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
use pemrix_vm::{BlockExecutor, Vm};
use std::collections::{BTreeMap, BTreeSet};
use tracing::warn;

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
            warn!(
                "[bft {}] validate_proposal failed: {:?}",
                self.local_address, e
            );
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

    /// Return the block proposed by the local validator for a height, if any.
    pub fn own_proposal(&self, height: u64) -> Option<Block> {
        self.rounds.get(&height)?.block.clone()
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
        let executor = BlockExecutor::new();
        for tx in &transactions {
            executor
                .execute(&mut self.state, tx)
                .map_err(|e| ConsensusError::ExecutionFailed(e.to_string()))?;
        }

        // Recompute the validator set from on-chain validator records so that
        // register/delegate/undelegate transactions take effect in the next round.
        self.update_validator_set();

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

    /// Rebuild the BFT validator set from on-chain validator records.
    ///
    /// Active validators are those with status `Active` and total stake above
    /// the protocol-defined threshold. The top validators by stake are included
    /// up to the maximum active set size.
    fn update_validator_set(&mut self) {
        let records = match self.state.validator_records() {
            Ok(r) => r,
            Err(e) => {
                warn!(
                    "[bft {}] failed to read validator records: {}",
                    self.local_address, e
                );
                return;
            }
        };

        let mut candidates: Vec<(Address, u64)> = records
            .into_iter()
            .filter(|(_, record)| {
                record.status == pemrix_primitives::ValidatorStatus::Active
                    && record.total_stake() >= pemrix_protocol::MIN_ACTIVE_STAKE
            })
            .map(|(address, record)| {
                let power = record.total_stake().min(u64::MAX as u128) as u64;
                (address, power)
            })
            .collect();

        // Sort by stake descending, then by address ascending for determinism.
        candidates.sort_by(|(a_addr, a_power), (b_addr, b_power)| {
            b_power
                .cmp(a_power)
                .then_with(|| a_addr.as_bytes().cmp(b_addr.as_bytes()))
        });

        let max_validators = pemrix_protocol::MAX_ACTIVE_VALIDATORS as usize;
        let active: Vec<(Address, u64)> = candidates.into_iter().take(max_validators).collect();

        let mut new_set = ValidatorSet::new();
        for (address, power) in active {
            new_set.add(address, power);
        }

        if !new_set.is_empty() {
            self.validator_set = new_set;
        } else {
            warn!(
                "[bft {}] validator set would become empty; keeping previous set",
                self.local_address
            );
        }
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
            self.voted_this_height.retain(|(h, _)| *h != height);
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

    #[tokio::test]
    async fn staking_register_updates_validator_set() {
        use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
        use pemrix_primitives::Transaction;
        use pemrix_vm::{StakingExecutor, StakingOperation};

        let scheme = Ed25519Scheme::new();
        let proposer = addr("proposer");

        // Initial validator set contains only the proposer.
        let mut engine = BftConsensus::new(
            proposer,
            ValidatorSet::from_validators(vec![crate::Validator::new(proposer, 1)]),
        );

        // Generate a new validator keypair and fund it.
        let keypair = scheme.generate_keypair().unwrap();
        let new_validator = Address::from_public_key_hash(Hash::hash_bytes(&keypair.public.0));
        let self_stake = 100_000 * pemrix_protocol::ONE_PMX;
        engine.fund(new_validator, 200_000 * pemrix_protocol::ONE_PMX);

        // Build a register-validator transaction.
        let payload = StakingExecutor::encode(&StakingOperation::RegisterValidator {
            consensus_pubkey: vec![1; 32],
            commission_bps: 500,
            self_stake,
        });
        let mut tx = Transaction {
            sender: new_validator,
            recipient: Address::default(),
            amount: 0,
            nonce: 0,
            fee: 1,
            public_key: keypair.public.0.clone(),
            signature: vec![],
            payload,
        };
        let signature = scheme
            .sign(&keypair.secret, tx.signing_hash().as_bytes())
            .unwrap();
        tx.signature = signature.0;

        // Propose a block containing the staking transaction.
        let block = engine.propose(1, vec![tx]).await.unwrap();
        assert_eq!(block.header.height, 1);

        // The validator set should now include the newly registered validator.
        assert!(
            engine.validator_set.is_validator(&new_validator),
            "new validator should be in the active set"
        );
        assert_eq!(
            engine.validator_set.power(&new_validator),
            Some(self_stake as u64)
        );
    }
}
