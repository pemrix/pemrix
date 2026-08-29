//! Explorer errors.

/// Errors returned by the explorer service.
#[derive(Debug, thiserror::Error)]
pub enum ExplorerError {
    /// Block not found.
    #[error("block not found")]
    BlockNotFound,
    /// Transaction not found.
    #[error("transaction not found")]
    TransactionNotFound,
    /// Account not found.
    #[error("account not found")]
    AccountNotFound,
    /// Invalid parameter.
    #[error("invalid parameter: {0}")]
    InvalidParameter(String),
    /// Internal error.
    #[error("internal error: {0}")]
    Internal(String),
}
