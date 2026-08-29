//! RPC errors.

/// Errors returned by RPC handlers.
#[derive(Debug, thiserror::Error)]
pub enum RpcError {
    /// Transaction not found.
    #[error("transaction not found")]
    TransactionNotFound,
    /// Block not found.
    #[error("block not found")]
    BlockNotFound,
    /// Account not found.
    #[error("account not found")]
    AccountNotFound,
    /// Invalid request.
    #[error("invalid request")]
    InvalidRequest,
    /// Internal error.
    #[error("internal error: {0}")]
    Internal(String),
}
