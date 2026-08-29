//! Slashing and jailing logic for PEMRIX validators.

use pemrix_primitives::{Address, Balance, ValidatorRecord, ValidatorStatus};
use std::collections::BTreeMap;

/// Evidence of validator misbehavior.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Misbehavior {
    /// Two conflicting signed votes/blocks at the same height.
    DoubleSign {
        /// Height at which the double sign occurred.
        height: u64,
        /// Round at which the double sign occurred.
        round: u64,
    },
    /// Missed too many blocks in a window.
    Downtime {
        /// Number of blocks missed.
        missed: u64,
        /// Size of the observation window.
        window: u64,
    },
    /// Conflicting pre-vote.
    Equivocation {
        /// Height at which equivocation occurred.
        height: u64,
        /// Round at which equivocation occurred.
        round: u64,
    },
}

/// Slashing policy parameters.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct SlashingPolicy {
    /// Percentage of stake slashed for double signing (basis points).
    pub double_sign_bps: u16,
    /// Percentage of stake slashed for downtime (basis points).
    pub downtime_bps: u16,
    /// Percentage of stake slashed for equivocation (basis points).
    pub equivocation_bps: u16,
    /// Jail duration for double sign (in blocks).
    pub double_sign_jail_blocks: u64,
    /// Jail duration for downtime (in blocks).
    pub downtime_jail_blocks: u64,
    /// Jail duration for equivocation (in blocks).
    pub equivocation_jail_blocks: u64,
    /// Missed-block ratio that triggers downtime slashing.
    pub downtime_threshold_ratio: u8,
}

impl Default for SlashingPolicy {
    fn default() -> Self {
        Self {
            double_sign_bps: 500,
            downtime_bps: 10,
            equivocation_bps: 100,
            double_sign_jail_blocks: 60 * 24 * 60, // ~60 days at 1 block / 7.5s
            downtime_jail_blocks: 7 * 24 * 60,     // ~7 days
            equivocation_jail_blocks: 14 * 24 * 60, // ~14 days
            downtime_threshold_ratio: 50,          // >50% missed
        }
    }
}

/// Apply slashing and jailing to a validator record.
///
/// Returns the amount slashed and updates the record in place.
pub fn apply_slash(
    record: &mut ValidatorRecord,
    misbehavior: &Misbehavior,
    current_height: u64,
    policy: &SlashingPolicy,
) -> Balance {
    let (slash_bps, jail_blocks) = match misbehavior {
        Misbehavior::DoubleSign { .. } => (policy.double_sign_bps, policy.double_sign_jail_blocks),
        Misbehavior::Downtime { .. } => (policy.downtime_bps, policy.downtime_jail_blocks),
        Misbehavior::Equivocation { .. } => {
            (policy.equivocation_bps, policy.equivocation_jail_blocks)
        }
    };

    let stake = record.total_stake();
    let slash_amount = stake * slash_bps as u128 / 10_000;

    record.status = ValidatorStatus::Jailed;
    record.jailed_until = current_height + jail_blocks;

    // Reduce self-stake first; if insufficient, reduce delegated stake conceptually.
    if record.self_stake >= slash_amount {
        record.self_stake -= slash_amount;
    } else {
        let remaining = slash_amount - record.self_stake;
        record.self_stake = 0;
        record.delegated_stake = record.delegated_stake.saturating_sub(remaining);
    }

    slash_amount
}

/// Check whether a validator is currently jailed.
pub fn is_jailed(record: &ValidatorRecord, current_height: u64) -> bool {
    record.status == ValidatorStatus::Jailed && current_height < record.jailed_until
}

/// Release validators whose jail time has expired.
pub fn release_validators(records: &mut BTreeMap<Address, ValidatorRecord>, current_height: u64) {
    for record in records.values_mut() {
        if record.status == ValidatorStatus::Jailed && current_height >= record.jailed_until {
            record.status = ValidatorStatus::Active;
            record.jailed_until = 0;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::Hash;

    fn addr(seed: &str) -> Address {
        Address::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
    }

    fn test_validator() -> ValidatorRecord {
        ValidatorRecord::new(addr("val"), vec![1, 2, 3], 1_000_000, 500)
    }

    #[test]
    fn double_sign_slash_and_jail() {
        let mut record = test_validator();
        let policy = SlashingPolicy::default();
        let evidence = Misbehavior::DoubleSign {
            height: 100,
            round: 0,
        };
        let slashed = apply_slash(&mut record, &evidence, 100, &policy);
        assert_eq!(slashed, 50_000); // 5%
        assert!(is_jailed(&record, 101));
        assert!(!is_jailed(&record, u64::MAX));
    }

    #[test]
    fn downtime_slash_is_smaller() {
        let mut record = test_validator();
        let policy = SlashingPolicy::default();
        let evidence = Misbehavior::Downtime {
            missed: 6,
            window: 10,
        };
        let slashed = apply_slash(&mut record, &evidence, 100, &policy);
        assert_eq!(slashed, 1_000); // 0.1%
    }

    #[test]
    fn release_validators_after_jail_time() {
        let mut records = BTreeMap::new();
        let mut record = test_validator();
        record.status = ValidatorStatus::Jailed;
        record.jailed_until = 100;
        records.insert(addr("val"), record);

        release_validators(&mut records, 100);
        assert_eq!(records[&addr("val")].status, ValidatorStatus::Active);
    }
}
