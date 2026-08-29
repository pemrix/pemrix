//! Faucet configuration.

use serde::{Deserialize, Serialize};

/// Configuration for the PEMRIX faucet service.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FaucetConfig {
    /// Listen address for the faucet HTTP API.
    pub listen: String,
    /// Faucet account address.
    pub faucet_address: String,
    /// Maximum amount that can be requested in a single call.
    pub max_amount: u128,
    /// Cooldown seconds between requests from the same address.
    pub cooldown_seconds: u64,
    /// RPC endpoint to submit transactions.
    pub rpc_url: String,
}

impl Default for FaucetConfig {
    fn default() -> Self {
        Self {
            listen: "127.0.0.1:60101".to_string(),
            faucet_address: "px".to_string(),
            max_amount: 10_000,
            cooldown_seconds: 60,
            rpc_url: "http://127.0.0.1:60001".to_string(),
        }
    }
}
