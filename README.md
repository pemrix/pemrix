# PEMRIX

**The Open Network for Value**

PEMRIX is a global, decentralized, post-quantum-ready, AI-native value network.
It combines a Bitcoin-like settlement layer with a UPI/PayPal/Stripe-like user
experience and an Ethereum-like + AI-native application ecosystem.

This repository contains the foundational Rust implementation of the PEMRIX
network core. Product layers (wallet, payments, exchange, AI) are built as
separate services and applications on top of this core.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the complete system
architecture, roadmap, and phase-wise completion tracking.

See [`docs/DISCUSSION.md`](docs/DISCUSSION.md) for the original strategic
discussion and naming decisions.

## Repository Structure

```
pemrix/
├── crates/
│   ├── pemrix-primitives/  # Blocks, transactions, addresses, canonical encoding
│   ├── pemrix-crypto/      # Signature abstraction, Ed25519, hybrid/PQC ready
│   ├── pemrix-storage/     # State storage abstraction and backends
│   ├── pemrix-network/     # QUIC-based P2P transport
│   ├── pemrix-consensus/   # BFT + PoS consensus engine
│   ├── pemrix-rpc/         # gRPC + JSON-RPC gateway
│   ├── pemrix-vm/          # WASM-based smart contract VM
│   ├── pemrix-sdk/         # Rust SDK for developers
│   └── pemrix-cli/         # `pemrix` command-line interface
├── node/
│   └── pemrix-node/        # Validator / full-node binary
├── docs/                   # Architecture and discussion documents
└── proto/                  # Protobuf definitions for gRPC
```

## Build Requirements

- Rust 1.75 or later (see `rust-toolchain.toml`)
- Cargo
- (Optional) Protocol Buffers compiler for gRPC code generation

## Quick Start

```bash
# Build everything
cargo build --release

# Run tests
cargo test --all-features

# Run linting
cargo clippy --all-targets --all-features

# Check formatting
cargo fmt --check

# Run the PEMRIX CLI
pemrix --help
pemrix init --data-dir ./pemrix-data
pemrix start --data-dir ./pemrix-data
```

## Design Principles

- **Tiny core, massive periphery:** The validator node contains only
  consensus-critical code.
- **Crypto-agility:** Cryptographic algorithms can be migrated over time,
  including post-quantum signatures.
- **Permissionless base, regulated interfaces:** The blockchain is open; fiat
  services connect through licensed partners.
- **No bloat in consensus:** Explorers, AI, exchanges, and payment gateways are
  external services.

## License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or
  <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or
  <http://opensource.org/licenses/MIT>)

at your option.

## Contribution

PEMRIX is an open ecosystem. Contributions are welcome once the contribution
guidelines and code of conduct are published.
