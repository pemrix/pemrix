//! Classical signature schemes.

use crate::{CryptoError, KeyPair, PublicKey, SecretKey, Signature, SignatureScheme};
use ed25519_dalek::{Signer, Verifier};

/// Ed25519 signature scheme.
#[derive(Clone, Copy, Debug, Default)]
pub struct Ed25519Scheme;

impl Ed25519Scheme {
    /// Create a new Ed25519 scheme instance.
    pub const fn new() -> Self {
        Self
    }
}

impl Ed25519Scheme {
    /// Derive a deterministic keypair from a seed.
    ///
    /// The seed is hashed to 32 bytes and used as the secret key. The public key
    /// is derived from the secret key. This is useful for testnets and
    /// deterministic accounts; never use it for production keys unless the seed
    /// has high entropy.
    pub fn keypair_from_seed(seed: &[u8]) -> Result<KeyPair, CryptoError> {
        let hash = blake3::hash(seed);
        let secret_bytes = hash.as_bytes();
        let signing_key = ed25519_dalek::SigningKey::from_bytes(secret_bytes);
        let verifying_key = signing_key.verifying_key();
        Ok(KeyPair {
            public: PublicKey(verifying_key.to_bytes().to_vec()),
            secret: SecretKey(signing_key.to_bytes().to_vec()),
        })
    }
}

impl SignatureScheme for Ed25519Scheme {
    fn generate_keypair(&self) -> Result<KeyPair, CryptoError> {
        let mut rng = rand::thread_rng();
        let signing_key = ed25519_dalek::SigningKey::generate(&mut rng);
        let verifying_key = signing_key.verifying_key();
        Ok(KeyPair {
            public: PublicKey(verifying_key.to_bytes().to_vec()),
            secret: SecretKey(signing_key.to_bytes().to_vec()),
        })
    }

    fn sign(&self, secret: &SecretKey, message: &[u8]) -> Result<Signature, CryptoError> {
        let bytes: [u8; 32] = secret
            .0
            .as_slice()
            .try_into()
            .map_err(|_| CryptoError::InvalidKey)?;
        let signing_key = ed25519_dalek::SigningKey::from_bytes(&bytes);
        let signature = signing_key.sign(message);
        Ok(Signature(signature.to_bytes().to_vec()))
    }

    fn verify(
        &self,
        public: &PublicKey,
        message: &[u8],
        signature: &Signature,
    ) -> Result<(), CryptoError> {
        let bytes: [u8; 32] = public
            .0
            .as_slice()
            .try_into()
            .map_err(|_| CryptoError::InvalidKey)?;
        let verifying_key =
            ed25519_dalek::VerifyingKey::from_bytes(&bytes).map_err(|_| CryptoError::InvalidKey)?;
        let sig_bytes: [u8; 64] = signature
            .0
            .as_slice()
            .try_into()
            .map_err(|_| CryptoError::InvalidKey)?;
        let sig = ed25519_dalek::Signature::from_bytes(&sig_bytes);
        verifying_key
            .verify(message, &sig)
            .map_err(|_| CryptoError::VerificationFailed)
    }

    fn algorithm_id(&self) -> &'static str {
        "ed25519"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ed25519_sign_verify() {
        let scheme = Ed25519Scheme::new();
        let keypair = scheme.generate_keypair().unwrap();
        let message = b"pemrix";
        let signature = scheme.sign(&keypair.secret, message).unwrap();
        scheme.verify(&keypair.public, message, &signature).unwrap();
    }

    #[test]
    fn ed25519_verify_wrong_message_fails() {
        let scheme = Ed25519Scheme::new();
        let keypair = scheme.generate_keypair().unwrap();
        let signature = scheme.sign(&keypair.secret, b"pemrix").unwrap();
        assert!(scheme
            .verify(&keypair.public, b"wrong", &signature)
            .is_err());
    }
}
