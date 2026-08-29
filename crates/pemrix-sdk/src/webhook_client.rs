//! Webhook client for managing subscriptions.

use crate::SdkError;
use serde::{Deserialize, Serialize};

/// A webhook client.
#[derive(Clone, Debug)]
pub struct WebhookClient {
    #[allow(dead_code)]
    base_url: String,
}

/// Webhook event type.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WebhookEventType {
    /// New block event.
    Block,
    /// New transaction event.
    Transaction,
    /// Transaction confirmed event.
    TransactionConfirmed,
}

/// Webhook subscription request.
#[derive(Clone, Debug, Serialize)]
pub struct SubscribeRequest {
    /// Target URL.
    pub url: String,
    /// Event types.
    pub events: Vec<WebhookEventType>,
}

/// Webhook subscription response.
#[derive(Clone, Debug, Deserialize)]
pub struct SubscriptionResponse {
    /// Subscription ID.
    pub id: String,
    /// Target URL.
    pub url: String,
    /// Event types.
    pub events: Vec<WebhookEventType>,
    /// Webhook secret.
    pub secret: String,
}

impl WebhookClient {
    /// Create a new webhook client.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
        }
    }

    /// Subscribe to webhook events.
    pub async fn subscribe(
        &self,
        url: String,
        events: Vec<WebhookEventType>,
    ) -> Result<SubscriptionResponse, SdkError> {
        Ok(SubscriptionResponse {
            id: "mock-id".to_string(),
            url,
            events,
            secret: "mock-secret".to_string(),
        })
    }
}
