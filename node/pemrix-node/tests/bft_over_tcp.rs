//! End-to-end test: four validators run BFT consensus over localhost TCP.
//!
//! Each validator has a `BftConsensus` engine and a `TcpTransport`. The
//! proposer for height 1 broadcasts the block; the other validators validate
//! the proposal, vote for it, and send their votes back to the proposer. The
//! proposer collects the votes and finalizes the block.
//!
//! Coordination is done manually in a single async task to avoid lock
//! contention between event polling and message sending.

use pemrix_consensus::{BftConsensus, ConsensusEngine, Validator, ValidatorSet, Vote};
use pemrix_network::{Message, NetworkEvent, PeerId, TcpTransport, Transport};
use pemrix_primitives::{Address, Hash};
use std::collections::{BTreeMap, HashSet};
use std::net::SocketAddr;
use std::str::FromStr;

fn peer_id(seed: &str) -> PeerId {
    PeerId::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
}

fn address(seed: &str) -> Address {
    Address::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
}

fn socket_addr(port: u16) -> SocketAddr {
    SocketAddr::from_str(&format!("127.0.0.1:{}", port)).unwrap()
}

async fn wait_for_all_peers(transport: &mut TcpTransport, expected: HashSet<PeerId>) {
    let mut connected = HashSet::new();
    for _ in 0..200 {
        if connected == expected {
            return;
        }
        match tokio::time::timeout(
            tokio::time::Duration::from_millis(50),
            transport.next_event(),
        )
        .await
        {
            Ok(Some(NetworkEvent::PeerConnected(peer))) => {
                connected.insert(peer);
            }
            _ => continue,
        }
    }
    panic!(
        "timed out waiting for peers; connected {:?}, expected {:?}",
        connected, expected
    );
}

async fn expect_block(transport: &mut TcpTransport) -> pemrix_primitives::Block {
    for _ in 0..100 {
        match tokio::time::timeout(
            tokio::time::Duration::from_millis(100),
            transport.next_event(),
        )
        .await
        {
            Ok(Some(NetworkEvent::MessageReceived(_, Message::Block(block)))) => return block,
            Ok(Some(_)) => continue,
            _ => continue,
        }
    }
    panic!("timed out waiting for block proposal");
}

async fn expect_vote(transport: &mut TcpTransport) -> Vote {
    for _ in 0..100 {
        match tokio::time::timeout(
            tokio::time::Duration::from_millis(100),
            transport.next_event(),
        )
        .await
        {
            Ok(Some(NetworkEvent::MessageReceived(_, Message::Vote(bytes)))) => {
                return pemrix_primitives::encoding::decode(&bytes).expect("valid vote");
            }
            Ok(Some(_)) => continue,
            _ => continue,
        }
    }
    panic!("timed out waiting for vote");
}

#[tokio::test]
async fn four_validators_finalize_block_over_tcp() {
    let validators = [address("v0"), address("v1"), address("v2"), address("v3")];
    let validator_set =
        ValidatorSet::from_validators(validators.iter().map(|a| Validator::new(*a, 1)).collect());

    let ports: Vec<u16> = vec![60301, 60302, 60303, 60304];
    let mut addrs: BTreeMap<Address, SocketAddr> = BTreeMap::new();
    for (addr, port) in validators.iter().zip(ports.iter()) {
        addrs.insert(*addr, socket_addr(*port));
    }

    let mut transports: Vec<TcpTransport> = Vec::new();
    let mut consensus_engines: Vec<BftConsensus> = Vec::new();

    for (i, validator_addr) in validators.iter().enumerate() {
        let local_port = ports[i];
        let local_id = peer_id(&format!("v{i}"));

        // Dial only higher-index peers to avoid duplicate connections.
        let mut bootstrap: BTreeMap<PeerId, SocketAddr> = BTreeMap::new();
        for (j, other_addr) in validators.iter().enumerate().skip(i + 1) {
            bootstrap.insert(peer_id(&format!("v{j}")), addrs[other_addr]);
        }

        let transport = TcpTransport::new(local_id, socket_addr(local_port), bootstrap)
            .await
            .expect("transport should bind");
        let consensus = BftConsensus::new(*validator_addr, validator_set.clone());

        transports.push(transport);
        consensus_engines.push(consensus);
    }

    // Wait for every node to see every other node as connected.
    for (i, transport) in transports.iter_mut().enumerate() {
        let mut expected = HashSet::new();
        for (j, _) in validators.iter().enumerate() {
            if i == j {
                continue;
            }
            expected.insert(peer_id(&format!("v{j}")));
        }
        wait_for_all_peers(transport, expected).await;
    }

    // Determine proposer for height 1.
    let proposer_addr = validator_set.proposer(1, 0).unwrap();
    let proposer_index = validators.iter().position(|a| *a == proposer_addr).unwrap();

    // Proposer creates and broadcasts the block.
    let block = consensus_engines[proposer_index]
        .propose(1, vec![])
        .await
        .unwrap();
    transports[proposer_index]
        .broadcast(Message::Block(block.clone()))
        .await
        .expect("broadcast should succeed");

    // Each non-proposer receives the block, validates it, and sends its vote
    // directly back to the proposer.
    for i in 0..4 {
        if i == proposer_index {
            continue;
        }
        let received = expect_block(&mut transports[i]).await;
        assert_eq!(received.hash(), block.hash());

        let proposal = received.into();
        consensus_engines[i]
            .handle_proposal(proposal)
            .await
            .unwrap();
        let vote = consensus_engines[i].own_vote(1).unwrap();
        let vote_bytes = pemrix_primitives::encoding::encode(&vote);
        transports[i]
            .send_to(
                &peer_id(&format!("v{proposer_index}")),
                Message::Vote(vote_bytes),
            )
            .await
            .expect("send vote should succeed");
    }

    // Proposer collects the votes and finalizes the block.
    for _ in 0..3 {
        let vote = expect_vote(&mut transports[proposer_index]).await;
        consensus_engines[proposer_index]
            .handle_vote(vote)
            .await
            .expect("handle vote should succeed");
    }

    let finality = consensus_engines[proposer_index]
        .finalize(block.hash())
        .await
        .expect("block should finalize");
    assert_eq!(finality.block.hash(), block.hash());
    assert_eq!(consensus_engines[proposer_index].height(), 1);
}
