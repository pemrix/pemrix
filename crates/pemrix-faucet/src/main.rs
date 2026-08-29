//! PEMRIX faucet service.

use pemrix_faucet::{FaucetConfig, FaucetService, LocalSubmitter};
use pemrix_primitives::Address;
use pemrix_rpc::RpcState;
use std::str::FromStr;
use std::sync::Arc;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let mut config = FaucetConfig::default();
    if let Ok(listen) = std::env::var("FAUCET_LISTEN") {
        config.listen = listen;
    }
    let faucet_address = Address::from_str(&config.faucet_address).unwrap_or_default();
    let state = RpcState::new();
    let submitter = Arc::new(LocalSubmitter::new(state, faucet_address));
    let keypair = FaucetService::generate_keypair()?;

    info!("Starting PEMRIX faucet on {}", config.listen);
    let service = FaucetService::new(config, keypair, faucet_address, submitter);
    service.start().await?;
    Ok(())
}
