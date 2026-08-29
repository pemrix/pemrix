//! # PEMRIX Protocol
//!
//! Public protocol invariants, parameters, and constants. This crate contains
//! only non-sensitive protocol rules that are safe to publish in the open
//! repository. Exact genesis allocations, initial validator set, and other
//! launch-sensitive values live in the private protocol directory.

#![warn(missing_docs)]

use pemrix_primitives::Balance;

/// Number of decimal places for PMX.
pub const DECIMALS: u8 = 9;

/// One whole PMX in base units.
pub const ONE_PMX: Balance = 1_000_000_000;

/// Genesis supply in base units.
///
/// This is the amount of PMX that exists at block 0, before any protocol
/// issuance. The exact allocation is defined in the genesis configuration.
pub const GENESIS_SUPPLY: Balance = 1_000_000_000 * ONE_PMX;

/// Maximum protocol issuance after genesis, in base units.
///
/// This is the maximum additional PMX the consensus protocol may ever create
/// for validator and delegator security rewards.
pub const MAX_PROTOCOL_ISSUANCE: Balance = 100_000_000 * ONE_PMX;

/// Hard supply ceiling in base units.
///
/// Total supply may never exceed this amount. Increasing this ceiling requires
/// a constitutional amendment procedure.
pub const MAX_SUPPLY: Balance = GENESIS_SUPPLY + MAX_PROTOCOL_ISSUANCE;

/// Minimum self-stake required to register a validator.
///
/// This is a candidate testnet value. The mainnet value will be set in the
/// genesis configuration and may be adjusted by governance.
pub const MIN_SELF_STAKE: Balance = 10_000 * ONE_PMX;

/// Minimum total stake (self + delegated) required for a validator to enter
/// the active consensus set.
pub const MIN_ACTIVE_STAKE: Balance = 100_000 * ONE_PMX;

/// Minimum delegation amount.
pub const MIN_DELEGATION: Balance = ONE_PMX;

/// Gas cost for a simple transfer.
pub const TRANSFER_GAS: u64 = 21_000;

/// Gas cost for a staking operation.
pub const STAKING_GAS: u64 = 50_000;

/// Unbonding period in blocks.
///
/// Candidate value assuming ~7.5 second block time = ~21 days.
pub const UNBONDING_PERIOD_BLOCKS: u64 = 241_920;

/// Minimum validator commission in basis points.
pub const MIN_COMMISSION_BPS: u16 = 0;
/// Maximum validator commission in basis points (20%).
pub const MAX_COMMISSION_BPS: u16 = 2_000;

/// Maximum number of validators in the active consensus set.
pub const MAX_ACTIVE_VALIDATORS: u32 = 100;

/// A protocol parameter bundle.
///
/// This is the public, on-chain representation of protocol parameters. The
/// genesis configuration initializes these values; governance can update
/// parameters that are marked as governable.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct ProtocolParameters {
    /// Block target time in seconds.
    pub block_time_seconds: u64,
    /// Maximum number of active validators.
    pub max_active_validators: u32,
    /// Minimum total stake to enter the active set.
    pub min_active_stake: Balance,
    /// Base fee per gas unit.
    pub base_fee_per_gas: Balance,
    /// Minimum base fee per gas unit.
    pub min_base_fee_per_gas: Balance,
    /// Maximum base fee increase per block, in basis points.
    pub max_base_fee_change_bps: u16,
    /// Target block utilization in basis points.
    pub target_utilization_bps: u16,
    /// Priority fee share to validator, in basis points.
    pub priority_fee_validator_share_bps: u16,
    /// Priority fee share to treasury, in basis points.
    pub priority_fee_treasury_share_bps: u16,
    /// Governance quorum for normal proposals, in basis points.
    pub normal_quorum_bps: u16,
    /// Governance yes threshold for normal proposals, in basis points.
    pub normal_threshold_bps: u16,
    /// Voting period for normal proposals, in blocks.
    pub normal_voting_period_blocks: u64,
    /// Timelock for normal proposals, in blocks.
    pub normal_timelock_blocks: u64,
}

impl Default for ProtocolParameters {
    fn default() -> Self {
        Self {
            block_time_seconds: 8,
            max_active_validators: MAX_ACTIVE_VALIDATORS,
            min_active_stake: MIN_ACTIVE_STAKE,
            base_fee_per_gas: 100,
            min_base_fee_per_gas: 1,
            max_base_fee_change_bps: 125,
            target_utilization_bps: 5_000,
            priority_fee_validator_share_bps: 9_000,
            priority_fee_treasury_share_bps: 1_000,
            normal_quorum_bps: 2_000,
            normal_threshold_bps: 5_000,
            normal_voting_period_blocks: 75_600,
            normal_timelock_blocks: 32_400,
        }
    }
}

impl ProtocolParameters {
    /// Create a new set of protocol parameters.
    pub const fn new() -> Self {
        Self {
            block_time_seconds: 8,
            max_active_validators: MAX_ACTIVE_VALIDATORS,
            min_active_stake: MIN_ACTIVE_STAKE,
            base_fee_per_gas: 100,
            min_base_fee_per_gas: 1,
            max_base_fee_change_bps: 125,
            target_utilization_bps: 5_000,
            priority_fee_validator_share_bps: 9_000,
            priority_fee_treasury_share_bps: 1_000,
            normal_quorum_bps: 2_000,
            normal_threshold_bps: 5_000,
            normal_voting_period_blocks: 75_600,
            normal_timelock_blocks: 32_400,
        }
    }

    /// Validate that parameters are internally consistent.
    pub fn validate(&self) -> Result<(), ParameterError> {
        if self.block_time_seconds == 0 {
            return Err(ParameterError::ZeroBlockTime);
        }
        if self.max_active_validators == 0 {
            return Err(ParameterError::ZeroActiveValidators);
        }
        if self.base_fee_per_gas < self.min_base_fee_per_gas {
            return Err(ParameterError::BaseFeeBelowMinimum);
        }
        if self.priority_fee_validator_share_bps + self.priority_fee_treasury_share_bps > 10_000 {
            return Err(ParameterError::PriorityFeeSharesOverflow);
        }
        if self.normal_quorum_bps > 10_000 || self.normal_threshold_bps > 10_000 {
            return Err(ParameterError::InvalidGovernanceThreshold);
        }
        Ok(())
    }
}

/// Error returned when protocol parameters are inconsistent.
#[derive(Debug, thiserror::Error)]
pub enum ParameterError {
    /// Block time cannot be zero.
    #[error("block time cannot be zero")]
    ZeroBlockTime,
    /// Active validator set cannot be empty.
    #[error("active validator set cannot be empty")]
    ZeroActiveValidators,
    /// Base fee is below the configured minimum.
    #[error("base fee is below the configured minimum")]
    BaseFeeBelowMinimum,
    /// Priority fee shares exceed 100%.
    #[error("priority fee shares exceed 100%")]
    PriorityFeeSharesOverflow,
    /// Governance threshold is not a valid basis-points value.
    #[error("invalid governance threshold")]
    InvalidGovernanceThreshold,
}

/// Validate that total supply never exceeds the hard ceiling.
pub fn check_supply_invariant(total_supply: Balance) -> Result<(), InvariantError> {
    if total_supply > MAX_SUPPLY {
        Err(InvariantError::SupplyCeilingExceeded)
    } else {
        Ok(())
    }
}

/// Protocol invariant violations.
#[derive(Debug, thiserror::Error)]
pub enum InvariantError {
    /// Total supply would exceed the hard ceiling.
    #[error("total supply would exceed the hard ceiling of {MAX_SUPPLY}")]
    SupplyCeilingExceeded,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn supply_invariant_enforced() {
        assert!(check_supply_invariant(MAX_SUPPLY).is_ok());
        assert!(check_supply_invariant(MAX_SUPPLY + 1).is_err());
    }

    #[test]
    fn default_parameters_validate() {
        let params = ProtocolParameters::default();
        assert!(params.validate().is_ok());
    }

    #[test]
    fn priority_fee_overflow_detected() {
        let params = ProtocolParameters {
            priority_fee_validator_share_bps: 9_500,
            priority_fee_treasury_share_bps: 1_000,
            ..Default::default()
        };
        assert!(params.validate().is_err());
    }
}
