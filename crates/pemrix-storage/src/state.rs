//! High-level state store.

use crate::{InMemoryBackend, StateBackend, StorageError};
use pemrix_primitives::{Account, Address, Balance, Hash, Nonce};

/// A state store wraps a backend and provides account operations.
pub struct StateStore<B: StateBackend> {
    backend: B,
}

impl StateStore<InMemoryBackend> {
    /// Create a new in-memory state store.
    pub fn new_in_memory() -> Self {
        Self {
            backend: InMemoryBackend::new(),
        }
    }
}

impl<B: StateBackend> StateStore<B> {
    /// Create a state store from an existing backend.
    pub fn new(backend: B) -> Self {
        Self { backend }
    }

    /// Get an account balance.
    pub fn balance(&self, address: &Address) -> Result<Balance, StorageError> {
        self.backend
            .get_account(address)
            .map(|opt| opt.map_or(0, |a| a.balance))
    }

    /// Get an account nonce.
    pub fn nonce(&self, address: &Address) -> Result<Nonce, StorageError> {
        self.backend
            .get_account(address)
            .map(|opt| opt.map_or(0, |a| a.nonce))
    }

    /// Set an account.
    pub fn set_account(&mut self, address: &Address, account: Account) -> Result<(), StorageError> {
        self.backend.put_account(address, &account)
    }

    /// Get the state root.
    pub fn state_root(&self) -> Result<Hash, StorageError> {
        self.backend.state_root()
    }

    /// Apply a transfer between two accounts.
    pub fn transfer(
        &mut self,
        from: &Address,
        to: &Address,
        amount: Balance,
        fee: Balance,
    ) -> Result<(), StorageError> {
        let mut sender = self
            .backend
            .get_account(from)?
            .ok_or(StorageError::NotFound)?;
        let total = amount
            .checked_add(fee)
            .ok_or(StorageError::Backend("balance overflow".to_string()))?;
        if sender.balance < total {
            return Err(StorageError::Backend("insufficient balance".to_string()));
        }
        sender.balance -= total;
        sender.nonce += 1;
        self.backend.put_account(from, &sender)?;

        let mut recipient = self.backend.get_account(to)?.unwrap_or_default();
        recipient.balance = recipient
            .balance
            .checked_add(amount)
            .ok_or(StorageError::Backend("balance overflow".to_string()))?;
        self.backend.put_account(to, &recipient)?;

        Ok(())
    }
}

/// Type alias for a state root.
pub type StateRoot = Hash;

/// Type alias for account state.
pub type AccountState = Account;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transfer_updates_balances() {
        let mut store = StateStore::new_in_memory();
        let alice = Address::default();
        let bob = Address::from_public_key_hash(Hash::hash_bytes(b"bob"));
        store.set_account(&alice, Account::new(1_000, 0)).unwrap();
        store.transfer(&alice, &bob, 100, 1).unwrap();
        assert_eq!(store.balance(&alice).unwrap(), 899);
        assert_eq!(store.balance(&bob).unwrap(), 100);
    }
}
