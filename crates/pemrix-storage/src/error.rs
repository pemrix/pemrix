//! Storage errors.

/// Errors that can occur when interacting with the state store.
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    /// Key not found.
    #[error("key not found")]
    NotFound,
    /// Backend failure.
    #[error("backend error: {0}")]
    Backend(String),
    /// Serialization failure.
    #[error("serialization error")]
    Serialization,
    /// State root mismatch.
    #[error("state root mismatch")]
    StateRootMismatch,
}
