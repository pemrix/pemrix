//! Storage backend abstraction.

use crate::StorageError;
use pemrix_primitives::{Account, Address, Hash};

/// A storage backend for account state.
pub trait StateBackend: Send + Sync {
    /// Get an account by address.
    fn get_account(&self, address: &Address) -> Result<Option<Account>, StorageError>;

    /// Put an account.
    fn put_account(&mut self, address: &Address, account: &Account) -> Result<(), StorageError>;

    /// Delete an account.
    fn delete_account(&mut self, address: &Address) -> Result<(), StorageError>;

    /// Compute the state root.
    fn state_root(&self) -> Result<Hash, StorageError>;
}

/// In-memory backend for testing and development.
#[derive(Clone, Debug, Default)]
pub struct InMemoryBackend {
    accounts: std::collections::BTreeMap<Address, Account>,
}

impl InMemoryBackend {
    /// Create a new empty in-memory backend.
    pub fn new() -> Self {
        Self::default()
    }
}

impl StateBackend for InMemoryBackend {
    fn get_account(&self, address: &Address) -> Result<Option<Account>, StorageError> {
        Ok(self.accounts.get(address).copied())
    }

    fn put_account(&mut self, address: &Address, account: &Account) -> Result<(), StorageError> {
        self.accounts.insert(*address, *account);
        Ok(())
    }

    fn delete_account(&mut self, address: &Address) -> Result<(), StorageError> {
        self.accounts.remove(address);
        Ok(())
    }

    fn state_root(&self) -> Result<Hash, StorageError> {
        let bytes = pemrix_primitives::encoding::encode(&self.accounts);
        Ok(Hash::hash_bytes(&bytes))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn in_memory_state_root_is_deterministic() {
        let mut backend = InMemoryBackend::new();
        let addr = Address::default();
        backend.put_account(&addr, &Account::new(100, 0)).unwrap();
        let root1 = backend.state_root().unwrap();
        let root2 = backend.state_root().unwrap();
        assert_eq!(root1, root2);
    }
}
