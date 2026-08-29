//! PEMRIX webhook worker.

use pemrix_webhooks::WebhookService;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let listen = std::env::var("WEBHOOK_LISTEN").unwrap_or_else(|_| "127.0.0.1:60103".to_string());
    info!("Starting PEMRIX webhook worker on {}", listen);
    let service = WebhookService::new(listen);
    service.start().await?;
    Ok(())
}
