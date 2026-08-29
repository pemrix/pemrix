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
            listen: pemrix_ports::faucet_local(),
            faucet_address: "px".to_string(),
            max_amount: 10_000,
            cooldown_seconds: 60,
            rpc_url: pemrix_ports::rpc_internal_url(),
        }
    }
}
