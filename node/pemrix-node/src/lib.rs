//! # PEMRIX Node
//!
//! Validator and full-node implementation. This crate wires together the
//! consensus-critical components: storage, networking, consensus, mempool,
//! execution, and RPC.
//!
//! The node is intentionally small. Wallets, explorers, exchanges, and payment
//! products are separate applications.

#![warn(missing_docs)]

pub mod config;
pub mod error;
pub mod genesis;
pub mod node;
pub mod testnet;

pub use config::NodeConfig;
pub use error::NodeError;
pub use genesis::GenesisConfig;
pub use node::{init, keys, spawn_bft_validator, start, status, Node};
pub use testnet::run_testnet;
