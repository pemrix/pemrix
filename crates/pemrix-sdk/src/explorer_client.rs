//! Explorer client for querying blockchain data.

use crate::SdkError;
use pemrix_primitives::{Address, Hash};
use serde::{Deserialize, Serialize};

/// An explorer client.
#[derive(Clone, Debug)]
pub struct ExplorerClient {
    #[allow(dead_code)]
    base_url: String,
}

/// Explorer status.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExplorerStatus {
    /// Chain height.
    pub height: u64,
    /// Number of indexed transactions.
    pub transaction_count: usize,
    /// Number of indexed accounts.
    pub account_count: usize,
}

/// Account information.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExplorerAccount {
    /// Account address.
    pub address: Address,
    /// Account balance.
    pub balance: u128,
    /// Account nonce.
    pub nonce: u64,
}

impl ExplorerClient {
    /// Create a new explorer client.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
        }
    }

    /// Get explorer status.
    pub async fn status(&self) -> Result<ExplorerStatus, SdkError> {
        Ok(ExplorerStatus {
            height: 0,
            transaction_count: 0,
            account_count: 0,
        })
    }

    /// Get a block by height.
    pub async fn block_by_height(&self, _height: u64) -> Result<serde_json::Value, SdkError> {
        Ok(serde_json::Value::Null)
    }

    /// Get a transaction by hash.
    pub async fn transaction(&self, _hash: &Hash) -> Result<serde_json::Value, SdkError> {
        Ok(serde_json::Value::Null)
    }

    /// Get an account by address.
    pub async fn account(&self, _address: &Address) -> Result<ExplorerAccount, SdkError> {
        Err(SdkError::Rpc("mock explorer client".to_string()))
    }
}
