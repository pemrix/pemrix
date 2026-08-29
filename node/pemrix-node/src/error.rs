//! Node errors.

/// Errors that can occur in the node.
#[derive(Debug, thiserror::Error)]
pub enum NodeError {
    /// Configuration error.
    #[error("configuration error: {0}")]
    Config(String),
    /// Storage error.
    #[error("storage error")]
    Storage,
    /// Consensus error.
    #[error("consensus error")]
    Consensus,
    /// RPC error.
    #[error("rpc error")]
    Rpc,
    /// Network error.
    #[error("network error")]
    Network,
    /// IO error.
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}
