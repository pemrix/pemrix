//! WASM-based smart contract execution.
//!
//! A production implementation uses `wasmtime` with deterministic gas metering
//! and sandboxed host functions. This first implementation runs a tiny
//! "hello world" style contract and rejects anything else, establishing the
//! sandbox boundary and gas accounting.

use crate::{ExecutionResult, Gas, Vm, VmError};
use pemrix_primitives::Transaction;
use pemrix_storage::{StateBackend, StateStore};

#[cfg(feature = "wasm")]
use wasmtime::{Engine, Linker, Module, Store};

/// WASM virtual machine.
#[derive(Clone, Debug, Default)]
pub struct WasmVm;

impl WasmVm {
    /// Create a new WASM VM.
    pub const fn new() -> Self {
        Self
    }

    /// Execute a trivial in-module contract for testing.
    ///
    /// The transaction `payload` must be a valid WASM module. If the module
    /// exports a `run() -> i32` function, it is invoked and the result is
    /// returned. Anything else returns `InvalidContract`.
    #[cfg(feature = "wasm")]
    fn run_contract(&self, wasm: &[u8]) -> Result<i32, VmError> {
        let engine = Engine::default();
        let module = Module::new(&engine, wasm).map_err(|_| VmError::InvalidContract)?;
        let linker = Linker::<u64>::new(&engine);
        let mut store = Store::new(&engine, 0u64);
        let instance = linker
            .instantiate(&mut store, &module)
            .map_err(|_| VmError::InvalidContract)?;
        let run = instance
            .get_typed_func::<(), i32>(&mut store, "run")
            .map_err(|_| VmError::InvalidContract)?;
        run.call(&mut store, ())
            .map_err(|_| VmError::Execution("contract trap".to_string()))
    }

    #[cfg(not(feature = "wasm"))]
    fn run_contract(&self, _wasm: &[u8]) -> Result<i32, VmError> {
        Err(VmError::InvalidContract)
    }
}

impl Vm for WasmVm {
    fn execute<B: StateBackend>(
        &self,
        _state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        if transaction.payload.is_empty() {
            return Err(VmError::InvalidContract);
        }

        let result = self.run_contract(&transaction.payload)?;

        Ok(ExecutionResult {
            success: result == 0,
            gas_used: Gas::new(100_000),
            message: format!("wasm contract returned {}", result),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::{Address, Transaction};
    use pemrix_storage::StateStore;

    fn simple_run_contract_wasm() -> Vec<u8> {
        // Minimal wat: (module (func (export "run") (result i32) i32.const 0))
        // Compiled to wasm bytes by `wasm-tools parse`.
        vec![
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01,
            0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x72, 0x75, 0x6e, 0x00, 0x00,
            0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x00, 0x0b,
        ]
    }

    #[test]
    #[cfg(feature = "wasm")]
    fn wasm_contract_runs_and_returns_zero() {
        let vm = WasmVm::new();
        let mut state = StateStore::new_in_memory();
        let mut tx = Transaction::transfer(Address::default(), Address::default(), 0, 0, 0);
        tx.payload = simple_run_contract_wasm();
        let result = vm.execute(&mut state, &tx).unwrap();
        assert!(result.success);
    }

    #[test]
    #[cfg(not(feature = "wasm"))]
    fn wasm_contract_disabled_without_feature() {
        let vm = WasmVm::new();
        let mut state = StateStore::new_in_memory();
        let mut tx = Transaction::transfer(Address::default(), Address::default(), 0, 0, 0);
        tx.payload = vec![0x00, 0x61, 0x73, 0x6d];
        assert!(vm.execute(&mut state, &tx).is_err());
    }
}
