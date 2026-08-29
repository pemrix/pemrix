<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/logo-mark-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="logo/logo-mark-black.svg">
    <img alt="PEMRIX" src="logo/logo-mark-black.svg" width="96">
  </picture>
</p>

<h1 align="center">PEMRIX</h1>

<p align="center"><strong>Global settlement layer for payments, assets, and autonomous commerce.</strong></p>

<p align="center">
  <a href="https://github.com/pemrix/pemrix/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/pemrix/pemrix/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache%202.0%20%7C%20MIT-blue?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Rust-1.75+-orange.svg?style=flat-square" alt="Rust 1.75+">
  <img src="https://img.shields.io/badge/post--quantum-ready-purple?style=flat-square" alt="Post-quantum ready">
</p>

---

## What is PEMRIX?

PEMRIX is a permissionless value network: a blockchain designed from the ground up for real-world payments, programmable assets, and machine-to-machine commerce.

- **Payments first.** Shop QR codes, checkout links, subscriptions, and merchant settlement — with the simplicity of modern payment apps.
- **Self-custody by default.** Users hold their own keys. No company can freeze a wallet or reverse a finalized transaction.
- **Programmable value.** WASM smart contracts and policy wallets let developers and AI agents transact under rules.
- **Built to evolve.** Cryptography, consensus, and execution can upgrade through on-chain governance without forking the ledger.

> **Current status:** working local testnet. Mainnet readiness requires security audits, validator onboarding, and battle-testing at scale.

---

## How a Payment Works

1. A merchant shows a QR code from the PEMRIX Merchant app.
2. A customer scans it, confirms the amount, and taps **Pay**.
3. The wallet signs the transaction and broadcasts it to validators.
4. Validators verify the signature, balance, and nonce independently.
5. Once >⅔ of voting power agrees, the payment is final.
6. The merchant sees **Paid** — usually in seconds.

Internet is required, just like any digital payment. Under the hood it is a blockchain transaction; on the surface it feels like UPI, PhonePe, or Apple Pay.

---

## How PEMRIX Compares

| Dimension | Bitcoin | Ethereum | BNB Chain | Solana | **PEMRIX** |
|---|---|---|---|---|---|
| **Consensus** | Proof-of-Work | Proof-of-Stake | Proof-of-Stake (21 validators) | Proof-of-Stake + Proof-of-History | **BFT + Proof-of-Stake** |
| **Block time** | ~10 min | ~12 sec | ~3 sec | ~400 ms | **Target: sub-second** |
| **Finality** | ~60 min | ~12 min | ~3 sec | ~12 sec | **Deterministic, seconds** |
| **Smart-contract VM** | Limited Script | EVM / Solidity | EVM / Solidity | Solana VM / Rust | **WASM VM / Rust, C/C++** |
| **Default signatures** | ECDSA | ECDSA | ECDSA | Ed25519 | **Ed25519, PQC-migration ready** |
| **Supply model** | 21M hard cap | No hard cap | No hard cap | No hard cap | **1B initial, bounded issuance + burn** |
| **Primary use** | Store of value | DeFi, NFTs | Trading | High-speed apps | **Payments, settlement, AI commerce** |

| Dimension | UPI | PhonePe / GPay | PayPal | Razorpay / Stripe | **PEMRIX** |
|---|---|---|---|---|---|
| **Open network** | No | No | No | No | **Yes** |
| **Self-custody** | No (bank account) | No | No | No | **Yes (user owns keys)** |
| **Cross-border** | No (India only) | No | Limited | Limited | **Global by default** |
| **Programmable money** | No | No | No | No | **Yes (smart contracts)** |
| **Who controls it** | NPCI / RBI | Company | Company | Company | **Validator set + token-holder governance** |

PEMRIX is not a copy of any of the above. It borrows the openness of public blockchains and the convenience of payment apps, then adds crypto-agility and an AI-native application layer.

---

## Why Open Source?

The protocol is open source so that validators, developers, and security researchers can audit the rules, run their own nodes, and verify that the network behaves exactly as documented.

Open source does not mean "easy to copy." The real moat of a live network is:

- **Economic security** — the value staked to protect the ledger.
- **Adoption** — wallets, merchants, developers, and apps built on PEMRIX.
- **Liquidity** — exchanges and fiat on/off-ramp partners.
- **Trust over time** — years of reliable, auditable operation.
- **Closed-source products** — the PEMRIX Wallet, Merchant Console, and fiat bridges can remain proprietary products built on the open protocol.

The code is transparent. The network effect is the asset.

---

## Design Principles

| Principle | Meaning |
|---|---|
| **Tiny core, massive periphery** | Validators run only consensus-critical code. Wallets, exchanges, AI, and analytics live outside. |
| **Crypto-agility** | Classical → hybrid → post-quantum signatures via on-chain governance. |
| **Protocol agility** | Consensus, execution, and networking upgrade through governance with extraordinary safeguards. |
| **Permissionless base, regulated interfaces** | The base layer is open. Fiat on/off-ramps operate through licensed partners. |
| **Determinism** | Every validator computes identical state transitions from identical inputs. |
| **Developer-first** | First-class SDKs, APIs, webhooks, sandbox, testnet, and multi-language docs. |
| **AI-native, not AI-bloated** | AI agents transact through policy wallets; the blockchain does not run LLMs. |

---

## Technical Highlights

| Component | Choice |
|---|---|
| **Language** | Rust |
| **Consensus** | BFT + Proof-of-Stake (no mining) |
| **Networking** | QUIC |
| **Smart-contract VM** | WebAssembly |
| **Signatures** | Ed25519 today, crypto-agile migration to PQC |
| **Storage** | RocksDB / embedded KV |

### Performance Targets

| Metric | Target |
|---|---|
| Block time | **Sub-second under ideal network conditions** |
| Finality | **Deterministic, seconds** |
| Throughput | **10,000+ sustained payment TPS** |
| Validator hardware | Accessible cloud server or dedicated machine |

These are design targets, not current measured performance. The present implementation is a testnet and must be benchmarked and optimized before mainnet.

---

## Tokenomics

| Parameter | Value |
|---|---|
| Initial supply | 1,000,000,000 PEMRIX |
| Decimals | 9 |
| Initial block reward | 10 PEMRIX per block |
| Reward decay interval | 2,000,000 blocks (~4.6 years) |
| Decay rate | 10% reduction per interval |
| Minimum block reward | 0.1 PEMRIX per block |
| Asymptotic maximum supply | ~1,100,000,000 PEMRIX |

Supply is bounded and predictable. Small rewards continue indefinitely to keep validators incentivized, unlike a hard cap that eventually relies only on fees.

---

## Repository Structure

```
pemrix/
├── crates/          # Core Rust libraries (consensus, crypto, VM, RPC, SDK)
├── node/            # Validator / full-node binary
├── sdks/            # Client SDKs (Go, Python, TypeScript)
├── docs/            # Public API, developer, and validator docs
├── systemd/         # systemd unit files for validators
├── scripts/         # Validator setup helpers
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

---

## Security

- Consensus-critical code is minimal and deterministic.
- All transactions are cryptographically signed.
- Cryptographic primitives are crypto-agile for future upgrades.
- Dependencies are pinned and audited via `cargo-deny`.
- External security audits are planned before mainnet.

Report vulnerabilities privately to `security@pemrix.com`.

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

<p align="center">Founded by <a href="https://github.com/debaranjan-pegu">Debaranjan Pegu</a>. Built by the PEMRIX community.</p>
