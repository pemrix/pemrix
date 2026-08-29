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

/// RocksDB-backed persistent storage backend.
///
/// Enabled by the `rocksdb` crate feature. This is the production target for
/// validator nodes. Data survives restarts and is stored in a directory on disk.
#[cfg(feature = "rocksdb")]
pub struct RocksDbBackend {
    db: rocksdb::DB,
}

#[cfg(feature = "rocksdb")]
impl RocksDbBackend {
    /// Key prefix used for account records.
    const ACCOUNT_PREFIX: &[u8] = b"acc:";

    /// Open a RocksDB backend at the given directory, creating it if needed.
    pub fn open<P: AsRef<std::path::Path>>(path: P) -> Result<Self, StorageError> {
        let mut opts = rocksdb::Options::default();
        opts.create_if_missing(true);
        let db = rocksdb::DB::open(&opts, path)
            .map_err(|e| StorageError::Backend(format!("failed to open rocksdb: {e}")))?;
        Ok(Self { db })
    }

    /// Build the database key for an account address.
    fn account_key(address: &Address) -> Vec<u8> {
        let mut key = Self::ACCOUNT_PREFIX.to_vec();
        key.extend_from_slice(address.as_bytes());
        key
    }
}

#[cfg(feature = "rocksdb")]
impl StateBackend for RocksDbBackend {
    fn get_account(&self, address: &Address) -> Result<Option<Account>, StorageError> {
        match self.db.get(Self::account_key(address)) {
            Ok(Some(bytes)) => {
                let account = pemrix_primitives::encoding::decode(&bytes)
                    .map_err(|_| StorageError::Serialization)?;
                Ok(Some(account))
            }
            Ok(None) => Ok(None),
            Err(e) => Err(StorageError::Backend(format!("rocksdb get error: {e}"))),
        }
    }

    fn put_account(&mut self, address: &Address, account: &Account) -> Result<(), StorageError> {
        let bytes = pemrix_primitives::encoding::encode(account);
        self.db
            .put(Self::account_key(address), bytes)
            .map_err(|e| StorageError::Backend(format!("rocksdb put error: {e}")))
    }

    fn delete_account(&mut self, address: &Address) -> Result<(), StorageError> {
        self.db
            .delete(Self::account_key(address))
            .map_err(|e| StorageError::Backend(format!("rocksdb delete error: {e}")))
    }

    fn state_root(&self) -> Result<Hash, StorageError> {
        // Collect all accounts into a BTreeMap so the root is deterministic.
        // TODO: For mainnet scale this should be replaced by an incremental
        // Merkle/Patricia trie. Loading the entire state into memory works for
        // testnet and early mainnet only.
        let mut accounts = std::collections::BTreeMap::new();
        let iter = self.db.iterator(rocksdb::IteratorMode::Start);
        for item in iter {
            let (key, value) =
                item.map_err(|e| StorageError::Backend(format!("rocksdb iterator error: {e}")))?;
            if key.starts_with(Self::ACCOUNT_PREFIX) {
                let address_bytes: [u8; 32] = key[Self::ACCOUNT_PREFIX.len()..]
                    .try_into()
                    .map_err(|_| StorageError::Backend("invalid address key".to_string()))?;
                let account: Account = pemrix_primitives::encoding::decode(&value)
                    .map_err(|_| StorageError::Serialization)?;
                accounts.insert(Address(address_bytes), account);
            }
        }
        let bytes = pemrix_primitives::encoding::encode(&accounts);
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

    #[test]
    #[cfg(feature = "rocksdb")]
    fn rocksdb_backend_round_trip() {
        let dir = tempfile::tempdir().unwrap();
        let mut backend = RocksDbBackend::open(dir.path()).unwrap();
        let addr = Address::default();
        backend.put_account(&addr, &Account::new(100, 7)).unwrap();
        let account = backend.get_account(&addr).unwrap().unwrap();
        assert_eq!(account.balance, 100);
        assert_eq!(account.nonce, 7);
    }

    #[test]
    #[cfg(feature = "rocksdb")]
    fn rocksdb_backend_state_root_is_deterministic() {
        let dir = tempfile::tempdir().unwrap();
        let mut backend = RocksDbBackend::open(dir.path()).unwrap();
        let addr = Address::default();
        backend.put_account(&addr, &Account::new(100, 0)).unwrap();
        let root1 = backend.state_root().unwrap();
        let root2 = backend.state_root().unwrap();
        assert_eq!(root1, root2);
    }

    #[test]
    #[cfg(feature = "rocksdb")]
    fn rocksdb_backend_survives_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().to_path_buf();
        {
            let mut backend = RocksDbBackend::open(&path).unwrap();
            backend
                .put_account(&Address::default(), &Account::new(999, 1))
                .unwrap();
        }
        {
            let backend = RocksDbBackend::open(&path).unwrap();
            let account = backend.get_account(&Address::default()).unwrap().unwrap();
            assert_eq!(account.balance, 999);
            assert_eq!(account.nonce, 1);
        }
    }
}
