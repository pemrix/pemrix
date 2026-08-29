//! Faucet service implementation.

use crate::{FaucetConfig, FaucetError};
use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use pemrix_crypto::{Ed25519Scheme, KeyPair, SignatureScheme};
use pemrix_primitives::{Address, Transaction};
use pemrix_rpc::RpcState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use tracing::{info, warn};

/// A transaction submitter abstraction.
#[async_trait::async_trait]
pub trait TransactionSubmitter: Send + Sync {
    /// Submit a signed transaction.
    async fn submit(
        &self,
        transaction: Transaction,
    ) -> Result<pemrix_primitives::Hash, FaucetError>;

    /// Get the nonce for an address.
    async fn nonce(&self, address: &Address) -> u64;
}

/// Submitter that pushes transactions into a local `RpcState`.
pub struct LocalSubmitter {
    state: RpcState,
    faucet_address: Address,
}

impl LocalSubmitter {
    /// Create a new local submitter.
    pub fn new(state: RpcState, faucet_address: Address) -> Self {
        Self {
            state,
            faucet_address,
        }
    }
}

#[async_trait::async_trait]
impl TransactionSubmitter for LocalSubmitter {
    async fn submit(
        &self,
        transaction: Transaction,
    ) -> Result<pemrix_primitives::Hash, FaucetError> {
        let hash = transaction.hash();
        self.state
            .store_transaction(hash, transaction.clone())
            .await;
        self.state.submit_transaction(transaction).await;
        Ok(hash)
    }

    async fn nonce(&self, _address: &Address) -> u64 {
        self.state
            .get_account(&self.faucet_address)
            .await
            .map_or(0, |a| a.nonce)
    }
}

/// Faucet service state.
#[derive(Clone)]
pub struct FaucetService {
    config: FaucetConfig,
    faucet_keypair: KeyPair,
    faucet_address: Address,
    submitter: Arc<dyn TransactionSubmitter>,
    cooldowns: Arc<Mutex<HashMap<Address, Instant>>>,
}

impl FaucetService {
    /// Create a new faucet service.
    pub fn new(
        config: FaucetConfig,
        faucet_keypair: KeyPair,
        faucet_address: Address,
        submitter: Arc<dyn TransactionSubmitter>,
    ) -> Self {
        Self {
            config,
            faucet_keypair,
            faucet_address,
            submitter,
            cooldowns: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Generate a deterministic faucet keypair for local testnets.
    pub fn generate_keypair() -> Result<KeyPair, FaucetError> {
        let scheme = Ed25519Scheme::new();
        scheme.generate_keypair().map_err(|_| FaucetError::Signing)
    }

    /// Build the axum router.
    pub fn router(&self) -> Router {
        Router::new()
            .route("/faucet/request", post(request_handler))
            .with_state(self.clone_state())
    }

    fn clone_state(&self) -> FaucetState {
        FaucetState {
            config: self.config.clone(),
            faucet_keypair: self.faucet_keypair.clone(),
            faucet_address: self.faucet_address,
            submitter: self.submitter.clone(),
            cooldowns: self.cooldowns.clone(),
        }
    }

    /// Start the faucet HTTP server.
    pub async fn start(&self) -> Result<(), &'static str> {
        let addr: SocketAddr = self
            .config
            .listen
            .parse()
            .map_err(|_| "invalid listen address")?;
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .map_err(|_| "failed to bind")?;
        info!("Faucet server listening on {}", addr);
        axum::serve(listener, self.router())
            .await
            .map_err(|_| "server error")?;
        Ok(())
    }
}

#[derive(Clone)]
struct FaucetState {
    config: FaucetConfig,
    faucet_keypair: KeyPair,
    faucet_address: Address,
    submitter: Arc<dyn TransactionSubmitter>,
    cooldowns: Arc<Mutex<HashMap<Address, Instant>>>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct FaucetRequest {
    address: String,
    amount: String,
}

#[derive(Clone, Debug, Serialize)]
struct FaucetResponse {
    success: bool,
    tx_hash: String,
    message: String,
}

async fn request_handler(
    State(state): State<FaucetState>,
    Json(request): Json<FaucetRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let recipient = Address::from_str(&request.address).map_err(|_| StatusCode::BAD_REQUEST)?;
    let amount: u128 = request
        .amount
        .parse()
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    if amount > state.config.max_amount {
        return Ok((
            StatusCode::BAD_REQUEST,
            Json(FaucetResponse {
                success: false,
                tx_hash: String::new(),
                message: "amount exceeds maximum".to_string(),
            }),
        ));
    }

    {
        let cooldowns = state.cooldowns.lock().await;
        if let Some(last) = cooldowns.get(&recipient) {
            if last.elapsed() < Duration::from_secs(state.config.cooldown_seconds) {
                return Ok((
                    StatusCode::TOO_MANY_REQUESTS,
                    Json(FaucetResponse {
                        success: false,
                        tx_hash: String::new(),
                        message: "address is on cooldown".to_string(),
                    }),
                ));
            }
        }
    }

    let nonce = state.submitter.nonce(&state.faucet_address).await;
    let tx = Transaction::transfer(state.faucet_address, recipient, amount, nonce, 0);
    let scheme = Ed25519Scheme::new();
    let _sig = scheme
        .sign(
            &state.faucet_keypair.secret,
            &tx.hash().to_string().into_bytes(),
        )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match state.submitter.submit(tx).await {
        Ok(hash) => {
            state
                .cooldowns
                .lock()
                .await
                .insert(recipient, Instant::now());
            info!("Faucet sent {} to {}", amount, recipient);
            Ok((
                StatusCode::OK,
                Json(FaucetResponse {
                    success: true,
                    tx_hash: hash.to_string(),
                    message: "tokens sent".to_string(),
                }),
            ))
        }
        Err(e) => {
            warn!("Faucet submission failed: {}", e);
            Ok((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(FaucetResponse {
                    success: false,
                    tx_hash: String::new(),
                    message: e.to_string(),
                }),
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn faucet_rejects_excessive_amount() {
        let state = RpcState::new();
        let submitter: Arc<dyn TransactionSubmitter> =
            Arc::new(LocalSubmitter::new(state, Address::default()));
        let keypair = FaucetService::generate_keypair().unwrap();
        let service = FaucetService::new(
            FaucetConfig::default(),
            keypair,
            Address::default(),
            submitter,
        );
        let app = service.router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/faucet/request")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"address":"px0000000000000000000000000000000000000000000000000000000000000000","amount":"999999999"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }
}
