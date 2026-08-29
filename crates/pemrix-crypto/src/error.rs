//! Cryptographic errors.

/// Errors that can occur during cryptographic operations.
#[derive(Debug, thiserror::Error)]
pub enum CryptoError {
    /// Signature verification failed.
    #[error("signature verification failed")]
    VerificationFailed,
    /// Invalid key material.
    #[error("invalid key material")]
    InvalidKey,
    /// Random number generation failure.
    #[error("random number generation failed")]
    RngFailed,
    /// Unsupported signature algorithm.
    #[error("unsupported signature algorithm")]
    UnsupportedAlgorithm,
    /// Hybrid signature component mismatch.
    #[error("hybrid signature component mismatch")]
    HybridMismatch,
}
