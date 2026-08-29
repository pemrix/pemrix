//! Validator key management.
//!
//! PEMRIX validators need an Ed25519 keypair. The public key is hashed to
//! produce the validator's on-chain address. The secret key must be protected
//! and never shared.
//!
//! For production deployments, store the secret key in an HSM, secure enclave,
//! or encrypted key management service. The simple file-based storage here is
//! only suitable for testnets and initial development.

use crate::NodeError;
use pemrix_crypto::{Ed25519Scheme, KeyPair, SignatureScheme};
use pemrix_primitives::{Address, Hash};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::str::FromStr;

/// On-disk representation of a validator keypair.
///
/// The secret key is stored as raw bytes. This is NOT secure for production.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ValidatorKeyFile {
    /// Validator address derived from the public key.
    pub address: String,
    /// Public key bytes, hex encoded.
    pub public_key: String,
    /// Secret key bytes, hex encoded.
    pub secret_key: String,
}

impl ValidatorKeyFile {
    /// File name for validator keys inside the data directory.
    pub const FILE_NAME: &'static str = "validator_key.json";

    /// Convert a keypair into the on-disk format.
    pub fn from_keypair(keypair: &KeyPair) -> Self {
        let address = Address::from_public_key_hash(Hash::hash_bytes(&keypair.public.0));
        Self {
            address: address.to_string(),
            public_key: hex::encode(&keypair.public.0),
            secret_key: hex::encode(&keypair.secret.0),
        }
    }

    /// Convert the on-disk format back into a keypair.
    pub fn to_keypair(&self) -> Result<KeyPair, NodeError> {
        let public = hex::decode(&self.public_key)
            .map_err(|e| NodeError::Config(format!("invalid public key hex: {e}")))?;
        let secret = hex::decode(&self.secret_key)
            .map_err(|e| NodeError::Config(format!("invalid secret key hex: {e}")))?;
        Ok(KeyPair {
            public: pemrix_crypto::PublicKey(public),
            secret: pemrix_crypto::SecretKey(secret),
        })
    }

    /// Return the validator address.
    pub fn address(&self) -> Result<Address, NodeError> {
        Address::from_str(&self.address)
            .map_err(|e| NodeError::Config(format!("invalid validator address: {e}")))
    }
}

/// Generate a new random validator keypair.
pub fn generate_keypair() -> Result<KeyPair, NodeError> {
    let scheme = Ed25519Scheme::new();
    scheme.generate_keypair().map_err(|_| NodeError::Crypto)
}

/// Generate and save a validator keypair to the data directory.
pub fn generate_and_save(data_dir: &str) -> Result<ValidatorKeyFile, NodeError> {
    std::fs::create_dir_all(data_dir)?;
    let keypair = generate_keypair()?;
    let key_file = ValidatorKeyFile::from_keypair(&keypair);
    let path = Path::new(data_dir).join(ValidatorKeyFile::FILE_NAME);
    let contents =
        serde_json::to_string_pretty(&key_file).map_err(|e| NodeError::Config(e.to_string()))?;
    std::fs::write(&path, contents)?;
    Ok(key_file)
}

/// Load a validator keypair from the data directory.
pub fn load(data_dir: &str) -> Result<ValidatorKeyFile, NodeError> {
    let path = Path::new(data_dir).join(ValidatorKeyFile::FILE_NAME);
    let contents = std::fs::read_to_string(&path)?;
    let key_file: ValidatorKeyFile = serde_json::from_str(&contents)
        .map_err(|e| NodeError::Config(format!("failed to parse validator key file: {e}")))?;
    Ok(key_file)
}

/// Return a human-readable summary of the validator key in the data directory.
pub fn status(data_dir: &str) -> Result<String, NodeError> {
    let path = Path::new(data_dir).join(ValidatorKeyFile::FILE_NAME);
    if !path.exists() {
        return Ok(format!(
            "No validator key found at {}. Run `pemrix init --validator` to create one.",
            path.display()
        ));
    }
    let key_file = load(data_dir)?;
    Ok(format!(
        "Validator key found at {}\nAddress: {}\nPublic key: {}\nSecret key: [stored in file - protect it]",
        path.display(),
        key_file.address,
        key_file.public_key
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keypair_round_trip() {
        let kp = generate_keypair().unwrap();
        let file = ValidatorKeyFile::from_keypair(&kp);
        let restored = file.to_keypair().unwrap();
        assert_eq!(kp.public.0, restored.public.0);
        assert_eq!(kp.secret.0, restored.secret.0);
    }

    #[test]
    fn address_matches_public_key() {
        let kp = generate_keypair().unwrap();
        let file = ValidatorKeyFile::from_keypair(&kp);
        let expected = Address::from_public_key_hash(Hash::hash_bytes(&kp.public.0));
        assert_eq!(file.address, expected.to_string());
    }
}
