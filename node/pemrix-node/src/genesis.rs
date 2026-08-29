//! Genesis configuration.

use pemrix_primitives::{Account, Address, Balance, Block, BlockBody, BlockHeader, Hash};
use pemrix_storage::StateStore;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Genesis configuration for the network.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct GenesisConfig {
    /// Genesis chain ID.
    pub chain_id: String,
    /// Genesis timestamp.
    pub timestamp: u64,
    /// Initial account allocations.
    pub allocations: BTreeMap<Address, Account>,
    /// Initial validators.
    pub validators: Vec<Address>,
}

impl Default for GenesisConfig {
    fn default() -> Self {
        Self {
            chain_id: "pemrix-local".to_string(),
            timestamp: 0,
            allocations: BTreeMap::new(),
            validators: Vec::new(),
        }
    }
}

impl GenesisConfig {
    /// Create a local development genesis with the given funded accounts.
    pub fn local_development(funded: &[(Address, Balance)]) -> Self {
        let mut allocations = BTreeMap::new();
        for (address, balance) in funded {
            allocations.insert(*address, Account::new(*balance, 0));
        }
        Self {
            chain_id: "pemrix-local".to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            allocations,
            validators: Vec::new(),
        }
    }

    /// Save the genesis config to the data directory.
    pub fn save(&self, data_dir: &str) -> Result<(), crate::NodeError> {
        let path = std::path::Path::new(data_dir).join("genesis.json");
        std::fs::create_dir_all(data_dir)?;
        let contents = serde_json::to_string_pretty(self)
            .map_err(|e| crate::NodeError::Config(e.to_string()))?;
        std::fs::write(path, contents)?;
        Ok(())
    }

    /// Load the genesis config from the data directory.
    pub fn load(data_dir: &str) -> Result<Self, crate::NodeError> {
        let path = std::path::Path::new(data_dir).join("genesis.json");
        let contents = std::fs::read_to_string(&path)?;
        let config: GenesisConfig =
            serde_json::from_str(&contents).map_err(|e| crate::NodeError::Config(e.to_string()))?;
        Ok(config)
    }

    /// Build the genesis block from this configuration.
    ///
    /// The genesis block has height 0, an empty transaction body, and a state
    /// root derived from the genesis allocations.
    pub fn genesis_block(&self) -> Result<Block, crate::NodeError> {
        let mut state = StateStore::new_in_memory();
        for (address, account) in &self.allocations {
            state
                .set_account(address, *account)
                .map_err(|_| crate::NodeError::Storage)?;
        }
        let state_root = state.state_root().map_err(|_| crate::NodeError::Storage)?;
        let proposer = self.validators.first().copied().unwrap_or_default();

        let header = BlockHeader {
            height: 0,
            timestamp: self.timestamp,
            previous_hash: Hash::default(),
            state_root,
            tx_root: Hash::hash_bytes(&[]),
            proposer: *proposer.as_bytes(),
        };

        Ok(Block {
            header,
            body: BlockBody {
                transactions: vec![],
            },
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::{Address, Hash};

    #[test]
    fn genesis_block_has_height_zero() {
        let address = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
        let genesis = GenesisConfig::local_development(&[(address, 1_000)]);
        let block = genesis.genesis_block().unwrap();
        assert_eq!(block.header.height, 0);
        assert!(block.body.transactions.is_empty());
        assert!(!block.hash().to_string().is_empty());
    }

    #[test]
    fn genesis_block_state_root_reflects_allocations() {
        let address = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));
        let genesis = GenesisConfig::local_development(&[(address, 5_000)]);
        let block = genesis.genesis_block().unwrap();
        assert_ne!(block.header.state_root, Hash::default());
    }

    #[test]
    fn genesis_block_previous_hash_is_zero() {
        let genesis = GenesisConfig::local_development(&[]);
        let block = genesis.genesis_block().unwrap();
        assert_eq!(block.header.previous_hash, Hash::default());
    }
}
