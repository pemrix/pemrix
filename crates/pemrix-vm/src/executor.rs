//! VM executor trait.

use crate::{Gas, VmError};
use pemrix_primitives::Transaction;
use pemrix_storage::{StateBackend, StateStore};

/// Result of executing a transaction.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ExecutionResult {
    /// Whether execution succeeded.
    pub success: bool,
    /// Gas used.
    pub gas_used: Gas,
    /// Result message or error.
    pub message: String,
}

/// A virtual machine executor.
pub trait Vm {
    /// Execute a transaction against the given state store.
    fn execute<B: StateBackend>(
        &self,
        state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError>;
}
