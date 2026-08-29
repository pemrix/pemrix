//! Faucet client for requesting test tokens.

use crate::SdkError;
use pemrix_primitives::Address;
use serde::{Deserialize, Serialize};

/// A faucet client.
#[derive(Clone, Debug)]
pub struct FaucetClient {
    base_url: String,
    http: reqwest::Client,
}

/// Faucet request body.
#[derive(Clone, Debug, Serialize)]
pub struct FaucetRequest {
    /// Recipient address.
    pub address: String,
    /// Requested amount.
    pub amount: String,
}

/// Faucet response body.
#[derive(Clone, Debug, Deserialize)]
pub struct FaucetResponse {
    /// Whether the request succeeded.
    pub success: bool,
    /// Transaction hash.
    pub tx_hash: String,
    /// Response message.
    pub message: String,
}

impl FaucetClient {
    /// Create a new faucet client.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into().trim_end_matches('/').to_string(),
            http: reqwest::Client::new(),
        }
    }

    /// Request tokens from the faucet.
    pub async fn request(
        &self,
        address: Address,
        amount: u128,
    ) -> Result<FaucetResponse, SdkError> {
        let request = FaucetRequest {
            address: address.to_string(),
            amount: amount.to_string(),
        };

        let response: FaucetResponse = self
            .http
            .post(format!("{}/faucet/request", self.base_url))
            .json(&request)
            .send()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?
            .json()
            .await
            .map_err(|e| SdkError::Rpc(e.to_string()))?;

        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn faucet_request_url_is_formatted() {
        let client = FaucetClient::new("http://localhost:61003");
        assert_eq!(client.base_url, "http://localhost:61003");
        assert_eq!(
            format!("{}/faucet/request", client.base_url),
            "http://localhost:61003/faucet/request"
        );
    }
}
