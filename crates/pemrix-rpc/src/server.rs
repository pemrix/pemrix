//! HTTP REST RPC server.

use crate::{
    BalanceResponse, BlockResponse, NonceResponse, RpcError, SendTransactionRequest,
    TransactionResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use pemrix_primitives::{Account, Address, Block, Hash, Transaction};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::info;

/// Shared RPC state.
#[derive(Clone, Default, Debug)]
pub struct RpcState {
    inner: Arc<Mutex<RpcStateInner>>,
}

#[derive(Default, Debug)]
struct RpcStateInner {
    accounts: HashMap<Address, Account>,
    blocks: HashMap<u64, Block>,
    blocks_by_hash: HashMap<Hash, Block>,
    transactions: HashMap<Hash, Transaction>,
    pending: Vec<Transaction>,
    height: u64,
}

impl RpcState {
    /// Create a new empty RPC state.
    pub fn new() -> Self {
        Self::default()
    }

    /// Set an account.
    pub async fn set_account(&self, address: Address, account: Account) {
        self.inner.lock().await.accounts.insert(address, account);
    }

    /// Get an account.
    pub async fn get_account(&self, address: &Address) -> Option<Account> {
        self.inner.lock().await.accounts.get(address).copied()
    }

    /// Store a block.
    pub async fn store_block(&self, block: Block) {
        let hash = block.hash();
        let height = block.header.height;
        let mut inner = self.inner.lock().await;
        inner.blocks.insert(height, block.clone());
        inner.blocks_by_hash.insert(hash, block);

        if height > inner.height {
            inner.height = height;
        }
    }

    /// Get a block by height.
    pub async fn get_block_by_height(&self, height: u64) -> Option<Block> {
        self.inner.lock().await.blocks.get(&height).cloned()
    }

    /// Get a block by hash.
    pub async fn get_block_by_hash(&self, hash: &Hash) -> Option<Block> {
        self.inner.lock().await.blocks_by_hash.get(hash).cloned()
    }

    /// Store a transaction.
    pub async fn store_transaction(&self, hash: Hash, transaction: Transaction) {
        self.inner
            .lock()
            .await
            .transactions
            .insert(hash, transaction);
    }

    /// Get a transaction by hash.
    pub async fn get_transaction(&self, hash: &Hash) -> Option<Transaction> {
        self.inner.lock().await.transactions.get(hash).cloned()
    }

    /// Submit a pending transaction.
    pub async fn submit_transaction(&self, transaction: Transaction) {
        self.inner.lock().await.pending.push(transaction);
    }

    /// Get pending transactions.
    pub async fn pending_transactions(&self) -> Vec<Transaction> {
        self.inner.lock().await.pending.clone()
    }

    /// Get current chain height.
    pub async fn height(&self) -> u64 {
        self.inner.lock().await.height
    }
}

/// RPC server.
#[derive(Clone, Debug)]
pub struct RpcServer {
    state: RpcState,
    listen: String,
}

impl RpcServer {
    /// Create a new RPC server.
    pub fn new(listen: impl Into<String>) -> Self {
        Self::new_with_state(listen, RpcState::new())
    }

    /// Create a new RPC server backed by an existing shared state.
    pub fn new_with_state(listen: impl Into<String>, state: RpcState) -> Self {
        Self {
            state,
            listen: listen.into(),
        }
    }

    /// Access the server state.
    pub fn state(&self) -> &RpcState {
        &self.state
    }

    /// Build the axum router.
    pub fn router(&self) -> Router {
        Router::new()
            .route("/v1/status", get(status_handler))
            .route("/v1/blocks/:height", get(block_by_height_handler))
            .route("/v1/blocks/hash/:hash", get(block_by_hash_handler))
            .route("/v1/transactions/:hash", get(transaction_handler))
            .route("/v1/accounts/:address/balance", get(balance_handler))
            .route("/v1/accounts/:address/nonce", get(nonce_handler))
            .route("/v1/transactions", post(send_transaction_handler))
            .with_state(self.state.clone())
    }

    /// Start the server and block until shutdown.
    pub async fn start(&self) -> Result<(), &'static str> {
        let addr: SocketAddr = self.listen.parse().map_err(|_| "invalid listen address")?;
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .map_err(|_| "failed to bind")?;
        info!("RPC server listening on {}", addr);
        axum::serve(listener, self.router())
            .await
            .map_err(|_| "server error")?;
        Ok(())
    }
}

async fn status_handler(State(state): State<RpcState>) -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "height": state.height().await,
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

async fn block_by_height_handler(
    State(state): State<RpcState>,
    Path(height): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    state
        .get_block_by_height(height)
        .await
        .map(|block| {
            Json(BlockResponse {
                hash: block.hash(),
                height,
                payload: serde_json::to_value(&block).unwrap_or_default(),
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

async fn block_by_hash_handler(
    State(state): State<RpcState>,
    Path(hash): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let hash = Hash::from_str(&hash).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .get_block_by_hash(&hash)
        .await
        .map(|block| {
            Json(BlockResponse {
                hash,
                height: block.header.height,
                payload: serde_json::to_value(&block).unwrap_or_default(),
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

async fn transaction_handler(
    State(state): State<RpcState>,
    Path(hash): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let hash = Hash::from_str(&hash).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .get_transaction(&hash)
        .await
        .map(|tx| {
            Json(TransactionResponse {
                hash,
                status: "confirmed".to_string(),
                payload: serde_json::to_value(&tx).unwrap_or_default(),
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

async fn balance_handler(
    State(state): State<RpcState>,
    Path(address): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let address = Address::from_str(&address).map_err(|_| StatusCode::BAD_REQUEST)?;
    let balance = state.get_account(&address).await.map_or(0, |a| a.balance);
    Ok(Json(BalanceResponse { address, balance }))
}

async fn nonce_handler(
    State(state): State<RpcState>,
    Path(address): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let address = Address::from_str(&address).map_err(|_| StatusCode::BAD_REQUEST)?;
    let nonce = state.get_account(&address).await.map_or(0, |a| a.nonce);
    Ok(Json(NonceResponse { address, nonce }))
}

async fn send_transaction_handler(
    State(state): State<RpcState>,
    Json(request): Json<SendTransactionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let tx = request.transaction;
    let hash = tx.hash();
    state.store_transaction(hash, tx.clone()).await;
    state.submit_transaction(tx).await;
    Ok(Json(TransactionResponse {
        hash,
        status: "pending".to_string(),
        payload: serde_json::Value::Null,
    }))
}

impl From<RpcError> for StatusCode {
    fn from(_err: RpcError) -> Self {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn status_endpoint() {
        let server = RpcServer::new("127.0.0.1:0");
        let app = server.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/status")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
