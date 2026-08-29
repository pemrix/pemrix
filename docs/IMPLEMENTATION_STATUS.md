# PEMRIX Implementation Status

**Version:** 1.0  
**Date:** 2026-08-30  
**Purpose:** Honest mapping between public documentation claims and what is actually implemented in code today.

---

## How to Read This Document

- **Implemented** — Code exists, compiles, and is exercised in tests or live deployment.
- **Partial** — Core code exists but is a stub, optional feature, or not wired into the live node path.
- **Planned** — Design is documented, code skeleton may exist, but feature is not functional.
- **Not Started** — Mentioned in roadmap/docs only.

---

## Consensus & Networking

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Solo consensus | `docs/ARCHITECTURE.md` | `crates/pemrix-consensus/src/solo.rs` | Implemented | Used for local single-node testnet. |
| BFT consensus | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | `crates/pemrix-consensus/src/bft.rs` | Implemented | Multi-validator BFT with quorum, proposer rotation, votes. |
| TCP P2P transport | `docs/ARCHITECTURE.md` | `crates/pemrix-network/src/tcp.rs` | Implemented | Used by live validators `pegus-s1` and `pegus-s3`. |
| QUIC transport | `docs/ARCHITECTURE.md` | `crates/pemrix-network/src/quic.rs` | Planned | Skeleton exists; TCP is the active transport. |
| Mempool | `docs/ARCHITECTURE.md` | `crates/pemrix-consensus/src/mempool.rs` | Partial | Basic mempool exists; spam filtering and prioritization are minimal. |
| Validator set | `docs/ARCHITECTURE.md` | `crates/pemrix-consensus/src/validator_set.rs` | Implemented | Static/dynamic validator set support. |
| Re-broadcast of proposals/votes | `docs/ARCHITECTURE.md` roadmap | `node/pemrix-node/src/node.rs` | Implemented | Proposers re-broadcast until height finalizes. |

## RPC & APIs

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| REST RPC server | `docs/API.md`, `docs/ARCHITECTURE.md` | `crates/pemrix-rpc/src/server.rs` | Implemented | `/v1/status`, `/v1/blocks/:height`, `/v1/blocks/raw/:height`, `/v1/transactions`, `/v1/accounts/:address/balance`, `/v1/accounts/:address/nonce`. |
| gRPC server | `docs/API.md`, `docs/ARCHITECTURE.md` | `crates/pemrix-rpc/src/grpc.rs` | Partial | Implemented behind `grpc` feature flag; not enabled by default in validator binary. |
| Public RPC endpoints | `docs/ARCHITECTURE.md` | Live infra | Implemented | `https://rpc.pemrix.com` (validator) and `https://api.pemrix.com` (services proxy) are live. |

## Cryptography

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Ed25519 signatures | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | `crates/pemrix-crypto/src/classical.rs` | Implemented | Default account and validator signatures. |
| Signature abstraction | `docs/ARCHITECTURE.md` | `crates/pemrix-crypto/src/scheme.rs` | Implemented | Allows future algorithm swaps. |
| Hybrid classical+PQC signatures | `docs/ARCHITECTURE.md` | `crates/pemrix-crypto/src/hybrid.rs` | Partial | Skeleton exists; TODO for canonical encoding. Not default. |
| Post-quantum-only mode | `docs/ARCHITECTURE.md` | — | Planned | Design only; awaits standards maturity and governance. |

## Storage

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| In-memory state backend | `docs/ARCHITECTURE.md` | `crates/pemrix-storage/src/backend.rs` | Implemented | Used in tests and local runs. |
| RocksDB backend | `docs/ARCHITECTURE.md` | `crates/pemrix-storage/src/backend.rs` | Partial | Feature flag exists; not the default in current deployment. |
| State store (accounts/blocks) | `docs/ARCHITECTURE.md` | `crates/pemrix-storage/src/state.rs` | Implemented | Balances, nonces, blocks, transactions. |

## Execution / VM

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Native transfers | `docs/ARCHITECTURE.md` | `crates/pemrix-vm/src/native.rs` | Implemented | PEMRIX-to-PEMRIX transfers execute in consensus. |
| WASM VM | `docs/ARCHITECTURE.md`, `docs/PEMRIX_VS_MARKET.md` | `crates/pemrix-vm/src/wasm.rs` | Partial | wasmtime-based runner behind `wasm` feature. Runs simple contracts; no storage host functions yet. |
| Gas metering | `docs/ARCHITECTURE.md` | `crates/pemrix-vm/src/gas.rs` | Partial | Skeleton exists; not enforced on main path. |

## Services

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Faucet | `docs/ARCHITECTURE.md`, `docs/API.md` | `crates/pemrix-faucet/` | Implemented | Local testnet faucet with signed drip transactions. |
| Explorer API | `docs/ARCHITECTURE.md` | `crates/pemrix-explorer/` | Implemented | Ingests blocks, exposes state. |
| Webhooks | `docs/ARCHITECTURE.md` | `crates/pemrix-webhooks/` | Implemented | Block and transaction event triggers. |
| Shared services process | `docs/ARCHITECTURE.md` | `node/pemrix-node/src/services.rs` | Implemented | Runs faucet, explorer, webhooks, services RPC proxy. |
| Services RPC height sync | `docs/ARCHITECTURE.md` | `node/pemrix-node/src/services.rs` | Implemented | Polls validator raw block endpoint and updates proxy height. |
| Account balance sync in services | — | `node/pemrix-node/src/services.rs` | Implemented | Genesis allocations seeded; block transactions replayed into RpcState. |

## SDKs & Tooling

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Rust SDK | `docs/API.md`, `docs/ARCHITECTURE.md` | `crates/pemrix-sdk/src/` | Partial | HTTP client, faucet client, wallet, transaction builder exist. |
| TypeScript SDK | `docs/ARCHITECTURE.md` roadmap | `sdks/` | Planned / Stubs | Check `sdks/` directory for current state. |
| Go SDK | `docs/ARCHITECTURE.md` roadmap | `sdks/` | Planned / Stubs | Check `sdks/` directory for current state. |
| Python SDK | `docs/ARCHITECTURE.md` roadmap | `sdks/` | Planned / Stubs | Check `sdks/` directory for current state. |
| CLI (`pemrix`) | `docs/ARCHITECTURE.md` | `crates/pemrix-cli/` | Implemented | `init`, `start`, `keys`, `services`, `demo`. |

## Tokenomics

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Genesis allocation | `docs/ARCHITECTURE.md` | `node/pemrix-node/src/genesis.rs` | Implemented | Genesis block builder with allocations. |
| Issuance schedule | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | `crates/pemrix-primitives/src/tokenomics.rs` | Implemented | Bounded decaying rewards. |
| Transaction fee burn | `docs/ARCHITECTURE.md` | `crates/pemrix-vm/src/native.rs` | Implemented | Fee is deducted from sender and not credited anywhere (burned). |
| Block reward distribution | `docs/ARCHITECTURE.md` | `crates/pemrix-consensus/src/rewards.rs` | Implemented | Proposer bonus + commission-aware payout calculation. Not yet wired into block finalization. |
| Staking types | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | `crates/pemrix-primitives/src/staking.rs` | Implemented | ValidatorRecord, Delegation, ValidatorStatus. |
| Staking state machine | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | `crates/pemrix-vm/src/staking.rs`, `crates/pemrix-vm/src/block_executor.rs` | Implemented | Register/delegate/undelegate transactions execute on-chain; CLI commands and RPC query endpoints exist. |
| Slashing / jailing | `docs/VALIDATORS.md` | `crates/pemrix-consensus/src/slashing.rs` | Implemented | Misbehavior evidence, slash rates, jail durations, release logic. |

## Governance

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| On-chain governance | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | — | Planned | Design only. |
| Protocol constitution | `docs/ARCHITECTURE.md` | `private/PEMRIX_CONSTITUTION_AND_TOKENOMICS.md` | In Progress | Internal draft exists; not ratified. |
| Validator voting | `docs/ARCHITECTURE.md` | — | Planned | Design only. |

## Payments & Consumer Products

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Wallet app | `docs/ARCHITECTURE.md` | — | Not Started | Design / roadmap only. |
| QR payments | `docs/ARCHITECTURE.md`, `docs/PEMRIX_VS_MARKET.md` | — | Not Started | Design / roadmap only. |
| Merchant console | `docs/ARCHITECTURE.md` | — | Not Started | Design / roadmap only. |
| POS integration | `docs/ARCHITECTURE.md` | — | Not Started | Design / roadmap only. |
| Fiat on/off-ramp | `docs/ARCHITECTURE.md`, `docs/VALIDATORS.md` | — | Not Started | Requires licensed partners. |

## Security & Operations

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Formal verification spec | `docs/ARCHITECTURE.md` | — | Partial | Spec referenced; not yet proved. |
| Bug bounty program | `docs/ARCHITECTURE.md` | — | Not Started | Structure exists in old internal docs; not public. |
| External security audits | `docs/ARCHITECTURE.md` | — | Not Started | Planned before mainnet. |
| Incident response plan | `docs/ARCHITECTURE.md` | old internal docs | Planned | Not in public repo. |

## Deployment & Infrastructure

| Feature | Docs Claim | Code Location | Status | Notes |
|---|---|---|---|---|
| Validator install script | `docs/VALIDATORS.md` | `scripts/install-validator.sh` | Implemented | Downloads release binaries by default; `--build` compiles source. |
| systemd units | `docs/VALIDATORS.md` | `systemd/` | Implemented | `pemrix-validator.service`, `pemrix-services.service`. |
| Release workflow | `docs/VALIDATORS.md` | `.github/workflows/release.yml` | Implemented | Builds Linux x86_64 binaries on tags. |
| HTTPS public RPC | `docs/ARCHITECTURE.md` | Live NGINX + Certbot | Implemented | `https://rpc.pemrix.com`, `https://api.pemrix.com`. |
| Cloudflare DNS | — | Cloudflare zone | Implemented | `rpc.pemrix.com`, `api.pemrix.com`, `explorer.pemrix.com`, `faucet.pemrix.com`. |

---

## Biggest Gaps to Close Before Mainnet

1. **Block reward wiring** — calculate and apply rewards during block finalization.
2. **Validator set updates from staking** — on-chain registration must feed back into the BFT validator set.
3. **WASM host functions** — let contracts read/write state and call other contracts.
4. **Fiat on/off-ramp partnerships** — not a code problem; requires legal/commercial work.
5. **External security audits** — required before real value enters.
6. **Consumer wallet and merchant payment products** — not started.
7. **Governance module** — on-chain proposals and voting.

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-30 | Kimi Code / Quanvio Labs | Initial implementation-status audit |
| 1.2 | 2026-08-30 | Kimi Code / Quanvio Labs | Staking state machine implemented: raw storage, validator/delegation accessors, BlockExecutor, CLI, RPC, services sync |
