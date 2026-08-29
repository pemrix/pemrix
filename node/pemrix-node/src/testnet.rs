//! Testnet orchestration.
//!
//! Wires together the node, RPC server, faucet, explorer, and webhook worker
//! into a single local testnet command.

use crate::{spawn_bft_validator, GenesisConfig, NodeConfig, NodeError};
use pemrix_consensus::{
    ConsensusEngine, Mempool, SimpleMempool, SoloConsensus, Validator, ValidatorSet,
};
use pemrix_explorer::ExplorerService;
use pemrix_faucet::{FaucetConfig, FaucetService, LocalSubmitter};
use pemrix_network::MockTransport;
use pemrix_primitives::{Account, Address, Block, Hash};
#[cfg(feature = "grpc")]
use pemrix_rpc::grpc::serve as serve_grpc;
use pemrix_rpc::{RpcServer, RpcState};
use pemrix_testnet::TestnetConfig;
use pemrix_webhooks::WebhookService;
use std::collections::BTreeMap;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::mpsc;
use tracing::{info, warn};

/// Initialize and run a local PEMRIX testnet.
pub async fn run_testnet(data_dir: &str, validator_count: usize) -> Result<(), NodeError> {
    if validator_count == 0 {
        return Err(NodeError::Config(
            "validator_count must be at least 1".to_string(),
        ));
    }

    std::fs::create_dir_all(data_dir)?;

    if validator_count == 1 {
        run_solo_testnet(data_dir).await
    } else {
        run_bft_testnet(data_dir, validator_count).await
    }
}

/// Run a single-validator testnet using solo consensus.
async fn run_solo_testnet(data_dir: &str) -> Result<(), NodeError> {
    let testnet = TestnetConfig::local();
    let node_config = NodeConfig {
        data_dir: data_dir.to_string(),
        rpc_listen: testnet.rpc_listen.clone(),
        p2p_listen: pemrix_ports::p2p_default(),
        validator: true,
        bootstrap_nodes: BTreeMap::new(),
        validator_set: None,
        local_validator_address: None,
    };
    let genesis = GenesisConfig {
        chain_id: testnet.chain_id.clone(),
        timestamp: testnet.genesis_timestamp(),
        allocations: testnet.combined_allocations(),
        validators: testnet.validators.clone(),
    };

    node_config.save()?;
    genesis.save(data_dir)?;

    info!("Starting PEMRIX local testnet");
    info!("Chain ID: {}", genesis.chain_id);
    info!("Data directory: {}", data_dir);

    let genesis_block = genesis.genesis_block()?;
    let genesis_hash = genesis_block.hash();
    info!("Genesis block hash: {}", genesis_hash);

    let rpc_state = RpcState::new();
    let explorer = ExplorerService::new(&testnet.explorer_listen);
    let webhooks = WebhookService::new(&pemrix_ports::webhooks_local());

    // Store genesis block and seed RPC state and explorer with allocations.
    rpc_state.store_block(genesis_block.clone()).await;
    explorer.state().ingest_block(genesis_block).await;
    for (address, account) in &genesis.allocations {
        rpc_state.set_account(*address, *account).await;
        explorer.state().ingest_account(*address, *account).await;
    }

    let service_handles = spawn_shared_services(
        &testnet,
        rpc_state.clone(),
        explorer.clone(),
        webhooks.clone(),
    )
    .await?;

    // Run the node block production loop.
    let proposer = genesis
        .validators
        .first()
        .copied()
        .unwrap_or_else(Address::default);
    let mut consensus = SoloConsensus::new_with_previous_hash(proposer, genesis_hash);
    let mut mempool = SimpleMempool::new();
    let _transport = MockTransport::new(pemrix_network::PeerId::from_public_key_hash(
        Hash::hash_bytes(b"local"),
    ));

    // Seed consensus state with genesis allocations.
    for (address, account) in &genesis.allocations {
        consensus
            .state_mut()
            .set_account(address, *account)
            .map_err(NodeError::Storage)?;
    }

    for height in 1..=100_000u64 {
        // Include pending transactions from RPC state.
        let pending = rpc_state.pending_transactions().await;
        for tx in pending {
            mempool.add(tx).map_err(|_| NodeError::Consensus)?;
        }

        let txs = mempool.drain(100);
        let block = consensus
            .propose(height, txs.clone())
            .await
            .map_err(|_| NodeError::Consensus)?;

        ingest_block(&rpc_state, &explorer, &webhooks, block).await;

        if height % 10 == 0 {
            info!("Testnet block {} produced", height);
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    }

    // The shared services run forever; dropping the handle lets them keep
    // running in the background.
    drop(service_handles);
    Ok(())
}

/// Run a multi-validator testnet where all validators live in one process.
async fn run_bft_testnet(data_dir: &str, validator_count: usize) -> Result<(), NodeError> {
    let testnet = TestnetConfig::local();

    // Generate deterministic validator addresses.
    let validator_addresses: Vec<Address> = (0..validator_count)
        .map(|i| {
            Address::from_public_key_hash(Hash::hash_bytes(format!("validator-{i}").as_bytes()))
        })
        .collect();

    let validator_set = ValidatorSet::from_validators(
        validator_addresses
            .iter()
            .map(|a| Validator::new(*a, 1))
            .collect(),
    );

    let mut allocations = testnet.combined_allocations();
    for address in &validator_addresses {
        allocations.insert(*address, Account::new(1_000_000, 0));
    }

    let genesis = GenesisConfig {
        chain_id: testnet.chain_id.clone(),
        timestamp: testnet.genesis_timestamp(),
        allocations,
        validators: validator_addresses.clone(),
    };

    genesis.save(data_dir)?;

    info!(
        "Starting PEMRIX local BFT testnet with {} validators",
        validator_count
    );
    info!("Chain ID: {}", genesis.chain_id);
    info!("Data directory: {}", data_dir);

    let genesis_block = genesis.genesis_block()?;
    let genesis_hash = genesis_block.hash();
    info!("Genesis block hash: {}", genesis_hash);

    let rpc_state = RpcState::new();
    let explorer = ExplorerService::new(&testnet.explorer_listen);
    let webhooks = WebhookService::new(&pemrix_ports::webhooks_local());

    rpc_state.store_block(genesis_block.clone()).await;
    explorer.state().ingest_block(genesis_block).await;
    for (address, account) in &genesis.allocations {
        rpc_state.set_account(*address, *account).await;
        explorer.state().ingest_account(*address, *account).await;
    }

    let service_handles = spawn_shared_services(
        &testnet,
        rpc_state.clone(),
        explorer.clone(),
        webhooks.clone(),
    )
    .await?;

    // Build per-validator configs and bootstrap map.
    let p2p_base = pemrix_ports::P2P_BASE;
    let mut validator_addrs: BTreeMap<Address, SocketAddr> = BTreeMap::new();
    for (i, address) in validator_addresses.iter().enumerate() {
        let port = p2p_base + i as u16;
        validator_addrs.insert(
            *address,
            SocketAddr::from_str(&format!("127.0.0.1:{}", port)).unwrap(),
        );
    }

    let (finalized_tx, mut finalized_rx) = mpsc::unbounded_channel::<Block>();

    for (i, address) in validator_addresses.iter().enumerate() {
        let port = p2p_base + i as u16;
        let local_id =
            pemrix_network::PeerId::from_public_key_hash(Hash::hash_bytes(address.as_bytes()));

        // Bootstrap to all other validators. The TCP transport will retry
        // until each peer is connected, and duplicate connections are harmless
        // because the peers map is keyed by peer id.
        //
        // The validator's network peer id is derived from its address bytes,
        // matching the derivation inside `spawn_bft_validator`.
        let mut bootstrap: BTreeMap<pemrix_network::PeerId, SocketAddr> = BTreeMap::new();
        for (j, other) in validator_addresses.iter().enumerate() {
            if i == j {
                continue;
            }
            let other_id =
                pemrix_network::PeerId::from_public_key_hash(Hash::hash_bytes(other.as_bytes()));
            bootstrap.insert(other_id, validator_addrs[other]);
        }

        let config = NodeConfig {
            data_dir: format!("{}/validator-{}", data_dir, i),
            rpc_listen: testnet.rpc_listen.clone(),
            p2p_listen: format!("127.0.0.1:{}", port),
            validator: true,
            bootstrap_nodes: bootstrap,
            validator_set: Some(validator_set.clone()),
            local_validator_address: Some(*address),
        };

        config.save()?;

        info!(
            "Spawning validator index={} address={} peer_id={:?} p2p={}",
            i, address, local_id, port
        );
        spawn_bft_validator(config, genesis.clone(), finalized_tx.clone());
    }

    // Collect finalized blocks from any validator and update shared services.
    let collector = tokio::spawn(async move {
        while let Some(block) = finalized_rx.recv().await {
            info!("Testnet finalized block {}", block.header.height);
            ingest_block(&rpc_state, &explorer, &webhooks, block).await;
        }
    });

    let _ = tokio::join!(service_handles, collector);
    Ok(())
}

/// Start RPC, faucet, explorer, and webhook services and return their handles.
async fn spawn_shared_services(
    testnet: &TestnetConfig,
    rpc_state: RpcState,
    explorer: ExplorerService,
    webhooks: WebhookService,
) -> Result<tokio::task::JoinHandle<()>, NodeError> {
    // Start RPC server using the shared state so finalized blocks are visible.
    let rpc = RpcServer::new_with_state(&testnet.rpc_listen, rpc_state.clone());
    let rpc_handle = tokio::spawn({
        let rpc = rpc.clone();
        async move {
            if let Err(e) = rpc.start().await {
                warn!("RPC server error: {}", e);
            }
        }
    });

    // Start gRPC server when the grpc feature is enabled.
    #[cfg(feature = "grpc")]
    let grpc_handle = {
        let grpc_listen = testnet.grpc_listen.clone();
        let grpc_state = rpc_state.clone();
        tokio::spawn(async move {
            if let Err(e) = serve_grpc(grpc_state, grpc_listen).await {
                warn!("gRPC server error: {}", e);
            }
        })
    };

    // Start faucet server.
    let faucet_address = testnet.faucet_address().unwrap_or_default();
    let faucet_account = testnet.faucet_account().copied().unwrap_or_default();
    rpc_state.set_account(faucet_address, faucet_account).await;

    let faucet_keypair = testnet
        .faucet_keypair()
        .map_err(|_| NodeError::Config("failed to generate faucet keypair".to_string()))?;
    let submitter = Arc::new(LocalSubmitter::new(rpc_state.clone(), faucet_address));
    let faucet_config = FaucetConfig {
        listen: testnet.faucet_listen.clone(),
        faucet_address: faucet_address.to_string(),
        max_amount: 10_000,
        cooldown_seconds: 0,
        rpc_url: testnet.rpc_internal_url(),
    };
    let faucet = FaucetService::new(faucet_config, faucet_keypair, faucet_address, submitter);
    let faucet_handle = tokio::spawn({
        let faucet = faucet.clone();
        async move {
            if let Err(e) = faucet.start().await {
                warn!("Faucet server error: {}", e);
            }
        }
    });

    // Start explorer server.
    let explorer_handle = tokio::spawn({
        let explorer = explorer.clone();
        async move {
            if let Err(e) = explorer.start().await {
                warn!("Explorer server error: {}", e);
            }
        }
    });

    // Start webhook server.
    let webhook_handle = tokio::spawn({
        let webhooks = webhooks.clone();
        async move {
            if let Err(e) = webhooks.start().await {
                warn!("Webhook server error: {}", e);
            }
        }
    });

    // Aggregate all service handles into one join handle.
    Ok(tokio::spawn(async move {
        #[cfg(feature = "grpc")]
        {
            let _ = tokio::join!(
                rpc_handle,
                grpc_handle,
                faucet_handle,
                explorer_handle,
                webhook_handle
            );
        }
        #[cfg(not(feature = "grpc"))]
        {
            let _ = tokio::join!(rpc_handle, faucet_handle, explorer_handle, webhook_handle);
        }
    }))
}

/// Ingest a finalized block into RPC, explorer, and webhook services.
async fn ingest_block(
    rpc_state: &RpcState,
    explorer: &ExplorerService,
    webhooks: &WebhookService,
    block: Block,
) {
    let height = block.header.height;

    // Replay transactions through the native execution semantics so the RPC
    // account state mirrors the consensus state. This makes balance queries
    // accurate for wallets, explorers, and payment demos.
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
