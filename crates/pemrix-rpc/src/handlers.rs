//! RPC request handlers.

use crate::{
    BalanceResponse, BlockResponse, RpcError, SendTransactionRequest, TransactionResponse,
};
use async_trait::async_trait;
use pemrix_primitives::{Address, Hash};

/// Trait for RPC handlers.
#[async_trait]
pub trait RpcHandler: Send + Sync {
    /// Get the balance of an address.
    async fn get_balance(&self, address: Address) -> Result<BalanceResponse, RpcError>;

    /// Get a block by hash or height.
    async fn get_block(&self, hash_or_height: HashOrHeight) -> Result<BlockResponse, RpcError>;

    /// Get a transaction by hash.
    async fn get_transaction(&self, hash: Hash) -> Result<TransactionResponse, RpcError>;

    /// Submit a transaction to the network.
    async fn send_transaction(
        &self,
        request: SendTransactionRequest,
    ) -> Result<TransactionResponse, RpcError>;
}

/// Either a block hash or a block height.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HashOrHeight {
    /// Query by hash.
    Hash(Hash),
    /// Query by height.
    Height(u64),
}

/// Simple in-memory RPC handler for testing.
pub struct SimpleRpcHandler {
    balance: u128,
}

impl SimpleRpcHandler {
    /// Create a new simple handler.
    pub fn new(balance: u128) -> Self {
        Self { balance }
    }
}

#[async_trait]
impl RpcHandler for SimpleRpcHandler {
    async fn get_balance(&self, address: Address) -> Result<BalanceResponse, RpcError> {
        Ok(BalanceResponse {
            address,
            balance: self.balance,
        })
    }

    async fn get_block(&self, _hash_or_height: HashOrHeight) -> Result<BlockResponse, RpcError> {
        Err(RpcError::BlockNotFound)
    }

    async fn get_transaction(&self, _hash: Hash) -> Result<TransactionResponse, RpcError> {
        Err(RpcError::TransactionNotFound)
    }

    async fn send_transaction(
        &self,
        request: SendTransactionRequest,
    ) -> Result<TransactionResponse, RpcError> {
        Ok(TransactionResponse {
            hash: request.transaction.hash(),
            status: "pending".to_string(),
            payload: serde_json::Value::Null,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn simple_handler_balance() {
        let handler = SimpleRpcHandler::new(1_000);
        let balance = handler.get_balance(Address::default()).await.unwrap();
        assert_eq!(balance.balance, 1_000);
    }
}
