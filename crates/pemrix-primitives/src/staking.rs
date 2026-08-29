//! Staking primitives for PEMRIX.

use crate::{Address, Balance};
use serde::{Deserialize, Serialize};

/// A delegation entry.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct Delegation {
    /// Amount delegated.
    pub amount: Balance,
    /// Whether the delegation is in unbonding.
    pub unbonding: bool,
    /// Block height at which unbonding completes.
    pub unbond_end_height: u64,
}

/// Validator status.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum ValidatorStatus {
    /// Active in the consensus set.
    #[default]
    Active,
    /// Jailed due to misbehavior.
    Jailed,
    /// Unbonding and will leave the set.
    Unbonding,
}

/// On-chain validator record.
#[derive(Clone, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct ValidatorRecord {
    /// Validator operator address.
    pub address: Address,
    /// Validator consensus public key.
    pub consensus_pubkey: Vec<u8>,
    /// Self-stake (security deposit).
    pub self_stake: Balance,
    /// Total delegated stake.
    pub delegated_stake: Balance,
    /// Commission rate in basis points (0–10000 = 0%–100%).
    pub commission_bps: u16,
    /// Current status.
    pub status: ValidatorStatus,
    /// Block height until which the validator is jailed (if jailed).
    pub jailed_until: u64,
    /// Accumulated rewards pending distribution.
    pub pending_rewards: Balance,
}

impl ValidatorRecord {
    /// Create a new active validator record.
    pub fn new(
        address: Address,
        consensus_pubkey: Vec<u8>,
        self_stake: Balance,
        commission_bps: u16,
    ) -> Self {
        Self {
            address,
            consensus_pubkey,
            self_stake,
            delegated_stake: 0,
            commission_bps,
            status: ValidatorStatus::Active,
            jailed_until: 0,
            pending_rewards: 0,
        }
    }

    /// Total stake (self + delegated).
    pub fn total_stake(&self) -> Balance {
        self.self_stake.saturating_add(self.delegated_stake)
    }
}
