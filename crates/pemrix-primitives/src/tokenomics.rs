//! PEMRIX tokenomics and issuance schedule.
//!
//! PEMRIX does **not** have a hard supply cap like Bitcoin's 21 million.
//! Instead it uses a deterministic, decaying issuance curve that converges
//! toward an asymptotic maximum while never fully stopping. This guarantees
//! perpetual validator rewards without an abrupt halting of issuance.
//!
//! The schedule is governed by on-chain parameters and can be adjusted by
//! governance within protocol-defined bounds.

use serde::{Deserialize, Serialize};

/// Tokenomics configuration.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TokenomicsConfig {
    /// Total supply at genesis (in the smallest indivisible unit).
    pub initial_supply: u128,
    /// Block reward at height 1.
    pub initial_block_reward: u128,
    /// Number of blocks between reward decay steps.
    pub decay_interval: u64,
    /// Numerator of the decay fraction applied at each interval.
    /// A value of `9` with denominator `10` means reward drops by 10%.
    pub decay_numerator: u64,
    /// Denominator of the decay fraction.
    pub decay_denominator: u64,
    /// Minimum block reward after decay (in the smallest indivisible unit).
    pub min_block_reward: u128,
}

impl Default for TokenomicsConfig {
    fn default() -> Self {
        Self {
            initial_supply: 1_000_000_000_000_000_000, // 1 billion with 9 decimals
            initial_block_reward: 10_000_000_000,      // 10 tokens with 9 decimals
            decay_interval: 2_000_000,                 // ~4.6 years at 1 block / 7.5s
            decay_numerator: 9,
            decay_denominator: 10,
            min_block_reward: 100_000_000, // 0.1 tokens with 9 decimals
        }
    }
}

impl TokenomicsConfig {
    /// Create a mainnet-like default configuration.
    pub fn mainnet() -> Self {
        Self::default()
    }

    /// Create a fast-decay configuration useful for tests.
    pub fn fast_test() -> Self {
        Self {
            initial_supply: 1_000_000_000,
            initial_block_reward: 1_000,
            decay_interval: 10,
            decay_numerator: 9,
            decay_denominator: 10,
            min_block_reward: 1,
        }
    }

    /// Compute the block reward at a given chain height.
    ///
    /// Height 0 (genesis) produces no reward.
    pub fn block_reward(&self, height: u64) -> u128 {
        if height == 0 {
            return 0;
        }

        let decay_steps = (height - 1) / self.decay_interval;
        let mut reward = self.initial_block_reward;
        for _ in 0..decay_steps {
            reward = reward
                .saturating_mul(self.decay_numerator as u128)
                .saturating_div(self.decay_denominator as u128);
            if reward <= self.min_block_reward {
                return self.min_block_reward;
            }
        }
        reward
    }

    /// Compute the cumulative issuance from block 1 through `height` inclusive.
    pub fn total_issued_by_height(&self, height: u64) -> u128 {
        if height == 0 {
            return 0;
        }

        let mut total = 0u128;
        let mut current_reward = self.initial_block_reward;
        let mut remaining = height;
        let mut step_height = 0u64;

        while remaining > 0 {
            let step_end = step_height + self.decay_interval;
            let blocks_in_step = std::cmp::min(remaining, self.decay_interval);
            total = total.saturating_add(current_reward.saturating_mul(blocks_in_step as u128));

            remaining = remaining.saturating_sub(blocks_in_step);
            step_height = step_end;

            if current_reward > self.min_block_reward {
                current_reward = current_reward
                    .saturating_mul(self.decay_numerator as u128)
                    .saturating_div(self.decay_denominator as u128);
                if current_reward < self.min_block_reward {
                    current_reward = self.min_block_reward;
                }
            }
        }

        total
    }

    /// Return the theoretical asymptotic maximum supply.
    ///
    /// This is `initial_supply +` the infinite sum of decaying block rewards.
    /// In practice issuance never fully reaches this value.
    pub fn asymptotic_max_supply(&self) -> u128 {
        if self.decay_numerator >= self.decay_denominator {
            return u128::MAX;
        }

        // Sum of geometric series: a / (1 - r)
        // where a = initial_block_reward, r = decay_numerator / decay_denominator.
        // To avoid floating point we compute:
        //   total_issuance = initial_block_reward * decay_denominator / (decay_denominator - decay_numerator)
        let denom_diff = (self.decay_denominator - self.decay_numerator) as u128;
        let infinite_issuance = self
            .initial_block_reward
            .saturating_mul(self.decay_denominator as u128)
            .saturating_div(denom_diff);

        self.initial_supply.saturating_add(infinite_issuance)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn genesis_produces_no_reward() {
        let config = TokenomicsConfig::default();
        assert_eq!(config.block_reward(0), 0);
    }

    #[test]
    fn reward_decays_over_intervals() {
        let config = TokenomicsConfig::fast_test();
        let r1 = config.block_reward(1);
        let r10 = config.block_reward(10);
        let r11 = config.block_reward(11);

        assert_eq!(r1, config.initial_block_reward);
        assert_eq!(r10, config.initial_block_reward);
        assert_eq!(r11, config.initial_block_reward * 9 / 10);
    }

    #[test]
    fn reward_reaches_floor() {
        let config = TokenomicsConfig::fast_test();
        let floor_height = config.decay_interval * 100;
        let reward = config.block_reward(floor_height);
        assert_eq!(reward, config.min_block_reward);
    }

    #[test]
    fn cumulative_issuance_grows() {
        let config = TokenomicsConfig::fast_test();
        let issued_10 = config.total_issued_by_height(10);
        let issued_20 = config.total_issued_by_height(20);
        assert!(issued_20 > issued_10);
    }

    #[test]
    fn asymptotic_max_is_finite() {
        let config = TokenomicsConfig::fast_test();
        let max_supply = config.asymptotic_max_supply();
        let issued = config.total_issued_by_height(1_000_000);
        assert!(issued < max_supply);
        assert!(max_supply > config.initial_supply);
    }

    #[test]
    fn default_mainnet_has_reasonable_values() {
        let config = TokenomicsConfig::mainnet();
        assert_eq!(config.initial_supply, 1_000_000_000_000_000_000);
        assert_eq!(config.initial_block_reward, 10_000_000_000);
        assert!(config.decay_numerator < config.decay_denominator);
    }
}
