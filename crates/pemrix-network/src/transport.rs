//! Transport abstraction.

use crate::{Message, NetworkEvent, PeerId};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;

/// A network transport abstraction.
#[async_trait]
pub trait Transport: Send + Sync {
    /// Broadcast a message to all connected peers.
    async fn broadcast(&self, message: Message) -> Result<(), &'static str>;

    /// Send a message to a specific peer.
    async fn send_to(&self, peer: &PeerId, message: Message) -> Result<(), &'static str>;

    /// Receive the next network event.
    async fn next_event(&self) -> Option<NetworkEvent>;
}

/// A mock transport for deterministic unit testing.
#[derive(Clone, Debug, Default)]
pub struct MockTransport {
    #[allow(dead_code)]
    local_id: PeerId,
    state: Arc<std::sync::Mutex<MockTransportState>>,
}

#[derive(Debug, Default)]
struct MockTransportState {
    peers: HashMap<PeerId, Vec<Message>>,
    events: Vec<NetworkEvent>,
}

impl MockTransport {
    /// Create a new mock transport for the given local peer.
    pub fn new(local_id: PeerId) -> Self {
        Self {
            local_id,
            state: Arc::new(std::sync::Mutex::new(MockTransportState::default())),
        }
    }

    /// Register a peer in the mock network.
    pub fn add_peer(&self, peer: PeerId) {
        let mut state = self.state.lock().expect("mock transport lock poisoned");
        state.peers.entry(peer).or_default();
        state.events.push(NetworkEvent::PeerConnected(peer));
    }
}

#[async_trait]
impl Transport for MockTransport {
    async fn broadcast(&self, message: Message) -> Result<(), &'static str> {
        let mut state = self.state.lock().expect("mock transport lock poisoned");
        let peers: Vec<PeerId> = state.peers.keys().copied().collect();
        for peer in peers {
            state
                .peers
                .entry(peer)
                .or_default()
                .push(message.clone());
            state
                .events
                .push(NetworkEvent::MessageReceived(peer, message.clone()));
        }
        Ok(())
    }

    async fn send_to(&self, peer: &PeerId, message: Message) -> Result<(), &'static str> {
        let mut state = self.state.lock().expect("mock transport lock poisoned");
        state
            .peers
            .get_mut(peer)
            .ok_or("peer not found")?
            .push(message.clone());
        state.events.push(NetworkEvent::MessageReceived(*peer, message));
        Ok(())
    }

    async fn next_event(&self) -> Option<NetworkEvent> {
        let mut state = self.state.lock().expect("mock transport lock poisoned");
        if state.events.is_empty() {
            None
        } else {
            Some(state.events.remove(0))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn mock_transport_peer_connects() {
        let local = PeerId::default();
        let transport = MockTransport::new(local);
        let peer = PeerId::default();
        transport.add_peer(peer);
        let event = transport.next_event().await.unwrap();
        assert_eq!(event, NetworkEvent::PeerConnected(peer));
    }
}
