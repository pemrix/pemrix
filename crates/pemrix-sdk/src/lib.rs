//! # PEMRIX SDK
//!
//! Developer-facing Rust SDK for the PEMRIX network. Provides types,
//! transaction builders, signing helpers, and client abstractions.

#![warn(missing_docs)]

pub mod client;
pub mod error;
pub mod explorer_client;
pub mod faucet_client;
pub mod transaction_builder;
pub mod wallet;
pub mod webhook_client;

pub use client::{Client, GrpcClient, HttpClient, LocalClient};
pub use error::SdkError;
pub use explorer_client::{ExplorerAccount, ExplorerClient, ExplorerStatus};
pub use faucet_client::{FaucetClient, FaucetRequest, FaucetResponse};
pub use transaction_builder::TransactionBuilder;
pub use wallet::Wallet;
pub use webhook_client::{SubscribeRequest, SubscriptionResponse, WebhookClient, WebhookEventType};
