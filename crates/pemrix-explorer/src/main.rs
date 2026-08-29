//! PEMRIX explorer API service.

use pemrix_explorer::ExplorerService;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let listen = std::env::var("EXPLORER_LISTEN").unwrap_or_else(|_| pemrix_ports::explorer_local());
    info!("Starting PEMRIX explorer on {}", listen);
    let service = ExplorerService::new(listen);
    service.start().await?;
    Ok(())
}
