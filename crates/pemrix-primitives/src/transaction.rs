//! Transaction primitive for PEMRIX.

use crate::{Address, Balance, Nonce};

/// A PEMRIX transaction.
///
/// Transactions carry a sender public key and a signature. The public key is
/// required so that validators can verify the signature without maintaining a
/// reverse lookup from address to public key. The signature is computed over
/// the transaction body excluding the signature itself.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct Transaction {
    /// Sender address (derived from `public_key`).
    pub sender: Address,
    /// Recipient address.
    pub recipient: Address,
    /// Amount to transfer.
    pub amount: Balance,
    /// Sender nonce.
    pub nonce: Nonce,
    /// Transaction fee.
    pub fee: Balance,
    /// Sender public key used to verify the signature.
    pub public_key: Vec<u8>,
    /// Signature over the transaction hash.
    pub signature: Vec<u8>,
    /// Optional payload for smart contracts.
    pub payload: Vec<u8>,
}

impl Transaction {
    /// Create a simple unsigned transfer transaction.
    ///
    /// Use `TransactionBuilder::sign` or `Wallet::transfer` to produce a signed
    /// transaction that can be executed by the network.
    pub fn transfer(
        sender: Address,
        recipient: Address,
        amount: Balance,
        nonce: Nonce,
        fee: Balance,
    ) -> Self {
        Self {
            sender,
            recipient,
            amount,
            nonce,
            fee,
            public_key: Vec::new(),
            signature: Vec::new(),
            payload: Vec::new(),
        }
    }

    /// Return a copy of this transaction with the signature cleared.
    ///
    /// This is the form that is hashed and signed.
    fn unsigned(&self) -> Self {
        let mut unsigned = self.clone();
        unsigned.signature.clear();
        unsigned
    }

    /// Compute the canonical hash of the transaction.
    ///
    /// The signature field is excluded so that signing does not depend on the
    /// signature itself.
    pub fn hash(&self) -> crate::Hash {
        let bytes = crate::encoding::encode(&self.unsigned());
        crate::Hash::hash_bytes(&bytes)
    }

    /// Compute the hash that the signature must cover.
    pub fn signing_hash(&self) -> crate::Hash {
        self.hash()
    }
}
