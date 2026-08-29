//! Fixed-size hash type for PEMRIX.

use std::fmt;
use std::str::FromStr;

/// A 32-byte hash.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Hash(pub [u8; 32]);

impl Hash {
    /// Create a hash from a byte array.
    pub const fn new(bytes: [u8; 32]) -> Self {
        Self(bytes)
    }

    /// Compute the BLAKE3 hash of arbitrary bytes.
    pub fn hash_bytes(bytes: &[u8]) -> Self {
        let digest = blake3::hash(bytes);
        Self(*digest.as_bytes())
    }

    /// Return the hash as a byte slice.
    pub fn as_bytes(&self) -> &[u8; 32] {
        &self.0
    }
}

impl fmt::Display for Hash {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.0))
    }
}

impl fmt::Debug for Hash {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Hash({})", self)
    }
}

impl serde::Serialize for Hash {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

impl<'de> serde::Deserialize<'de> for Hash {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        Hash::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl FromStr for Hash {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(s).map_err(|_| "invalid hex")?;
        if bytes.len() != 32 {
            return Err("hash must be 32 bytes");
        }
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&bytes);
        Ok(Self(arr))
    }
}

impl AsRef<[u8]> for Hash {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_round_trip() {
        let h = Hash::hash_bytes(b"pemrix");
        let s = h.to_string();
        let parsed = Hash::from_str(&s).unwrap();
        assert_eq!(h, parsed);
    }
}
