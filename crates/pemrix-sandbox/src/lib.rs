//! # PEMRIX Sandbox
//!
//! An isolated, in-memory developer environment for testing PEMRIX state
//! transitions without touching a live testnet or mainnet.
//!
//! The sandbox wires together a solo consensus engine, an in-memory state store,
//! and a simple mempool. Developers can fund accounts, submit transactions,
//! produce blocks, and query the resulting state.

#![warn(missing_docs)]

use pemrix_consensus::{ConsensusEngine, Mempool, SimpleMempool, SoloConsensus};
use pemrix_primitives::{Account, Address, Block, Hash, Transaction};
use std::collections::HashMap;

/// Error type returned by sandbox operations.
#[derive(Debug, thiserror::Error)]
pub enum SandboxError {
    /// Consensus operation failed.
    #[error("consensus error: {0}")]
    Consensus(String),
    /// Storage operation failed.
    #[error("storage error: {0}")]
    Storage(String),
    /// Transaction was not found.
    #[error("transaction not found")]
    TransactionNotFound,
    /// Block was not found.
    #[error("block not found")]
    BlockNotFound,
}

impl From<pemrix_consensus::ConsensusError> for SandboxError {
    fn from(err: pemrix_consensus::ConsensusError) -> Self {
        SandboxError::Consensus(err.to_string())
    }
}

impl From<pemrix_storage::StorageError> for SandboxError {
    fn from(err: pemrix_storage::StorageError) -> Self {
        SandboxError::Storage(err.to_string())
    }
}

/// In-memory developer sandbox.
pub struct Sandbox {
    proposer: Address,
    consensus: SoloConsensus,
    mempool: SimpleMempool,
    blocks: HashMap<u64, Block>,
    blocks_by_hash: HashMap<Hash, Block>,
    transactions: HashMap<Hash, Transaction>,
    pending: Vec<Transaction>,
    height: u64,
}

impl Sandbox {
    /// Create a new sandbox with a deterministic proposer.
    pub fn new(proposer: Address) -> Self {
        Self {
            proposer,
            consensus: SoloConsensus::new(proposer),
            mempool: SimpleMempool::new(),
            blocks: HashMap::new(),
            blocks_by_hash: HashMap::new(),
            transactions: HashMap::new(),
            pending: Vec::new(),
            height: 0,
        }
    }

    /// Fund an account with the given balance.
    pub fn fund(&mut self, address: Address, balance: u128) -> Result<(), SandboxError> {
        self.consensus
            .state_mut()
            .set_account(&address, Account::new(balance, 0))?;
        Ok(())
    }

    /// Submit a transaction to the sandbox mempool.
    pub fn submit(&mut self, transaction: Transaction) -> Result<Hash, SandboxError> {
        let hash = transaction.hash();
        self.mempool
            .add(transaction.clone())
            .map_err(|e| SandboxError::Consensus(e.to_string()))?;
        self.pending.push(transaction.clone());
        self.transactions.insert(hash, transaction);
        Ok(hash)
    }

    /// Produce the next block including pending mempool transactions.
    pub async fn produce_block(&mut self) -> Result<Block, SandboxError> {
        self.height += 1;
        let height = self.height;
        let txs = self.mempool.drain(1_000);
        self.pending
            .retain(|tx| !txs.iter().any(|t| t.hash() == tx.hash()));

        let block = self.consensus.propose(height, txs.clone()).await?;
        let hash = block.hash();

        self.blocks.insert(height, block.clone());
        self.blocks_by_hash.insert(hash, block.clone());

        for tx in &txs {
            self.transactions.insert(tx.hash(), tx.clone());
        }

        Ok(block)
    }

    /// Get the current sandbox height.
    pub fn height(&self) -> u64 {
        self.height
    }

    /// Get the balance of an account.
    pub fn balance(&self, address: &Address) -> Result<u128, SandboxError> {
        Ok(self.consensus.state().balance(address)?)
    }

    /// Get the nonce of an account.
    pub fn nonce(&self, address: &Address) -> Result<u64, SandboxError> {
        Ok(self.consensus.state().nonce(address)?)
    }

    /// Get a block by height.
    pub fn block_by_height(&self, height: u64) -> Result<Block, SandboxError> {
        self.blocks
            .get(&height)
            .cloned()
            .ok_or(SandboxError::BlockNotFound)
    }

    /// Get a block by hash.
    pub fn block_by_hash(&self, hash: &Hash) -> Result<Block, SandboxError> {
        self.blocks_by_hash
            .get(hash)
            .cloned()
            .ok_or(SandboxError::BlockNotFound)
    }

    /// Get a transaction by hash.
    pub fn transaction(&self, hash: &Hash) -> Result<Transaction, SandboxError> {
        self.transactions
            .get(hash)
            .cloned()
            .ok_or(SandboxError::TransactionNotFound)
    }

    /// Get pending transactions not yet included in a block.
    pub fn pending(&self) -> Vec<Transaction> {
        self.pending.clone()
    }

    /// Reset the sandbox to an empty state at height 0.
    pub fn reset(&mut self) {
        self.consensus = SoloConsensus::new(self.proposer);
        self.mempool = SimpleMempool::new();
        self.blocks.clear();
        self.blocks_by_hash.clear();
        self.transactions.clear();
        self.pending.clear();
        self.height = 0;
    }

    /// Access the internal consensus state store.
    pub fn consensus_state(&self) -> &pemrix_storage::StateStore<pemrix_storage::InMemoryBackend> {
        self.consensus.state()
    }
}

impl Default for Sandbox {
    fn default() -> Self {
        Self::new(Address::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn sandbox_funds_and_transfers() {
        let mut sandbox = Sandbox::default();
        let alice = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));

        sandbox.fund(alice, 1_000).unwrap();
        assert_eq!(sandbox.balance(&alice).unwrap(), 1_000);

        let tx = Transaction::transfer(alice, bob, 100, 0, 1);
        sandbox.submit(tx).unwrap();

        let block = sandbox.produce_block().await.unwrap();
        assert_eq!(block.header.height, 1);
        assert_eq!(sandbox.height(), 1);
        assert_eq!(sandbox.balance(&alice).unwrap(), 899);
        assert_eq!(sandbox.balance(&bob).unwrap(), 100);
    }

    #[tokio::test]
    async fn sandbox_queries_block_and_transaction() {
        let mut sandbox = Sandbox::default();
        let alice = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));

        sandbox.fund(alice, 1_000).unwrap();
        let tx = Transaction::transfer(alice, bob, 50, 0, 1);
        let tx_hash = tx.hash();
        sandbox.submit(tx).unwrap();

        let block = sandbox.produce_block().await.unwrap();
        let block_hash = block.hash();

        assert_eq!(sandbox.block_by_height(1).unwrap().hash(), block_hash);
        assert_eq!(sandbox.block_by_hash(&block_hash).unwrap().header.height, 1);
        assert_eq!(sandbox.transaction(&tx_hash).unwrap().amount, 50);
    }

    #[tokio::test]
    async fn sandbox_resets() {
        let mut sandbox = Sandbox::default();
        let alice = Address::from_public_key_hash(Hash::hash_bytes(b"alice"));
        sandbox.fund(alice, 1_000).unwrap();
        sandbox.produce_block().await.unwrap();

        sandbox.reset();
        assert_eq!(sandbox.height(), 0);
        assert_eq!(sandbox.balance(&alice).unwrap(), 0);
        assert!(sandbox.block_by_height(1).is_err());
    }
}
