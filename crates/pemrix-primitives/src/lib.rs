//! # PEMRIX Primitives
//!
//! Canonical types for the PEMRIX blockchain: hashes, addresses, accounts,
//! transactions, blocks, and deterministic binary encoding.
//!
//! This crate is intentionally minimal and contains no consensus logic,
//! networking, or I/O. It is the lowest layer of the protocol stack.

#![warn(missing_docs)]

pub mod account;
pub mod address;
pub mod block;
pub mod encoding;
pub mod hash;
pub mod tokenomics;
pub mod transaction;

#[cfg(test)]
mod proptest_tests;

pub use account::{Account, Balance, Nonce};
pub use address::Address;
pub use block::{Block, BlockBody, BlockHeader};
pub use hash::Hash;
pub use tokenomics::TokenomicsConfig;
pub use transaction::Transaction;
