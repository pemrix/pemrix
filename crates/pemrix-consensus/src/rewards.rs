//! Validator reward distribution for BFT consensus.

use pemrix_primitives::{Address, Balance, ValidatorRecord};
use std::collections::BTreeMap;

/// Reward split between a validator and its delegators.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub struct RewardSplit {
    /// Amount kept by the validator operator as commission.
    pub validator_commission: Balance,
    /// Amount distributed to delegators.
    pub delegator_pool: Balance,
}

/// Distribute a block reward across validators proportional to their power.
///
/// For now every validator in `validator_set` has equal power; the reward is
/// split equally. In a future stake-weighted version this function will use
/// `ValidatorRecord::total_stake`.
pub fn distribute_block_reward(
    validators: &[Address],
    records: &BTreeMap<Address, ValidatorRecord>,
    total_reward: Balance,
    proposer: Address,
) -> BTreeMap<Address, Balance> {
    let mut payouts = BTreeMap::new();
    if validators.is_empty() || total_reward == 0 {
        return payouts;
    }

    // Proposer bonus: 10% of the reward goes to the block proposer.
    let proposer_bonus = total_reward / 10;
    let remaining = total_reward - proposer_bonus;
    let per_validator = remaining / validators.len() as u128;

    for v in validators {
        let amount = if *v == proposer {
            per_validator.saturating_add(proposer_bonus)
        } else {
            per_validator
        };

        // Apply commission if we have a validator record.
        if let Some(record) = records.get(v) {
            let commission = amount * record.commission_bps as u128 / 10_000;
            let operator_share = commission;
            let delegator_share = amount - commission;
            // Operator gets self-stake proportional share of delegator pool too,
            // but for the first cut we credit the whole operator share to the
            // operator address and leave the rest in pending rewards.
            *payouts.entry(*v).or_insert(0) =
                payouts.get(v).unwrap_or(&0).saturating_add(operator_share);
            *payouts.entry(*v).or_insert(0) =
                payouts.get(v).unwrap_or(&0).saturating_add(delegator_share);
        } else {
            *payouts.entry(*v).or_insert(0) = payouts.get(v).unwrap_or(&0).saturating_add(amount);
        }
    }

    // Dust stays unallocated (burned).
    payouts
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::Hash;

    fn addr(seed: &str) -> Address {
        Address::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
    }

    #[test]
    fn reward_is_split_among_validators() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let validators = vec![v1, v2];
        let records = BTreeMap::new();
        let payouts = distribute_block_reward(&validators, &records, 100, v1);
        assert_eq!(payouts.get(&v1).copied().unwrap_or_default(), 55);
        assert_eq!(payouts.get(&v2).copied().unwrap_or_default(), 45);
    }

    #[test]
    fn empty_validator_set_returns_empty_payouts() {
        let payouts = distribute_block_reward(&[], &BTreeMap::new(), 100, Address::default());
        assert!(payouts.is_empty());
    }
}
