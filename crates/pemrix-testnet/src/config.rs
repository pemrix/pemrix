//! Testnet configuration.

use pemrix_crypto::Ed25519Scheme;
use pemrix_primitives::{Account, Address, Hash};

/// Seed used to derive the deterministic local testnet faucet keypair.
const LOCAL_FAUCET_SEED: &[u8] = b"pemrix-local-testnet-faucet-v1";
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// A testnet preset identifier.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TestnetPreset {
    /// Local development testnet.
    #[default]
    Local,
}

/// Configuration for a PEMRIX testnet.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TestnetConfig {
    /// Testnet preset.
    pub preset: TestnetPreset,
    /// Human-readable chain name.
    pub chain_name: String,
    /// Chain ID.
    pub chain_id: String,
    /// Genesis allocations.
    pub allocations: BTreeMap<Address, Account>,
    /// Faucet accounts with initial balances.
    pub faucet_accounts: Vec<(Address, Account)>,
    /// Initial validators.
    pub validators: Vec<Address>,
    /// Bootstrap node addresses (placeholder).
    pub bootstrap_nodes: Vec<String>,
    /// RPC listen address for services.
    pub rpc_listen: String,
    /// Faucet service listen address.
    pub faucet_listen: String,
    /// Explorer service listen address.
    pub explorer_listen: String,
    /// gRPC service listen address.
    pub grpc_listen: String,
}

impl TestnetConfig {
    /// Load a built-in testnet preset.
    pub fn preset(preset: TestnetPreset) -> Self {
        match preset {
            TestnetPreset::Local => Self::local(),
        }
    }

    /// Local development testnet with pre-funded accounts.
    ///
    /// Listen addresses default to `127.0.0.1` so the testnet is safe to run on
    /// a developer workstation. Set `PEMRIX_BIND_HOST` to `0.0.0.0` when running
    /// inside a container so the services accept connections from outside.
    pub fn local() -> Self {
        let mut allocations = BTreeMap::new();

        // Fund a set of deterministic developer accounts.
        for i in 0..10 {
            let address =
                Address::from_public_key_hash(Hash::hash_bytes(format!("dev-{i}").as_bytes()));
            allocations.insert(address, Account::new(1_000_000, 0));
        }

        // Faucet account. The address is derived from a deterministic keypair so
        // that the faucet service can sign transactions that pass signature
        // verification.
        let faucet_keypair = Ed25519Scheme::keypair_from_seed(LOCAL_FAUCET_SEED)
            .expect("deterministic faucet keypair should be valid");
        let faucet_address =
            Address::from_public_key_hash(Hash::hash_bytes(&faucet_keypair.public.0));
        let faucet_account = Account::new(1_000_000_000, 0);

        let bind_host = std::env::var("PEMRIX_BIND_HOST")
            .ok()
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| "127.0.0.1".to_string());

        Self {
            preset: TestnetPreset::Local,
            chain_name: "PEMRIX Local Testnet".to_string(),
            chain_id: "pemrix-local-testnet".to_string(),
            allocations,
            faucet_accounts: vec![(faucet_address, faucet_account)],
            validators: vec![faucet_address],
            bootstrap_nodes: vec![format!("{}:60303", bind_host)],
            rpc_listen: format!("{}:60001", bind_host),
            faucet_listen: format!("{}:60101", bind_host),
            explorer_listen: format!("{}:60102", bind_host),
            grpc_listen: format!("{}:60002", bind_host),
        }
    }

    /// Return the RPC endpoint that services inside the same host should use.
    ///
    /// This is always `127.0.0.1` because internal callers run on the same
    /// machine, even when the public bind address is `0.0.0.0`.
    pub fn rpc_internal_url(&self) -> String {
        let port = self
            .rpc_listen
            .rsplit_once(':')
            .map(|(_, p)| p)
            .unwrap_or("60001");
        format!("http://127.0.0.1:{}", port)
    }

    /// Get the default faucet address.
    pub fn faucet_address(&self) -> Option<Address> {
        self.faucet_accounts.first().map(|(addr, _)| *addr)
    }

    /// Get the default faucet account.
    pub fn faucet_account(&self) -> Option<&Account> {
        self.faucet_accounts.first().map(|(_, acc)| acc)
    }

    /// Generate a faucet key pair for the first faucet account.
    pub fn faucet_keypair(&self) -> Result<pemrix_crypto::KeyPair, &'static str> {
        // In a real deployment, the faucet key must be loaded from secure storage.
        // For local testnet we use a deterministic key derived from a fixed seed.
        Ed25519Scheme::keypair_from_seed(LOCAL_FAUCET_SEED)
            .map_err(|_| "failed to generate faucet keypair")
    }

    /// Return the combined allocations including faucet accounts.
    pub fn combined_allocations(&self) -> BTreeMap<Address, Account> {
        let mut allocations = self.allocations.clone();
        for (addr, account) in &self.faucet_accounts {
            allocations.insert(*addr, *account);
        }
        allocations
    }

    /// Return the testnet genesis timestamp.
    pub fn genesis_timestamp(&self) -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_testnet_has_faucet() {
        let config = TestnetConfig::local();
        assert!(!config.faucet_accounts.is_empty());
        assert!(config.faucet_address().is_some());
    }

    #[test]
    fn allocations_include_faucet() {
        let config = TestnetConfig::local();
        let allocations = config.combined_allocations();
        let faucet = config.faucet_address().unwrap();
        assert!(allocations.contains_key(&faucet));
    }
}
