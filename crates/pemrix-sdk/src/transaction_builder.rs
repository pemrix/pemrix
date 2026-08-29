//! Transaction builder helper.

use pemrix_crypto::{Ed25519Scheme, KeyPair, SignatureScheme};
use pemrix_primitives::{Address, Balance, Nonce, Transaction};

/// Builder for PEMRIX transactions.
#[derive(Clone, Debug, Default)]
pub struct TransactionBuilder {
    sender: Address,
    recipient: Address,
    amount: Balance,
    nonce: Nonce,
    fee: Balance,
    payload: Vec<u8>,
}

impl TransactionBuilder {
    /// Create a new transaction builder.
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the sender.
    pub fn sender(mut self, sender: Address) -> Self {
        self.sender = sender;
        self
    }

    /// Set the recipient.
    pub fn recipient(mut self, recipient: Address) -> Self {
        self.recipient = recipient;
        self
    }

    /// Set the amount.
    pub fn amount(mut self, amount: Balance) -> Self {
        self.amount = amount;
        self
    }

    /// Set the nonce.
    pub fn nonce(mut self, nonce: Nonce) -> Self {
        self.nonce = nonce;
        self
    }

    /// Set the fee.
    pub fn fee(mut self, fee: Balance) -> Self {
        self.fee = fee;
        self
    }

    /// Set the payload.
    pub fn payload(mut self, payload: Vec<u8>) -> Self {
        self.payload = payload;
        self
    }

    /// Build the unsigned transaction.
    pub fn build(self) -> Transaction {
        Transaction {
            sender: self.sender,
            recipient: self.recipient,
            amount: self.amount,
            nonce: self.nonce,
            fee: self.fee,
            public_key: Vec::new(),
            signature: Vec::new(),
            payload: self.payload,
        }
    }

    /// Build and sign the transaction.
    pub fn sign(self, keypair: &KeyPair) -> Transaction {
        let mut tx = self.build();
        let scheme = Ed25519Scheme::new();
        tx.public_key = keypair.public.0.clone();
        let signature = scheme
            .sign(&keypair.secret, tx.signing_hash().as_bytes())
            .expect("signing should succeed");
        tx.signature = signature.0;
        tx
    }
}
