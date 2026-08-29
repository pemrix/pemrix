//! Canonical binary encoding for consensus-critical types.
//!
//! This module provides a minimal deterministic encoding. In production it
//! should be replaced or hardened into a fully specified canonical format.

use serde::{Deserialize, Serialize};

/// Encode a value into canonical bytes using a compact binary format.
pub fn encode<T: Serialize>(value: &T) -> Vec<u8> {
    // TODO: Replace with a custom canonical binary encoder.
    // For scaffolding, `bincode` or `serde_json` would be tempting, but JSON
    // is non-canonical. We use a placeholder compact representation.
    bincode_placeholder(value)
}

/// Decode bytes into a value.
pub fn decode<T: for<'de> Deserialize<'de>>(bytes: &[u8]) -> Result<T, &'static str> {
    bincode_decode_placeholder(bytes)
}

fn bincode_placeholder<T: Serialize>(value: &T) -> Vec<u8> {
    // Placeholder: use serde_json for now to keep scaffolding compiling.
    // This MUST be replaced before mainnet.
    serde_json::to_vec(value).expect("serialization should not fail")
}

fn bincode_decode_placeholder<T: for<'de> Deserialize<'de>>(
    bytes: &[u8],
) -> Result<T, &'static str> {
    serde_json::from_slice(bytes).map_err(|_| "decode failed")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Account, Address, Transaction};

    #[test]
    fn round_trip_transaction() {
        let tx = Transaction::transfer(Address::default(), Address::default(), 100, 0, 1);
        let bytes = encode(&tx);
        let decoded: Transaction = decode(&bytes).unwrap();
        assert_eq!(tx, decoded);
    }

    #[test]
    fn round_trip_account() {
        let account = Account::new(1_000, 5);
        let bytes = encode(&account);
        let decoded: Account = decode(&bytes).unwrap();
        assert_eq!(account, decoded);
    }
}
