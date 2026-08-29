//! # PEMRIX RPC
//!
//! Public interfaces for PEMRIX nodes. gRPC is used for high-performance
//! internal and external APIs; JSON-RPC provides broad compatibility.
//!
//! The consensus engine is never exposed directly. RPC handlers read state and
//! submit transactions to the mempool.

#![warn(missing_docs)]

pub mod error;
pub mod handlers;
pub mod server;
pub mod types;

#[cfg(feature = "grpc")]
pub mod grpc;

pub use error::RpcError;
pub use handlers::{RpcHandler, SimpleRpcHandler};
pub use server::{RpcServer, RpcState};
pub use types::{
    BalanceResponse, BlockResponse, NonceResponse, SendTransactionRequest, TransactionResponse,
};
