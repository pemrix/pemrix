//! Unified block executor for PEMRIX.
//!
//! This is the entry point used by consensus to execute transactions. It
//! performs signature, nonce, and fee validation once, then dispatches to the
//! appropriate handler based on the transaction payload prefix:
//!
//! - empty payload: native PEMRIX transfer
//! - `0x01`: staking operation (register, delegate, undelegate)
//! - other: rejected as invalid contract

use crate::{ExecutionResult, Gas, StakingExecutor, Vm, VmError};
use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
use pemrix_primitives::{Hash, Transaction};
use pemrix_storage::{StateBackend, StateStore};

/// Unified executor run by consensus for every transaction in a block.
#[derive(Clone, Copy, Debug, Default)]
pub struct BlockExecutor;

impl BlockExecutor {
    /// Create a new block executor.
    pub const fn new() -> Self {
        Self
    }

    /// Verify the transaction signature and that the sender matches the public key.
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

impl Vm for BlockExecutor {
    fn execute<B: StateBackend>(
        &self,
        state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        Self::verify_signature(transaction)?;

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

        let sender_balance = state
            .balance(&transaction.sender)
            .map_err(|_| VmError::Storage)?;
        if sender_balance < transaction.fee {
            return Ok(ExecutionResult {
                success: false,
                gas_used: Gas::new(0),
                message: "insufficient balance for fee".to_string(),
            });
        }

        // Deduct fee and advance nonce once for every transaction.
        let mut sender = state
            .get_account(&transaction.sender)
            .map_err(|_| VmError::Storage)?
            .unwrap_or_default();
        sender.balance -= transaction.fee;
        sender.nonce += 1;
        state
            .set_account(&transaction.sender, sender)
            .map_err(|_| VmError::Storage)?;

        // Dispatch by payload prefix.
        if transaction.payload.is_empty() {
            // Native transfer: move the transfer amount from sender to recipient.
            // The fee was already deducted and the nonce already advanced above.
            if transaction.amount > 0 {
                let mut sender = state
                    .get_account(&transaction.sender)
                    .map_err(|_| VmError::Storage)?
                    .unwrap_or_default();
                if sender.balance < transaction.amount {
                    return Ok(ExecutionResult {
                        success: false,
                        gas_used: Gas::new(0),
                        message: "insufficient balance for transfer".to_string(),
                    });
                }
                sender.balance -= transaction.amount;
                state
                    .set_account(&transaction.sender, sender)
                    .map_err(|_| VmError::Storage)?;

                state
                    .transfer_amount_only(&transaction.recipient, transaction.amount)
                    .map_err(|_| VmError::Storage)?;
            }
            Ok(ExecutionResult {
                success: true,
                gas_used: Gas::new(21_000),
                message: "ok".to_string(),
            })
        } else if transaction.payload[0] == 0x01 {
            StakingExecutor::new().execute(state, transaction)
        } else {
            Ok(ExecutionResult {
                success: false,
                gas_used: Gas::new(0),
                message: "invalid contract".to_string(),
            })
        }
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
    fn block_executor_transfer() {
        let mut state = StateStore::new_in_memory();
        let (alice_kp, alice) = random_keypair();
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));
        state.set_account(&alice, Account::new(1_000, 0)).unwrap();

        let mut tx = Transaction::transfer(alice, bob, 100, 0, 1);
        sign_tx(&mut tx, &alice_kp);

        let result = BlockExecutor::new().execute(&mut state, &tx).unwrap();
        assert!(result.success);
        assert_eq!(state.balance(&alice).unwrap(), 899);
        assert_eq!(state.balance(&bob).unwrap(), 100);
        assert_eq!(state.nonce(&alice).unwrap(), 1);
    }

    #[test]
    fn block_executor_register_validator() {
        let mut state = StateStore::new_in_memory();
        let (kp, sender) = random_keypair();
        state
            .set_account(&sender, Account::new(100_000, 0))
            .unwrap();

        let mut payload = vec![0x01];
        payload.extend_from_slice(
            &serde_json::to_vec(&crate::StakingOperation::RegisterValidator {
                consensus_pubkey: vec![1; 32],
                commission_bps: 500,
                self_stake: 10_000,
            })
            .unwrap(),
        );

        let mut tx = Transaction {
            sender,
            recipient: Address::default(),
            amount: 0,
            nonce: 0,
            fee: 1,
            public_key: vec![],
            signature: vec![],
            payload,
        };
        sign_tx(&mut tx, &kp);

        let result = BlockExecutor::new().execute(&mut state, &tx).unwrap();
        assert!(result.success);
        assert_eq!(state.balance(&sender).unwrap(), 89_999); // 100k - 10k stake - 1 fee
        let record = state.validator_record(&sender).unwrap().unwrap();
        assert_eq!(record.self_stake, 10_000);
        assert_eq!(state.nonce(&sender).unwrap(), 1);
    }
}
