//! Verify that a BFT-enabled NodeConfig can be saved and loaded.

use pemrix_consensus::{Validator, ValidatorSet};
use pemrix_network::PeerId;
use pemrix_node::NodeConfig;
use pemrix_primitives::{Address, Hash};
use std::collections::BTreeMap;
use std::net::SocketAddr;
use std::str::FromStr;

fn address(seed: &str) -> Address {
    Address::from_public_key_hash(Hash::hash_bytes(seed.as_bytes()))
}

#[test]
fn bft_node_config_round_trip() {
    let v1 = address("v1");
    let v2 = address("v2");
    let validator_set =
        ValidatorSet::from_validators(vec![Validator::new(v1, 1), Validator::new(v2, 1)]);

    let peer = PeerId::from_public_key_hash(Hash::hash_bytes(b"peer"));
    let mut bootstrap = BTreeMap::new();
    bootstrap.insert(peer, SocketAddr::from_str("127.0.0.1:60303").unwrap());

    let config = NodeConfig {
        data_dir: "./test-data".to_string(),
        rpc_listen: "127.0.0.1:60001".to_string(),
        p2p_listen: "0.0.0.0:60303".to_string(),
        validator: true,
        bootstrap_nodes: bootstrap.clone(),
        validator_set: Some(validator_set.clone()),
        local_validator_address: Some(v1),
    };

    let json = serde_json::to_string(&config).expect("serialize");
    let loaded: NodeConfig = serde_json::from_str(&json).expect("deserialize");

    assert_eq!(loaded.data_dir, config.data_dir);
    assert_eq!(loaded.rpc_listen, config.rpc_listen);
    assert_eq!(loaded.p2p_listen, config.p2p_listen);
    assert!(loaded.validator);
    assert_eq!(loaded.bootstrap_nodes, bootstrap);
    assert_eq!(loaded.validator_set, Some(validator_set));
    assert_eq!(loaded.local_validator_address, Some(v1));
}
