//! # PEMRIX Testnet
//!
//! Configuration and bootstrap utilities for PEMRIX testnets.
//!
//! Provides preset testnet configurations (e.g. `local`) with pre-funded
//! developer accounts, faucet accounts, and a genesis validator set.

#![warn(missing_docs)]

pub mod config;

pub use config::{TestnetConfig, TestnetPreset};
