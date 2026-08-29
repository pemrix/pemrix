//! VM errors.

/// Errors that can occur during execution.
#[derive(Debug, thiserror::Error)]
pub enum VmError {
    /// Insufficient balance.
    #[error("insufficient balance")]
    InsufficientBalance,
    /// Invalid nonce.
    #[error("invalid nonce")]
    InvalidNonce,
    /// Out of gas.
    #[error("out of gas")]
    OutOfGas,
    /// Invalid contract.
    #[error("invalid contract")]
    InvalidContract,
    /// Storage error.
    #[error("storage error")]
    Storage,
    /// Unknown operation.
    #[error("unknown operation")]
    UnknownOperation,
}
