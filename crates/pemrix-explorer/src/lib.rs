//! # PEMRIX Explorer
//!
//! Blockchain explorer API for querying blocks, transactions, accounts, and
//! validators.

#![warn(missing_docs)]

pub mod error;
pub mod service;

pub use error::ExplorerError;
pub use service::{ExplorerService, ExplorerState};
