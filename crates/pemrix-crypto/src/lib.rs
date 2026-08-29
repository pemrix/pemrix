//! # PEMRIX Cryptography
//!
//! Crypto-agile signature abstraction for the PEMRIX network.
//!
//! The design supports classical signatures today (Ed25519), with a clear path
//! to hybrid classical + post-quantum signatures and eventually PQC-only
//! signatures without breaking the protocol.

#![warn(missing_docs)]

pub mod classical;
pub mod error;
pub mod hybrid;
pub mod scheme;

pub use classical::Ed25519Scheme;
pub use error::CryptoError;
pub use hybrid::HybridSignature;
pub use scheme::{KeyPair, PublicKey, SecretKey, Signature, SignatureScheme};
