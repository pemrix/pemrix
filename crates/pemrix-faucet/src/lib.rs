//! # PEMRIX Faucet
//!
//! Testnet faucet service for distributing test tokens to developers.

#![warn(missing_docs)]

pub mod config;
pub mod error;
pub mod service;

pub use config::FaucetConfig;
pub use error::FaucetError;
pub use service::{FaucetService, LocalSubmitter, TransactionSubmitter};
