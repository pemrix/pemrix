//! # PEMRIX Node
//!
//! Validator and full-node implementation. This crate wires together the
//! consensus-critical components: storage, networking, consensus, mempool,
//! execution, and RPC.
//!
//! The node is intentionally small. Wallets, explorers, exchanges, and payment
//! products are separate applications.

#![warn(missing_docs)]

pub mod bootstrap;
pub mod config;
pub mod error;
pub mod genesis;
pub mod keys;
pub mod node;
pub mod services;
pub mod testnet;

pub use bootstrap::{bootstrap_bft_network, manifest_from_key_files, BootstrapValidator};
pub use config::NodeConfig;
pub use error::NodeError;
pub use genesis::GenesisConfig;
pub use keys::{generate_and_save as generate_validator_key, ValidatorKeyFile};
pub use node::{init, keys, spawn_bft_validator, start, start_validator, status, Node};
pub use services::run_services;
pub use testnet::run_testnet;
