//! Account address type for PEMRIX.

use crate::Hash;
use std::fmt;
use std::str::FromStr;

/// A fixed-size account address derived from a public key hash.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Address(pub [u8; 32]);

impl Address {
    /// Create an address from a public key hash.
    pub fn from_public_key_hash(hash: Hash) -> Self {
        Self(*hash.as_bytes())
    }

    /// Return the address as a byte slice.
    pub fn as_bytes(&self) -> &[u8; 32] {
        &self.0
    }
}

impl fmt::Display for Address {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "px{}", hex::encode(self.0))
    }
}

impl fmt::Debug for Address {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Address({})", self)
    }
}

impl serde::Serialize for Address {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

impl<'de> serde::Deserialize<'de> for Address {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        Address::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl FromStr for Address {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s = s.strip_prefix("px").unwrap_or(s);
        let bytes = hex::decode(s).map_err(|_| "invalid hex")?;
        if bytes.len() != 32 {
            return Err("address must be 32 bytes");
        }
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&bytes);
        Ok(Self(arr))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn address_round_trip() {
        let addr = Address::from_public_key_hash(Hash::hash_bytes(b"key"));
        let s = addr.to_string();
        let parsed = Address::from_str(&s).unwrap();
        assert_eq!(addr, parsed);
    }
}
