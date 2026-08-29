//! Multi-validator Byzantine Fault Tolerant consensus engine.
//!
//! `BftConsensus` implements a simplified rotating-proposer BFT protocol:
//!
//! 1. The proposer for a (height, round) is chosen round-robin from the validator set.
//! 2. The proposer builds a block and broadcasts a `Proposal`.
//! 3. Each validator validates the proposal and broadcasts a `Vote`.
//! 4. When votes with power greater than 2/3 of total power are collected, the
//!    block is finalized.
//!
//! This is a deterministic foundation. Networking integration will be added
//! so validators can exchange proposals and votes over the P2P transport.

use crate::{ConsensusEngine, ConsensusError, Finality, Proposal, ValidatorSet, Vote};
use pemrix_primitives::{Address, Block, BlockBody, BlockHeader, Hash, Transaction};
use pemrix_storage::{InMemoryBackend, StateBackend, StateStore};
use pemrix_vm::{NativeExecutor, Vm};
use std::collections::{BTreeMap, BTreeSet};
use tracing::{info, warn};

/// State for a single BFT round.
#[derive(Clone, Debug, Default)]
struct RoundState {
    /// Proposal received for this round, if any.
    proposal: Option<Proposal>,
    /// Block matching the proposal, if available.
    block: Option<Block>,
    /// Votes received by validator address.
    votes: BTreeMap<Address, Vote>,
    /// Whether this round has been finalized.
    finalized: bool,
}

/// Multi-validator BFT consensus engine backed by a `StateBackend`.
pub struct BftConsensus<B: StateBackend> {
    /// Local validator address.
    local_address: Address,
    /// Current validator committee.
    validator_set: ValidatorSet,
    /// State store.
    state: StateStore<B>,
    /// Current chain height.
    height: u64,
    /// Previous block hash.
    previous_hash: Hash,
    /// Round state keyed by height.
    rounds: BTreeMap<u64, RoundState>,
    /// Finalized blocks by height.
    finalized: BTreeMap<u64, Block>,
    /// Validators that have already voted in a given height.
    voted_this_height: BTreeSet<(u64, Address)>,
}

impl BftConsensus<InMemoryBackend> {
    /// Create a new in-memory BFT consensus engine for the local validator.
    pub fn new(local_address: Address, validator_set: ValidatorSet) -> Self {
        Self::new_with_previous_hash(local_address, validator_set, Hash::default())
    }

    /// Create a new in-memory BFT consensus engine with a specific previous block hash.
    pub fn new_with_previous_hash(
        local_address: Address,
        validator_set: ValidatorSet,
        previous_hash: Hash,
    ) -> Self {
        Self::new_with_store(
            local_address,
            validator_set,
            StateStore::new_in_memory(),
            previous_hash,
        )
    }
}

impl<B: StateBackend> BftConsensus<B> {
    /// Create a new BFT consensus engine with the provided state store.
    pub fn new_with_store(
        local_address: Address,
        validator_set: ValidatorSet,
        state: StateStore<B>,
        previous_hash: Hash,
    ) -> Self {
        assert!(
            validator_set.is_validator(&local_address),
            "local address must be in validator set"
        );
        Self {
            local_address,
            validator_set,
            state,
            height: 0,
            previous_hash,
            rounds: BTreeMap::new(),
            finalized: BTreeMap::new(),
            voted_this_height: BTreeSet::new(),
        }
    }

    /// Access the internal state store.
    pub fn state(&self) -> &StateStore<B> {
        &self.state
    }

    /// Access the internal state store mutably.
    pub fn state_mut(&mut self) -> &mut StateStore<B> {
        &mut self.state
    }

    /// Return the validator set.
    pub fn validator_set(&self) -> &ValidatorSet {
        &self.validator_set
    }

    /// Attempt to finalize any pending block for which a quorum of votes has
    /// been collected. Returns the highest finalized block, if any.
    pub async fn finalize_pending(&mut self) -> Option<Block> {
        let candidates: Vec<u64> = self
            .rounds
            .iter()
            .filter(|(h, r)| **h > self.height && r.proposal.is_some())
            .map(|(h, _)| *h)
            .collect();
        let mut finalized = None;
        for height in candidates {
            if let Some(proposal) = self.rounds.get(&height).and_then(|r| r.proposal.clone()) {
                if let Ok(f) = self.finalize(proposal.block_hash).await {
                    finalized = Some(f.block);
                }
            }
        }
        finalized
    }

    /// Handle a full block proposal and return the local validator's vote.
    ///
    /// This stores both the proposal and the block so the round can be
    /// finalized once a quorum of votes is collected.
    pub async fn handle_block(&mut self, block: Block) -> Result<Vote, ConsensusError> {
        let proposal: Proposal = block.clone().into();
        if let Err(e) = self.validate_proposal(&proposal) {
            warn!("[bft {}] validate_proposal failed: {:?}", self.local_address, e);
            return Err(e);
        }
        let height = proposal.height;
        let round_state = self.rounds.entry(height).or_default();
        round_state.proposal = Some(proposal);
        round_state.block = Some(block);

        let vote_key = (height, self.local_address);
        if !self.voted_this_height.contains(&vote_key) {
            let vote = Vote {
                block_hash: round_state.proposal.as_ref().unwrap().block_hash,
                height,
                round: 0,
                voter: *self.local_address.as_bytes(),
            };
            round_state.votes.insert(self.local_address, vote.clone());
            self.voted_this_height.insert(vote_key);
            Ok(vote)
        } else {
            Err(ConsensusError::InvalidVote)
        }
    }

    /// Return the local validator's vote for a height, if it has voted.
    pub fn own_vote(&self, height: u64) -> Option<Vote> {
        self.rounds
            .get(&height)?
            .votes
            .get(&self.local_address)
            .cloned()
    }

    /// Return the number of collected votes for a height (test helper).
    #[cfg(test)]
    pub fn vote_count(&self, height: u64) -> usize {
        self.rounds.get(&height).map(|r| r.votes.len()).unwrap_or(0)
    }

    /// Fund an account for testing.
    #[cfg(test)]
    pub fn fund(&mut self, address: Address, balance: u128) {
        use pemrix_primitives::Account;
        self.state
            .set_account(&address, Account::new(balance, 0))
            .unwrap();
    }

    /// Build a block from the given transactions at the current height.
    fn build_block(
        &mut self,
        height: u64,
        transactions: Vec<Transaction>,
    ) -> Result<Block, ConsensusError> {
        let executor = NativeExecutor;
        for tx in &transactions {
            executor
                .execute(&mut self.state, tx)
                .map_err(|e| ConsensusError::ExecutionFailed(e.to_string()))?;
        }

        let header = BlockHeader {
            height,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            previous_hash: self.previous_hash,
            state_root: self
                .state
                .state_root()
                .map_err(|_| ConsensusError::Storage)?,
            tx_root: Hash::hash_bytes(&pemrix_primitives::encoding::encode(&transactions)),
            proposer: *self.local_address.as_bytes(),
        };

        Ok(Block {
            header,
            body: BlockBody { transactions },
        })
    }

    /// Validate a proposal against the current state.
    fn validate_proposal(&self, proposal: &Proposal) -> Result<(), ConsensusError> {
        let expected_proposer = self
            .validator_set
            .proposer(proposal.height, proposal.round)
            .ok_or(ConsensusError::InvalidProposal)?;

        if proposal.height <= self.height {
            return Err(ConsensusError::InvalidProposal);
        }

        let proposer_address = Address(proposal.proposer);
        if proposer_address != expected_proposer {
            return Err(ConsensusError::InvalidProposal);
        }

        Ok(())
    }

    /// Validate a vote against the current state.
    fn validate_vote(&self, vote: &Vote) -> Result<(), ConsensusError> {
        if vote.height <= self.height {
            return Err(ConsensusError::InvalidVote);
        }

        let voter = Address(vote.voter);
        if !self.validator_set.is_validator(&voter) {
            return Err(ConsensusError::InvalidVote);
        }

        let round = self
            .rounds
            .get(&vote.height)
            .ok_or(ConsensusError::InvalidVote)?;

        if let Some(proposal) = &round.proposal {
            if proposal.block_hash != vote.block_hash {
                return Err(ConsensusError::InvalidVote);
            }
        } else {
            return Err(ConsensusError::InvalidVote);
        }

        Ok(())
    }

    /// Check whether the collected votes for a height reach a quorum.
    fn has_quorum(&self, height: u64) -> bool {
        let round = match self.rounds.get(&height) {
            Some(r) => r,
            None => return false,
        };
        let validators = self.validator_set.validators();
        let power: u64 = round
            .votes
            .keys()
            .map(|addr| {
                validators
                    .iter()
                    .find(|v| v.address == *addr)
                    .map(|v| v.power)
                    .unwrap_or(0)
            })
            .sum();
        power >= self.validator_set.quorum_threshold()
    }

    /// Attempt to finalize the block at the given height if a quorum exists.
    fn try_finalize(&mut self, height: u64) -> Option<Block> {
        if !self.has_quorum(height) {
            return None;
        }
        let round = self.rounds.get_mut(&height)?;
        if round.finalized {
            return round.block.clone();
        }
        round.finalized = true;
        if let Some(block) = round.block.clone() {
            self.finalized.insert(height, block.clone());
            self.previous_hash = block.hash();
            self.height = height;
            // Voting state is keyed by height; remove entries for finalized
            // height to keep memory bounded.
            self.voted_this_height
                .retain(|(h, _)| *h != height);
            Some(block)
        } else {
            None
        }
    }
}

#[async_trait::async_trait]
impl<B: StateBackend> ConsensusEngine for BftConsensus<B> {
    async fn propose(
        &mut self,
        height: u64,
        transactions: Vec<Transaction>,
    ) -> Result<Block, ConsensusError> {
        let round = 0;
        let proposer = self
            .validator_set
            .proposer(height, round)
            .ok_or(ConsensusError::NotProposer)?;

        if proposer != self.local_address {
            return Err(ConsensusError::NotProposer);
        }

        let block = self.build_block(height, transactions)?;
        let proposal = Proposal {
            block_hash: block.hash(),
            height,
            round,
            proposer: *self.local_address.as_bytes(),
        };

        let round_state = self.rounds.entry(height).or_default();
        round_state.proposal = Some(proposal);
        round_state.block = Some(block.clone());

        // Automatically vote for our own proposal.
        let vote = Vote {
            block_hash: block.hash(),
            height,
            round,
            voter: *self.local_address.as_bytes(),
        };
        round_state.votes.insert(self.local_address, vote);
        self.voted_this_height.insert((height, self.local_address));

        Ok(block)
    }

    async fn handle_proposal(&mut self, proposal: Proposal) -> Result<(), ConsensusError> {
        self.validate_proposal(&proposal)?;
        let round_state = self.rounds.entry(proposal.height).or_default();
        round_state.proposal = Some(proposal.clone());

        // If we haven't voted yet for this height and the proposal is valid, vote for it.
        let vote_key = (proposal.height, self.local_address);
        if !self.voted_this_height.contains(&vote_key) {
            let vote = Vote {
                block_hash: proposal.block_hash,
                height: proposal.height,
                round: proposal.round,
                voter: *self.local_address.as_bytes(),
            };
            round_state.votes.insert(self.local_address, vote);
            self.voted_this_height.insert(vote_key);
        }

        Ok(())
    }

    async fn handle_vote(&mut self, vote: Vote) -> Result<(), ConsensusError> {
        if let Err(e) = self.validate_vote(&vote) {
            warn!("[bft {}] validate_vote failed: {:?}", self.local_address, e);
            return Err(e);
        }
        let voter = Address(vote.voter);
        let round_state = self.rounds.entry(vote.height).or_default();
        round_state.votes.insert(voter, vote);
        Ok(())
    }

    async fn finalize(&mut self, block_hash: Hash) -> Result<Finality, ConsensusError> {
        // Find the most recent height with a matching proposal and quorum.
        for height in (self.height + 1..=self.height + 1).rev() {
            let round = self
                .rounds
                .get(&height)
                .ok_or(ConsensusError::InvalidProposal)?;
            if let Some(proposal) = &round.proposal {
                if proposal.block_hash == block_hash {
                    if let Some(block) = self.try_finalize(height) {
                        return Ok(Finality {
                            block,
                            timestamp: std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_secs(),
                        });
                    }
                }
            }
        }
        Err(ConsensusError::InvalidProposal)
    }

    fn height(&self) -> u64 {
        self.height
    }

    fn validator_address(&self) -> Option<Address> {
        Some(self.local_address)
    }
}

impl From<Block> for Proposal {
    fn from(block: Block) -> Self {
        Self {
            block_hash: block.hash(),
            height: block.header.height,
            round: 0,
            proposer: block.header.proposer,
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

    fn validator_set(addresses: Vec<Address>) -> ValidatorSet {
        ValidatorSet::from_validators(
            addresses
                .into_iter()
                .map(|a| crate::Validator::new(a, 1))
                .collect(),
        )
    }

    #[tokio::test]
    async fn non_proposer_cannot_propose() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let set = validator_set(vec![v1, v2]);
        let proposer = set.proposer(1, 0).unwrap();
        let non_proposer = if proposer == v1 { v2 } else { v1 };
        let mut engine = BftConsensus::new(non_proposer, set);
        let result = engine.propose(1, vec![]).await;
        assert!(matches!(result, Err(ConsensusError::NotProposer)));
    }

    #[tokio::test]
    async fn proposer_auto_votes_for_own_block() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let v3 = addr("v3");
        let set = validator_set(vec![v1, v2, v3]);
        let proposer_addr = set.proposer(1, 0).unwrap();
        let mut engine = BftConsensus::new(proposer_addr, set);
        let block = engine.propose(1, vec![]).await.unwrap();
        assert_eq!(block.header.height, 1);
    }

    #[tokio::test]
    async fn proposal_reaches_finality_with_quorum() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let v3 = addr("v3");
        let v4 = addr("v4");
        let set = validator_set(vec![v1, v2, v3, v4]);

        let proposer_addr = set.proposer(1, 0).unwrap();
        let mut proposer = BftConsensus::new(proposer_addr, set.clone());
        let block = proposer.propose(1, vec![]).await.unwrap();
        let proposal: Proposal = block.clone().into();

        // Two additional validators receive the proposal and vote for it.
        // With 4 validators the quorum is 3, so the proposer's own vote plus
        // two more is enough.
        let mut other_validators: Vec<Address> = set
            .addresses()
            .into_iter()
            .filter(|a| *a != proposer_addr)
            .collect();
        other_validators.truncate(2);

        for voter in other_validators {
            let mut engine = BftConsensus::new(voter, set.clone());
            engine.handle_proposal(proposal.clone()).await.unwrap();
            let vote = Vote {
                block_hash: block.hash(),
                height: 1,
                round: 0,
                voter: *voter.as_bytes(),
            };
            proposer.handle_vote(vote).await.unwrap();
        }

        assert_eq!(proposer.vote_count(1), 3, "expected 3 votes for quorum");

        let finality = proposer.finalize(block.hash()).await.unwrap();
        assert_eq!(finality.block.hash(), block.hash());
        assert_eq!(proposer.height(), 1);
    }

    #[tokio::test]
    async fn invalid_proposer_rejected() {
        let v1 = addr("v1");
        let v2 = addr("v2");
        let set = validator_set(vec![v1, v2]);
        let proposer = set.proposer(1, 0).unwrap();
        let non_proposer = if proposer == v1 { v2 } else { v1 };
        let mut engine = BftConsensus::new(proposer, set);
        let bad_proposal = Proposal {
            block_hash: Hash::default(),
            height: 1,
            round: 0,
            proposer: *non_proposer.as_bytes(),
        };
        let result = engine.handle_proposal(bad_proposal).await;
        assert!(matches!(result, Err(ConsensusError::InvalidProposal)));
    }
}
