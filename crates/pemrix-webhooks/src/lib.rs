//! # PEMRIX Webhooks
//!
//! Webhook subscription and delivery service for PEMRIX events.

#![warn(missing_docs)]

pub mod delivery;
pub mod error;
pub mod service;
pub mod subscription;

pub use delivery::{DeliveryResult, WebhookDelivery};
pub use error::WebhookError;
pub use service::WebhookService;
pub use subscription::{EventType, WebhookSubscription};
