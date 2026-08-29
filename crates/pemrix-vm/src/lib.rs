//! # PEMRIX VM
//!
//! Deterministic execution layer for PEMRIX. The initial implementation
//! supports native transfers and a no-op contract stub. WebAssembly-based
//! smart contracts are supported behind the `wasm` feature flag.
//!
//! The VM is isolated from the consensus engine; consensus only verifies the
//! state root produced by execution.

#![warn(missing_docs)]

pub mod error;
pub mod executor;
pub mod gas;
pub mod native;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use error::VmError;
pub use executor::{ExecutionResult, Vm};
pub use gas::Gas;
pub use native::NativeExecutor;
