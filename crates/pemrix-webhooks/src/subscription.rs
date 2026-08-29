//! Webhook subscription model.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Types of events that can trigger webhooks.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    /// New block produced.
    Block,
    /// New transaction.
    Transaction,
    /// Transaction confirmed.
    TransactionConfirmed,
}

/// A webhook subscription.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct WebhookSubscription {
    /// Unique subscription ID.
    pub id: String,
    /// Target URL.
    pub url: String,
    /// Event types to subscribe to.
    pub events: HashSet<EventType>,
    /// Secret used to sign payloads.
    pub secret: String,
    /// Whether the subscription is active.
    pub active: bool,
}

impl WebhookSubscription {
    /// Create a new subscription.
    pub fn new(id: String, url: String, events: HashSet<EventType>, secret: String) -> Self {
        Self {
            id,
            url,
            events,
            secret,
            active: true,
        }
    }
}
