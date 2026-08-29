//! Webhook errors.

/// Errors returned by the webhook service.
#[derive(Debug, thiserror::Error)]
pub enum WebhookError {
    /// Subscription not found.
    #[error("subscription not found")]
    NotFound,
    /// Invalid URL.
    #[error("invalid url")]
    InvalidUrl,
    /// Delivery failed.
    #[error("delivery failed: {0}")]
    DeliveryFailed(String),
    /// Serialization failed.
    #[error("serialization failed")]
    Serialization,
    /// Internal error.
    #[error("internal error: {0}")]
    Internal(String),
}
