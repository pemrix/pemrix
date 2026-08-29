//! QUIC-based transport implementation.
//!
//! This is a scaffolding placeholder. A production implementation would use
//! `quinn` to establish encrypted QUIC connections between validators.

use crate::{Message, NetworkEvent, PeerId, Transport};
use async_trait::async_trait;

/// QUIC transport.
#[derive(Debug, Default)]
pub struct QuicTransport;

impl QuicTransport {
    /// Create a new QUIC transport.
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Transport for QuicTransport {
    async fn broadcast(&self, _message: Message) -> Result<(), &'static str> {
        Err("QUIC transport not yet implemented")
    }

    async fn send_to(&self, _peer: &PeerId, _message: Message) -> Result<(), &'static str> {
        Err("QUIC transport not yet implemented")
    }

    async fn next_event(&self) -> Option<NetworkEvent> {
        None
    }
}
