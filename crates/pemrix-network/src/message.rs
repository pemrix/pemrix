//! Network messages.

use pemrix_primitives::{Block, Hash, Transaction};
use serde::{Deserialize, Serialize};

/// A network message.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Message {
    /// Gossip a transaction.
    Transaction(Transaction),
    /// Propagate a block.
    Block(Block),
    /// Request a block by hash.
    BlockRequest(Hash),
    /// Response containing a block.
    BlockResponse(Option<Block>),
    /// Consensus vote placeholder.
    Vote(Vec<u8>),
    /// Consensus proposal placeholder.
    Proposal(Vec<u8>),
    /// Keep-alive ping.
    Ping,
    /// Keep-alive pong.
    Pong,
}

/// A network event observed by the local node.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum NetworkEvent {
    /// A new peer connected.
    PeerConnected(PeerId),
    /// A peer disconnected.
    PeerDisconnected(PeerId),
    /// A message was received from a peer.
    MessageReceived(PeerId, Message),
}

use crate::PeerId;
