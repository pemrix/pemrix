//! Consensus engine trait.

use crate::{ConsensusError, Finality, Proposal, Vote};
use pemrix_primitives::{Address, Block, Hash, Transaction};

/// A consensus engine produces and finalizes blocks.
#[async_trait::async_trait]
pub trait ConsensusEngine: Send + Sync {
    /// Propose a new block at the given height.
    async fn propose(
        &mut self,
        height: u64,
        transactions: Vec<Transaction>,
    ) -> Result<Block, ConsensusError>;

    /// Handle an incoming proposal.
    async fn handle_proposal(&mut self, proposal: Proposal) -> Result<(), ConsensusError>;

    /// Handle an incoming vote.
    async fn handle_vote(&mut self, vote: Vote) -> Result<(), ConsensusError>;

    /// Attempt to finalize a block.
    async fn finalize(&mut self, block_hash: Hash) -> Result<Finality, ConsensusError>;

    /// Return the current chain height.
    fn height(&self) -> u64;

    /// Return the validator address if this node is a validator.
    fn validator_address(&self) -> Option<Address>;
}
