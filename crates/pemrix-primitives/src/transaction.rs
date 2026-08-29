//! Transaction primitive for PEMRIX.

use crate::{Address, Balance, Nonce};

/// A signed or unsigned transaction.
#[derive(Clone, Debug, PartialEq, Eq, Default, serde::Serialize, serde::Deserialize)]
pub struct Transaction {
    /// Sender address.
    pub sender: Address,
    /// Recipient address.
    pub recipient: Address,
    /// Amount to transfer.
    pub amount: Balance,
    /// Sender nonce.
    pub nonce: Nonce,
    /// Transaction fee.
    pub fee: Balance,
    /// Optional payload for smart contracts.
    pub payload: Vec<u8>,
}

impl Transaction {
    /// Create a simple transfer transaction.
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
            payload: Vec::new(),
        }
    }

    /// Compute the canonical hash of the transaction.
    pub fn hash(&self) -> crate::Hash {
        let bytes = crate::encoding::encode(self);
        crate::Hash::hash_bytes(&bytes)
    }
}
