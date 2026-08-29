//! End-to-end test: local testnet runs multiple BFT validators in one process.
//!
//! The testnet command spawns four validators, shared RPC/faucet/explorer/webhook
//! services, and produces finalized blocks. We poll the REST status endpoint to
//! confirm the chain advances.

use std::time::Duration;

#[tokio::test]
async fn four_validator_testnet_produces_blocks() {
    let _ = tracing_subscriber::fmt::try_init();

    let data_path = std::env::temp_dir()
        .join(format!("pemrix-testnet-cluster-{}", std::process::id()))
        .to_str()
        .unwrap()
        .to_string();
    let _ = std::fs::remove_dir_all(&data_path);

    // Keep the testnet isolated from default ports to avoid conflicts with
    // other test runs or a developer testnet already running.
    std::env::set_var("PEMRIX_BIND_HOST", "127.0.0.1");
    // Speed up block production in tests so slow CI runners still finalize
    // blocks within the polling timeout.
    std::env::set_var("PEMRIX_BLOCK_INTERVAL_MS", "250");

    let testnet_handle = tokio::spawn(async move {
        pemrix_node::run_testnet(&data_path, 4).await.unwrap();
    });

    // Wait for validators to connect and finalize a few blocks.
    // Use a generous timeout because CI runners can be slow to connect
    // four validators over localhost TCP.
    let mut highest_height = 0u64;
    let mut rpc_ready = false;
    for _ in 0..240 {
        let poll_interval = if rpc_ready {
            Duration::from_millis(250)
        } else {
            Duration::from_millis(500)
        };
        tokio::time::sleep(poll_interval).await;

        match reqwest::get("http://127.0.0.1:61001/v1/status").await {
            Ok(response) => {
                rpc_ready = true;
                if let Ok(body) = response.json::<serde_json::Value>().await {
                    if let Some(height) = body.get("height").and_then(|v| v.as_u64()) {
                        highest_height = highest_height.max(height);
                    }
                }
            }
            Err(e) => {
                eprintln!("status poll error: {}", e);
            }
        }

        if highest_height >= 2 {
            break;
        }
    }

    testnet_handle.abort();
    let _ = testnet_handle.await;

    assert!(
        highest_height >= 2,
        "testnet should have finalized at least 2 blocks, got {}",
        highest_height
    );
}
