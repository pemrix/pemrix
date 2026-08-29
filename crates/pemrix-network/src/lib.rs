//! # PEMRIX Network
//!
//! Peer-to-peer networking layer for the PEMRIX blockchain. The production
//! transport is QUIC over UDP. A mock transport is provided for deterministic
//! testing of consensus and networking logic without real sockets.

#![warn(missing_docs)]

pub mod message;
pub mod peer;
pub mod tcp;
pub mod transport;

#[cfg(feature = "quic")]
pub mod quic;

pub use message::{Message, NetworkEvent};
pub use peer::PeerId;
pub use tcp::TcpTransport;
pub use transport::{MockTransport, Transport};
