//! Block primitive for PEMRIX.

use crate::{Hash, Transaction};

/// Block header.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct BlockHeader {
    /// Block height.
    pub height: u64,
    /// Timestamp (Unix seconds).
    pub timestamp: u64,
    /// Hash of the previous block header.
    pub previous_hash: Hash,
    /// State root after executing this block.
    pub state_root: Hash,
    /// Merkle root of transactions.
    pub tx_root: Hash,
    /// Proposer address or public key hash.
    pub proposer: [u8; 32],
}

/// Block body.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct BlockBody {
    /// Transactions included in the block.
    pub transactions: Vec<Transaction>,
}

/// A complete block.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct Block {
    /// Block header.
    pub header: BlockHeader,
    /// Block body.
    pub body: BlockBody,
}

impl Block {
    /// Compute the canonical hash of the block header.
    pub fn hash(&self) -> Hash {
        let bytes = crate::encoding::encode(&self.header);
        Hash::hash_bytes(&bytes)
    }
}
