//! Staking operations for the PEMRIX VM.

use crate::{ExecutionResult, Gas, Vm, VmError};
use pemrix_primitives::{Address, Balance, Transaction, ValidatorRecord, ValidatorStatus};
use pemrix_storage::{StateBackend, StateStore};
use serde::{Deserialize, Serialize};

/// Minimum self-stake required to register a validator.
pub const MIN_SELF_STAKE: Balance = 10_000;

/// Minimum delegation amount.
pub const MIN_DELEGATION: Balance = 1;

mod u128_string {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S: Serializer>(value: &u128, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&value.to_string())
    }

    pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<u128, D::Error> {
        let s = String::deserialize(deserializer)?;
        s.parse::<u128>().map_err(serde::de::Error::custom)
    }
}

/// Staking operations encoded in a transaction payload.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum StakingOperation {
    /// Register a new validator.
    RegisterValidator {
        /// Consensus public key for the validator.
        consensus_pubkey: Vec<u8>,
        /// Commission rate in basis points (0–10000).
        commission_bps: u16,
        /// Amount of self-stake to lock.
        #[serde(with = "u128_string")]
        self_stake: Balance,
    },
    /// Delegate tokens to a validator.
    Delegate {
        /// Validator address.
        validator: Address,
        /// Amount to delegate.
        #[serde(with = "u128_string")]
        amount: Balance,
    },
    /// Undelegate tokens from a validator.
    Undelegate {
        /// Validator address.
        validator: Address,
        /// Amount to undelegate.
        #[serde(with = "u128_string")]
        amount: Balance,
    },
}

/// Execute staking operations against the state store.
#[derive(Clone, Copy, Debug, Default)]
pub struct StakingExecutor;

impl StakingExecutor {
    /// Create a new staking executor.
    pub const fn new() -> Self {
        Self
    }

    /// Decode a staking operation from raw payload bytes.
    pub fn decode(payload: &[u8]) -> Result<StakingOperation, VmError> {
        if payload.len() < 2 || payload[0] != 0x01 {
            return Err(VmError::InvalidContract);
        }
        serde_json::from_slice(&payload[1..]).map_err(|_| VmError::InvalidContract)
    }

    fn register<B: StateBackend>(
        state: &mut StateStore<B>,
        sender: Address,
        consensus_pubkey: Vec<u8>,
        commission_bps: u16,
        self_stake: Balance,
    ) -> Result<ExecutionResult, VmError> {
        if consensus_pubkey.is_empty() {
            return Err(VmError::InvalidContract);
        }
        if commission_bps > 10_000 {
            return Err(VmError::InvalidContract);
        }
        if self_stake < MIN_SELF_STAKE {
            return Err(VmError::InvalidContract);
        }
        if state
            .validator_record(&sender)
            .map_err(|_| VmError::Storage)?
            .is_some()
        {
            return Err(VmError::InvalidContract);
        }

        let balance = state.balance(&sender).map_err(|_| VmError::Storage)?;
        if balance < self_stake {
            return Err(VmError::InsufficientBalance);
        }

        let mut account = state
            .get_account(&sender)
            .map_err(|_| VmError::Storage)?
            .unwrap_or_default();
        account.balance -= self_stake;
        state
            .set_account(&sender, account)
            .map_err(|_| VmError::Storage)?;

        let record = ValidatorRecord::new(sender, consensus_pubkey, self_stake, commission_bps);
        state
            .set_validator_record(&sender, record)
            .map_err(|_| VmError::Storage)?;

        Ok(ExecutionResult {
            success: true,
            gas_used: Gas::new(50_000),
            message: "validator registered".to_string(),
        })
    }

    fn delegate<B: StateBackend>(
        state: &mut StateStore<B>,
        sender: Address,
        validator: Address,
        amount: Balance,
    ) -> Result<ExecutionResult, VmError> {
        if amount < MIN_DELEGATION {
            return Err(VmError::InvalidContract);
        }

        let record = state
            .validator_record(&validator)
            .map_err(|_| VmError::Storage)?
            .ok_or(VmError::InvalidContract)?;
        if record.status != ValidatorStatus::Active {
            return Err(VmError::InvalidContract);
        }

        let balance = state.balance(&sender).map_err(|_| VmError::Storage)?;
        if balance < amount {
            return Err(VmError::InsufficientBalance);
        }

        let mut account = state
            .get_account(&sender)
            .map_err(|_| VmError::Storage)?
            .unwrap_or_default();
        account.balance -= amount;
        state
            .set_account(&sender, account)
            .map_err(|_| VmError::Storage)?;

        let mut record = record;
        record.delegated_stake += amount;
        state
            .set_validator_record(&validator, record)
            .map_err(|_| VmError::Storage)?;

        let mut delegation = state
            .delegation(&sender, &validator)
            .map_err(|_| VmError::Storage)?
            .unwrap_or_default();
        delegation.amount += amount;
        state
            .set_delegation(&sender, &validator, delegation)
            .map_err(|_| VmError::Storage)?;

        Ok(ExecutionResult {
            success: true,
            gas_used: Gas::new(30_000),
            message: "delegated".to_string(),
        })
    }

    fn undelegate<B: StateBackend>(
        state: &mut StateStore<B>,
        sender: Address,
        validator: Address,
        amount: Balance,
    ) -> Result<ExecutionResult, VmError> {
        let delegation = state
            .delegation(&sender, &validator)
            .map_err(|_| VmError::Storage)?
            .ok_or(VmError::InvalidContract)?;
        if delegation.amount < amount {
            return Err(VmError::InsufficientBalance);
        }

        let mut record = state
            .validator_record(&validator)
            .map_err(|_| VmError::Storage)?
            .ok_or(VmError::InvalidContract)?;
        record.delegated_stake = record.delegated_stake.saturating_sub(amount);
        state
            .set_validator_record(&validator, record)
            .map_err(|_| VmError::Storage)?;

        let mut delegation = delegation;
        delegation.amount -= amount;
        if delegation.amount == 0 {
            state
                .delete_delegation(&sender, &validator)
                .map_err(|_| VmError::Storage)?;
        } else {
            state
                .set_delegation(&sender, &validator, delegation)
                .map_err(|_| VmError::Storage)?;
        }

        let mut account = state
            .get_account(&sender)
            .map_err(|_| VmError::Storage)?
            .unwrap_or_default();
        account.balance += amount;
        state
            .set_account(&sender, account)
            .map_err(|_| VmError::Storage)?;

        Ok(ExecutionResult {
            success: true,
            gas_used: Gas::new(30_000),
            message: "undelegated".to_string(),
        })
    }
}

impl Vm for StakingExecutor {
    fn execute<B: StateBackend>(
        &self,
        state: &mut StateStore<B>,
        transaction: &Transaction,
    ) -> Result<ExecutionResult, VmError> {
        let op = Self::decode(&transaction.payload)?;
        match op {
            StakingOperation::RegisterValidator {
                consensus_pubkey,
                commission_bps,
                self_stake,
            } => Self::register(
                state,
                transaction.sender,
                consensus_pubkey,
                commission_bps,
                self_stake,
            ),
            StakingOperation::Delegate { validator, amount } => {
                Self::delegate(state, transaction.sender, validator, amount)
            }
            StakingOperation::Undelegate { validator, amount } => {
                Self::undelegate(state, transaction.sender, validator, amount)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
    use pemrix_primitives::{Account, Hash};

    fn random_address() -> (pemrix_crypto::KeyPair, Address) {
        let scheme = Ed25519Scheme::new();
        let kp = scheme.generate_keypair().unwrap();
        let addr = Address::from_public_key_hash(Hash::hash_bytes(&kp.public.0));
        (kp, addr)
    }

    fn encode_op(op: StakingOperation) -> Vec<u8> {
        let mut payload = vec![0x01];
        payload.extend_from_slice(&serde_json::to_vec(&op).unwrap());
        payload
    }

    #[test]
    fn register_validator_locks_self_stake() {
        let mut state = StateStore::new_in_memory();
        let (_, sender) = random_address();
        state
            .set_account(&sender, Account::new(100_000, 0))
            .unwrap();

        let tx = Transaction {
            sender,
            recipient: Address::default(),
            amount: 0,
            nonce: 0,
            fee: 0,
            public_key: vec![],
            signature: vec![],
            payload: encode_op(StakingOperation::RegisterValidator {
                consensus_pubkey: vec![1; 32],
                commission_bps: 500,
                self_stake: 10_000,
            }),
        };

        let executor = StakingExecutor::new();
        let result = executor.execute(&mut state, &tx).unwrap();
        assert!(result.success);
        assert_eq!(state.balance(&sender).unwrap(), 90_000);
        let record = state.validator_record(&sender).unwrap().unwrap();
        assert_eq!(record.self_stake, 10_000);
    }

    #[test]
    fn delegate_and_undelegate() {
        let mut state = StateStore::new_in_memory();
        let (_, validator) = random_address();
        let (_, delegator) = random_address();

        state
            .set_account(&validator, Account::new(100_000, 0))
            .unwrap();
        state
            .set_account(&delegator, Account::new(50_000, 0))
            .unwrap();

        let register = Transaction {
            sender: validator,
            recipient: Address::default(),
            amount: 0,
            nonce: 0,
            fee: 0,
            public_key: vec![],
            signature: vec![],
            payload: encode_op(StakingOperation::RegisterValidator {
                consensus_pubkey: vec![2; 32],
                commission_bps: 500,
                self_stake: 10_000,
            }),
        };
        StakingExecutor::new()
            .execute(&mut state, &register)
            .unwrap();

        let delegate = Transaction {
            sender: delegator,
            recipient: Address::default(),
            amount: 0,
            nonce: 0,
            fee: 0,
            public_key: vec![],
            signature: vec![],
            payload: encode_op(StakingOperation::Delegate {
                validator,
                amount: 5_000,
            }),
        };
        StakingExecutor::new()
            .execute(&mut state, &delegate)
            .unwrap();
        assert_eq!(state.balance(&delegator).unwrap(), 45_000);
        assert_eq!(
            state
                .validator_record(&validator)
                .unwrap()
                .unwrap()
                .delegated_stake,
            5_000
        );

        let undelegate = Transaction {
            sender: delegator,
            recipient: Address::default(),
            amount: 0,
            nonce: 1,
            fee: 0,
            public_key: vec![],
            signature: vec![],
            payload: encode_op(StakingOperation::Undelegate {
                validator,
                amount: 2_000,
            }),
        };
        StakingExecutor::new()
            .execute(&mut state, &undelegate)
            .unwrap();
        assert_eq!(state.balance(&delegator).unwrap(), 47_000);
        assert_eq!(
            state
                .validator_record(&validator)
                .unwrap()
                .unwrap()
                .delegated_stake,
            3_000
        );
    }
}
