//! WASM-based smart contract execution.
//!
//! This module is a scaffolding placeholder. A production implementation would
//! use `wasmtime` with deterministic gas metering and sandboxed host functions.

use crate::{ExecutionResult, Vm, VmError};
use pemrix_primitives::Transaction;
use pemrix_storage::{StateBackend, StateStore};

/// WASM virtual machine.
#[derive(Clone, Copy, Debug, Default)]
pub struct WasmVm;

impl WasmVm {
    /// Create a new WASM VM.
    pub const fn new() -> Self {
        Self
    }
}

impl Vm for WasmVm {
    fn execute<B: StateBackend>(
        &self,
        _state: &mut StateStore<B>,
        _transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        Err(VmError::InvalidContract)
    }
}
