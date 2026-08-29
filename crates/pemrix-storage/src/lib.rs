//! # PEMRIX Storage
//!
//! Storage abstraction for consensus-critical state. The validator node uses a
//! tiny, predictable state engine. Historical archives, indexers, and analytics
//! live in separate services.

#![warn(missing_docs)]

pub mod backend;
pub mod error;
pub mod state;

pub use backend::{InMemoryBackend, StateBackend};
#[cfg(feature = "rocksdb")]
pub use backend::RocksDbBackend;
pub use error::StorageError;
pub use state::{AccountState, StateRoot, StateStore};
