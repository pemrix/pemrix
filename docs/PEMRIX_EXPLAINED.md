# PEMRIX Explained

**Version:** 1.0  
**Date:** 2026-08-30  
**Purpose:** Plain answers to the most common questions about what PEMRIX is, how it works, and how it compares to money, blockchains, and payment apps you already know.

---

## Is PEMRIX like Bitcoin, Ethereum, or Binance?

Yes and no.

| PEMRIX is like... | Because it has... |
|---|---|
| **Bitcoin / Ethereum** | A public blockchain, a native digital asset, self-custody wallets, and a validator network that secures the ledger. |
| **UPI / PhonePe / Google Pay** | Fast QR-code payments, simple wallets, and merchant settlement. |
| **PayPal / Razorpay / Stripe** | Developer APIs, checkout links, and merchant dashboards. |
| **None of the above** | Crypto-agile signatures, deterministic finality in seconds, and on-chain governance that can upgrade the protocol without forking. |

PEMRIX is not a copy. It combines the openness of public blockchains with the convenience of modern payment apps, then adds the ability to evolve as cryptography and consensus research advance.

---

## Do users need their own server?

No.

A user only needs a wallet app, just like UPI or PhonePe. The servers — called **validators** — are run by independent operators around the world. Your wallet connects to them over the internet.

Validators are the ones who store the blockchain, verify transactions, and agree on the state of the network. No single validator controls PEMRIX; they reach agreement through BFT consensus.

---

## What is the difference between PEMRIX and UPI / PhonePe / PayPal / Razorpay?

| Question | UPI / PhonePe / GPay | PayPal / Razorpay / Stripe | PEMRIX |
|---|---|---|---|
| Do I own the money? | No — your bank does. | No — the company holds it. | Yes — you hold your own keys. |
| Can it work globally? | Mostly India only. | Limited cross-border. | Global by default. |
| Can anyone build on it? | No. | No. | Yes — open protocol. |
| Can the network freeze my account? | Yes. | Yes. | No finalized transaction can be reversed by one party. |
| Is it programmable? | No. | Limited. | Yes — smart contracts. |
| How fast is finality? | Instant inside the network. | Seconds to days. | Deterministic, usually seconds. |

UPI moves rupees between bank accounts. PEMRIX moves **digital value** directly between users, merchants, developers, and machines — no bank required in the middle.

---

## What is 1 PEMRIX? Can it be 0.000001 PEMRIX?

PEMRIX is the native currency of the network. It is divisible, like a rupee is divisible into paise.

- 1 PEMRIX = 1,000,000,000 **nanopemrix** (9 decimals).
- You can send 0.000001 PEMRIX, just like you can send one satoshi of Bitcoin or one paise.

PEMRIX is used for:
- Paying transaction fees.
- Transferring value between wallets.
- Staking to run a validator or delegate to one.
- Powering smart contracts and machine-to-machine payments.

---

## Who are validators, and what do they validate?

Validators are independent server operators who run the PEMRIX node software. They:

1. Receive transactions from wallets and apps.
2. Verify signatures, balances, and nonces.
3. Agree on the order of transactions through BFT consensus.
4. Store the resulting blockchain state.
5. Earn block rewards and fees for honest participation.

A validator cannot change the rules. It can only follow them. If a validator tries to cheat, the other validators reject its messages.

---

## If there is no central server, how is PEMRIX controlled?

PEMRIX is controlled by three things working together:

1. **The protocol rules** — open-source code that every validator runs.
2. **The validator set** — the group of validators that must agree before any block is finalized.
3. **Token-holder governance** — future on-chain votes to change parameters, upgrade cryptography, or spend treasury funds.

No single company, country, or person can reverse a finalized transaction or unilaterally change the rules.

---

## Why is PEMRIX "seconds" if UPI is instant?

UPI is fast because one organization (NPCI) maintains a private ledger. PEMRIX is a public network where independent validators must agree. That agreement takes seconds, not milliseconds.

The trade-off is worth it for many use cases: PEMRIX works globally, requires no bank account, and no single party can freeze funds.

Research directions like parallel execution, optimized BFT, and faster networking can reduce finality further, but PEMRIX will always be a blockchain finality layer, not a private ledger.

---

## Is PEMRIX a coin, a wallet, or real money?

- **PEMRIX** is the name of the network and the native digital asset.
- A **PEMRIX wallet** is an app that holds your private keys and lets you send/receive PEMRIX.
- PEMRIX has value because people use it, stake it, accept it for payments, and trade it. It is not fiat currency issued by a government; it is a decentralized digital asset.

---

## Who decides the value of PEMRIX?

The market decides. Like Bitcoin or Ethereum, PEMRIX value comes from:

- Utility: fees, staking, payments, smart contracts.
- Adoption: wallets, merchants, developers, and apps built on PEMRIX.
- Scarcity: bounded issuance schedule (~1.1B maximum supply).
- Security: economic stake protecting the ledger.
- Liquidity: exchanges and fiat on/off-ramp partners.

---

## Can PEMRIX be converted into USD, INR, EUR, etc.?

Eventually, yes — through **fiat on/off-ramp partners**. These are licensed exchanges or payment services that let users buy PEMRIX with fiat currency or sell PEMRIX back to fiat.

PEMRIX itself does not issue fiat. It is a bridge: value moves on the PEMRIX ledger, and licensed partners handle the conversion to local currency.

---

## Can a country block PEMRIX?

A country can block websites, exchanges, or fiat ramps within its borders. It cannot shut down the PEMRIX blockchain itself, because validators are distributed around the world and there is no central server to seize.

This is the same reality as Bitcoin and Ethereum: networks are global, but local regulations apply to the businesses that interact with them.

---

## How does someone become a validator?

1. Set up a server meeting the minimum hardware requirements.
2. Install the PEMRIX validator binary or build from source.
3. Create or load a validator key.
4. Obtain enough PEMRIX to meet the minimum self-stake.
5. Submit a `RegisterValidator` transaction.
6. Keep the node online, synced, and honest.

In the current testnet, the requirements are modest. Before mainnet, exact hardware, stake, and operational requirements will be published in `docs/VALIDATORS.md` and ratified through governance.

---

## What do validators earn?

Validators earn:

- **Block rewards** — newly issued PEMRIX for producing and finalizing blocks.
- **Transaction fees** — fees paid by users for each transaction.
- **Delegation commission** — a share of rewards from users who delegate PEMRIX to the validator.

Rewards are calculated in the protocol and distributed automatically. Bad behavior results in **slashing** — losing part of the staked PEMRIX — or **jailing** — temporary removal from the validator set.

---

## How is PEMRIX quantum-safe?

Today PEMRIX uses Ed25519 signatures, which are not quantum-safe. The protocol is designed for a staged migration:

1. **Classical** — Ed25519 today.
2. **Hybrid** — classical + post-quantum signature in each transaction.
3. **Post-quantum only** — once standards and performance mature.

The upgrade happens through on-chain governance, without forking the ledger. This is what **crypto-agility** means.

**Honest framing:** No live blockchain is fully quantum-safe today. PEMRIX is designed to become quantum-resistant; it is not a claim that it already is.

---

## Can anyone change the PEMRIX source code?

The protocol code is open source so anyone can audit it. But changing the live network requires:

1. Writing and reviewing a code change.
2. Passing tests, audits, and community review.
3. Releasing new validator software.
4. Validators choosing to upgrade.
5. For protocol changes, passing on-chain governance.

Open source does not mean anyone can hack the network. It means the rules are transparent and verifiable.

---

## What keeps validators from cheating?

Three things:

1. **Economic stake** — validators must lock PEMRIX. Cheating causes slashing.
2. **BFT consensus** — more than one-third of validators would have to collude to break safety.
3. **Transparency** — all transactions and validator behavior are public and auditable.

The more independent validators participate, and the more value is staked, the more expensive and difficult attacks become.

---

## Does Quanvio / PEMRIX Labs control the network?

No. Quanvio Labs originated the software and runs some of the first validators, but the network is permissionless. Anyone can run a validator, build a wallet, or write a smart contract. Governance decisions are made by the validator set and token holders, not by one company.

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-30 | Kimi Code / Quanvio Labs | Initial plain-language explanation document |
