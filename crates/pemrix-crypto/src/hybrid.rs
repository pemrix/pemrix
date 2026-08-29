//! Hybrid classical + post-quantum signature support.

use crate::{CryptoError, Signature, SignatureScheme};

/// A hybrid signature containing a classical and a post-quantum component.
///
/// This type is crypto-agile: the inner algorithms can be swapped as the
/// protocol migrates from classical → hybrid → post-quantum.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct HybridSignature {
    /// Classical signature component.
    pub classical: Signature,
    /// Post-quantum signature component.
    pub post_quantum: Option<Signature>,
    /// Classical algorithm identifier.
    pub classical_algorithm: String,
    /// Post-quantum algorithm identifier, if present.
    pub post_quantum_algorithm: Option<String>,
}

impl HybridSignature {
    /// Create a classical-only hybrid signature.
    pub fn classical(algorithm: &str, signature: Signature) -> Self {
        Self {
            classical: signature,
            post_quantum: None,
            classical_algorithm: algorithm.to_string(),
            post_quantum_algorithm: None,
        }
    }

    /// Create a full hybrid signature.
    pub fn hybrid(
        classical_algorithm: &str,
        classical: Signature,
        pq_algorithm: &str,
        post_quantum: Signature,
    ) -> Self {
        Self {
            classical,
            post_quantum: Some(post_quantum),
            classical_algorithm: classical_algorithm.to_string(),
            post_quantum_algorithm: Some(pq_algorithm.to_string()),
        }
    }

    /// Return true if this signature includes a post-quantum component.
    pub fn is_post_quantum(&self) -> bool {
        self.post_quantum.is_some()
    }
}

/// A hybrid signature scheme that combines a classical scheme with a
/// post-quantum scheme.
pub struct HybridScheme {
    classical: Box<dyn SignatureScheme>,
    post_quantum: Option<Box<dyn SignatureScheme>>,
}

impl HybridScheme {
    /// Create a hybrid scheme from a classical scheme and optional PQC scheme.
    pub fn new(
        classical: Box<dyn SignatureScheme>,
        post_quantum: Option<Box<dyn SignatureScheme>>,
    ) -> Self {
        Self {
            classical,
            post_quantum,
        }
    }
}

impl SignatureScheme for HybridScheme {
    fn generate_keypair(&self) -> Result<crate::KeyPair, CryptoError> {
        // For scaffolding, return classical keys only.
        self.classical.generate_keypair()
    }

    fn sign(&self, secret: &crate::SecretKey, message: &[u8]) -> Result<Signature, CryptoError> {
        let classical_sig = self.classical.sign(secret, message)?;
        Ok(HybridSignature::classical(self.classical.algorithm_id(), classical_sig).into())
    }

    fn verify(
        &self,
        public: &crate::PublicKey,
        message: &[u8],
        signature: &Signature,
    ) -> Result<(), CryptoError> {
        let hybrid: HybridSignature = signature.clone().into();
        self.classical.verify(public, message, &hybrid.classical)?;
        if let (Some(pq), Some(pq_sig)) = (&self.post_quantum, &hybrid.post_quantum) {
            pq.verify(public, message, pq_sig)?;
        }
        Ok(())
    }

    fn algorithm_id(&self) -> &'static str {
        "hybrid"
    }
}

impl From<HybridSignature> for Signature {
    fn from(h: HybridSignature) -> Self {
        // TODO: Replace with a real canonical hybrid signature encoding.
        Signature(serde_json::to_vec(&h).unwrap_or_default())
    }
}

impl From<Signature> for HybridSignature {
    fn from(s: Signature) -> Self {
        serde_json::from_slice(&s.0).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::classical::Ed25519Scheme;

    #[test]
    fn hybrid_classical_only_round_trip() {
        let scheme = HybridScheme::new(Box::new(Ed25519Scheme::new()), None);
        let keypair = scheme.generate_keypair().unwrap();
        let message = b"pemrix";
        let signature = scheme.sign(&keypair.secret, message).unwrap();
        scheme.verify(&keypair.public, message, &signature).unwrap();
    }
}
