//! Node lifecycle functions.

use crate::{GenesisConfig, NodeConfig, NodeError};
use pemrix_consensus::{BftConsensus, ConsensusEngine, SimpleMempool, SoloConsensus, Vote};
use pemrix_network::{Message, MockTransport, NetworkEvent, PeerId, TcpTransport, Transport};
use pemrix_primitives::{Address, Block, Hash};
#[cfg(not(feature = "rocksdb"))]
use pemrix_storage::InMemoryBackend;
use pemrix_storage::StateStore;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tracing::{info, warn};

/// The consensus backend type selected at compile time.
#[cfg(feature = "rocksdb")]
type Backend = pemrix_storage::RocksDbBackend;
#[cfg(not(feature = "rocksdb"))]
type Backend = InMemoryBackend;

/// The concrete BFT consensus type for this build.
type Consensus = BftConsensus<Backend>;

/// Open the state store for the node data directory.
#[cfg(feature = "rocksdb")]
fn open_state_store(data_dir: &str) -> Result<StateStore<Backend>, NodeError> {
    let path = std::path::Path::new(data_dir).join("state");
    std::fs::create_dir_all(&path)?;
    let backend = pemrix_storage::RocksDbBackend::open(path)?;
    Ok(StateStore::new(backend))
}

#[cfg(not(feature = "rocksdb"))]
fn open_state_store(_data_dir: &str) -> StateStore<Backend> {
    StateStore::new_in_memory()
}

/// A running PEMRIX node.
pub struct Node {
    /// Node configuration.
    pub config: NodeConfig,
    /// Genesis configuration.
    pub genesis: GenesisConfig,
}

/// Initialize a new node data directory.
pub fn init(data_dir: &str, validator: bool) -> Result<(), NodeError> {
    std::fs::create_dir_all(data_dir)?;
    let mut config = NodeConfig::for_data_dir(data_dir);
    config.validator = validator;
    config.save()?;

    let genesis = GenesisConfig::local_development(&[]);
    genesis.save(data_dir)?;

    info!("Initialized PEMRIX node at {}", data_dir);
    Ok(())
}

/// Start a PEMRIX node.
pub async fn start(data_dir: &str) -> Result<(), NodeError> {
    let mut config = NodeConfig::load(data_dir)?;
    let genesis = GenesisConfig::load(data_dir)?;

    info!("Starting PEMRIX node");
    info!("Chain ID: {}", genesis.chain_id);
    info!("Data directory: {}", config.data_dir);
    info!("Validator mode: {}", config.validator);

    if config.validator {
        let key_file = crate::keys::load(data_dir)?;
        let local_address = key_file.address()?;
        config.local_validator_address = Some(local_address);
        if config.validator_set.is_none() {
            config.validator_set = Some(crate::config::single_validator_set(local_address));
        }
    }

    if config.validator_set.is_some() && config.local_validator_address.is_some() {
        start_bft(config, genesis).await
    } else {
        start_solo(config, genesis).await
    }
}

/// Convenience wrapper to start a validator node.
pub async fn start_validator(data_dir: &str) -> Result<(), NodeError> {
    let mut config = NodeConfig::load(data_dir)?;
    config.validator = true;
    config.save()?;
    start(data_dir).await
}

/// Run a single-validator node using solo consensus (development mode).
async fn start_solo(_config: NodeConfig, genesis: GenesisConfig) -> Result<(), NodeError> {
    let genesis_block = genesis.genesis_block()?;
    let genesis_hash = genesis_block.hash();
    info!("Genesis block hash: {}", genesis_hash);

    let proposer = genesis
        .validators
        .first()
        .copied()
        .unwrap_or_else(Address::default);
    let mut consensus = SoloConsensus::new_with_previous_hash(proposer, genesis_hash);
    // Seed consensus state with genesis allocations.
    for (address, account) in &genesis.allocations {
        consensus
            .state_mut()
            .set_account(address, *account)
            .map_err(NodeError::Storage)?;
    }

    let _mempool = SimpleMempool::new();
    let _transport = MockTransport::new(PeerId::from_public_key_hash(Hash::hash_bytes(b"local")));

    // Run a minimal block production loop for demonstration.
    for height in 1..=3 {
        let block = consensus
            .propose(height, vec![])
            .await
            .map_err(|_| NodeError::Consensus)?;
        info!(
            "Produced block {} with hash {}",
            block.header.height,
            block.hash()
        );
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }

    warn!("Solo node shutdown gracefully.");
    Ok(())
}

/// Run a multi-validator BFT node connected to peers over TCP.
async fn start_bft(config: NodeConfig, genesis: GenesisConfig) -> Result<(), NodeError> {
    let (_tx, mut rx) = mpsc::unbounded_channel::<Block>();
    let handle = spawn_bft_validator(config, genesis, _tx);
    // The node binary does not wire finalized blocks to shared services;
    // just keep the task alive.
    let _ = rx.recv().await;
    handle.await.map_err(|_| NodeError::Consensus)?
}

/// Spawn a BFT validator task that connects to peers over TCP and reports
/// finalized blocks on `finalized_tx`.
pub fn spawn_bft_validator(
    config: NodeConfig,
    genesis: GenesisConfig,
    finalized_tx: mpsc::UnboundedSender<Block>,
) -> tokio::task::JoinHandle<Result<(), NodeError>> {
    tokio::spawn(async move { run_bft_validator(config, genesis, finalized_tx).await })
}

async fn run_bft_validator(
    config: NodeConfig,
    genesis: GenesisConfig,
    finalized_tx: mpsc::UnboundedSender<Block>,
) -> Result<(), NodeError> {
    let validator_set = config
        .validator_set
        .ok_or_else(|| NodeError::Config("validator_set required for BFT validator".to_string()))?;
    let local_address = config.local_validator_address.ok_or_else(|| {
        NodeError::Config("local_validator_address required for BFT validator".to_string())
    })?;

    let genesis_block = genesis.genesis_block()?;
    let genesis_hash = genesis_block.hash();
    info!(
        "[validator {}] Genesis block hash: {}",
        local_address, genesis_hash
    );

    let p2p_addr = std::net::SocketAddr::from_str(&config.p2p_listen)
        .map_err(|_| NodeError::Config("invalid p2p_listen address".to_string()))?;
    let local_id = PeerId::from_public_key_hash(Hash::hash_bytes(local_address.as_bytes()));

    let transport = TcpTransport::new(local_id, p2p_addr, config.bootstrap_nodes.clone())
        .await
        .map_err(|_| NodeError::Network)?;

    #[cfg(feature = "rocksdb")]
    let state_store = open_state_store(&config.data_dir)?;
    #[cfg(not(feature = "rocksdb"))]
    let state_store = open_state_store(&config.data_dir);

    let mut consensus = Consensus::new_with_store(
        local_address,
        validator_set.clone(),
        state_store,
        genesis_hash,
    );
    // Seed consensus state with genesis allocations.
    for (address, account) in &genesis.allocations {
        consensus
            .state_mut()
            .set_account(address, *account)
            .map_err(NodeError::Storage)?;
    }

    let consensus = Arc::new(Mutex::new(consensus));
    let transport = Arc::new(transport);

    // Spawn network event loop.
    let event_consensus = consensus.clone();
    let event_transport = transport.clone();
    let event_finalized = finalized_tx.clone();
    tokio::spawn(async move {
        run_network_event_loop(event_consensus, event_transport, event_finalized).await;
    });

    // Block production loop.
    let block_interval_ms = std::env::var("PEMRIX_BLOCK_INTERVAL_MS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(1000u64)
        .max(50);
    let block_interval = tokio::time::Duration::from_millis(block_interval_ms);

    let mut height = 1u64;
    let mut last_proposed_height = 0u64;
    loop {
        // Wait for at least one peer before proposing (multi-validator BFT).
        while transport.peer_count().await == 0 {
            info!(
                "[validator {}] Waiting for peers (peer_count=0)",
                local_address
            );
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }

        let is_proposer = {
            let c = consensus.lock().await;
            c.validator_set().proposer(height, 0) == Some(local_address)
        };
        info!(
            "[validator {}] block loop height={} peer_count={} is_proposer={}",
            local_address,
            height,
            transport.peer_count().await,
            is_proposer
        );

        if is_proposer && height > last_proposed_height {
            let block = {
                let mut c = consensus.lock().await;
                match c.propose(height, vec![]).await {
                    Ok(block) => block,
                    Err(e) => {
                        warn!(
                            "[validator {}] Failed to propose block at height {}: {}",
                            local_address, height, e
                        );
                        tokio::time::sleep(block_interval).await;
                        continue;
                    }
                }
            };
            last_proposed_height = height;
            info!(
                "[validator {}] Proposed block {} with hash {}",
                local_address,
                height,
                block.hash()
            );
            info!("[validator {}] broadcasting block height={} hash={}", local_address, height, block.hash());
            if let Err(e) = transport.broadcast(Message::Block(block)).await {
                warn!("[validator {}] Broadcast failed: {}", local_address, e);
            }

            // The proposer auto-voted for its own proposal. Broadcast that vote
            // so non-proposer validators can reach a quorum and finalize the
            // same height.
            if let Some(vote) = consensus.lock().await.own_vote(height) {
                let bytes = pemrix_primitives::encoding::encode(&vote);
                info!("[validator {}] broadcasting proposer vote height={} hash={}", local_address, vote.height, vote.block_hash);
                if let Err(e) = transport.broadcast(Message::Vote(bytes)).await {
                    warn!("[validator {}] proposer vote broadcast failed: {}", local_address, e);
                }
            }

            // The proposer auto-voted; try to finalize immediately (useful for
            // single-validator tests) and after collecting peer votes.
            if let Some(block) = consensus.lock().await.finalize_pending().await {
                let _ = finalized_tx.send(block);
            }
        }

        tokio::time::sleep(block_interval).await;

        let current_height = consensus.lock().await.height();
        if current_height >= height {
            height = current_height + 1;
        }
    }
}

/// Process incoming network events and feed them to the consensus engine.
async fn run_network_event_loop(
    consensus: Arc<Mutex<Consensus>>,
    transport: Arc<TcpTransport>,
    finalized_tx: mpsc::UnboundedSender<Block>,
) {
    loop {
        let event = transport.next_event().await;
        match event {
            Some(NetworkEvent::PeerConnected(peer)) => {
                info!("Peer connected: {:?}", peer);
            }
            Some(NetworkEvent::PeerDisconnected(peer)) => {
                warn!("Peer disconnected: {:?}", peer);
            }
            Some(NetworkEvent::MessageReceived(peer, Message::Block(block))) => {
                info!(
                    "[network] received Block from {:?} height={} hash={}",
                    peer,
                    block.header.height,
                    block.hash()
                );
                let own_vote = {
                    let mut c = consensus.lock().await;
                    match c.handle_block(block).await {
                        Ok(vote) => Some(vote),
                        Err(e) => {
                            warn!("[network] handle_block failed: {}", e);
                            None
                        }
                    }
                };
                if let Some(vote) = own_vote {
                    let bytes = pemrix_primitives::encoding::encode(&vote);
                    info!("[network] broadcasting own vote for height={} hash={}", vote.height, vote.block_hash);
                    if let Err(e) = transport.broadcast(Message::Vote(bytes)).await {
                        warn!("[network] vote broadcast failed: {}", e);
                    }
                }

                if let Some(block) = consensus.lock().await.finalize_pending().await {
                    let _ = finalized_tx.send(block);
                }
            }
            Some(NetworkEvent::MessageReceived(peer, Message::Vote(bytes))) => {
                if let Ok(vote) = pemrix_primitives::encoding::decode::<Vote>(&bytes) {
                    info!(
                        "[network] received Vote from {:?} height={} voter={} hash={}",
                        peer,
                        vote.height,
                        Address(vote.voter),
                        vote.block_hash
                    );
                    let finalized = {
                        let mut c = consensus.lock().await;
                        let _ = c.handle_vote(vote).await;
                        c.finalize_pending().await
                    };
                    if let Some(block) = finalized {
                        info!("[network] finalized block height={} hash={}", block.header.height, block.hash());
                        let _ = finalized_tx.send(block);
                    }
                } else {
                    warn!("[network] failed to decode Vote from {:?}", peer);
                }
            }
            Some(NetworkEvent::MessageReceived(_peer, _)) => {}
            None => break,
        }
    }
}

/// Print node status.
pub fn status(data_dir: &str) -> Result<String, NodeError> {
    let config = NodeConfig::load(data_dir)?;
    let genesis = GenesisConfig::load(data_dir)?;
    Ok(format!(
        "PEMRIX Node Status\nChain ID: {}\nData Directory: {}\nValidator: {}\nRPC: {}\nP2P: {}",
        genesis.chain_id, config.data_dir, config.validator, config.rpc_listen, config.p2p_listen
    ))
}

/// Print key information.
pub fn keys(data_dir: &str) -> Result<String, NodeError> {
    crate::keys::status(data_dir)
}
