//! Transaction mempool.

use pemrix_primitives::Transaction;

/// A transaction mempool.
pub trait Mempool: Send + Sync {
    /// Add a transaction to the mempool.
    fn add(&mut self, transaction: Transaction) -> Result<(), &'static str>;

    /// Get transactions to include in the next block.
    fn drain(&mut self, max: usize) -> Vec<Transaction>;

    /// Return the number of pending transactions.
    fn len(&self) -> usize;

    /// Return true if the mempool is empty.
    fn is_empty(&self) -> bool;
}

/// A simple FIFO mempool.
#[derive(Clone, Debug, Default)]
pub struct SimpleMempool {
    transactions: Vec<Transaction>,
}

impl SimpleMempool {
    /// Create a new empty mempool.
    pub fn new() -> Self {
        Self::default()
    }
}

impl Mempool for SimpleMempool {
    fn add(&mut self, transaction: Transaction) -> Result<(), &'static str> {
        self.transactions.push(transaction);
        Ok(())
    }

    fn drain(&mut self, max: usize) -> Vec<Transaction> {
        let count = std::cmp::min(max, self.transactions.len());
        self.transactions.drain(..count).collect()
    }

    fn len(&self) -> usize {
        self.transactions.len()
    }

    fn is_empty(&self) -> bool {
        self.transactions.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mempool_drain_respects_max() {
        let mut mempool = SimpleMempool::new();
        for _ in 0..10 {
            mempool.add(Transaction::default()).unwrap();
        }
        let drained = mempool.drain(3);
        assert_eq!(drained.len(), 3);
        assert_eq!(mempool.len(), 7);
    }
}
