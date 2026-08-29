<p align="center">
  <img alt="PEMRIX" src="logo/logo-mark-black.svg" width="90">
</p>

<h1 align="center">PEMRIX</h1>

<p align="center"><strong>The global value layer for the next century of commerce.</strong></p>

<p align="center">
  Permissionless. Open source. Post-quantum ready. Built to settle payments, assets, and machine economies at internet scale.
</p>

<p align="center">
  <a href="https://github.com/pemrix/pemrix/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/pemrix/pemrix/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache%202.0%20%7C%20MIT-blue?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Rust-1.75+-orange.svg?style=flat-square" alt="Rust 1.75+">
  <img src="https://img.shields.io/badge/post--quantum-ready-purple?style=flat-square" alt="Post-quantum ready">
</p>

---

## What PEMRIX Is

PEMRIX is a next-generation, open-source settlement protocol. It combines the self-custody and global reach of a public blockchain with the speed and simplicity expected from modern payment networks — then adds crypto-agility so the protocol can evolve as cryptography, consensus, and compute change.

It is designed for three forces that will dominate the next decades of the economy:

- **Global payments** — instant, final, programmable value transfer without intermediaries.
- **Digital assets** — tokens, contracts, and ownership enforced by mathematics, not jurisdiction.
- **Autonomous commerce** — AI agents, IoT devices, and machines that transact under policy.

---

## Why PEMRIX

| Legacy blockchains | Legacy payments | PEMRIX |
|---|---|---|
| Slow finality, high fees, hard to upgrade. | Closed ledgers, geographic limits, frozen accounts. | **Open, fast-finality settlement with upgradeable cryptography.** |
| Mining or energy-heavy consensus. | Single companies control the ledger. | **BFT + Proof-of-Stake. No mining. No single operator.** |
| Locked into one language or one signature scheme. | No programmability. | **WASM smart contracts. Crypto-agile signatures. Built for the future.** |

PEMRIX is not an incremental improvement. It is a redesign of the settlement layer with a thousand-year assumption: **protocols outlive companies, countries, and cryptosystems.**

---

## How the Network Compares

| | Bitcoin | Ethereum | BNB Chain | Solana | **PEMRIX** |
|---|---|---|---|---|---|
| **Consensus** | Proof-of-Work | Proof-of-Stake | Proof-of-Stake (21 validators) | Proof-of-Stake + PoH | **BFT + Proof-of-Stake** |
| **Block time** | ~10 min | ~12 sec | ~3 sec | ~400 ms | **Target: sub-second** |
| **Finality** | ~60 min | ~12 min | ~3 sec | ~12 sec | **Deterministic, seconds** |
| **Smart-contract VM** | Limited Script | EVM / Solidity | EVM / Solidity | Solana VM / Rust | **WASM VM / Rust, C/C++** |
| **Signatures** | ECDSA | ECDSA | ECDSA | Ed25519 | **Ed25519 → hybrid → post-quantum** |
| **Supply model** | 21M hard cap | No hard cap | No hard cap | No hard cap | **1B initial, bounded issuance + burn** |
| **Upgrade path** | Social hard forks | Social hard forks | Controlled by Binance | Hard forks | **On-chain governance + crypto-agility** |
| **Primary use** | Store of value | DeFi, NFTs | Trading | High-speed apps | **Payments, settlement, autonomous commerce** |

| | UPI | PhonePe / GPay | PayPal | Razorpay / Stripe | **PEMRIX** |
|---|---|---|---|---|---|
| **Open network** | No | No | No | No | **Yes** |
| **Self-custody** | No (bank account) | No | No | No | **Yes** |
| **Cross-border** | No (India only) | No | Limited | Limited | **Global** |
| **Programmable money** | No | No | No | No | **Yes** |
| **Censorship resistance** | No | No | No | No | **By design** |

---

## A Payment in Seconds

1. Merchant shows a QR code.
2. Customer scans and confirms.
3. Wallet signs and broadcasts.
4. Validators verify and finalize the transaction.
5. Merchant sees **Paid**.

Internet is required, like any digital payment. On the surface it feels like UPI or Apple Pay. Under the hood it is a globally replicated, cryptographically final settlement.

---

## Architecture Built to Outlast

| Layer | What it does |
|---|---|
| **Settlement (L1)** | BFT consensus, mempool, state, canonical encoding. |
| **Execution** | WASM VM for smart contracts, native transfers, gas metering. |
| **Cryptography** | Ed25519 today, with a migration path to hybrid and post-quantum signatures. |
| **Networking** | QUIC transport for fast, encrypted, mobile-friendly P2P. |
| **Storage** | RocksDB backend for durable validator state. |
| **Applications** | Wallets, merchant consoles, SDKs, AI agent policies — built outside the core. |

The core is intentionally tiny. Everything that can live outside consensus does.

---

## Performance Targets

| Metric | Target |
|---|---|
| Block time | **Sub-second under ideal conditions** |
| Finality | **Deterministic, seconds** |
| Throughput | **10,000+ sustained payment TPS** |
| Validator hardware | Standard cloud server or dedicated machine |
| Cryptographic migration | **On-chain, without hard forks** |

These are engineering targets for the production network. The current testnet is functional but not yet benchmarked at production scale.

---

## Tokenomics

| Parameter | Value |
|---|---|
| Initial supply | 1,000,000,000 PEMRIX |
| Decimals | 9 |
| Initial block reward | 10 PEMRIX per block |
| Reward decay interval | 2,000,000 blocks (~4.6 years) |
| Decay rate | 10% per interval |
| Minimum block reward | 0.1 PEMRIX per block |
| Asymptotic maximum supply | ~1,100,000,000 PEMRIX |

Supply is bounded and predictable. Issuance decays forever, and transaction fees are partially burned. Validators remain incentivized without relying on a hard cap that eventually collapses into fee-only economics.

---

## Trust and Security

- **Open source protocol.** Every rule is auditable. Anyone can run a node, inspect the state, or validate the math.
- **No single point of control.** Not Quanvio, not any bank, not any government. The network is run by a distributed validator set.
- **Economic security.** Validators stake PEMRIX. Misbehavior is automatically slashed.
- **Crypto-agility.** If a cryptographic primitive is broken — by quantum computers or otherwise — the protocol can migrate without a ledger fracture.
- **Deterministic finality.** Once >⅔ of validators agree, a block is final. It cannot be silently reversed.
- **Audits planned.** External security review, fuzzing, and bug bounties before mainnet.

Report vulnerabilities privately to `security@pemrix.com`.

---

## Open Source Is Non-Negotiable for Money

For a normal app, open source is a choice. For a blockchain that settles value, it is a requirement.

PEMRIX moves money, assets, and machine-owned value across a global network with no bank to call and no company to reverse a transaction. If the protocol were closed, users would have to trust a black box with their wealth. That is unacceptable for a system designed to outlive any company or country.

Open source makes PEMRIX:

- **Auditable** — anyone can inspect consensus, cryptography, and economics.
- **Verifiable** — validators run the exact same code and compute identical state.
- **Fork-resistant by design** — if governance ever fails, the community can continue the protocol without permission.
- **Academically reviewable** — cryptographers and security researchers can find bugs before attackers do.

Open source does not make PEMRIX easy to copy. The live network is defended by economic security, adoption, liquidity, and years of operational trust. The code is transparent; the network effect is the asset.

---

## Repository Structure

```
pemrix/
├── crates/          # Core Rust libraries (consensus, crypto, VM, RPC, SDK)
├── node/            # Validator / full-node binary
├── sdks/            # Client SDKs (Go, Python, TypeScript)
├── docs/            # Architecture, API, developer, and validator docs
├── systemd/         # systemd unit files for validators
├── scripts/         # Validator setup helpers
├── pemrix-marketing/# Marketing site and public docs
└── proto/           # Protobuf definitions for gRPC
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/pemrix/pemrix.git
cd pemrix

# Build release binaries
cargo build --release

# Run tests
cargo test --workspace

# Initialize and start a local node
pemrix init --data-dir ./pemrix-data
pemrix start --data-dir ./pemrix-data
```

See [`docs/VALIDATORS.md`](docs/VALIDATORS.md) to run a validator.

---

## Documentation

- [`docs/API.md`](docs/API.md) — RPC and gRPC API reference.
- [`docs/DEVELOPERS.md`](docs/DEVELOPERS.md) — Build, test, and contribute.
- [`docs/VALIDATORS.md`](docs/VALIDATORS.md) — Run a validator or full node.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Full architecture and roadmap.

---

## Contributing

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before opening a pull request.

---

## License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
- MIT license ([LICENSE-MIT](LICENSE-MIT))

at your option.

---

<p align="center">Founded by <a href="https://github.com/debaranjan-pegu"><strong>Debaranjan Pegu</strong></a>.<br>Built for the long term by the PEMRIX community.</p>
