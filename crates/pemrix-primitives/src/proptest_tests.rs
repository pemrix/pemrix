//! Property-based tests for PEMRIX primitives.

use crate::{Account, Address, Block, BlockBody, BlockHeader, Hash, Transaction};
use proptest::prelude::*;
use std::str::FromStr;

fn any_hash() -> impl Strategy<Value = Hash> {
    proptest::array::uniform32(0u8..=255).prop_map(Hash::new)
}

fn any_address() -> impl Strategy<Value = Address> {
    any_hash().prop_map(Address::from_public_key_hash)
}

fn any_account() -> impl Strategy<Value = Account> {
    (any::<u128>(), any::<u64>()).prop_map(|(balance, nonce)| Account::new(balance, nonce))
}

fn any_transaction() -> impl Strategy<Value = Transaction> {
    (
        any_address(),
        any_address(),
        any::<u128>(),
        any::<u64>(),
        any::<u128>(),
        any::<Vec<u8>>(),
    )
        .prop_map(
            |(sender, recipient, amount, nonce, fee, payload)| Transaction {
                sender,
                recipient,
                amount,
                nonce,
                fee,
                public_key: Vec::new(),
                signature: Vec::new(),
                payload,
            },
        )
}

fn any_block() -> impl Strategy<Value = Block> {
    (
        any::<u64>(),
        any::<u64>(),
        any_hash(),
        any_hash(),
        any_hash(),
        proptest::array::uniform32(0u8..=255),
        proptest::collection::vec(any_transaction(), 0..10),
    )
        .prop_map(
            |(height, timestamp, previous_hash, state_root, tx_root, proposer, transactions)| {
                Block {
                    header: BlockHeader {
                        height,
                        timestamp,
                        previous_hash,
                        state_root,
                        tx_root,
                        proposer,
                    },
                    body: BlockBody { transactions },
                }
            },
        )
}

proptest! {
    #[test]
    fn hash_string_round_trip(hash in any_hash()) {
        let s = hash.to_string();
        let parsed = Hash::from_str(&s).unwrap();
        prop_assert_eq!(hash, parsed);
    }

    #[test]
    fn address_string_round_trip(addr in any_address()) {
        let s = addr.to_string();
        let parsed = Address::from_str(&s).unwrap();
        prop_assert_eq!(addr, parsed);
    }

    #[test]
    fn account_encoding_round_trip(account in any_account()) {
        let bytes = crate::encoding::encode(&account);
        let decoded: Account = crate::encoding::decode(&bytes).unwrap();
        prop_assert_eq!(account, decoded);
    }

    #[test]
    fn transaction_encoding_round_trip(tx in any_transaction()) {
        let bytes = crate::encoding::encode(&tx);
        let decoded: Transaction = crate::encoding::decode(&bytes).unwrap();
        prop_assert_eq!(tx, decoded);
    }

    #[test]
    fn block_encoding_round_trip(block in any_block()) {
        let bytes = crate::encoding::encode(&block);
        let decoded: Block = crate::encoding::decode(&bytes).unwrap();
        prop_assert_eq!(block, decoded);
    }

    #[test]
    fn transaction_hash_is_stable(tx in any_transaction()) {
        let h1 = tx.hash();
        let h2 = tx.hash();
        prop_assert_eq!(h1, h2);
    }
}
