//! HTTP REST RPC server.

use crate::{
    BalanceResponse, BlockResponse, DelegationResponse, NonceResponse, RpcError,
    SendTransactionRequest, TransactionResponse, ValidatorResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
use pemrix_primitives::{Account, Address, Block, Delegation, Hash, Transaction, ValidatorRecord};
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
    validators: HashMap<Address, ValidatorRecord>,
    delegations: HashMap<(Address, Address), Delegation>,
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

    /// Store a validator record.
    pub async fn set_validator(&self, address: Address, record: ValidatorRecord) {
        self.inner.lock().await.validators.insert(address, record);
    }

    /// Get a validator record by operator address.
    pub async fn get_validator(&self, address: &Address) -> Option<ValidatorRecord> {
        self.inner.lock().await.validators.get(address).cloned()
    }

    /// Store a delegation.
    pub async fn set_delegation(
        &self,
        delegator: Address,
        validator: Address,
        delegation: Delegation,
    ) {
        self.inner
            .lock()
            .await
            .delegations
            .insert((delegator, validator), delegation);
    }

    /// Get a delegation by delegator and validator.
    pub async fn get_delegation(
        &self,
        delegator: &Address,
        validator: &Address,
    ) -> Option<Delegation> {
        self.inner
            .lock()
            .await
            .delegations
            .get(&(*delegator, *validator))
            .cloned()
    }

    /// Delete a delegation.
    pub async fn delete_delegation(&self, delegator: &Address, validator: &Address) {
        self.inner
            .lock()
            .await
            .delegations
            .remove(&(*delegator, *validator));
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
            .route("/v1/blocks/raw/:height", get(block_raw_handler))
            .route("/v1/blocks/:height", get(block_by_height_handler))
            .route("/v1/blocks/hash/:hash", get(block_by_hash_handler))
            .route("/v1/transactions/:hash", get(transaction_handler))
            .route("/v1/accounts/:address/balance", get(balance_handler))
            .route("/v1/accounts/:address/nonce", get(nonce_handler))
            .route("/v1/validators/:address", get(validator_handler))
            .route(
                "/v1/delegations/:delegator/:validator",
                get(delegation_handler),
            )
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

async fn block_raw_handler(
    State(state): State<RpcState>,
    Path(height): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    state
        .get_block_by_height(height)
        .await
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
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

async fn validator_handler(
    State(state): State<RpcState>,
    Path(address): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let address = Address::from_str(&address).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .get_validator(&address)
        .await
        .map(|validator| Json(ValidatorResponse { address, validator }))
        .ok_or(StatusCode::NOT_FOUND)
}

async fn delegation_handler(
    State(state): State<RpcState>,
    Path((delegator, validator)): Path<(String, String)>,
) -> Result<impl IntoResponse, StatusCode> {
    let delegator = Address::from_str(&delegator).map_err(|_| StatusCode::BAD_REQUEST)?;
    let validator = Address::from_str(&validator).map_err(|_| StatusCode::BAD_REQUEST)?;
    state
        .get_delegation(&delegator, &validator)
        .await
        .map(|delegation| {
            Json(DelegationResponse {
                delegator,
                validator,
                delegation,
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

/// Validate a transaction before accepting it into the mempool.
///
/// Checks signature, sender identity, balance, and nonce. Returns the
/// transaction hash on success or an HTTP status on failure.
async fn validate_transaction<'a>(
    state: &'a RpcState,
    tx: &'a Transaction,
) -> Result<Hash, StatusCode> {
    // Basic field sizes for Ed25519.
    if tx.public_key.len() != 32 || tx.signature.len() != 64 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Sender address must match the hash of the provided public key.
    let derived_address = Address::from_public_key_hash(Hash::hash_bytes(&tx.public_key));
    if derived_address != tx.sender {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Verify the signature over the transaction signing hash.
    let scheme = Ed25519Scheme::new();
    let public_key = pemrix_crypto::PublicKey(tx.public_key.clone());
    let signature = pemrix_crypto::Signature(tx.signature.clone());
    scheme
        .verify(&public_key, tx.signing_hash().as_bytes(), &signature)
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    // Check balance and nonce.
    let total = tx.amount.saturating_add(tx.fee);
    if let Some(account) = state.get_account(&tx.sender).await {
        if account.balance < total {
            return Err(StatusCode::PAYMENT_REQUIRED);
        }
        if account.nonce != tx.nonce {
            return Err(StatusCode::CONFLICT);
        }
    } else {
        return Err(StatusCode::PAYMENT_REQUIRED);
    }

    Ok(tx.hash())
}

async fn send_transaction_handler(
    State(state): State<RpcState>,
    Json(request): Json<SendTransactionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let tx = request.transaction;
    let hash = validate_transaction(&state, &tx).await?;
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
    use pemrix_crypto::{Ed25519Scheme, SignatureScheme};
    use pemrix_primitives::{Account, Address, Hash, Transaction};
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

    fn signed_transfer(
        recipient: Address,
        amount: u128,
        nonce: u64,
        fee: u128,
    ) -> (Transaction, Account) {
        let scheme = Ed25519Scheme::new();
        let keypair = scheme.generate_keypair().unwrap();
        let sender = Address::from_public_key_hash(Hash::hash_bytes(&keypair.public.0));
        let mut tx = Transaction::transfer(sender, recipient, amount, nonce, fee);
        tx.public_key = keypair.public.0.clone();
        let signature = scheme
            .sign(&keypair.secret, tx.signing_hash().as_bytes())
            .unwrap();
        tx.signature = signature.0;
        (tx, Account::new(1_000_000, nonce))
    }

    #[tokio::test]
    async fn valid_transaction_is_accepted() {
        let server = RpcServer::new("127.0.0.1:0");
        let (tx, account) = signed_transfer(Address::default(), 100, 0, 1);
        server.state().set_account(tx.sender, account).await;

        let app = server.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/transactions")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&SendTransactionRequest { transaction: tx }).unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn unsigned_transaction_is_rejected() {
        let server = RpcServer::new("127.0.0.1:0");
        let scheme = Ed25519Scheme::new();
        let keypair = scheme.generate_keypair().unwrap();
        let sender = Address::from_public_key_hash(Hash::hash_bytes(&keypair.public.0));
        let mut tx = Transaction::transfer(sender, Address::default(), 100, 0, 1);
        tx.public_key = keypair.public.0;
        // signature left empty
        server
            .state()
            .set_account(sender, Account::new(1_000_000, 0))
            .await;

        let app = server.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/transactions")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&SendTransactionRequest { transaction: tx }).unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn transaction_with_wrong_nonce_is_rejected() {
        let server = RpcServer::new("127.0.0.1:0");
        let (tx, _account) = signed_transfer(Address::default(), 100, 5, 1);
        // Account nonce is 0, transaction nonce is 5 -> mismatch.
        server
            .state()
            .set_account(tx.sender, Account::new(1_000_000, 0))
            .await;

        let app = server.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/transactions")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&SendTransactionRequest { transaction: tx }).unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::CONFLICT);
    }

    #[tokio::test]
    async fn transaction_with_insufficient_balance_is_rejected() {
        let server = RpcServer::new("127.0.0.1:0");
        let (tx, account) = signed_transfer(Address::default(), 2_000_000, 0, 1);
        server.state().set_account(tx.sender, account).await;

        let app = server.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/transactions")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&SendTransactionRequest { transaction: tx }).unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::PAYMENT_REQUIRED);
    }
}
