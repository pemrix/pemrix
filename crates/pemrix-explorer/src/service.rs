//! Explorer API service implementation.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use pemrix_primitives::{Account, Address, Block, Hash, Transaction};
use serde::Serialize;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::info;

/// Explorer response models.
#[derive(Clone, Debug, Serialize)]
pub struct ExplorerStatus {
    /// Chain height.
    pub height: u64,
    /// Number of indexed transactions.
    pub transaction_count: usize,
    /// Number of indexed accounts.
    pub account_count: usize,
}

/// Account information returned by the explorer.
#[derive(Clone, Debug, Serialize)]
pub struct AccountInfo {
    /// Account address.
    pub address: Address,
    /// Account balance.
    pub balance: u128,
    /// Account nonce.
    pub nonce: u64,
}

/// Shared explorer state.
#[derive(Clone, Default, Debug)]
pub struct ExplorerState {
    inner: Arc<Mutex<ExplorerStateInner>>,
}

#[derive(Default, Debug)]
struct ExplorerStateInner {
    blocks: HashMap<u64, Block>,
    blocks_by_hash: HashMap<Hash, u64>,
    transactions: HashMap<Hash, (u64, Transaction)>,
    accounts: HashMap<Address, Account>,
}

impl ExplorerState {
    /// Create a new empty explorer state.
    pub fn new() -> Self {
        Self::default()
    }

    /// Ingest a block and its transactions into the explorer index.
    pub async fn ingest_block(&self, block: Block) {
        let height = block.header.height;
        let hash = block.hash();
        let mut inner = self.inner.lock().await;
        inner.blocks.insert(height, block.clone());
        inner.blocks_by_hash.insert(hash, height);
        for tx in &block.body.transactions {
            inner.transactions.insert(tx.hash(), (height, tx.clone()));
        }
    }

    /// Ingest or update an account.
    pub async fn ingest_account(&self, address: Address, account: Account) {
        self.inner.lock().await.accounts.insert(address, account);
    }

    /// Get the current status.
    pub async fn status(&self) -> ExplorerStatus {
        let inner = self.inner.lock().await;
        ExplorerStatus {
            height: inner.blocks.keys().copied().max().unwrap_or(0),
            transaction_count: inner.transactions.len(),
            account_count: inner.accounts.len(),
        }
    }

    /// Get a block by height.
    pub async fn block_by_height(&self, height: u64) -> Option<Block> {
        self.inner.lock().await.blocks.get(&height).cloned()
    }

    /// Get a block by hash.
    pub async fn block_by_hash(&self, hash: &Hash) -> Option<Block> {
        let inner = self.inner.lock().await;
        inner
            .blocks_by_hash
            .get(hash)
            .and_then(|h| inner.blocks.get(h).cloned())
    }

    /// Get a transaction by hash.
    pub async fn transaction(&self, hash: &Hash) -> Option<(u64, Transaction)> {
        self.inner.lock().await.transactions.get(hash).cloned()
    }

    /// Get an account by address.
    pub async fn account(&self, address: &Address) -> Option<Account> {
        self.inner.lock().await.accounts.get(address).copied()
    }

    /// List recent blocks.
    pub async fn recent_blocks(&self, limit: usize) -> Vec<Block> {
        let inner = self.inner.lock().await;
        let mut heights: Vec<u64> = inner.blocks.keys().copied().collect();
        heights.sort_unstable_by(|a, b| b.cmp(a));
        heights
            .into_iter()
            .take(limit)
            .filter_map(|h| inner.blocks.get(&h).cloned())
            .collect()
    }
}

/// Explorer HTTP service.
#[derive(Clone, Debug)]
pub struct ExplorerService {
    state: ExplorerState,
    listen: String,
}

impl ExplorerService {
    /// Create a new explorer service.
    pub fn new(listen: impl Into<String>) -> Self {
        Self {
            state: ExplorerState::new(),
            listen: listen.into(),
        }
    }

    /// Access the explorer state.
    pub fn state(&self) -> &ExplorerState {
        &self.state
    }

    /// Build the axum router.
    pub fn router(&self) -> Router {
        Router::new()
            .route("/explorer/status", get(status_handler))
            .route("/explorer/blocks", get(blocks_handler))
            .route("/explorer/blocks/:height", get(block_by_height_handler))
            .route("/explorer/blocks/hash/:hash", get(block_by_hash_handler))
            .route("/explorer/transactions/:hash", get(transaction_handler))
            .route("/explorer/accounts/:address", get(account_handler))
            .with_state(self.state.clone())
    }

    /// Start the explorer HTTP server.
    pub async fn start(&self) -> Result<(), &'static str> {
        let addr: SocketAddr = self.listen.parse().map_err(|_| "invalid listen address")?;
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .map_err(|_| "failed to bind")?;
        info!("Explorer server listening on {}", addr);
        axum::serve(listener, self.router())
            .await
            .map_err(|_| "server error")?;
        Ok(())
    }
}

async fn status_handler(State(state): State<ExplorerState>) -> impl IntoResponse {
    Json(state.status().await)
}

async fn blocks_handler(State(state): State<ExplorerState>) -> impl IntoResponse {
    Json(state.recent_blocks(20).await)
}

async fn block_by_height_handler(
    State(state): State<ExplorerState>,
    Path(height): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    state
        .block_by_height(height)
        .await
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn block_by_hash_handler(
    State(state): State<ExplorerState>,
    Path(hash): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let hash = Hash::from_str(&hash).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .block_by_hash(&hash)
        .await
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn transaction_handler(
    State(state): State<ExplorerState>,
    Path(hash): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let hash = Hash::from_str(&hash).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .transaction(&hash)
        .await
        .map(|(_, tx)| Json(tx))
        .ok_or(StatusCode::NOT_FOUND)
}

async fn account_handler(
    State(state): State<ExplorerState>,
    Path(address): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let address = Address::from_str(&address).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .account(&address)
        .await
        .map(|account| {
            Json(AccountInfo {
                address,
                balance: account.balance,
                nonce: account.nonce,
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn explorer_status_empty() {
        let service = ExplorerService::new("127.0.0.1:0");
        let app = service.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/explorer/status")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn explorer_ingests_block() {
        let state = ExplorerState::new();
        let block = Block::default();
        state.ingest_block(block.clone()).await;
        assert!(state.block_by_height(0).await.is_some());
    }
}
