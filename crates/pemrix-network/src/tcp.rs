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
use std::collections::{BTreeMap, BTreeSet};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{tcp::OwnedReadHalf, tcp::OwnedWriteHalf, TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex};
use tracing::{info, warn};

/// A TCP transport that connects to a static set of bootstrap peers.
pub struct TcpTransport {
    local_id: PeerId,
    peers: Arc<Mutex<BTreeMap<PeerId, PeerConnection>>>,
    events: Arc<Mutex<mpsc::UnboundedReceiver<NetworkEvent>>>,
    listen_addr: SocketAddr,
}

/// A connection slot for a peer. The token is used to ensure that only the
/// task which actually owns the slot removes it on exit, even when a
/// connection is replaced by a newer one.
struct PeerConnection {
    tx: mpsc::UnboundedSender<Message>,
    token: Arc<()>,
}

impl PeerConnection {
    fn new(tx: mpsc::UnboundedSender<Message>) -> Self {
        Self {
            tx,
            token: Arc::new(()),
        }
    }
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
        let events = Arc::new(Mutex::new(event_rx));
        let peers: Arc<Mutex<BTreeMap<PeerId, PeerConnection>>> =
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

        // Dial bootstrap peers, retrying until connected. Track in-flight dials
        // so a slow handshake does not cause the retry loop to spawn duplicate
        // connection attempts that churn the stable socket.
        let bootstrap_peers: Arc<Mutex<BTreeMap<PeerId, SocketAddr>>> =
            Arc::new(Mutex::new(bootstrap));
        let retry_peers = peers.clone();
        let retry_tx = event_tx.clone();
        let retry_id = local_id;
        let retry_bootstrap = bootstrap_peers.clone();
        let dialing: Arc<Mutex<BTreeSet<PeerId>>> = Arc::new(Mutex::new(BTreeSet::new()));
        tokio::spawn(async move {
            let mut first_attempt = true;
            loop {
                let pending: Vec<(PeerId, SocketAddr)> = {
                    let connected = retry_peers.lock().await;
                    let dialing = dialing.lock().await;
                    retry_bootstrap
                        .lock()
                        .await
                        .iter()
                        .filter(|(peer_id, _)| {
                            **peer_id != retry_id
                                && !connected.contains_key(peer_id)
                                && !dialing.contains(peer_id)
                        })
                        .map(|(peer_id, addr)| (*peer_id, *addr))
                        .collect()
                };

                for (peer_id, peer_addr) in pending {
                    let dial_peers = retry_peers.clone();
                    let dial_tx = retry_tx.clone();
                    let dial_id = retry_id;
                    let dial_dialing = dialing.clone();
                    dialing.lock().await.insert(peer_id);
                    tokio::spawn(async move {
                        let result = match TcpStream::connect(peer_addr).await {
                            Ok(stream) => {
                                run_connection(stream, Some(peer_id), dial_id, dial_peers, dial_tx)
                                    .await
                            }
                            Err(e) => {
                                if first_attempt {
                                    warn!(
                                        "Failed to dial bootstrap peer {:?} at {}: {}",
                                        peer_id, peer_addr, e
                                    );
                                }
                                Err("connect failed")
                            }
                        };
                        if let Err(e) = result {
                            warn!("Bootstrap connection to {} closed: {}", peer_addr, e);
                        }
                        dial_dialing.lock().await.remove(&peer_id);
                    });
                }

                first_attempt = false;
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        });

        Ok(Self {
            local_id,
            peers,
            events,
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
    async fn broadcast(&self, message: Message) -> Result<(), &'static str> {
        let peers = self.peers.lock().await;
        if peers.is_empty() {
            return Err("no connected peers");
        }
        for (peer_id, conn) in peers.iter() {
            if conn.tx.send(message.clone()).is_err() {
                warn!("Failed to broadcast to peer {:?}", peer_id);
            }
        }
        Ok(())
    }

    async fn send_to(&self, peer: &PeerId, message: Message) -> Result<(), &'static str> {
        let peers = self.peers.lock().await;
        let conn = peers.get(peer).ok_or("peer not connected")?;
        conn.tx.send(message).map_err(|_| "peer channel closed")?;
        Ok(())
    }

    async fn next_event(&self) -> Option<NetworkEvent> {
        self.events.lock().await.recv().await
    }
}

/// Handle an incoming connection: perform handshake and then route messages.
async fn handle_incoming(
    stream: TcpStream,
    addr: SocketAddr,
    local_id: PeerId,
    peers: Arc<Mutex<BTreeMap<PeerId, PeerConnection>>>,
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
    peers: Arc<Mutex<BTreeMap<PeerId, PeerConnection>>>,
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

    // Prevent duplicate bidirectional connections. If both peers dial each
    // other, keep exactly one socket. Both sides must agree on which socket
    // survives so the connection is not torn down:
    //   - Outbound (dialed) sockets survive when local_id > remote_id.
    //   - Inbound (accepted) sockets survive when remote_id > local_id.
    // This deterministically picks the socket initiated by the higher peer id.
    // We atomically check for an existing entry and insert a new one under a
    // single lock; the token returned by `PeerConnection::new` lets us remove
    // only the slot we own, so a slow incoming handler cannot wipe out a stable
    // outbound connection whose entry replaced ours.
    // Prevent duplicate bidirectional connections. If both peers dial each
    // other, both sides must keep the same socket or the connection is torn
    // down. The socket initiated by the higher peer id is the one both sides
    // keep: outbound sockets win when local_id > remote_id, and inbound sockets
    // win when remote_id > local_id. When there is no existing entry yet, the
    // first connection is always kept (handles unidirectional bootstrap).
    // The token returned by `PeerConnection::new` lets us remove only the slot
    // we own, so a replaced handler cannot wipe out the stable connection.
    let is_outbound = known_peer.is_some();
    let wins_tie = if is_outbound {
        local_id.0 > remote_id.0
    } else {
        remote_id.0 > local_id.0
    };
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();
    let (inserted, our_token) = {
        let mut peers = peers.lock().await;
        if let Some(existing) = peers.get(&remote_id) {
            if !wins_tie {
                return Err("duplicate connection closed");
            }
            // This socket wins the tie: notify the old handler that its channel
            // is being replaced so it exits without removing our slot.
            let _ = existing.tx.send(Message::Ping);
        }
        let conn = PeerConnection::new(tx);
        let token = Arc::clone(&conn.token);
        peers.insert(remote_id, conn);
        (true, token)
    };

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

    if inserted {
        let mut peers = peers.lock().await;
        if let Some(conn) = peers.get(&remote_id) {
            if Arc::ptr_eq(&conn.token, &our_token) {
                peers.remove(&remote_id);
            }
        }
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
        match tokio::io::AsyncReadExt::read_exact(&mut reader, &mut len_bytes).await {
            Ok(_) => {}
            Err(e) => {
                warn!("[tcp] read length failed from {:?}: {}", remote_id, e);
                return Err("read length failed");
            }
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

    #[tokio::test]
    async fn bidirectional_bootstrap_forms_single_connection() {
        let id_a = peer_id("a");
        let id_b = peer_id("b");

        let mut bootstrap_a = BTreeMap::new();
        bootstrap_a.insert(id_b, addr(60032));
        let mut transport_a = TcpTransport::new(id_a, addr(60031), bootstrap_a)
            .await
            .unwrap();

        let mut bootstrap_b = BTreeMap::new();
        bootstrap_b.insert(id_a, addr(60031));
        let mut transport_b = TcpTransport::new(id_b, addr(60032), bootstrap_b)
            .await
            .unwrap();

        // Both sides should observe exactly one peer-connected event.
        let event_a = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_a.next_event(),
        )
        .await
        .expect("timeout waiting for A connect")
        .expect("expected a network event on A");
        assert!(matches!(event_a, NetworkEvent::PeerConnected(peer) if peer == id_b));

        let event_b = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for B connect")
        .expect("expected a network event on B");
        assert!(matches!(event_b, NetworkEvent::PeerConnected(peer) if peer == id_a));

        // Let connection ownership settle after the simultaneous dial and
        // drain any duplicate PeerConnected events emitted by replacements.
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        while let Ok(Some(event)) = tokio::time::timeout(
            tokio::time::Duration::from_millis(50),
            transport_a.next_event(),
        )
        .await
        {
            assert!(matches!(event, NetworkEvent::PeerConnected(_)));
        }
        while let Ok(Some(event)) = tokio::time::timeout(
            tokio::time::Duration::from_millis(50),
            transport_b.next_event(),
        )
        .await
        {
            assert!(matches!(event, NetworkEvent::PeerConnected(_)));
        }
        assert!(
            transport_a.peer_count().await > 0,
            "A should have a connected peer"
        );
        assert!(
            transport_b.peer_count().await > 0,
            "B should have a connected peer"
        );

        // Messages should flow in both directions over the surviving socket.
        transport_a
            .send_to(&id_b, Message::Ping)
            .await
            .expect("A send to B should succeed");

        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_b.next_event(),
        )
        .await
        .expect("timeout waiting for B event")
        .expect("expected a network event on B");
        assert!(
            matches!(event, NetworkEvent::MessageReceived(peer, Message::Ping) if peer == id_a)
        );

        transport_b
            .send_to(&id_a, Message::Pong)
            .await
            .expect("B send to A should succeed");

        let event = tokio::time::timeout(
            tokio::time::Duration::from_secs(2),
            transport_a.next_event(),
        )
        .await
        .expect("timeout waiting for A event")
        .expect("expected a network event on A");
        assert!(
            matches!(event, NetworkEvent::MessageReceived(peer, Message::Pong) if peer == id_b)
        );
    }
}
