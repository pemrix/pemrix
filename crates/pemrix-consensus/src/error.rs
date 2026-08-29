//! Consensus errors.

/// Errors that can occur in consensus.
#[derive(Debug, thiserror::Error)]
pub enum ConsensusError {
    /// Invalid proposal.
    #[error("invalid proposal")]
    InvalidProposal,
    /// Invalid vote.
    #[error("invalid vote")]
    InvalidVote,
    /// Execution failed.
    #[error("execution failed: {0}")]
    ExecutionFailed(String),
    /// Storage error.
    #[error("storage error")]
    Storage,
    /// Network error.
    #[error("network error: {0}")]
    Network(String),
    /// Not the proposer.
    #[error("not the proposer")]
    NotProposer,
    /// Already finalized.
    #[error("already finalized")]
    AlreadyFinalized,
}
