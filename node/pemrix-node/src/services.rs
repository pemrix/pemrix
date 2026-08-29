//! Shared services runner for PEMRIX.
//!
//! Runs RPC, faucet, explorer, and webhook services as a standalone process.
//! The services poll a validator RPC endpoint to keep block and account state
//! in sync. This lets validator nodes run without also hosting user-facing
//! services.

use pemrix_crypto::Ed25519Scheme;
use pemrix_explorer::ExplorerService;
use pemrix_faucet::{FaucetConfig, FaucetService, LocalSubmitter};
use pemrix_rpc::{RpcServer, RpcState};
use pemrix_webhooks::WebhookService;
use std::sync::Arc;
use std::time::Duration;
use tracing::{info, warn};

const LOCAL_FAUCET_SEED: &[u8] = b"pemrix-local-testnet-faucet-v1";

/// Run shared services against a validator RPC endpoint.
pub async fn run_services(rpc_url: &str) -> Result<(), crate::NodeError> {
    let bind_host = std::env::var("PEMRIX_BIND_HOST")
        .ok()
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "127.0.0.1".to_string());

    let rpc_listen = format!("{}:{}", bind_host, pemrix_ports::SERVICES_RPC);
    let faucet_listen = format!("{}:{}", bind_host, pemrix_ports::FAUCET);
    let explorer_listen = format!("{}:{}", bind_host, pemrix_ports::EXPLORER);
    let webhooks_listen = pemrix_ports::webhooks_local();

    let rpc_state = RpcState::new();
    let explorer = ExplorerService::new(&explorer_listen);
    let webhooks = WebhookService::new(webhooks_listen.clone());

    // Seed faucet account so the faucet service can sign drip transactions.
    let faucet_keypair = Ed25519Scheme::keypair_from_seed(LOCAL_FAUCET_SEED)
        .map_err(|_| crate::NodeError::Config("failed to generate faucet keypair".to_string()))?;
    let faucet_address = pemrix_primitives::Address::from_public_key_hash(
        pemrix_primitives::Hash::hash_bytes(&faucet_keypair.public.0),
    );
    rpc_state
        .set_account(
            faucet_address,
            pemrix_primitives::Account::new(1_000_000_000, 0),
        )
        .await;

    let submitter = Arc::new(LocalSubmitter::new(rpc_state.clone(), faucet_address));
    let faucet_config = FaucetConfig {
        listen: faucet_listen,
        faucet_address: faucet_address.to_string(),
        max_amount: 10_000,
        cooldown_seconds: 0,
        rpc_url: rpc_url.to_string(),
    };
    let faucet = FaucetService::new(
        faucet_config.clone(),
        faucet_keypair,
        faucet_address,
        submitter,
    );

    let rpc = RpcServer::new_with_state(&rpc_listen, rpc_state.clone());

    info!("Starting PEMRIX shared services");
    info!("Validator RPC: {}", rpc_url);
    info!("RPC listen: {}", rpc_listen);
    info!("Faucet listen: {}", faucet_config.listen);
    info!("Explorer listen: {}", explorer_listen);
    info!("Webhooks listen: {}", webhooks_listen);

    // Spawn service tasks.
    let rpc_handle = tokio::spawn({
        let rpc = rpc.clone();
        async move {
            if let Err(e) = rpc.start().await {
                warn!("RPC server error: {}", e);
            }
        }
    });

    let faucet_handle = tokio::spawn({
        let faucet = faucet.clone();
        async move {
            if let Err(e) = faucet.start().await {
                warn!("Faucet server error: {}", e);
            }
        }
    });

    let explorer_handle = tokio::spawn({
        let explorer = explorer.clone();
        async move {
            if let Err(e) = explorer.start().await {
                warn!("Explorer server error: {}", e);
            }
        }
    });

    let webhook_handle = tokio::spawn({
        let webhooks = webhooks.clone();
        async move {
            if let Err(e) = webhooks.start().await {
                warn!("Webhook server error: {}", e);
            }
        }
    });

    // Poll validator RPC for new blocks and update local state.
    let poll_handle = tokio::spawn(poll_validator(
        rpc_url.to_string(),
        rpc_state,
        explorer,
        webhooks,
    ));

    let _ = tokio::join!(
        rpc_handle,
        faucet_handle,
        explorer_handle,
        webhook_handle,
        poll_handle
    );
    Ok(())
}

async fn poll_validator(
    rpc_url: String,
    rpc_state: RpcState,
    explorer: ExplorerService,
    webhooks: WebhookService,
) {
    let client = reqwest::Client::new();
    let mut last_height = 0u64;

    loop {
        tokio::time::sleep(Duration::from_secs(2)).await;

        let status_url = format!("{}/v1/status", rpc_url);
        let current_height = match client.get(&status_url).send().await {
            Ok(resp) => match resp.json::<serde_json::Value>().await {
                Ok(body) => body
                    .get("height")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(last_height),
                Err(e) => {
                    warn!("failed to parse validator status: {}", e);
                    last_height
                }
            },
            Err(e) => {
                warn!("validator status poll error: {}", e);
                last_height
            }
        };

        if current_height <= last_height {
            continue;
        }

        for height in (last_height + 1)..=current_height {
            let block_url = format!("{}/v1/blocks/raw/{}", rpc_url, height);
            match client.get(&block_url).send().await {
                Ok(resp) => match resp.json::<pemrix_primitives::Block>().await {
                    Ok(block) => {
                        ingest_block(&rpc_state, &explorer, &webhooks, block).await;
                    }
                    Err(e) => warn!("failed to parse block {}: {}", height, e),
                },
                Err(e) => warn!("failed to fetch block {}: {}", height, e),
            }
        }

        last_height = current_height;
    }
}

async fn ingest_block(
    rpc_state: &RpcState,
    explorer: &ExplorerService,
    webhooks: &WebhookService,
    block: pemrix_primitives::Block,
) {
    let height = block.header.height;

    for tx in &block.body.transactions {
        let mut sender = rpc_state.get_account(&tx.sender).await.unwrap_or_default();
        let total = tx.amount.saturating_add(tx.fee);

        if sender.nonce != tx.nonce {
            warn!(
                "RPC state nonce mismatch for {} at height {}: expected {}, got {}",
                tx.sender, height, sender.nonce, tx.nonce
            );
            continue;
        }

        if sender.balance < total {
            warn!(
                "RPC state insufficient balance for {} at height {}: needed {}, had {}",
                tx.sender, height, total, sender.balance
            );
            continue;
        }

        sender.balance = sender.balance.saturating_sub(total);
        sender.nonce = sender.nonce.saturating_add(1);
        rpc_state.set_account(tx.sender, sender).await;

        let mut recipient = rpc_state
            .get_account(&tx.recipient)
            .await
            .unwrap_or_default();
        recipient.balance = recipient.balance.saturating_add(tx.amount);
        rpc_state.set_account(tx.recipient, recipient).await;
    }

    rpc_state.store_block(block.clone()).await;
    explorer.state().ingest_block(block.clone()).await;
    webhooks
        .state()
        .trigger(
            pemrix_webhooks::EventType::Block,
            serde_json::json!({"height": height}),
        )
        .await;

    for tx in &block.body.transactions {
        webhooks
            .state()
            .trigger(
                pemrix_webhooks::EventType::Transaction,
                serde_json::json!({"hash": tx.hash().to_string()}),
            )
            .await;
        rpc_state.store_transaction(tx.hash(), tx.clone()).await;
    }
}
