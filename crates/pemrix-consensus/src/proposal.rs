//! Consensus proposals and votes.

use pemrix_primitives::{Block, Hash};
use serde::{Deserialize, Serialize};

/// A block proposal.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Proposal {
    /// Hash of the proposed block.
    pub block_hash: Hash,
    /// Block height.
    pub height: u64,
    /// Round number.
    pub round: u64,
    /// Proposer identifier.
    pub proposer: [u8; 32],
}

/// A vote on a proposal.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Vote {
    /// Hash of the block being voted on.
    pub block_hash: Hash,
    /// Block height.
    pub height: u64,
    /// Round number.
    pub round: u64,
    /// Voter identifier.
    pub voter: [u8; 32],
}

/// Finality information for a block.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Finality {
    /// Finalized block.
    pub block: Block,
    /// Finality timestamp.
    pub timestamp: u64,
}
