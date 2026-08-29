# PEMRIX Complete Architecture & Master Plan

**Version:** 1.0  
**Date:** 2026-08-28  
**Status:** Phase 4 Mainnet Genesis Started  
**Overall Completion:** ~46%

---

## 1. Vision Statement

PEMRIX is **The Open Network for Value**.

A global, decentralized, cryptographically secure, post-quantum-ready, AI-native value network that enables anyone — individual, merchant, developer, machine, or AI agent — to hold, transfer, settle, program, and exchange value without relying on a single company, country, or closed platform.

### 1.1 Thousand-Year Design Principle

PEMRIX is designed to outlive its founders, its first implementation language, its first cryptographic algorithms, its first consensus mechanism, and its first corporate sponsor. Every architectural decision is filtered through:

- **Survivability:** Can the protocol continue if any single entity disappears?
- **Evolvability:** Can the protocol upgrade cryptography, consensus, and execution without a hard social fracture?
- **Minimalism:** Is the core as small as possible while remaining secure?
- **Openness:** Can anyone build, validate, audit, or fork?
- **Neutrality:** Does the protocol favor no jurisdiction, no currency, no application?

---

## 2. Foundational Principles

| # | Principle | Meaning |
|---|---|---|
| 1 | **Tiny Core, Massive Periphery** | The blockchain node contains only consensus-critical code. Wallets, exchanges, AI, analytics, and payment products are external services. |
| 2 | **Crypto-Agility** | Cryptographic algorithms are replaceable. Classical → Hybrid → Post-Quantum → Future algorithms without protocol fracture. |
| 3 | **Protocol Agility** | Consensus, execution, and networking can be upgraded through on-chain governance with extraordinary safeguards for monetary changes. |
| 4 | **Permissionless Base, Regulated Interfaces** | The base layer is open. Fiat on/off-ramps, regulated payment services, and banking connectors operate through licensed partners. |
| 5 | **Determinism** | Every validator must compute identical state transitions from identical inputs. No undefined behavior in consensus. |
| 6 | **No Bloat in Consensus** | Explorers, search, analytics, AI inference, exchange matching, and payment gateways are never inside the validator. |
| 7 | **Security by Isolation** | Exchange custody, treasury, validator keys, and user keys live in separate security domains. |
| 8 | **Developer-First** | First-class SDKs, APIs, webhooks, sandbox, testnet, and documentation in multiple languages. |
| 9 | **AI-Native, Not AI-Bloated** | AI agents transact through policy wallets; the blockchain does not run LLMs. |
| 10 | **Independence from Quanvio Labs** | Quanvio Labs is the originator. The network eventually governs and sustains itself. |

---

## 3. Complete System Architecture

### 3.1 High-Level Layer Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│  PEMRIX Wallet │ PEMRIX Pay │ PEMRIX Merchant │ PEMRIX Exchange │ PEMRIX AI  │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SERVICE LAYER                                        │
│  Payments API │ Checkout │ POS │ QR/NFC │ Subscriptions │ On/Off-Ramp │ KYC  │
├─────────────────────────────────────────────────────────────────────────────┤
│                      DEVELOPER LAYER                                         │
│  SDKs (Rust/TS/Go/Python/Java/Swift/Kotlin/C#) │ gRPC │ REST │ Webhooks     │
├─────────────────────────────────────────────────────────────────────────────┤
│                         EXECUTION LAYER                                      │
│  WASM VM │ Native Transfers │ Smart Contracts │ Agent Policies │ Gas Metering│
├─────────────────────────────────────────────────────────────────────────────┤
│                         SETTLEMENT LAYER (L1)                                │
│  Blocks │ Consensus │ Mempool │ State │ Cryptography │ P2P Network │ RPC     │
├─────────────────────────────────────────────────────────────────────────────┤
│                         INFRASTRUCTURE LAYER                                 │
│  Validators │ Nodes │ RPC Gateways │ Indexers │ Explorers │ Archives         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 The Three Pillars

PEMRIX is three distinct things built on one shared ledger:

#### A. The Network — Bitcoin-like
- Own blockchain, native asset, validators, consensus.
- Cryptographic ownership. No bank required to move value.
- Global by default. Borders are irrelevant to the protocol.

#### B. Payments & Finance — UPI + PayPal + Stripe + Razorpay-like
- Wallet, QR, POS, checkout, payment links, invoices, subscriptions.
- Merchant settlement in native asset, stable asset, or fiat via regulated partners.
- User experience hides blockchain completely.

#### C. Application Ecosystem — Ethereum-like + AI-native
- Smart contracts (WASM), developer SDK/API, AI agents, machine payments.
- Autonomous commerce: agent-to-agent, machine-to-machine, IoT micropayments.

---

## 4. Product Portfolio

### 4.1 Product Hierarchy

| Layer | Product | Purpose | URL |
|---|---|---|---|
| Company | Quanvio Labs | Originator and first builder | quanvio.com |
| Network Brand | PEMRIX | Global value network | pemrix.com |
| Blockchain | PEMRIX Network | Distributed ledger and consensus | pemrix.com/network |
| Native Asset | [TICKER TBD] | Network money | — |
| Consumer Wallet | PEMRIX Wallet | PhonePe/PayPal-like app | wallet.pemrix.com |
| Payments | PEMRIX Pay | Merchant payment network | pay.pemrix.com |
| Merchant Console | PEMRIX Merchant | Razorpay/Stripe-like dashboard | merchant.pemrix.com |
| POS | PEMRIX POS | In-store payments | pos.pemrix.com |
| Checkout | PEMRIX Checkout | Web/app checkout | checkout.pemrix.com |
| Developer | PEMRIX Developer | Docs, APIs, SDKs | developers.pemrix.com |
| API | PEMRIX API | REST/gRPC endpoints | api.pemrix.com |
| SDK | PEMRIX SDK | Multi-language libraries | docs.pemrix.com/sdks |
| Connect | PEMRIX Connect | Integration platform | connect.pemrix.com |
| Exchange | PEMRIX Exchange | Trading platform | exchange.pemrix.com |
| Liquidity | PEMRIX Liquidity | Market making & OTC | liquidity.pemrix.com |
| Explorer | PEMRIX Explorer | Blockchain search | explorer.pemrix.com |
| Node Software | PEMRIX Node | Validator/node client | docs.pemrix.com/node |
| Validator Tools | PEMRIX Validator | Staking & validator ops | validators.pemrix.com |
| AI Platform | PEMRIX AI | Agent wallet infrastructure | ai.pemrix.com |
| Agent Wallet | PEMRIX Agent | AI-controlled policy wallet | — |
| Machine Economy | PEMRIX Machine | IoT/device payments | — |
| Security | PEMRIX PQ / Security | PQC & security portal | pemrix.com/security |
| Research | PEMRIX Labs | Experimental research | labs.pemrix.com |
| Governance | PEMRIX Governance | Proposals & voting | governance.pemrix.com |
| Foundation | PEMRIX Foundation | Future stewardship | foundation.pemrix.com |

### 4.2 Ecosystem Product Integrations

Existing Quanvio products become ecosystem applications, not dependencies:

- **QuanPOS** → PEMRIX POS integration
- **Qora** → Build on PEMRIX
- **Qprint** → Metadata/identity integrations
- **Qorvia** → Data/commerce layer
- **Pegus** → Stable asset / settlement infrastructure

Tagline for all: *“Built by Quanvio Labs. Powered by PEMRIX.”*

---

## 5. Technical Architecture

### 5.1 Core Implementation

| Component | Choice | Rationale |
|---|---|---|
| Core language | Rust | Memory safety, performance, determinism, no GC, strong crypto ecosystem |
| OS for validators | Linux (LTS) | Server-grade, long-term support, minimal attack surface |
| Developer OS | Linux / macOS / Windows / WASM | Broad accessibility |
| Mobile | Swift (iOS), Kotlin (Android) | Native OS security for money |
| Web frontend | Next.js + TypeScript + Tailwind | Presentation layer only; never inside consensus |
| Desktop wallet | Tauri + Rust | Lightweight, secure, native feel |

### 5.2 Node Architecture

A validator node contains exactly:

```
PEMRIX Node
│
├── P2P (QUIC)
├── Consensus (BFT + PoS)
├── Mempool
├── Execution (WASM VM + native transfers)
├── State (account balances, nonces, contracts)
├── Cryptography (classical + PQC, crypto-agile)
└── RPC (gRPC + JSON-RPC)
```

A validator node does **NOT** contain:
- Explorer
- Search/analytics
- Wallet UI
- AI inference
- Exchange matching
- Payment gateway
- Data warehouse

### 5.3 Networking

- Primary transport: **QUIC** over UDP.
- Benefits: encrypted by default, multiplexing, connection migration, modern congestion control, fast handshake, good mobile behavior.
- P2P sub-protocols: Gossip, Block propagation, Transaction propagation, Consensus messages.
- Future: support for TCP fallback and constrained environments.

### 5.4 Serialization

- **Consensus messages:** Compact canonical binary encoding. Strict determinism. No JSON in consensus.
- **External APIs:** Protobuf for gRPC, JSON for REST compatibility.
- **State storage:** Canonical key-value encoding.
- Goal: two independent implementations must produce byte-identical serialized consensus messages.

### 5.5 Cryptography

#### 5.5.1 Signature Architecture

```
SIGNATURE ABSTRACTION
        │
   ┌────┴────┐
   │         │
Classical   Post-Quantum
   │         │
Ed25519   ML-DSA / SLH-DSA
   │         │
   └────┬────┘
        │
   HYBRID BUNDLE
        │
   CRYPTO-AGILITY
```

#### 5.5.2 Phased Cryptographic Migration

| Era | Primary | Secondary | Status |
|---|---|---|---|
| Today | Ed25519 / secp256k1 | Optional ML-DSA | Development / early mainnet |
| Migration | Hybrid (Classical + ML-DSA) | Both required | Quantum threat assessment |
| Post-Quantum | ML-DSA or better | Classical deprecated | Standards mature |
| Future | PQC v2 / v3 | Algorithm agility | Continuous upgrade |

#### 5.5.3 Key Types

- **Account keys:** User signing keys (hybrid capable).
- **Validator keys:** Consensus signing keys, kept in HSM/secure enclave.
- **Node keys:** P2P identity keys.
- **Contract keys:** Deterministic contract-derived addresses.

### 5.6 Consensus

- **Type:** Byzantine Fault Tolerant (BFT) + Proof-of-Stake (PoS).
- **No mining:** PEMRIX does not use Proof-of-Work. There are no miners, ASICs, or hash puzzles. Validators stake tokens and produce blocks.
- **Finality:** Deterministic, seconds.
- **Throughput:** Benchmark-driven, not marketing-driven. Target 10,000+ sustained payment TPS initially.
- **Validator set:** Permissionless staking; hundreds to thousands of independent validators eventually.
- **Geographic distribution:** Required multi-region validator presence.
- **Upgrade path:** Solo → BFT single-region → multi-region BFT PoS.

### 5.7 Storage

| Store | Purpose | Location |
|---|---|---|
| Consensus state | Tiny, hot, validator-only | Embedded KV (RocksDB/MDBX/custom) |
| Historical archive | Full chain history | Separate archive nodes |
| Indexer | Searchable transactions/accounts | Indexer service |
| Analytics warehouse | Business intelligence | External data warehouse |
| Explorer DB | Optimized public queries | Explorer service |

### 5.8 Smart Contract VM

- **VM:** WebAssembly (WASM) based.
- **Languages:** Rust, C/C++, AssemblyScript, and other WASM-targeting languages.
- **Isolation:** VM runs outside consensus engine; consensus only verifies state roots.
- **Gas:** Metered execution with deterministic gas costs.

### 5.9 API Stack

| Layer | Protocol | Use Case |
|---|---|---|
| Internal services | gRPC | High-performance inter-service |
| Public APIs | REST + JSON | Broad compatibility |
| Live updates | WebSocket | Real-time notifications |
| Application layer | GraphQL | Optional at indexer/explorer layer only |

---

## 6. Phase-Wise Roadmap & Completion Tracking

### How to Read This Section

- **Phase:** Logical grouping of work.
- **Target Completion:** Cumulative % of total vision.
- **Duration:** Estimated calendar time.
- **Milestones:** Concrete deliverables.
- **Dependencies:** What must be done first.
- **Success Criteria:** How we know it is done.
- **Current Status:** As of today.

### Overall Progress

```
[████░░░░░░░░░░░░░░] 42% — Testnet Scaffolding Complete
```

### Phase 0 — Foundation & Planning (0% → 5%)

**Duration:** 1–2 months  
**Theme:** Decide everything before building irreversible things.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 0.1 | Final brand name confirmed (PEMRIX) | ✅ Done | 15% |
| 0.2 | Legal trademark clearance (India + WIPO) | 🔄 In Progress | 10% |
| 0.3 | Native asset ticker selected and cleared | ⏳ Pending | 15% |
| 0.4 | Complete architecture document finalized | 🔄 This document | 20% |
| 0.5 | Technical committee & roles defined | ⏳ Pending | 10% |
| 0.6 | Open-source license chosen | ⏳ Pending | 10% |
| 0.7 | Domain & email architecture locked | ✅ Done | 10% |
| 0.8 | GitHub organization structure planned | ⏳ Pending | 10% |

**Dependencies:** None.  
**Success Criteria:** Architecture approved; legal clearance complete; team formed; license chosen.  
**Current Status:** 50% of phase 0 complete.

### Phase 1 — Core Protocol & Node Scaffolding (5% → 15%)

**Duration:** 3–4 months  
**Theme:** Build the tiny, correct core.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 1.1 | Cargo workspace + crate structure | ✅ Done | 10% |
| 1.2 | `pemrix-primitives`: blocks, txs, addresses, canonical encoding | ✅ Done | 15% |
| 1.3 | `pemrix-crypto`: signature abstraction + Ed25519 + hybrid bundle | ✅ Done | 15% |
| 1.4 | `pemrix-storage`: state store trait + in-memory + RocksDB backend | ✅ Done | 10% |
| 1.5 | `pemrix-network`: mock transport + QUIC interface | ✅ Done | 5% |
| 1.5b | `pemrix-network`: TCP gossip transport for BFT messages | ✅ Done | 5% |
| 1.6 | `pemrix-consensus`: solo engine + BFT interface | ✅ Done | 10% |
| 1.6b | `pemrix-consensus`: multi-validator BFT engine with quorum | ✅ Done | 5% |
| 1.7 | `pemrix-vm`: WASM VM stub + native execution | ✅ Done | 10% |
| 1.8 | `pemrix-rpc`: gRPC + JSON-RPC skeleton | ✅ Done | 10% |
| 1.9 | `pemrix-node` binary: init/start/status/keys | ✅ Done | 3% |
| 1.9b | `pemrix-node`: BFT validator mode with TCP peer connections | ✅ Done | 2% |

**Dependencies:** Phase 0.  
**Success Criteria:** `cargo test`, `cargo clippy`, `cargo build --release` pass; node binary runs locally.  
**Current Status:** 100% of phase 1 complete; multi-validator BFT consensus, TCP gossip transport, and BFT validator node mode (`pemrix-node start`) are implemented and validated end-to-end.

### Phase 2 — Developer Platform & Testnet (15% → 30%)

**Duration:** 4–6 months  
**Theme:** Let developers touch the network safely.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 2.1 | `pemrix-sdk` Rust core + mock clients | ✅ Done | 10% |
| 2.1b | `pemrix-sdk` TypeScript + Python + Go stubs | ✅ Done | 5% |
| 2.2 | Local testnet configuration (`pemrix testnet`), solo + multi-validator BFT | ✅ Done | 10% |
| 2.2b | Public testnet deployed | ⏳ Pending | 10% |
| 2.2c | Native testnet runner script (`scripts/run-testnet.sh`) | ✅ Done | 2% |
| 2.3 | Faucet and testnet explorer API | ✅ Done | 10% |
| 2.4 | Developer documentation portal skeleton | ✅ Done | 10% |
| 2.5 | Sandbox environment (`pemrix-sandbox`) | ✅ Done | 10% |
| 2.6 | REST API v1 stable | ✅ Done | 10% |
| 2.6b | gRPC API v1 stable | ✅ Done | 5% |
| 2.7 | Webhooks infrastructure | ✅ Done | 10% |
| 2.8 | Bug bounty structure and security docs | ✅ Done | 10% |
| 2.8b | Bug bounty program publicly launched | ⏳ Pending | 0% |

**Dependencies:** Phase 1.  
**Success Criteria:** External developer can create wallet, get test tokens, send transaction, query explorer within 15 minutes.  
**Current Status:** 100% of phase 2 scaffolding complete; `pemrix testnet` supports both solo and multi-validator BFT modes (`--validators N`) with shared RPC, faucet, explorer, and webhook services. Public testnet deployment and public bounty launch remain.

### Phase 3 — Security, Audits & Hardening (30% → 40%)

**Duration:** 3–4 months  
**Theme:** Prove the core is safe before real value enters.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 3.1 | External security audit: consensus + crypto | ⏳ Pending | 20% |
| 3.2 | External security audit: VM + RPC | ⏳ Pending | 15% |
| 3.3 | Formal verification of critical state transition | 🚧 In Progress — spec complete | 15% |
| 3.4 | Fuzzing infrastructure (`proptest` in `pemrix-primitives`) | ✅ Done | 10% |
| 3.5 | Validator operational security guide | ✅ Done | 10% |
| 3.6 | Incident response plan | ✅ Done | 10% |
| 3.7 | Key custody reference architecture | ✅ Done | 10% |
| 3.8 | Security portal public launch | ✅ Done | 10% |

**Dependencies:** Phase 2.  
**Success Criteria:** Two independent audit reports with no critical findings unresolved; fuzzing runs continuously.  
**Current Status:** 50% of phase 3 complete.

### Phase 4 — Mainnet Launch (40% → 50%)

**Duration:** 2–3 months  
**Theme:** Genesis.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 4.1 | Genesis validator selection | ⏳ Pending | 15% |
| 4.2 | Genesis allocation & token distribution plan | ✅ Done (TokenomicsConfig + issuance schedule) | 15% |
| 4.3 | Mainnet genesis block produced | ✅ Done (genesis builder) | 25% |
| 4.4 | Public RPC + explorer live | ⏳ Pending | 15% |
| 4.5 | Network monitoring & status page | ⏳ Pending | 10% |
| 4.6 | Foundation/DAO governance bootstrap | ⏳ Pending | 10% |
| 4.7 | Emergency upgrade procedures tested | ⏳ Pending | 10% |

**Dependencies:** Phase 3.  
**Success Criteria:** Mainnet blocks finalize continuously; 100+ independent validators; no critical incidents in first 30 days.  
**Current Status:** 25% of phase 4 complete.

### Phase 5 — Consumer Wallet & Payments (50% → 65%)

**Duration:** 6–9 months  
**Theme:** UPI-like experience on a global network.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 5.1 | PEMRIX Wallet iOS + Android | ⏳ Pending | 20% |
| 5.2 | PEMRIX Wallet web + desktop | ⏳ Pending | 10% |
| 5.3 | PEMRIX Pay merchant onboarding | ⏳ Pending | 15% |
| 5.4 | QR + payment links + checkout | ⏳ Pending | 15% |
| 5.5 | PEMRIX POS integrations (incl. QuanPOS) | ⏳ Pending | 15% |
| 5.6 | Subscriptions + invoices | ⏳ Pending | 10% |
| 5.7 | Refunds + disputes | ⏳ Pending | 10% |
| 5.8 | Fiat on/off-ramp partner integrations | ⏳ Pending | 5% |

**Dependencies:** Phase 4.  
**Success Criteria:** User can download wallet, scan QR, pay merchant in under 10 seconds.  
**Current Status:** 0% of phase 5 complete.

### Phase 6 — Developer Ecosystem & Enterprise (65% → 75%)

**Duration:** 6–9 months  
**Theme:** Thousands of integrations.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 6.1 | Full SDK suite (Rust, TS, Go, Python, Java, Swift, Kotlin, C#) | ⏳ Pending | 20% |
| 6.2 | E-commerce plugins (Shopify, WooCommerce, Magento) | ⏳ Pending | 15% |
| 6.3 | Enterprise treasury + multisig | ⏳ Pending | 15% |
| 6.4 | PEMRIX Connect marketplace | ⏳ Pending | 10% |
| 6.5 | Verifiable credentials / identity layer | ⏳ Pending | 10% |
| 6.6 | Grants + hackathons + university partnerships | ⏳ Pending | 10% |
| 6.7 | Compliance platform (KYC/KYB/AML) | ⏳ Pending | 10% |
| 6.8 | Status page + SLA commitments | ⏳ Pending | 10% |

**Dependencies:** Phase 5.  
**Success Criteria:** 100+ live integrations; enterprise treasury in production.  
**Current Status:** 0% of phase 6 complete.

### Phase 7 — Exchange & Liquidity (75% → 82%)

**Duration:** 6–12 months  
**Theme:** Price discovery and global convertibility.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 7.1 | Spot trading engine | ⏳ Pending | 20% |
| 7.2 | Convert/swap product | ⏳ Pending | 15% |
| 7.3 | Custody + wallet service separation | ⏳ Pending | 15% |
| 7.4 | Market maker partnerships | ⏳ Pending | 10% |
| 7.5 | Institutional OTC desk | ⏳ Pending | 10% |
| 7.6 | Regulatory licenses (where required) | ⏳ Pending | 15% |
| 7.7 | API for algorithmic traders | ⏳ Pending | 10% |
| 7.8 | Insurance / proof of reserves | ⏳ Pending | 5% |

**Dependencies:** Phase 6.  
**Success Criteria:** Regulated exchange operational; deep liquidity; proof of reserves public.  
**Current Status:** 0% of phase 7 complete.

### Phase 8 — AI & Machine Economy (82% → 90%)

**Duration:** 6–12 months  
**Theme:** Autonomous commerce.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 8.1 | PEMRIX Agent wallet + policy engine | ⏳ Pending | 20% |
| 8.2 | Agent identity + reputation | ⏳ Pending | 15% |
| 8.3 | Agent-to-agent payments | ⏳ Pending | 15% |
| 8.4 | Machine payments (IoT/EV/charging/APIs) | ⏳ Pending | 15% |
| 8.5 | Micropayment channel infrastructure | ⏳ Pending | 10% |
| 8.6 | AI developer platform + SDK | ⏳ Pending | 10% |
| 8.7 | Autonomous commerce pilots | ⏳ Pending | 10% |
| 8.8 | Agent audit / safety framework | ⏳ Pending | 5% |

**Dependencies:** Phase 7.  
**Success Criteria:** 10,000+ agent wallets; real machine-to-machine payments in production.  
**Current Status:** 0% of phase 8 complete.

### Phase 9 — Global Expansion & Decentralization (90% → 97%)

**Duration:** 2–5 years  
**Theme:** Become a global public good.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 9.1 | Multi-jurisdiction regulated payment partnerships | ⏳ Pending | 15% |
| 9.2 | Decentralized governance fully controlling protocol | ⏳ Pending | 20% |
| 9.3 | Multiple independent node implementations | ⏳ Pending | 15% |
| 9.4 | Regional RPC/edge node networks | ⏳ Pending | 10% |
| 9.5 | Quantum-resistant signatures become default | ⏳ Pending | 15% |
| 9.6 | PEMRIX Foundation fully operational | ⏳ Pending | 10% |
| 9.7 | Mass merchant adoption (1M+ merchants) | ⏳ Pending | 10% |
| 9.8 | Interoperability with major chains | ⏳ Pending | 5% |

**Dependencies:** Phase 8.  
**Success Criteria:** Network operates without Quanvio Labs involvement; global merchant coverage.  
**Current Status:** 0% of phase 9 complete.

### Phase 10 — Thousand-Year Sustainability (97% → 100%)

**Duration:** Ongoing / indefinite  
**Theme:** Outlive everything.

| # | Milestone | Status | % of Phase |
|---|---|---|---|
| 10.1 | Cryptographic algorithm migration procedures institutionalized | ⏳ Pending | 15% |
| 10.2 | Long-term archive + data preservation | ⏳ Pending | 15% |
| 10.3 | Self-funding treasury + public goods | ⏳ Pending | 15% |
| 10.4 | Protocol constitution ratified | ⏳ Pending | 15% |
| 10.5 | Education + standards body participation | ⏳ Pending | 10% |
| 10.6 | Catastrophe recovery tested | ⏳ Pending | 15% |
| 10.7 | Next-generation consensus research deployed | ⏳ Pending | 10% |
| 10.8 | Recognition as global public infrastructure | ⏳ Pending | 5% |

**Dependencies:** Phase 9.  
**Success Criteria:** Protocol continues to upgrade and operate autonomously for decades.  
**Current Status:** 0% of phase 10 complete.

### Cumulative Progress Dashboard

| Phase | Target % | Current % | Status |
|---|---|---|---|
| 0 — Foundation | 5% | 2.5% | In Progress |
| 1 — Core Protocol | 15% | 15% | Done |
| 2 — Testnet | 30% | 30% | Done (scaffolding) |
| 3 — Security | 40% | 5% | In Progress |
| 4 — Mainnet | 50% | ~6% | In Progress |
| 5 — Wallet/Payments | 65% | 0% | Not Started |
| 6 — Developer/Enterprise | 75% | 0% | Not Started |
| 7 — Exchange/Liquidity | 82% | 0% | Not Started |
| 8 — AI/Machine Economy | 90% | 0% | Not Started |
| 9 — Global Expansion | 97% | 0% | Not Started |
| 10 — Sustainability | 100% | 0% | Not Started |
| **TOTAL** | **100%** | **~42%** | **Phase 4 Mainnet Genesis Started** |


---

## 7. Governance & Tokenomics

### 7.1 Governance Layers

| Layer | Scope | Safeguard |
|---|---|---|
| Protocol parameters | Block size, fees, validator limits | Standard proposal + vote |
| Consensus upgrades | Algorithm changes | High quorum + long voting period |
| Execution upgrades | VM changes | High quorum + audit requirement |
| Cryptographic migration | Default signature scheme | Extraordinary safeguards |
| Monetary policy | Supply cap, issuance, burns | Constitution-level safeguards |

### 7.2 Governance Actors

- **Validators:** Vote directly; voting power proportional to stake (with caps to prevent centralization).
- **Delegators:** Delegate stake to validators; can override vote or switch validator.
- **Token holders:** Direct vote on constitutional amendments.
- **PEMRIX Foundation:** Stewardship, grants, ecosystem funding (no unilateral protocol power).

### 7.3 Monetary Policy Principles

PEMRIX does not copy Bitcoin's 21 million hard cap. A fixed 21M supply is poorly suited to a global payment network serving billions of users and machines. Instead, PEMRIX uses a predictable, algorithmically bounded issuance model with deflationary fee burning.

| Parameter | Policy |
|---|---|
| **Total supply** | No fixed hard cap; algorithmically bounded issuance |
| **Initial issuance** | Genesis allocation + validator/staking rewards |
| **Issuance curve** | Declining rewards over time (halving-like schedule) |
| **Transaction fees** | Split between validators and burn; burn creates deflationary pressure |
| **Staking rewards** | Come from issuance + fees; target moderate real yield |
| **Treasury** | Small percentage of fees/fundraising for public goods; governed transparently |

**Why this model:**
- Provides enough granularity for everyday payments and micropayments.
- Ensures long-term validator incentives without relying solely on fees.
- Creates scarcity through burn mechanics rather than an arbitrary hard cap.
- Allows 1000+ year sustainability without a predetermined end to rewards.

### 7.4 Validator Economics

| Parameter | Initial Target |
|---|---|
| Minimum stake | Set high enough to deter spam, low enough for diversity |
| Validator cap | None initially; target 100+ genesis, 1,000+ eventual |
| Commission | Validator-set, 0–100% |
| Slashing conditions | Double signing, downtime, equivocation |
| Unbonding period | 14–28 days |

### 7.5 Issuance Schedule

The issuance logic is implemented in `pemrix-primitives::tokenomics::TokenomicsConfig`.

| Parameter | Mainnet Default |
|---|---|
| Initial supply | 1,000,000,000 tokens |
| Initial block reward | 10 tokens per block |
| Decay interval | ~2,000,000 blocks (~4.6 years at 7.5s block time) |
| Decay factor | 10% reduction per interval (`9/10`) |
| Minimum block reward | 0.1 tokens per block |
| Hard cap | None — issuance decays asymptotically toward a finite ceiling |

The reward at any height is:

```
reward(height) = max(initial_reward * (9/10)^epochs, min_reward)
```

where `epochs = (height - 1) / decay_interval`.

This gives PEMRIX a **soft cap** — a calculable asymptotic maximum supply — while preserving perpetual validator rewards. Governance can adjust the parameters within constitution-defined bounds.

---

## 8. Compliance & Legal Framework

### 8.1 Regulatory Separation Model

```
┌─────────────────────────────────────────┐
│  Layer A — Open Blockchain Protocol     │ Permissionless, global
├─────────────────────────────────────────┤
│  Layer B — Crypto Wallet / Self-Custody │ User-controlled
├─────────────────────────────────────────┤
│  Layer C — Regulated Fiat Services      │ Licensed partners
├─────────────────────────────────────────┤
│  Layer D — Indian Payment Services      │ RBI authorization where required
├─────────────────────────────────────────┤
│  Layer E — Bank Connectivity            │ Banks / PSPs
└─────────────────────────────────────────┘
```

### 8.2 India-Specific Considerations

- **Payment Systems:** RBI authorization required under Payment and Settlement Systems Act for operating payment systems in India.
- **VDA Taxation:** Crypto-assets included in Virtual Digital Asset definition; tax compliance required.
- **Approach:** Never bypass RBI. Partner with licensed banks/PSPs for INR on/off-ramps.

### 8.3 Global Compliance Program

| Area | Mechanism |
|---|---|
| KYC/KYB | Regulated partners and identity providers |
| AML | Transaction monitoring, risk scoring |
| Sanctions | Screening against international lists |
| Travel Rule | FATF Travel Rule compliance for VASPs |
| Audit logs | Immutable, exportable records |
| Reporting | Regulatory reporting interfaces |

---

## 9. Security Architecture

### 9.1 Network Security

- BFT consensus tolerates up to 1/3 malicious validators.
- Geographically distributed validator set.
- Rate limiting, peer diversity, DDoS mitigation.
- Attack detection and automatic peer isolation.
- Independent implementations to avoid single-codebase catastrophic bugs.

### 9.1a Security Positioning vs. Bitcoin and Ethereum

PEMRIX is designed with stronger *future-proofing* tools than first-generation networks, but "more secure" is only proven by years of real-world operation.

| Dimension | Bitcoin / Ethereum today | PEMRIX design |
|---|---|---|
| **Consensus finality** | Probabilistic (wait for confirmations) | Deterministic BFT finality in seconds |
| **Quantum resistance** | ECDSA/secp256k1 vulnerable to Shor's algorithm | Crypto-agile: classical → hybrid → PQC-only |
| **Algorithm upgrade** | Difficult; requires social coordination | Designed for cryptographic migration via governance |
| **Client diversity** | One or few dominant implementations | Goal: multiple independent implementations |
| **Custody model** | Often combined domains | Strict separation: node ≠ exchange ≠ treasury |
| **Formal verification** | Limited | Formal verification of critical state transitions |

**Honest claim:** PEMRIX is designed to resist known future attacks, including quantum computer threats, and to upgrade cryptography without a protocol fracture. It is not guaranteed to be "unhackable." Security is a process measured by audits, bug bounties, formal verification, and time.

### 9.2 Wallet Security

| Feature | Implementation |
|---|---|
| Key storage | Secure enclave / keystore / HSM |
| Authentication | Passkeys / WebAuthn + biometric |
| Recovery | Social recovery + encrypted backups |
| 2FA | TOTP / hardware security keys |
| Multisig | N-of-M approvals |
| Spending limits | Configurable per wallet / agent |
| Transaction simulation | Show effects before signing |
| Anti-phishing | Domain verification + trusted contacts |

### 9.3 Exchange & Custody Security

- Exchange hot wallet ≠ node wallet ≠ company treasury.
- Multi-sig + HSM for hot wallets.
- Cold storage for majority of assets.
- Proof of reserves.
- Insurance where available.

### 9.4 Post-Quantum Security Roadmap

| Phase | Action |
|---|---|
| Now | Design crypto-agility into protocol |
| Testnet | Hybrid Ed25519 + ML-DSA available as option |
| Mainnet v1 | Classical default, hybrid opt-in |
| Mainnet v2 | Hybrid default |
| Future | PQC-only after standards and performance mature |

### 9.5 Security Operations

- Public bug bounty.
- Continuous external audits.
- Formal verification of state transition and consensus critical paths.
- Fuzzing infrastructure.
- Public incident transparency reports.
- Security Operations Center (SOC) for internal monitoring.

---

## 10. AI & Machine Economy

### 10.1 Design Rule

> The blockchain does not run LLMs. The blockchain authorizes AI agents to spend under policies.

### 10.2 Agent Wallet Architecture

```
AI Agent
   │
Agent Runtime (off-chain)
   │
Agent Wallet / Policy Engine
   │
   ├── Balance: 500
   ├── Daily limit: 100
   ├── Max transaction: 20
   ├── Approved merchants: X, Y, Z
   ├── Allowed categories: compute, data, APIs
   ├── Human approval required > 20
   └── Expiry: 30 days
   │
Payment Protocol
   │
Blockchain
```

### 10.3 Agent Capabilities

- Autonomous payments within policy.
- Agent-to-agent negotiation and settlement.
- Machine-to-machine payments (EV charging, compute, data).
- Escrow for disputed agent transactions.
- Delegation and revocation.

### 10.4 Micropayments

- Efficient small-value transactions.
- Payment channel or L2 support for high-frequency micro-transactions.
- Suitable for APIs, IoT, data streaming, compute.

---

## 11. Ecosystem Strategy

### 11.1 Quanvio Labs Position

```
                    QUANVIO LABS
                         │
                   Original Founder
                         │
                         ▼
                      PEMRIX
        ┌───────────────┼───────────────┐
        │               │               │
    Network           Pay             Exchange
        │               │               │
        └───────────────┼───────────────┘
                        │
                  OPEN ECOSYSTEM
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    QuanPOS          Qora            Pegus
    Qprint           Qorvia          (others)
```

### 11.2 Adoption Flywheel

1. Developers build on PEMRIX.
2. More apps create more utility.
3. More users need wallets.
4. More merchants accept payments.
5. More liquidity and exchange access.
6. More developers join.

### 11.3 Partnership Categories

- Banks & payment service providers (fiat on/off-ramps).
- Merchants & merchant aggregators.
- E-commerce platforms.
- Hardware wallet manufacturers.
- Security audit firms.
- Academic institutions.
- Standards bodies.

### 11.4 Grants & Public Goods

- PEMRIX Foundation grants for open-source tooling.
- Research grants for cryptography, consensus, quantum resistance.
- Education grants for documentation and courses.

---

## 12. Thousand-Year Design

### 12.1 Longevity Requirements

| Challenge | Strategy |
|---|---|
| Cryptographic obsolescence | Crypto-agility + algorithm migration procedures |
| Hardware obsolescence | Multiple implementations, portable languages |
| Software dependency rot | Minimal external dependencies; long-term supported libraries |
| Organizational disappearance | Open-source, foundation stewardship, decentralized governance |
| Social fracture | Protocol constitution + high-bar governance |
| Data preservation | Archive nodes + open data formats |
| Catastrophic events | Geographic distribution + recovery drills |

### 12.2 Protocol Constitution (Future)

A ratified document covering:
- Monetary policy invariants.
- Validator rights and responsibilities.
- Governance thresholds.
- User rights (censorship resistance, access).
- Amendment procedures.

### 12.3 Archive Strategy

- Canonical block format documented independently of code.
- Multiple archive implementations.
- Incentives for long-term archival nodes.
- Compatibility commitment: old blocks remain parseable forever.

---

## 13. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Trademark conflict | Medium | High | Complete clearance before public launch |
| 2 | Regulatory shutdown (India/global) | Medium | High | Separate base layer from regulated services; partner with licensed entities |
| 3 | Critical consensus bug | Low | Catastrophic | Audits, formal verification, fuzzing, multiple implementations |
| 4 | Quantum computer breaks classical crypto | Low (now) / High (future) | Catastrophic | Crypto-agility + PQC migration path |
| 5 | Validator centralization | Medium | High | Stake caps, geographic incentives, slashing |
| 6 | Exchange hack draining ecosystem | Medium | High | Separate custody, HSM, insurance, proof of reserves |
| 7 | Smart contract exploit | Medium | High | WASM sandbox, audits, formal verification, bug bounty |
| 8 | Loss of user keys | High | Medium | Recovery mechanisms, education, secure defaults |
| 9 | Dependency supply-chain attack | Medium | High | Pin dependencies, audit, vendoring critical libraries |
| 10 | Failure to achieve product-market fit | Medium | High | Focus on payments UX; iterate with real users |
| 11 | Quanvio Labs conflict of interest | Low | High | Clear separation; foundation governance |
| 12 | Network spam / DoS | Medium | Medium | Fees, rate limits, peer reputation |

---

## 14. Appendix

### 14.1 Naming Conventions

| Entity | Format | Example |
|---|---|---|
| Master brand | PEMRIX | PEMRIX |
| Product | PEMRIX [Name] | PEMRIX Wallet |
| Native asset | [TICKER] | TBD |
| Subdomain | [service].pemrix.com | wallet.pemrix.com |
| CLI command | pemrix [subcommand] | pemrix start |

### 14.2 Domain Architecture

| Category | Domains |
|---|---|
| Brand | pemrix.com |
| Public sections | /network, /technology, /security, /quantum, /about, /careers |
| Applications | wallet, pay, merchant, exchange, explorer, developers, status, governance, validators |
| Infrastructure | rpc, api, testnet, faucet |

### 14.3 Email Structure

- hello@pemrix.com
- support@pemrix.com
- security@pemrix.com
- developers@pemrix.com
- press@pemrix.com
- legal@pemrix.com
- partners@pemrix.com

### 14.4 GitHub Organization

```
github.com/pemrix
├── protocol
├── node
├── consensus
├── crypto
├── wallet
├── explorer
├── sdk
├── payments
├── developer
├── agent-sdk
├── mobile
├── docs
├── infrastructure
└── specifications
```

### 14.5 Success Metrics

| Category | Metric |
|---|---|
| Security | Zero critical unpatched vulnerabilities; audit pass |
| Decentralization | Number of independent validators; geographic distribution |
| Performance | Sustained TPS; finality time; node sync time |
| Adoption | Active wallets; merchant count; transaction volume |
| Developer | Number of apps; SDK downloads; API calls |
| Economic | Market cap; staking ratio; fee burn |
| Resilience | Uptime; successful upgrades; incident response time |

### 14.6 Related Documents

| Document | Purpose | Location |
|---|---|---|
| `PEMRIX_VS_MARKET.md` | Plain-language comparison of PEMRIX vs. Bitcoin, Ethereum, UPI, PayPal, Razorpay, Stripe, etc. | `docs/PEMRIX_VS_MARKET.md` |
| `PEMRIX_FAQ.md` | Answers to validator, fiat conversion, exchange, regulation, quantum, and source-code questions | `docs/PEMRIX_FAQ.md` |
| `API.md` | API and SDK surface for developers | `docs/API.md` |
| `DEVELOPERS.md` | Quick-start for building on PEMRIX | `docs/DEVELOPERS.md` |

### 14.7 Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-28 | Kimi Code / Quanvio Labs | Initial complete architecture and master plan |

---

## 15. Executive Summary

PEMRIX is designed as a **global, open, thousand-year value network** with three defining properties:

1. **Bitcoin-like base layer:** independent blockchain, native asset, validators, cryptographic ownership.
2. **UPI/PayPal/Stripe-like user experience:** simple wallet, QR payments, merchant tools, subscriptions.
3. **AI-native application layer:** policy wallets for agents, machine-to-machine payments, autonomous commerce.

The architecture enforces a **tiny consensus core** surrounded by **modular services and products**. It is **crypto-agile** and **protocol-agile** to survive future cryptographic and computational threats. It is **permissionless at the base** but connects to **regulated partners** for fiat services, ensuring compliance without sacrificing openness.

Quanvio Labs originates the network, but PEMRIX is architected to become independent through open-source development, foundation stewardship, and decentralized governance.

**Current state:** Phase 1 core protocol now includes a multi-validator BFT consensus engine, a real TCP gossip transport, a BFT validator node mode for `pemrix-node start`, and end-to-end integration tests proving four validators can finalize a block over localhost TCP. Phase 2 developer platform is active; `pemrix testnet` runs both solo consensus and multi-validator BFT consensus in a single process (`--validators N`), sharing RPC, faucet, explorer, and webhook services. The SDK now has a real HTTP client (`HttpClient`) and faucet client that talk to the testnet RPC and faucet endpoints, plus a `/v1/accounts/:address/nonce` endpoint. Phase 3 security hardening now includes Ed25519 signature verification in the native VM; every transaction must carry a valid public key and signature matching the sender address. The local testnet faucet uses a deterministic keypair derived from a fixed seed so its signed transactions pass verification. Phase 4 genesis block builder and tokenomics schedule (`TokenomicsConfig`) are implemented. A wallet-to-merchant QR payment demo (`pemrix demo`) is functional end-to-end. All PEMRIX service ports are in the valid 16-bit range (60001/60002/60101/60102/60103/60303). Overall ~46%. Validator onboarding, live infrastructure, public testnet, and mainnet launch remain.
**Immediate next step:** Harden consensus networking and begin public testnet deployment planning (Phase 2b / Phase 3).
