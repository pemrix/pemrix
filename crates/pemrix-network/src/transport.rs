//! Transport abstraction.

use crate::{Message, NetworkEvent, PeerId};
use async_trait::async_trait;
use std::collections::HashMap;

/// A network transport abstraction.
#[async_trait]
pub trait Transport: Send + Sync {
    /// Broadcast a message to all connected peers.
    async fn broadcast(&mut self, message: Message) -> Result<(), &'static str>;

    /// Send a message to a specific peer.
    async fn send_to(&mut self, peer: &PeerId, message: Message) -> Result<(), &'static str>;

    /// Receive the next network event.
    async fn next_event(&mut self) -> Option<NetworkEvent>;
}

/// A mock transport for deterministic unit testing.
#[derive(Clone, Debug, Default)]
pub struct MockTransport {
    #[allow(dead_code)]
    local_id: PeerId,
    peers: HashMap<PeerId, Vec<Message>>,
    events: Vec<NetworkEvent>,
}

impl MockTransport {
    /// Create a new mock transport for the given local peer.
    pub fn new(local_id: PeerId) -> Self {
        Self {
            local_id,
            peers: HashMap::new(),
            events: Vec::new(),
        }
    }

    /// Register a peer in the mock network.
    pub fn add_peer(&mut self, peer: PeerId) {
        self.peers.entry(peer).or_default();
        self.events.push(NetworkEvent::PeerConnected(peer));
    }
}

#[async_trait]
impl Transport for MockTransport {
    async fn broadcast(&mut self, message: Message) -> Result<(), &'static str> {
        for (peer, mailbox) in &mut self.peers {
            mailbox.push(message.clone());
            self.events
                .push(NetworkEvent::MessageReceived(*peer, message.clone()));
        }
        Ok(())
    }

    async fn send_to(&mut self, peer: &PeerId, message: Message) -> Result<(), &'static str> {
        self.peers
            .get_mut(peer)
            .ok_or("peer not found")?
            .push(message.clone());
        self.events
            .push(NetworkEvent::MessageReceived(*peer, message));
        Ok(())
    }

    async fn next_event(&mut self) -> Option<NetworkEvent> {
        if self.events.is_empty() {
            None
        } else {
            Some(self.events.remove(0))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn mock_transport_peer_connects() {
        let local = PeerId::default();
        let mut transport = MockTransport::new(local);
        let peer = PeerId::default();
        transport.add_peer(peer);
        let event = transport.next_event().await.unwrap();
        assert_eq!(event, NetworkEvent::PeerConnected(peer));
    }
}
