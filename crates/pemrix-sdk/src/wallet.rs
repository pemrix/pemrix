//! Simple wallet abstraction.

use crate::{SdkError, TransactionBuilder};
use pemrix_crypto::{Ed25519Scheme, KeyPair, SignatureScheme};
use pemrix_primitives::{Address, Balance, Nonce, Transaction};

/// A simple software wallet.
pub struct Wallet {
    keypair: KeyPair,
    address: Address,
}

impl Wallet {
    /// Create a new random wallet.
    pub fn generate() -> Result<Self, SdkError> {
        let scheme = Ed25519Scheme::new();
        let keypair = scheme.generate_keypair().map_err(|_| SdkError::Signing)?;
        let address =
            Address::from_public_key_hash(pemrix_primitives::Hash::hash_bytes(&keypair.public.0));
        Ok(Self { keypair, address })
    }

    /// Return the wallet address.
    pub fn address(&self) -> Address {
        self.address
    }

    /// Create a signed transfer transaction.
    pub fn transfer(
        &self,
        recipient: Address,
        amount: Balance,
        nonce: Nonce,
        fee: Balance,
    ) -> Transaction {
        TransactionBuilder::new()
            .sender(self.address)
            .recipient(recipient)
            .amount(amount)
            .nonce(nonce)
            .fee(fee)
            .sign(&self.keypair)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wallet_generates_address() {
        let wallet = Wallet::generate().unwrap();
        assert_ne!(wallet.address(), Address::default());
    }
}
