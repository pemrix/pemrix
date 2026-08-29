//! Native execution for transfers.

use crate::{ExecutionResult, Gas, Vm, VmError};
use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
use pemrix_primitives::{Hash, Transaction};
use pemrix_storage::{StateBackend, StateStore};

/// Native executor handling built-in operations.
#[derive(Clone, Copy, Debug, Default)]
pub struct NativeExecutor;

impl NativeExecutor {
    /// Create a new native executor.
    pub const fn new() -> Self {
        Self
    }

    /// Verify the transaction signature.
    fn verify_signature(transaction: &Transaction) -> Result<(), VmError> {
        if transaction.public_key.len() != 32 {
            return Err(VmError::InvalidSignature);
        }
        if transaction.signature.len() != 64 {
            return Err(VmError::InvalidSignature);
        }

        let derived_address = Hash::hash_bytes(&transaction.public_key);
        if derived_address.as_bytes() != transaction.sender.as_bytes() {
            return Err(VmError::InvalidSignature);
        }

        let scheme = Ed25519Scheme::new();
        scheme
            .verify(
                &pemrix_crypto::PublicKey(transaction.public_key.clone()),
                transaction.signing_hash().as_bytes(),
                &pemrix_crypto::Signature(transaction.signature.clone()),
            )
            .map_err(|_| VmError::InvalidSignature)
    }
}

impl Vm for NativeExecutor {
    fn execute<B: StateBackend>(
        &self,
        state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        Self::verify_signature(transaction)?;

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
    use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
    use pemrix_primitives::{Account, Address, Hash};

    fn random_keypair() -> (pemrix_crypto::KeyPair, Address) {
        let scheme = Ed25519Scheme::new();
        let kp = scheme.generate_keypair().unwrap();
        let address = Address::from_public_key_hash(Hash::hash_bytes(&kp.public.0));
        (kp, address)
    }

    fn sign_tx(tx: &mut Transaction, keypair: &pemrix_crypto::KeyPair) {
        tx.public_key = keypair.public.0.clone();
        tx.sender = Address::from_public_key_hash(Hash::hash_bytes(&tx.public_key));
        let scheme = Ed25519Scheme::new();
        let sig = scheme
            .sign(&keypair.secret, tx.signing_hash().as_bytes())
            .unwrap();
        tx.signature = sig.0;
    }

    #[test]
    fn native_transfer() {
        let mut state = StateStore::new_in_memory();
        let (alice_kp, alice) = random_keypair();
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));
        state.set_account(&alice, Account::new(1_000, 0)).unwrap();

        let mut tx = Transaction::transfer(alice, bob, 100, 0, 1);
        sign_tx(&mut tx, &alice_kp);

        let executor = NativeExecutor::new();
        let result = executor.execute(&mut state, &tx).unwrap();
        assert!(result.success);
        assert_eq!(state.balance(&alice).unwrap(), 899);
        assert_eq!(state.balance(&bob).unwrap(), 100);
    }
}
