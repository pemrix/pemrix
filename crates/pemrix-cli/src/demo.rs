//! Wallet-to-merchant QR payment demo.
//!
//! This demo simulates a shop payment on the PEMRIX local testnet:
//!
//! 1. Create a payer wallet (customer).
//! 2. Create a merchant wallet (shopkeeper).
//! 3. Fund the payer from the testnet faucet.
//! 4. The merchant displays a QR code payload with their address and amount.
//! 5. The payer "scans" the QR code and submits a transfer transaction.
//! 6. Poll balances until the merchant receives the payment.
//!
//! Run `pemrix testnet` first, then run `pemrix demo`.

use anyhow::{anyhow, Context, Result};
use pemrix_sdk::{Client, FaucetClient, HttpClient, Wallet};
use std::time::Duration;
use tracing::{info, warn};

/// Amount to fund the payer with from the faucet.
const FAUCET_AMOUNT: u128 = 10_000;

/// Amount the customer pays the merchant.
const PAYMENT_AMOUNT: u128 = 1_000;

/// Transaction fee.
const TX_FEE: u128 = 1;

/// Maximum time to wait for the payment to settle.
const SETTLE_TIMEOUT: Duration = Duration::from_secs(30);

/// Run the wallet-to-merchant payment demo.
pub async fn run(rpc_url: &str, faucet_url: &str) -> Result<()> {
    let rpc = HttpClient::new(rpc_url);
    let faucet = FaucetClient::new(faucet_url);

    info!("PEMRIX Wallet-to-Merchant Payment Demo");
    info!("RPC endpoint: {}", rpc_url);
    info!("Faucet endpoint: {}", faucet_url);

    // Create wallets.
    let payer = Wallet::generate().context("failed to generate payer wallet")?;
    let merchant = Wallet::generate().context("failed to generate merchant wallet")?;

    info!("Payer wallet: {}", payer.address());
    info!("Merchant wallet: {}", merchant.address());

    // Fund payer from faucet.
    info!("Requesting {} from faucet for payer...", FAUCET_AMOUNT);
    let faucet_response = faucet
        .request(payer.address(), FAUCET_AMOUNT)
        .await
        .context("faucet request failed")?;
    if !faucet_response.success {
        return Err(anyhow!(
            "faucet request rejected: {}",
            faucet_response.message
        ));
    }
    info!("Faucet sent funds: tx_hash={}", faucet_response.tx_hash);

    // Wait briefly for the faucet funding to be included in a block.
    tokio::time::sleep(Duration::from_secs(3)).await;

    let payer_balance_before = rpc
        .balance(&payer.address())
        .await
        .context("failed to query payer balance")?;
    let merchant_balance_before = rpc
        .balance(&merchant.address())
        .await
        .context("failed to query merchant balance")?;

    info!("Payer balance before: {}", payer_balance_before);
    info!("Merchant balance before: {}", merchant_balance_before);

    if payer_balance_before < PAYMENT_AMOUNT + TX_FEE {
        return Err(anyhow!(
            "payer balance too low: have {}, need {}",
            payer_balance_before,
            PAYMENT_AMOUNT + TX_FEE
        ));
    }

    // Merchant displays QR code payload.
    let qr_payload = format!(
        "pemrix:pay?address={}&amount={}&memo=Tea",
        merchant.address(),
        PAYMENT_AMOUNT
    );
    info!("Merchant QR payload: {}", qr_payload);

    // Payer scans QR and prepares payment.
    let nonce = rpc
        .nonce(&payer.address())
        .await
        .context("failed to query payer nonce")?;
    info!("Payer nonce: {}", nonce);

    let tx = payer.transfer(merchant.address(), PAYMENT_AMOUNT, nonce, TX_FEE);
    let tx_hash = rpc
        .send_transaction(&tx)
        .await
        .context("failed to submit payment transaction")?;
    info!("Payment transaction submitted: hash={}", tx_hash);

    // Poll until the merchant balance increases.
    let start = std::time::Instant::now();
    loop {
        tokio::time::sleep(Duration::from_secs(2)).await;

        let merchant_balance_after = rpc
            .balance(&merchant.address())
            .await
            .context("failed to query merchant balance")?;
        let payer_balance_after = rpc
            .balance(&payer.address())
            .await
            .context("failed to query payer balance")?;

        if merchant_balance_after >= merchant_balance_before + PAYMENT_AMOUNT {
            info!("Payment settled!");
            info!("Payer balance after: {}", payer_balance_after);
            info!("Merchant balance after: {}", merchant_balance_after);
            info!("Transaction hash: {}", tx_hash);
            break;
        }

        if start.elapsed() > SETTLE_TIMEOUT {
            warn!("Payment did not settle within {:?}", SETTLE_TIMEOUT);
            info!("Payer balance after: {}", payer_balance_after);
            info!("Merchant balance after: {}", merchant_balance_after);
            return Err(anyhow!("payment settlement timeout"));
        }
    }

    Ok(())
}
