//! # PEMRIX Consensus
//!
//! Byzantine Fault Tolerant + Proof-of-Stake consensus for the PEMRIX network.
//!
//! The crate exposes a generic `ConsensusEngine` trait so that the node can
//! start with a simple solo consensus for development and migrate to a full
//! multi-validator BFT engine as the network matures.

#![warn(missing_docs)]

pub mod bft;
pub mod engine;
pub mod error;
pub mod mempool;
pub mod proposal;
pub mod rewards;
pub mod solo;
pub mod validator_set;

pub use bft::BftConsensus;
pub use engine::ConsensusEngine;
pub use error::ConsensusError;
pub use mempool::{Mempool, SimpleMempool};
pub use proposal::{Finality, Proposal, Vote};
pub use rewards::distribute_block_reward;
pub use solo::SoloConsensus;
pub use validator_set::{Validator, ValidatorSet};
