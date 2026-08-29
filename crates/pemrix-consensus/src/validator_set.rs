//! Validator set and staking weight logic for BFT consensus.

use pemrix_primitives::Address;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

/// A validator with equal voting weight in the BFT committee.
///
/// PEMRIX uses a Proof-of-Stake committee where validators have stake-weighted
/// voting power. The first implementation uses equal weights for simplicity.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Validator {
    /// Validator address derived from a public key.
    pub address: Address,
    /// Voting power.
    pub power: u64,
}

impl Validator {
    /// Create a new validator entry.
    pub fn new(address: Address, power: u64) -> Self {
        Self { address, power }
    }
}

/// A deterministic ordered set of validators.
#[derive(Clone, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct ValidatorSet {
    validators: BTreeMap<Address, u64>,
}

impl ValidatorSet {
    /// Create an empty validator set.
    pub fn new() -> Self {
        Self::default()
    }

    /// Create a validator set from a list of validators.
    pub fn from_validators(validators: Vec<Validator>) -> Self {
        let mut set = Self::new();
        for v in validators {
            set.add(v.address, v.power);
        }
        set
    }

    /// Add or update a validator's power.
    pub fn add(&mut self, address: Address, power: u64) {
        self.validators.insert(address, power);
    }

    /// Remove a validator.
    pub fn remove(&mut self, address: &Address) {
        self.validators.remove(address);
    }

    /// Check whether an address is a known validator.
    pub fn is_validator(&self, address: &Address) -> bool {
        self.validators.contains_key(address)
    }

    /// Total voting power in the set.
    pub fn total_power(&self) -> u64 {
        self.validators.values().sum()
    }

    /// Minimum power required to reach a Byzantine-fault-tolerant quorum
    /// (>2/3 of total power).
    pub fn quorum_threshold(&self) -> u64 {
        let total = self.total_power();
        (total * 2 / 3) + 1
    }

    /// Number of validators.
    pub fn len(&self) -> usize {
        self.validators.len()
    }

    /// Whether the set is empty.
    pub fn is_empty(&self) -> bool {
        self.validators.is_empty()
    }

    /// Return the validators in deterministic order.
    pub fn validators(&self) -> Vec<Validator> {
        self.validators
            .iter()
            .map(|(address, power)| Validator::new(*address, *power))
            .collect()
    }

    /// Return the proposer for a given height and round.
    ///
    /// Uses round-robin selection over the sorted validator addresses.
    pub fn proposer(&self, height: u64, round: u64) -> Option<Address> {
        if self.is_empty() {
            return None;
        }
        let validators: Vec<Address> = self.validators.keys().copied().collect();
        let index = ((height + round) as usize) % validators.len();
        Some(validators[index])
    }

    /// Return the set of validator addresses.
    pub fn addresses(&self) -> BTreeSet<Address> {
        self.validators.keys().copied().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pemrix_primitives::Hash;

    fn addr(seed: &str) -> Address {
        Address::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
    }

    #[test]
    fn empty_set_has_no_quorum() {
        let set = ValidatorSet::new();
        assert_eq!(set.quorum_threshold(), 1);
        assert!(set.proposer(1, 0).is_none());
    }

    #[test]
    fn quorum_is_two_thirds_plus_one() {
        let mut set = ValidatorSet::new();
        for i in 0..4 {
            set.add(addr(&format!("v{i}")), 1);
        }
        assert_eq!(set.total_power(), 4);
        assert_eq!(set.quorum_threshold(), 3);
    }

    #[test]
    fn proposer_rotates_deterministically() {
        let mut set = ValidatorSet::new();
        for i in 0..3 {
            set.add(addr(&format!("v{i}")), 1);
        }
        let p0 = set.proposer(1, 0).unwrap();
        let p1 = set.proposer(1, 1).unwrap();
        let p2 = set.proposer(1, 2).unwrap();
        assert_ne!(p0, p1);
        assert_ne!(p1, p2);
        assert_ne!(p0, p2);
        // Rotation wraps back after len rounds for the same height.
        let p3 = set.proposer(1, 3).unwrap();
        assert_eq!(p0, p3);
    }

    #[test]
    fn membership_check() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let mut set = ValidatorSet::new();
        set.add(v1, 1);
        assert!(set.is_validator(&v1));
        assert!(!set.is_validator(&v2));
    }
}
