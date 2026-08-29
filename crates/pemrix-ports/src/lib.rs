//! Standardized PEMRIX network service ports.
//!
//! All PEMRIX services use the 61xxx range so they do not collide with
//! common system services (22, 80, 443) or the Quanvio application stack
//! on shared servers. TCP ports are 16-bit unsigned values with a maximum
//! of 65535, so a true "7xxxx" range is not possible.
//!
//! | Service | Default Port |
//! |---------|-------------|
//! | RPC     | 61001       |
//! | gRPC    | 61002       |
//! | Faucet  | 61003       |
//! | Explorer| 61004       |
//! | Webhooks| 61005       |
//! | P2P     | 61100+      |

/// RPC JSON-RPC server.
pub const RPC: u16 = 61001;

/// gRPC server.
pub const GRPC: u16 = 61002;

/// Faucet server.
pub const FAUCET: u16 = 61003;

/// Explorer / block viewer server.
pub const EXPLORER: u16 = 61004;

/// Webhook delivery server.
pub const WEBHOOKS: u16 = 61005;

/// Base port for P2P validator listening.
/// A single validator listens on this port; a local testnet allocates
/// consecutive ports starting here (61100, 61101, ...).
pub const P2P_BASE: u16 = 61100;

/// Default listen address for the RPC server on localhost.
pub fn rpc_local() -> String {
    format!("127.0.0.1:{}", RPC)
}

/// Default public listen address for the RPC server.
pub fn rpc_public() -> String {
    format!("0.0.0.0:{}", RPC)
}

/// Default listen address for the gRPC server on localhost.
pub fn grpc_local() -> String {
    format!("127.0.0.1:{}", GRPC)
}

/// Default public listen address for the gRPC server.
pub fn grpc_public() -> String {
    format!("0.0.0.0:{}", GRPC)
}

/// Default listen address for the faucet server on localhost.
pub fn faucet_local() -> String {
    format!("127.0.0.1:{}", FAUCET)
}

/// Default public listen address for the faucet server.
pub fn faucet_public() -> String {
    format!("0.0.0.0:{}", FAUCET)
}

/// Default listen address for the explorer server on localhost.
pub fn explorer_local() -> String {
    format!("127.0.0.1:{}", EXPLORER)
}

/// Default public listen address for the explorer server.
pub fn explorer_public() -> String {
    format!("0.0.0.0:{}", EXPLORER)
}

/// Default listen address for the webhook server on localhost.
pub fn webhooks_local() -> String {
    format!("127.0.0.1:{}", WEBHOOKS)
}

/// Default public listen address for the webhook server.
pub fn webhooks_public() -> String {
    format!("0.0.0.0:{}", WEBHOOKS)
}

/// Default public listen address for a single validator P2P port.
pub fn p2p_default() -> String {
    format!("0.0.0.0:{}", P2P_BASE)
}

/// Local listen address for a validator P2P port at the given offset.
pub fn p2p_local_offset(offset: u16) -> String {
    format!("127.0.0.1:{}", P2P_BASE + offset)
}

/// Public listen address for a validator P2P port at the given offset.
pub fn p2p_public_offset(offset: u16) -> String {
    format!("0.0.0.0:{}", P2P_BASE + offset)
}

/// RPC internal URL used by services running on the same host.
pub fn rpc_internal_url() -> String {
    format!("http://127.0.0.1:{}", RPC)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ports_are_five_digits_starting_with_six() {
        for p in [RPC, GRPC, FAUCET, EXPLORER, WEBHOOKS, P2P_BASE] {
            assert!(p >= 61000, "port {} is not in PEMRIX 61xxx range", p);
        }
    }

    #[test]
    fn p2p_offsets_stay_in_range() {
        assert_eq!(p2p_local_offset(0), "127.0.0.1:61100");
        assert_eq!(p2p_local_offset(3), "127.0.0.1:61103");
    }
}
