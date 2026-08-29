//! PEMRIX explorer API service.

use pemrix_explorer::ExplorerService;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let listen = std::env::var("EXPLORER_LISTEN").unwrap_or_else(|_| "127.0.0.1:60102".to_string());
    info!("Starting PEMRIX explorer on {}", listen);
    let service = ExplorerService::new(listen);
    service.start().await?;
    Ok(())
}
