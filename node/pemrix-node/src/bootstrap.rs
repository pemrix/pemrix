//! Network bootstrap for multi-validator BFT deployments.
//!
//! Creates a shared genesis configuration and per-validator node
//! configurations for a production BFT network. All validators must agree on
//! the same genesis and validator set; only the local validator address and
//! bootstrap peers differ per node.

use crate::{GenesisConfig, NodeConfig, NodeError};
use pemrix_consensus::{Validator, ValidatorSet};
use pemrix_network::PeerId;
use pemrix_primitives::{Account, Address, Balance};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::net::SocketAddr;
use std::path::Path;
use std::str::FromStr;

/// A single validator entry in the bootstrap manifest.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BootstrapValidator {
    /// Validator on-chain address.
    pub address: Address,
    /// Public P2P listen address in `host:port` form.
    pub p2p: String,
    /// Optional human-readable name.
    pub name: Option<String>,
}

/// Bootstrap a BFT network from a manifest of validators.
///
/// `output_dir` receives one subdirectory per validator (named `validator-N`) plus
/// a shared `genesis.json` at the root. Each subdirectory contains a `node.json`
/// configured with the full validator set and bootstrap peers (all other
/// validators).
pub fn bootstrap_bft_network(
    chain_id: &str,
    validators: &[BootstrapValidator],
    allocations: &[(Address, Balance)],
    output_dir: &str,
) -> Result<(), NodeError> {
    if validators.len() < 2 {
        return Err(NodeError::Config(
            "BFT network requires at least 2 validators".to_string(),
        ));
    }

    let validator_set = ValidatorSet::from_validators(
        validators
            .iter()
            .map(|v| Validator::new(v.address, 1))
            .collect(),
    );

    let mut genesis_allocations = BTreeMap::new();
    for (address, balance) in allocations {
        genesis_allocations.insert(*address, Account::new(*balance, 0));
    }
    // Fund every validator account with a small starting balance so they can
    // pay fees if the chain charges them in the future.
    for v in validators {
        genesis_allocations
            .entry(v.address)
            .or_insert_with(|| Account::new(1_000_000, 0));
    }

    let genesis = GenesisConfig {
        chain_id: chain_id.to_string(),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        allocations: genesis_allocations,
        validators: validators.iter().map(|v| v.address).collect(),
    };

    let out = Path::new(output_dir);
    std::fs::create_dir_all(out)?;
    genesis.save(output_dir)?;

    // Build a lookup from address to P2P socket address.
    let p2p_addrs: BTreeMap<Address, SocketAddr> = validators
        .iter()
        .map(|v| {
            let addr = SocketAddr::from_str(&v.p2p)
                .map_err(|_| NodeError::Config(format!("invalid p2p address: {}", v.p2p)))?;
            Ok((v.address, addr))
        })
        .collect::<Result<_, NodeError>>()?;

    for (i, local) in validators.iter().enumerate() {
        let local_dir = out.join(format!("validator-{}", i));
        std::fs::create_dir_all(&local_dir)?;

        // Bootstrap to the previous validator in the chain. This avoids
        // simultaneous-dial races in the TCP transport when both peers list
        // each other as bootstrap nodes.
        let mut bootstrap_nodes = BTreeMap::new();
        if i > 0 {
            let peer = &validators[i - 1];
            let peer_id = PeerId::from_public_key_hash(pemrix_primitives::Hash::hash_bytes(
                peer.address.as_bytes(),
            ));
            bootstrap_nodes.insert(peer_id, p2p_addrs[&peer.address]);
        }

        let config = NodeConfig {
            data_dir: local_dir.to_string_lossy().to_string(),
            rpc_listen: pemrix_ports::rpc_public(),
            p2p_listen: local.p2p.clone(),
            validator: true,
            bootstrap_nodes,
            validator_set: Some(validator_set.clone()),
            local_validator_address: Some(local.address),
        };

        config.save()?;
    }

    Ok(())
}

/// Build a bootstrap manifest from validator key files and P2P endpoints.
///
/// `entries` is a list of `(key_file_path, p2p_host:port)` tuples. The key files
/// must contain the PEMRIX validator key JSON produced by `pemrix init --validator`.
pub fn manifest_from_key_files(
    entries: &[(String, String)],
) -> Result<Vec<BootstrapValidator>, NodeError> {
    entries
        .iter()
        .map(|(path, p2p)| {
            let contents = std::fs::read_to_string(path)
                .map_err(|e| NodeError::Config(format!("failed to read {}: {}", path, e)))?;
            let key_file: crate::keys::ValidatorKeyFile = serde_json::from_str(&contents)
                .map_err(|e| NodeError::Config(format!("failed to parse {}: {}", path, e)))?;
            Ok(BootstrapValidator {
                address: key_file.address()?,
                p2p: p2p.clone(),
                name: None,
            })
        })
        .collect()
}
