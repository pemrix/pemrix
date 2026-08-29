//! Solo consensus engine for development and testing.

use crate::{ConsensusEngine, ConsensusError, Finality};
use pemrix_primitives::{Address, Block, BlockBody, BlockHeader, Hash, Transaction};
use pemrix_storage::{InMemoryBackend, StateStore};
use pemrix_vm::{ExecutionResult, NativeExecutor, Vm};

/// A single-validator consensus engine that produces blocks on demand.
pub struct SoloConsensus {
    state: StateStore<InMemoryBackend>,
    height: u64,
    proposer: Address,
    previous_hash: Hash,
}

impl SoloConsensus {
    /// Create a new solo consensus engine with the given proposer.
    pub fn new(proposer: Address) -> Self {
        Self::new_with_previous_hash(proposer, Hash::default())
    }

    /// Create a new solo consensus engine with a specific previous block hash.
    pub fn new_with_previous_hash(proposer: Address, previous_hash: Hash) -> Self {
        Self {
            state: StateStore::new_in_memory(),
            height: 0,
            proposer,
            previous_hash,
        }
    }

    /// Access the internal state store.
    pub fn state(&self) -> &StateStore<InMemoryBackend> {
        &self.state
    }

    /// Access the internal state store mutably.
    pub fn state_mut(&mut self) -> &mut StateStore<InMemoryBackend> {
        &mut self.state
    }

    /// Fund an account for testing.
    #[cfg(test)]
    pub fn fund(&mut self, address: Address, balance: u128) {
        use pemrix_primitives::Account;
        self.state
            .set_account(&address, Account::new(balance, 0))
            .unwrap();
    }
}

#[async_trait::async_trait]
impl ConsensusEngine for SoloConsensus {
    async fn propose(
        &mut self,
        height: u64,
        transactions: Vec<Transaction>,
    ) -> Result<Block, ConsensusError> {
        let executor = NativeExecutor;
        for tx in &transactions {
            let _result: ExecutionResult = executor
                .execute(&mut self.state, tx)
                .map_err(|e| ConsensusError::ExecutionFailed(e.to_string()))?;
        }

        let header = BlockHeader {
            height,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            previous_hash: self.previous_hash,
            state_root: self
                .state
                .state_root()
                .map_err(|_| ConsensusError::Storage)?,
            tx_root: Hash::hash_bytes(&pemrix_primitives::encoding::encode(&transactions)),
            proposer: *self.proposer.as_bytes(),
        };

        let block = Block {
            header,
            body: BlockBody { transactions },
        };

        self.previous_hash = block.hash();
        self.height = height;

        Ok(block)
    }

    async fn handle_proposal(&mut self, _proposal: crate::Proposal) -> Result<(), ConsensusError> {
        Ok(())
    }

    async fn handle_vote(&mut self, _vote: crate::Vote) -> Result<(), ConsensusError> {
        Ok(())
    }

    async fn finalize(&mut self, _block_hash: Hash) -> Result<Finality, ConsensusError> {
        Ok(Finality {
            block: Block {
                header: BlockHeader {
                    height: self.height,
                    ..Default::default()
                },
                body: BlockBody::default(),
            },
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        })
    }

    fn height(&self) -> u64 {
        self.height
    }

    fn validator_address(&self) -> Option<Address> {
        Some(self.proposer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn solo_consensus_produces_block() {
        let proposer = Address::default();
        let sender = Address::from_public_key_hash(Hash::hash_bytes(b"sender"));
        let recipient = Address::from_public_key_hash(Hash::hash_bytes(b"recipient"));
        let mut engine = SoloConsensus::new(proposer);
        engine.fund(sender, 1_000);
        let tx = Transaction::transfer(sender, recipient, 100, 0, 1);
        let block = engine.propose(1, vec![tx]).await.unwrap();
        assert_eq!(block.header.height, 1);
    }
}
