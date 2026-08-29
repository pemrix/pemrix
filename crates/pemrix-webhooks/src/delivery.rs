//! Webhook delivery logic.

use crate::{EventType, WebhookError, WebhookSubscription};
use serde::Serialize;

/// A webhook delivery request.
#[derive(Clone, Debug, Serialize)]
pub struct WebhookDelivery {
    /// Subscription ID.
    pub subscription_id: String,
    /// Event type.
    pub event_type: EventType,
    /// Event payload.
    pub payload: serde_json::Value,
    /// HMAC-SHA256 signature of the payload.
    pub signature: String,
}

impl WebhookDelivery {
    /// Create a delivery from a subscription and event.
    pub fn new(
        subscription: &WebhookSubscription,
        event_type: EventType,
        payload: serde_json::Value,
    ) -> Result<Self, WebhookError> {
        let signature = compute_signature(&subscription.secret, &payload)?;
        Ok(Self {
            subscription_id: subscription.id.clone(),
            event_type,
            payload,
            signature,
        })
    }
}

/// Result of a delivery attempt.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DeliveryResult {
    /// Delivery succeeded.
    Success,
    /// Delivery failed and should be retried.
    RetryableFailure(String),
    /// Delivery failed permanently.
    PermanentFailure(String),
}

fn compute_signature(secret: &str, payload: &serde_json::Value) -> Result<String, WebhookError> {
    use hmac::{Hmac, Mac};
    use sha2::Sha256;
    let bytes = serde_json::to_vec(payload).map_err(|_| WebhookError::Serialization)?;
    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| WebhookError::Internal(e.to_string()))?;
    mac.update(&bytes);
    let result = mac.finalize();
    Ok(hex::encode(result.into_bytes()))
}

/// Attempt to deliver a webhook payload to a URL.
pub async fn deliver(
    _subscription: &WebhookSubscription,
    delivery: &WebhookDelivery,
) -> DeliveryResult {
    // In a production implementation this would use reqwest to POST to the URL.
    // For Phase 2 scaffolding, we simulate delivery.
    if delivery.subscription_id.is_empty() {
        return DeliveryResult::PermanentFailure("invalid subscription id".to_string());
    }
    DeliveryResult::Success
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn signature_is_deterministic() {
        let payload = serde_json::json!({"block": 1});
        let sig1 = compute_signature("secret", &payload).unwrap();
        let sig2 = compute_signature("secret", &payload).unwrap();
        assert_eq!(sig1, sig2);
    }
}
