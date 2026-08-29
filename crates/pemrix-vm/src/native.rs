//! Native execution for transfers.

use crate::{ExecutionResult, Gas, Vm, VmError};
use pemrix_primitives::Transaction;
use pemrix_storage::{StateBackend, StateStore};

/// Native executor handling built-in operations.
#[derive(Clone, Copy, Debug, Default)]
pub struct NativeExecutor;

impl NativeExecutor {
    /// Create a new native executor.
    pub const fn new() -> Self {
        Self
    }
}

impl Vm for NativeExecutor {
    fn execute<B: StateBackend>(
        &self,
        state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        let sender_balance = state
            .balance(&transaction.sender)
            .map_err(|_| VmError::Storage)?;
        let sender_nonce = state
            .nonce(&transaction.sender)
            .map_err(|_| VmError::Storage)?;

        if sender_nonce != transaction.nonce {
            return Ok(ExecutionResult {
                success: false,
                gas_used: Gas::new(0),
                message: "invalid nonce".to_string(),
            });
        }

        let total = transaction
            .amount
            .checked_add(transaction.fee)
            .ok_or(VmError::InsufficientBalance)?;
        if sender_balance < total {
            return Ok(ExecutionResult {
                success: false,
                gas_used: Gas::new(0),
                message: "insufficient balance".to_string(),
            });
        }

        state
            .transfer(
                &transaction.sender,
                &transaction.recipient,
                transaction.amount,
                transaction.fee,
            )
            .map_err(|_| VmError::Storage)?;

        Ok(ExecutionResult {
            success: true,
            gas_used: Gas::new(21_000),
            message: "ok".to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::{Account, Address, Hash};

    #[test]
    fn native_transfer() {
        let mut state = StateStore::new_in_memory();
        let alice = Address::default();
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));
        state.set_account(&alice, Account::new(1_000, 0)).unwrap();

        let tx = Transaction::transfer(alice, bob, 100, 0, 1);
        let executor = NativeExecutor::new();
        let result = executor.execute(&mut state, &tx).unwrap();
        assert!(result.success);
        assert_eq!(state.balance(&alice).unwrap(), 899);
        assert_eq!(state.balance(&bob).unwrap(), 100);
    }
}
