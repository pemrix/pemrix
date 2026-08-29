//! SDK client abstractions.

use crate::SdkError;
use async_trait::async_trait;
use pemrix_primitives::{Address, Balance, Block, Hash, Nonce, Transaction};
use pemrix_rpc::{BalanceResponse, NonceResponse, SendTransactionRequest, TransactionResponse};

/// A client for interacting with the PEMRIX network.
#[async_trait]
pub trait Client: Send + Sync {
    /// Get the balance of an address.
    async fn balance(&self, address: &Address) -> Result<Balance, SdkError>;

    /// Get the nonce of an address.
    async fn nonce(&self, address: &Address) -> Result<Nonce, SdkError>;

    /// Get a block by height.
    async fn block_by_height(&self, height: u64) -> Result<Block, SdkError>;

    /// Get a transaction by hash.
    async fn transaction(&self, hash: &Hash) -> Result<Option<Transaction>, SdkError>;

    /// Submit a signed transaction.
    async fn send_transaction(&self, transaction: &Transaction) -> Result<Hash, SdkError>;
}

/// A local in-memory client for testing.
pub struct LocalClient {
    balance: Balance,
}

impl LocalClient {
    /// Create a new local client with the given balance.
    pub const fn new(balance: Balance) -> Self {
        Self { balance }
    }
}

#[async_trait]
impl Client for LocalClient {
    async fn balance(&self, _address: &Address) -> Result<Balance, SdkError> {
        Ok(self.balance)
    }

    async fn nonce(&self, _address: &Address) -> Result<Nonce, SdkError> {
        Ok(0)
    }

    async fn block_by_height(&self, _height: u64) -> Result<Block, SdkError> {
        Ok(Block::default())
    }

    async fn transaction(&self, _hash: &Hash) -> Result<Option<Transaction>, SdkError> {
        Ok(None)
    }

    async fn send_transaction(&self, transaction: &Transaction) -> Result<Hash, SdkError> {
        Ok(transaction.hash())
    }
}

/// An HTTP client that talks to a PEMRIX RPC server.
#[derive(Clone, Debug)]
pub struct HttpClient {
    base_url: String,
    client: reqwest::Client,
}

impl HttpClient {
    /// Create a new HTTP client pointing at the given RPC base URL.
    ///
    /// The URL should be the root of the RPC server, e.g. `http://127.0.0.1:61001`.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into().trim_end_matches('/').to_string(),
            client: reqwest::Client::new(),
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base_url, path)
    }
}

#[async_trait]
impl Client for HttpClient {
    async fn balance(&self, address: &Address) -> Result<Balance, SdkError> {
        let response: BalanceResponse = self
            .client
            .get(self.url(&format!("/v1/accounts/{}/balance", address)))
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?
            .json()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;
        Ok(response.balance)
    }

    async fn nonce(&self, address: &Address) -> Result<Nonce, SdkError> {
        let response: NonceResponse = self
            .client
            .get(self.url(&format!("/v1/accounts/{}/nonce", address)))
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?
            .json()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;
        Ok(response.nonce)
    }

    async fn block_by_height(&self, height: u64) -> Result<Block, SdkError> {
        let response = self
            .client
            .get(self.url(&format!("/v1/blocks/{}", height)))
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;

        if response.status().is_success() {
            let body = response
                .json::<pemrix_rpc::BlockResponse>()
                .await
                .map_err(|e| SdkError::Rpc(e.to_string()))?;
            serde_json::from_value(body.payload).map_err(|e| SdkError::Rpc(e.to_string()))
        } else {
            Err(SdkError::Rpc(format!(
                "block not found or server error: {}",
                response.status()
            )))
        }
    }

    async fn transaction(&self, hash: &Hash) -> Result<Option<Transaction>, SdkError> {
        let response = self
            .client
            .get(self.url(&format!("/v1/transactions/{}", hash)))
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;

        if response.status().is_success() {
            let body: TransactionResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Rpc(e.to_string()))?;
            serde_json::from_value(body.payload)
                .map_err(|e| SdkError::Rpc(e.to_string()))
                .map(Some)
        } else if response.status() == reqwest::StatusCode::NOT_FOUND {
            Ok(None)
        } else {
            Err(SdkError::Rpc(format!(
                "transaction query failed: {}",
                response.status()
            )))
        }
    }

    async fn send_transaction(&self, transaction: &Transaction) -> Result<Hash, SdkError> {
        let response: TransactionResponse = self
            .client
            .post(self.url("/v1/transactions"))
            .json(&SendTransactionRequest {
                transaction: transaction.clone(),
            })
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?
            .json()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;
        Ok(response.hash)
    }
}

/// A gRPC client placeholder.
#[derive(Default)]
pub struct GrpcClient;

impl GrpcClient {
    /// Create a new gRPC client.
    pub const fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Client for GrpcClient {
    async fn balance(&self, _address: &Address) -> Result<Balance, SdkError> {
        Err(SdkError::Rpc("gRPC client not implemented".to_string()))
    }

    async fn nonce(&self, _address: &Address) -> Result<Nonce, SdkError> {
        Err(SdkError::Rpc("gRPC client not implemented".to_string()))
    }

    async fn block_by_height(&self, _height: u64) -> Result<Block, SdkError> {
        Err(SdkError::Rpc("gRPC client not implemented".to_string()))
    }

    async fn transaction(&self, _hash: &Hash) -> Result<Option<Transaction>, SdkError> {
        Err(SdkError::Rpc("gRPC client not implemented".to_string()))
    }

    async fn send_transaction(&self, _transaction: &Transaction) -> Result<Hash, SdkError> {
        Err(SdkError::Rpc("gRPC client not implemented".to_string()))
    }
}
