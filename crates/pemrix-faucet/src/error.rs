//! Faucet errors.

/// Errors returned by the faucet service.
#[derive(Debug, thiserror::Error)]
pub enum FaucetError {
    /// Requested amount exceeds the maximum allowed.
    #[error("amount exceeds maximum")]
    AmountTooHigh,
    /// Address is on cooldown.
    #[error("address is on cooldown")]
    Cooldown,
    /// Invalid address.
    #[error("invalid address")]
    InvalidAddress,
    /// Signing failed.
    #[error("signing failed")]
    Signing,
    /// Submission failed.
    #[error("submission failed: {0}")]
    Submission(String),
    /// Insufficient funds.
    #[error("insufficient faucet funds")]
    InsufficientFunds,
}
