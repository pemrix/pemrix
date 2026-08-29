//! Node configuration.

use pemrix_consensus::{Validator, ValidatorSet};
use pemrix_network::PeerId;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::net::SocketAddr;

/// Configuration for a PEMRIX node.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct NodeConfig {
    /// Data directory path.
    pub data_dir: String,
    /// RPC listen address.
    pub rpc_listen: String,
    /// P2P listen address.
    pub p2p_listen: String,
    /// Enable validator mode.
    pub validator: bool,
    /// Bootstrap peers to dial on startup. Keyed by peer id.
    pub bootstrap_nodes: BTreeMap<PeerId, SocketAddr>,
    /// Validator committee. When present, the node runs multi-validator BFT
    /// consensus; otherwise it runs solo consensus.
    pub validator_set: Option<ValidatorSet>,
    /// Address of the local validator. Required when running in BFT mode.
    pub local_validator_address: Option<pemrix_primitives::Address>,
}

/// Helper to build a single-validator committee from a local address.
pub fn single_validator_set(address: pemrix_primitives::Address) -> ValidatorSet {
    ValidatorSet::from_validators(vec![Validator::new(address, 1)])
}

impl Default for NodeConfig {
    fn default() -> Self {
        Self {
            data_dir: "./pemrix-data".to_string(),
            rpc_listen: "127.0.0.1:60001".to_string(),
            p2p_listen: "0.0.0.0:60303".to_string(),
            validator: false,
            bootstrap_nodes: BTreeMap::new(),
            validator_set: None,
            local_validator_address: None,
        }
    }
}

impl NodeConfig {
    /// Create a default config for the given data directory.
    pub fn for_data_dir(data_dir: &str) -> Self {
        Self {
            data_dir: data_dir.to_string(),
            ..Default::default()
        }
    }

    /// Load configuration from a file, or return defaults if the file does not exist.
    pub fn load(data_dir: &str) -> Result<Self, crate::NodeError> {
        let path = std::path::Path::new(data_dir).join("node.json");
        if path.exists() {
            let contents = std::fs::read_to_string(&path)?;
            let config: NodeConfig = serde_json::from_str(&contents)
                .map_err(|e| crate::NodeError::Config(e.to_string()))?;
            Ok(config)
        } else {
            Ok(Self::for_data_dir(data_dir))
        }
    }

    /// Save configuration to a file.
    pub fn save(&self) -> Result<(), crate::NodeError> {
        let path = std::path::Path::new(&self.data_dir).join("node.json");
        std::fs::create_dir_all(&self.data_dir)?;
        let contents = serde_json::to_string_pretty(self)
            .map_err(|e| crate::NodeError::Config(e.to_string()))?;
        std::fs::write(path, contents)?;
        Ok(())
    }
}
