//! Storage backend abstraction.

use crate::StorageError;
use pemrix_primitives::{Account, Address, Hash};

/// A raw key-value pair returned by prefix iteration.
pub type RawEntry = (Vec<u8>, Vec<u8>);

/// A storage backend for account state and arbitrary protocol records.
pub trait StateBackend: Send + Sync {
    /// Get an account by address.
    fn get_account(&self, address: &Address) -> Result<Option<Account>, StorageError>;

    /// Put an account.
    fn put_account(&mut self, address: &Address, account: &Account) -> Result<(), StorageError>;

    /// Delete an account.
    fn delete_account(&mut self, address: &Address) -> Result<(), StorageError>;

    /// Get a raw value by key.
    fn get_raw(&self, key: &[u8]) -> Result<Option<Vec<u8>>, StorageError>;

    /// Put a raw key-value pair.
    fn put_raw(&mut self, key: &[u8], value: &[u8]) -> Result<(), StorageError>;

    /// Delete a raw key.
    fn delete_raw(&mut self, key: &[u8]) -> Result<(), StorageError>;

    /// Iterate over raw key-value pairs matching the given prefix.
    fn iter_raw_prefix(&self, prefix: &[u8]) -> Result<Vec<RawEntry>, StorageError>;

    /// Compute the state root.
    fn state_root(&self) -> Result<Hash, StorageError>;
}

/// In-memory backend for testing and development.
#[derive(Clone, Debug, Default)]
pub struct InMemoryBackend {
    accounts: std::collections::BTreeMap<Address, Account>,
    raw: std::collections::BTreeMap<Vec<u8>, Vec<u8>>,
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

    fn get_raw(&self, key: &[u8]) -> Result<Option<Vec<u8>>, StorageError> {
        Ok(self.raw.get(key).cloned())
    }

    fn put_raw(&mut self, key: &[u8], value: &[u8]) -> Result<(), StorageError> {
        self.raw.insert(key.to_vec(), value.to_vec());
        Ok(())
    }

    fn delete_raw(&mut self, key: &[u8]) -> Result<(), StorageError> {
        self.raw.remove(key);
        Ok(())
    }

    fn iter_raw_prefix(&self, prefix: &[u8]) -> Result<Vec<RawEntry>, StorageError> {
        let prefix = prefix.to_vec();
        let entries: Vec<RawEntry> = self
            .raw
            .range(prefix.clone()..)
            .take_while(|(k, _)| k.starts_with(&prefix))
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect();
        Ok(entries)
    }

    fn state_root(&self) -> Result<Hash, StorageError> {
        let mut snapshot = std::collections::BTreeMap::new();
        for (addr, account) in &self.accounts {
            let mut key = b"acc:".to_vec();
            key.extend_from_slice(addr.as_bytes());
            snapshot.insert(
                hex::encode(&key),
                pemrix_primitives::encoding::encode(account),
            );
        }
        for (key, value) in &self.raw {
            snapshot.insert(hex::encode(key), value.clone());
        }
        let bytes = pemrix_primitives::encoding::encode(&snapshot);
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

    fn get_raw(&self, key: &[u8]) -> Result<Option<Vec<u8>>, StorageError> {
        match self.db.get(key) {
            Ok(Some(bytes)) => Ok(Some(bytes)),
            Ok(None) => Ok(None),
            Err(e) => Err(StorageError::Backend(format!("rocksdb get error: {e}"))),
        }
    }

    fn put_raw(&mut self, key: &[u8], value: &[u8]) -> Result<(), StorageError> {
        self.db
            .put(key, value)
            .map_err(|e| StorageError::Backend(format!("rocksdb put error: {e}")))
    }

    fn delete_raw(&mut self, key: &[u8]) -> Result<(), StorageError> {
        self.db
            .delete(key)
            .map_err(|e| StorageError::Backend(format!("rocksdb delete error: {e}")))
    }

    fn iter_raw_prefix(&self, prefix: &[u8]) -> Result<Vec<RawEntry>, StorageError> {
        let mut entries = Vec::new();
        let iter = self.db.prefix_iterator(prefix);
        for item in iter {
            let (key, value) =
                item.map_err(|e| StorageError::Backend(format!("rocksdb iterator error: {e}")))?;
            entries.push((key.to_vec(), value.to_vec()));
        }
        Ok(entries)
    }

    fn state_root(&self) -> Result<Hash, StorageError> {
        // Collect all key-value entries into a BTreeMap so the root is deterministic.
        // Keys are hex-encoded because the placeholder encoder requires string map keys.
        // TODO: For mainnet scale this should be replaced by an incremental
        // Merkle/Patricia trie. Loading the entire state into memory works for
        // testnet and early mainnet only.
        let mut snapshot = std::collections::BTreeMap::new();
        let iter = self.db.iterator(rocksdb::IteratorMode::Start);
        for item in iter {
            let (key, value) =
                item.map_err(|e| StorageError::Backend(format!("rocksdb iterator error: {e}")))?;
            snapshot.insert(hex::encode(&key), value.to_vec());
        }
        let bytes = pemrix_primitives::encoding::encode(&snapshot);
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
    fn in_memory_raw_key_round_trip() {
        let mut backend = InMemoryBackend::new();
        backend.put_raw(b"val:test", b"record").unwrap();
        assert_eq!(
            backend.get_raw(b"val:test").unwrap().as_deref(),
            Some("record".as_bytes())
        );
        backend.delete_raw(b"val:test").unwrap();
        assert!(backend.get_raw(b"val:test").unwrap().is_none());
    }

    #[test]
    fn in_memory_raw_keys_affect_state_root() {
        let mut backend = InMemoryBackend::new();
        let root1 = backend.state_root().unwrap();
        backend.put_raw(b"val:test", b"record").unwrap();
        let root2 = backend.state_root().unwrap();
        assert_ne!(root1, root2);
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
