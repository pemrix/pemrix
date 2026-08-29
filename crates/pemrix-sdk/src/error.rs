//! SDK errors.

/// Errors returned by the SDK.
#[derive(Debug, thiserror::Error)]
pub enum SdkError {
    /// RPC call failed.
    #[error("rpc error: {0}")]
    Rpc(String),
    /// Signing failed.
    #[error("signing failed")]
    Signing,
    /// Invalid address.
    #[error("invalid address")]
    InvalidAddress,
    /// Insufficient balance.
    #[error("insufficient balance")]
    InsufficientBalance,
}
