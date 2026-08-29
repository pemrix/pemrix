# PEMRIX Master Roadmap

**Version:** 1.0  
**Date:** 2026-08-29  
**Status:** In Development  
**Goal:** Launch a secure, decentralized PEMRIX network with Quanvio as the first validator, and bring all services live under `pemrix.com`.

---

## How to Read This Roadmap

This document is the single source of truth for what must be built, in what order, and how complete it is. It is divided into phases. Each phase must be finished and verified before the next phase starts. No phase is skipped. No compromise on security.

| Column | Meaning |
|---|---|
| **Phase** | Major milestone |
| **Goal** | What must be true when the phase is done |
| **Deliverables** | Concrete outputs |
| **Status** | Not started / In progress / Done |
| **% Complete** | Completion within this phase |

---

## Overall Progress

| Phase | Name | Status | Weight | Weighted Contribution |
|---|---|---|---|---|
| 0 | Foundation (Git, CI/CD, docs) | In progress | 5% | — |
| 1 | Core Protocol (consensus, execution, networking) | Done | 15% | 15% |
| 2 | Developer Platform (SDK, RPC, testnet, demos) | Done | 15% | 15% |
| 3 | Security & Hardening | In progress | 20% | 6% |
| 4 | Tokenomics & Genesis | Done | 10% | 10% |
| 5 | Validator Onboarding (Quanvio genesis validators) | Not started | 15% | 0% |
| 6 | Live Infrastructure (RPC, explorer, faucet, pemrix.com) | Not started | 10% | 0% |
| 7 | Public Testnet & Bug Bounty | Not started | 5% | 0% |
| 8 | Mainnet Launch | Not started | 5% | 0% |
| **Total** | | | **100%** | **~46%** |

---

## Phase 0: Foundation

**Goal:** The project is properly version-controlled, automatically tested, and documented so that every future change is traceable and reproducible.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 0.1 | Initialize Git repository | Pending | Local repo, ready for GitHub push |
| 0.2 | Initial commit of all current code and docs | Pending | One clean foundational commit |
| 0.3 | GitHub Actions CI/CD workflow | Pending | `cargo fmt`, `clippy`, `test` on every PR |
| 0.4 | Branch protection rules documented | Pending | `main` branch protected |
| 0.5 | Contributor guidelines | Done | `CONTRIBUTING.md` |
| 0.6 | Security policy | Done | `SECURITY.md` |
| 0.7 | Issue and PR templates | Pending | GitHub templates |

**Exit criteria:**
- `git log` shows a clean initial commit.
- CI passes on `main`.
- Any developer can clone, build, and run tests in one command.

---

## Phase 1: Core Protocol

**Goal:** The PEMRIX node can produce and finalize blocks, execute transfers, and synchronize state across validators.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 1.1 | Primitives (Address, Hash, Transaction, Block, Account) | Done | `crates/pemrix-primitives` |
| 1.2 | Cryptography (Ed25519, key generation, signatures) | Done | `crates/pemrix-crypto` |
| 1.3 | Storage abstraction | Done | `crates/pemrix-storage` |
| 1.4 | Native VM execution | Done | `crates/pemrix-vm` |
| 1.5 | Solo consensus engine | Done | `crates/pemrix-consensus` |
| 1.6 | Multi-validator BFT consensus over TCP | Done | `crates/pemrix-consensus` + `pemrix-network` |
| 1.7 | Node lifecycle (init, start, validator spawn) | Done | `node/pemrix-node` |
| 1.8 | End-to-end multi-validator integration test | Done | 4 validators finalize blocks over localhost |

**Exit criteria:**
- `cargo test` passes.
- `pemrix testnet --validators 4` produces finalized blocks.

---

## Phase 2: Developer Platform

**Goal:** Developers can build on PEMRIX using SDKs, APIs, and a local testnet.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 2.1 | HTTP RPC server | Done | `crates/pemrix-rpc` |
| 2.2 | Faucet service | Done | `crates/pemrix-faucet` |
| 2.3 | Explorer service | Done | `crates/pemrix-explorer` |
| 2.4 | Webhook service | Done | `crates/pemrix-webhooks` |
| 2.5 | Rust SDK with real HTTP client | Done | `crates/pemrix-sdk` |
| 2.6 | Wallet abstraction | Done | `pemrix_sdk::Wallet` |
| 2.7 | Local testnet orchestration | Done | `pemrix testnet --validators N` |
| 2.8 | Wallet-to-merchant payment demo | Done | `pemrix demo` |
| 2.9 | Developer quickstart docs | Done | `docs/DEVELOPERS.md` |

**Exit criteria:**
- A developer can run `pemrix testnet` and `pemrix demo` successfully.
- SDK can query balance, nonce, and send transactions over HTTP.

---

## Phase 3: Security & Hardening

**Goal:** The protocol and node are hardened against attacks, bugs, and future quantum computers.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 3.1 | Threat model document | Done | `docs/SECURITY/` |
| 3.2 | Fuzzing harness for primitives and VM | Partial | `pemrix-sandbox` exists, more fuzzing needed |
| 3.3 | Signature verification in transaction execution | Done | Ed25519 signature verified in NativeExecutor |
| 3.4 | Input validation and rate limiting on RPC | Not started | Limit request sizes, request rates |
| 3.5 | Slashing conditions implemented | Partial | Double-sign detection exists, slashing logic needed |
| 3.6 | Crypto-agility framework | Partial | Design in place, hybrid signatures not implemented |
| 3.7 | Post-quantum signature support (hybrid Ed25519 + ML-DSA) | Not started | Phase 3b |
| 3.8 | External security audit | Not started | Required before mainnet |
| 3.9 | Bug bounty program | Not started | Launch after public testnet |
| 3.10 | Validator key management guide (HSM, secure enclave) | Not started | Critical for genesis validators |

**Exit criteria:**
- All transactions are cryptographically verified.
- Fuzzing runs in CI.
- At least one external audit completed.
- Slashing conditions are enforced.

---

## Phase 4: Tokenomics & Genesis

**Goal:** The economic rules of PEMRIX are defined and the genesis block is ready.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 4.1 | Tokenomics configuration | Done | `TokenomicsConfig` in `pemrix-primitives` |
| 4.2 | Genesis allocation plan | Done | Documented in `ARCHITECTURE.md` |
| 4.3 | Genesis block builder | Done | `node/pemrix-node/src/genesis.rs` |
| 4.4 | Fee burn mechanics | Partial | Design in place, burn not yet enforced |
| 4.5 | Staking and delegation model | Partial | Basic design, contracts not implemented |

**Exit criteria:**
- Genesis block can be generated deterministically.
- Tokenomics parameters are ratified.

---

## Phase 5: Validator Onboarding

**Goal:** Quanvio and trusted partners can run the first validators securely, and the process is documented for future validators.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 5.1 | Validator hardware requirements | Not started | Publish minimum and recommended specs |
| 5.2 | Validator setup script | Not started | One-command install for Linux |
| 5.3 | Validator configuration generator | Not started | `pemrix-node init --validator` |
| 5.4 | Genesis validator key generation ceremony | Not started | Multi-party, offline where possible |
| 5.5 | Quanvio genesis validator deployment | Not started | First production-like nodes |
| 5.6 | Trusted partner validator onboarding | Not started | 10–50 launch validators |
| 5.7 | Validator monitoring and alerting | Not started | Prometheus/Grafana dashboards |
| 5.8 | Validator handbook | Not started | `docs/VALIDATORS.md` |
| 5.9 | Staking CLI | Not started | Register validator, delegate stake |
| 5.10 | Validator reward distribution | Not started | Automated payouts |

**Exit criteria:**
- At least 5 independent genesis validators are running.
- Anyone can follow the handbook to set up a node.
- Quanvio runs at least one validator.

---

## Phase 6: Live Infrastructure

**Goal:** Public-facing PEMRIX services are live under `pemrix.com`.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 6.1 | Domain and DNS setup (`pemrix.com`) | Not started | Already owned, needs configuration |
| 6.2 | Public RPC gateway cluster | Not started | Load-balanced, geographically distributed |
| 6.3 | Public explorer (`explorer.pemrix.com`) | Not started | Web UI + API |
| 6.4 | Public faucet (`faucet.pemrix.com`) | Not started | For testnet only |
| 6.5 | Status page (`status.pemrix.com`) | Not started | Uptime monitoring |
| 6.6 | Documentation site (`docs.pemrix.com`) | Not started | Rendered from repo docs |
| 6.7 | PEMRIX website (`pemrix.com`) | Not started | Marketing + technology overview |
| 6.8 | SSL/TLS, DDoS protection, WAF | Not started | Cloudflare or equivalent |
| 6.9 | Log aggregation and incident response | Not started | Centralized logging, runbooks |

**Exit criteria:**
- `https://pemrix.com` loads.
- `https://rpc.pemrix.com` serves valid RPC responses.
- Explorer shows live blocks.

---

## Phase 7: Public Testnet & Bug Bounty

**Goal:** The network is battle-tested by the public before mainnet.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 7.1 | Public testnet launch | Not started | Long-running, permissionless validators allowed |
| 7.2 | Testnet faucet and explorer public | Not started | Part of Phase 6 infrastructure |
| 7.3 | Bug bounty program launch | Not started | Immunefi or self-hosted |
| 7.4 | Load and stress testing | Not started | Target 10,000 TPS sustained |
| 7.5 | Community validator onboarding | Not started | Open validator registration |
| 7.6 | Governance test votes | Not started | Practice upgrades on testnet |

**Exit criteria:**
- Public testnet runs for at least 3 months without critical incidents.
- Bug bounty active with reported and fixed issues.
- Stress tests meet target TPS.

---

## Phase 8: Mainnet Launch

**Goal:** PEMRIX mainnet is live and sustainable.

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 8.1 | Mainnet genesis finalized | Not started | Ratified by validators and community |
| 8.2 | Mainnet validator set locked | Not started | Genesis validators ready |
| 8.3 | Mainnet genesis block produced | Not started | Coordinated launch |
| 8.4 | Exchange listings and fiat on-ramps | Not started | Partner integrations |
| 8.5 | Wallet and merchant app release | Not started | Mobile and desktop wallets |
| 8.6 | PEMRIX Foundation governance | Not started | Decentralized stewardship |
| 8.7 | Launch communications | Not started | Press, blog, social |

**Exit criteria:**
- Mainnet block 1 finalized.
- Multiple independent validators producing blocks.
- Wallets and exchanges operational.

---

## Current Priority Queue

The next three deliverables to work on, in order:

1. **Phase 0.1–0.3:** Initialize Git, commit, and add GitHub Actions CI.
2. **Phase 3.3:** Add signature verification to transaction execution.
3. **Phase 5.1–5.3:** Validator setup script and configuration generator.

After these, we move to live infrastructure (Phase 6) and public testnet (Phase 7).

---

## Tracking Rules

- This file is updated every time a phase deliverable is completed.
- No phase is marked done until all its exit criteria are met.
- Security phases (3, 7) cannot be skipped or shortened.
- All code changes must pass CI before merging.

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-29 | Kimi Code / Quanvio Labs | Initial master roadmap |
