//! Generic signature scheme abstraction.

use crate::CryptoError;

/// A public key.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct PublicKey(pub Vec<u8>);

/// A secret key.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct SecretKey(pub Vec<u8>);

/// A digital signature.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct Signature(pub Vec<u8>);

/// A key pair.
#[derive(Clone, Debug)]
pub struct KeyPair {
    /// Public key.
    pub public: PublicKey,
    /// Secret key.
    pub secret: SecretKey,
}

/// A signature scheme abstraction.
pub trait SignatureScheme: Send + Sync {
    /// Generate a new key pair.
    fn generate_keypair(&self) -> Result<KeyPair, CryptoError>;

    /// Sign a message.
    fn sign(&self, secret: &SecretKey, message: &[u8]) -> Result<Signature, CryptoError>;

    /// Verify a signature.
    fn verify(
        &self,
        public: &PublicKey,
        message: &[u8],
        signature: &Signature,
    ) -> Result<(), CryptoError>;

    /// Human-readable algorithm identifier.
    fn algorithm_id(&self) -> &'static str;
}
