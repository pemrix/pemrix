//! TCP-based gossip transport for PEMRIX.
//!
//! This is a pragmatic first real network implementation. Validators open
//! persistent TCP connections to their bootstrap peers, exchange a 32-byte
//! peer-id handshake, then send length-prefixed `Message` frames.
//!
//! The long-term target remains QUIC over UDP (see `quic.rs`). TCP is used
//! here to prove multi-node BFT consensus end-to-end without waiting for a
//! full QUIC integration.

use crate::{Message, NetworkEvent, PeerId, Transport};
use async_trait::async_trait;
use std::collections::BTreeMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{tcp::OwnedReadHalf, tcp::OwnedWriteHalf, TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex};
use tracing::{info, warn};

/// A TCP transport that connects to a static set of bootstrap peers.
pub struct TcpTransport {
    local_id: PeerId,
    peers: Arc<Mutex<BTreeMap<PeerId, mpsc::UnboundedSender<Message>>>>,
    events: mpsc::UnboundedReceiver<NetworkEvent>,
    listen_addr: SocketAddr,
}

impl TcpTransport {
    /// Create a new TCP transport and start listening.
    ///
    /// `listen_addr` is the local bind address. `bootstrap` is a map of known
    /// peer IDs to their listen addresses. The transport will attempt to dial
    /// every bootstrap peer asynchronously.
    pub async fn new(
        local_id: PeerId,
        listen_addr: SocketAddr,
        bootstrap: BTreeMap<PeerId, SocketAddr>,
    ) -> Result<Self, &'static str> {
        let listener = TcpListener::bind(listen_addr)
            .await
            .map_err(|_| "failed to bind listener")?;
        let actual_addr = listener.local_addr().map_err(|_| "local_addr failed")?;

        let (event_tx, event_rx) = mpsc::unbounded_channel();
        let peers: Arc<Mutex<BTreeMap<PeerId, mpsc::UnboundedSender<Message>>>> =
            Arc::new(Mutex::new(BTreeMap::new()));

        // Accept incoming connections.
        let accept_peers = peers.clone();
        let accept_id = local_id;
        let accept_tx = event_tx.clone();
        tokio::spawn(async move {
            loop {
                match listener.accept().await {
                    Ok((stream, addr)) => {
                        tokio::spawn(handle_incoming(
                            stream,
                            addr,
                            accept_id,
                            accept_peers.clone(),
                            accept_tx.clone(),
                        ));
                    }
                    Err(e) => {
                        warn!("TCP accept error: {}", e);
                    }
                }
            }
        });

        // Dial bootstrap peers, retrying until connected.
        let bootstrap_peers: Arc<Mutex<BTreeMap<PeerId, SocketAddr>>> =
            Arc::new(Mutex::new(bootstrap));
        let retry_peers = peers.clone();
        let retry_tx = event_tx.clone();
        let retry_id = local_id;
        let retry_bootstrap = bootstrap_peers.clone();
        tokio::spawn(async move {
            let mut first_attempt = true;
            loop {
                let pending: Vec<(PeerId, SocketAddr)> = {
                    let connected = retry_peers.lock().await;
                    retry_bootstrap
                        .lock()
                        .await
                        .iter()
                        .filter(|(peer_id, _)| {
                            **peer_id != retry_id && !connected.contains_key(peer_id)
                        })
                        .map(|(peer_id, addr)| (*peer_id, *addr))
                        .collect()
                };

                for (peer_id, peer_addr) in pending {
                    let dial_peers = retry_peers.clone();
                    let dial_tx = retry_tx.clone();
                    let dial_id = retry_id;
                    tokio::spawn(async move {
                        match TcpStream::connect(peer_addr).await {
                            Ok(stream) => {
                                if let Err(e) = run_connection(
                                    stream,
                                    Some(peer_id),
                                    dial_id,
                                    dial_peers,
                                    dial_tx,
                                )
                                .await
                                {
                                    warn!("Bootstrap connection to {} closed: {}", peer_addr, e);
                                }
                            }
                            Err(e) => {
                                if first_attempt {
                                    warn!(
                                        "Failed to dial bootstrap peer {:?} at {}: {}",
                                        peer_id, peer_addr, e
                                    );
                                }
                            }
                        }
                    });
                }

                first_attempt = false;
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        });

        Ok(Self {
            local_id,
            peers,
            events: event_rx,
            listen_addr: actual_addr,
        })
    }

    /// Return the local listen address.
    pub fn local_addr(&self) -> SocketAddr {
        self.listen_addr
    }

    /// Return the local peer id.
    pub fn local_id(&self) -> PeerId {
        self.local_id
    }

    /// Return the number of currently connected peers.
    pub async fn peer_count(&self) -> usize {
        self.peers.lock().await.len()
    }

    /// Send a raw length-prefixed message to a writer.
    async fn write_message(
        writer: &mut OwnedWriteHalf,
        message: &Message,
    ) -> Result<(), &'static str> {
        let bytes = pemrix_primitives::encoding::encode(message);
        let len = bytes.len() as u32;
        writer
            .write_all(&len.to_be_bytes())
            .await
            .map_err(|_| "write length failed")?;
        writer
            .write_all(&bytes)
            .await
            .map_err(|_| "write payload failed")?;
        Ok(())
    }
}

#[async_trait]
impl Transport for TcpTransport {
    async fn broadcast(&mut self, message: Message) -> Result<(), &'static str> {
        let peers = self.peers.lock().await;
        if peers.is_empty() {
            return Err("no connected peers");
        }
        for (peer_id, tx) in peers.iter() {
            if tx.send(message.clone()).is_err() {
                warn!("Failed to broadcast to peer {:?}", peer_id);
            }
        }
        Ok(())
    }

    async fn send_to(&mut self, peer: &PeerId, message: Message) -> Result<(), &'static str> {
        let peers = self.peers.lock().await;
        let tx = peers.get(peer).ok_or("peer not connected")?;
        tx.send(message).map_err(|_| "peer channel closed")?;
        Ok(())
    }

    async fn next_event(&mut self) -> Option<NetworkEvent> {
        self.events.recv().await
    }
}

/// Handle an incoming connection: perform handshake and then route messages.
async fn handle_incoming(
    stream: TcpStream,
    addr: SocketAddr,
    local_id: PeerId,
    peers: Arc<Mutex<BTreeMap<PeerId, mpsc::UnboundedSender<Message>>>>,
    events: mpsc::UnboundedSender<NetworkEvent>,
) {
    info!("Incoming TCP connection from {}", addr);
    if let Err(e) = run_connection(stream, None, local_id, peers, events).await {
        warn!("Incoming connection from {} closed: {}", addr, e);
    }
}

/// Run a single connection: handshake, register peer, read loop.
async fn run_connection(
    stream: TcpStream,
    known_peer: Option<PeerId>,
    local_id: PeerId,
    peers: Arc<Mutex<BTreeMap<PeerId, mpsc::UnboundedSender<Message>>>>,
    events: mpsc::UnboundedSender<NetworkEvent>,
) -> Result<(), &'static str> {
    let (mut reader, mut writer) = stream.into_split();

    // Handshake: send local peer id, then read remote peer id.
    writer
        .write_all(&local_id.0)
        .await
        .map_err(|_| "handshake write failed")?;
    let mut remote_bytes = [0u8; 32];
    reader
        .read_exact(&mut remote_bytes)
        .await
        .map_err(|_| "handshake read failed")?;
    let remote_id = PeerId(remote_bytes);

    // If we dialed a known peer, the ids must match.
    if let Some(expected) = known_peer {
        if expected != remote_id {
            warn!(
                "Peer id mismatch dialing {:?}: expected {:?}, got {:?}",
                known_peer, expected, remote_id
            );
            return Err("peer id mismatch");
        }
    }

    // Channel for outbound messages to this peer.
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    {
        let mut peers = peers.lock().await;
        peers.insert(remote_id, tx);
    }

    let _ = events.send(NetworkEvent::PeerConnected(remote_id));

    // Outbound task: serialize messages from the channel to the socket.
    let outbound = tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            if TcpTransport::write_message(&mut writer, &message)
                .await
                .is_err()
            {
                break;
            }
        }
    });

    // Inbound loop: read length-prefixed messages and emit events.
    let read_result = read_messages(reader, remote_id, events).await;

    outbound.abort();

    {
        let mut peers = peers.lock().await;
        peers.remove(&remote_id);
    }

    read_result
}

/// Read length-prefixed messages from a socket and emit network events.
async fn read_messages(
    mut reader: OwnedReadHalf,
    remote_id: PeerId,
    events: mpsc::UnboundedSender<NetworkEvent>,
) -> Result<(), &'static str> {
    loop {
        let mut len_bytes = [0u8; 4];
        if tokio::io::AsyncReadExt::read_exact(&mut reader, &mut len_bytes)
            .await
            .is_err()
        {
            return Err("read length failed");
        }
        let len = u32::from_be_bytes(len_bytes) as usize;
        if len > 8 * 1024 * 1024 {
            return Err("message too large");
        }
        let mut buf = vec![0u8; len];
        reader
            .read_exact(&mut buf)
            .await
            .map_err(|_| "read payload failed")?;
        let message: Message =
            pemrix_primitives::encoding::decode(&buf).map_err(|_| "decode failed")?;
        let _ = events.send(NetworkEvent::MessageReceived(remote_id, message));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Message;
    use std::net::SocketAddr;
    use std::str::FromStr;

    fn peer_id(seed: &str) -> PeerId {
        PeerId::from_public_key_hash(pemrix_primitives::Hash::hash_bytes(seed.as_bytes()))
    }

    fn addr(port: u16) -> SocketAddr {
        SocketAddr::from_str(&format!("127.0.0.1:{}", port)).unwrap()
    }

    #[tokio::test]
    async fn two_peers_exchange_messages() {
        let id_a = peer_id("a");
        let id_b = peer_id("b");

        let mut transport_a = TcpTransport::new(id_a, addr(60010), BTreeMap::new())
            .await
            .unwrap();
        let actual_addr_a = transport_a.local_addr();

        let mut bootstrap = BTreeMap::new();
        bootstrap.insert(id_a, actual_addr_a);
        let mut transport_b = TcpTransport::new(id_b, addr(60011), bootstrap)
            .await
            .unwrap();

        // Wait for the peer-connected event on the receiver side.
        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for connect")
        .expect("expected a network event");
        assert!(matches!(event, NetworkEvent::PeerConnected(peer) if peer == id_a));

        transport_a
            .send_to(&id_b, Message::Ping)
            .await
            .expect("send_to b should succeed");

        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for event")
        .expect("expected a network event");

        match event {
            NetworkEvent::MessageReceived(sender, Message::Ping) => {
                assert_eq!(sender, id_a);
            }
            other => panic!("unexpected event: {:?}", other),
        }
    }

    #[tokio::test]
    async fn broadcast_reaches_connected_peer() {
        let id_a = peer_id("a");
        let id_b = peer_id("b");

        let mut transport_a = TcpTransport::new(id_a, addr(60020), BTreeMap::new())
            .await
            .unwrap();
        let actual_addr_a = transport_a.local_addr();

        let mut bootstrap = BTreeMap::new();
        bootstrap.insert(id_a, actual_addr_a);
        let mut transport_b = TcpTransport::new(id_b, addr(60021), bootstrap)
            .await
            .unwrap();

        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for connect")
        .expect("expected a network event");
        assert!(matches!(event, NetworkEvent::PeerConnected(peer) if peer == id_a));

        transport_a
            .broadcast(Message::Pong)
            .await
            .expect("broadcast should succeed");

        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for event")
        .expect("expected a network event");

        match event {
            NetworkEvent::MessageReceived(sender, Message::Pong) => {
                assert_eq!(sender, id_a);
            }
            other => panic!("unexpected event: {:?}", other),
        }
    }
}
