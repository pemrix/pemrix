# PEMRIX Founder Reality Check

Plain-English answers to the questions that keep coming up. Read this first, then read `PEMRIX_EXECUTIVE_QA_AND_REALITY.md` and `PEMRIX_VS_MARKET.md` for depth.

---

## 1. Is PEMRIX like Bitcoin, Ethereum, or Binance?

| System | What it really is | Who runs the servers | Supply cap | How you get value |
|--------|-------------------|----------------------|------------|-------------------|
| **Bitcoin** | Digital gold / store of value | ~20,000 public miners (proof-of-work) | 21 million BTC | Scarce, slow, expensive to move |
| **Ethereum** | Smart-contract computer | ~1 million validators staking ETH | No hard cap | Programmable apps, gas fees |
| **Binance Chain / BSC** | Fast exchange chain run by ~21 hand-picked validators | Binance-controlled set | Burns fees, no fixed cap | Centralized speed, low fees |
| **PEMRIX** | Payments + AI-agent settlement chain | Open validator set, BFT consensus (like Cosmos/Tendermint) | **1 billion PRX hard cap** | Fast finality, low fees, merchant/AI use |

**Key difference:**
- Bitcoin = mine with electricity + ASICs.
- Ethereum = stake ETH to validate.
- PEMRIX = validators run nodes, agree by voting (BFT). No mining, no massive staking lock-up.

---

## 2. Is PEMRIX like UPI, PhonePe, PayPal, Razorpay?

| System | Who controls it | Do users run servers? | Settlement speed | Can it be blocked? |
|--------|-----------------|-----------------------|------------------|------------------|
| **UPI** | NPCI (India) + banks | No | Instant | Yes, by government/bank |
| **PhonePe / GPay** | Private companies | No | Instant | Yes, app can be banned |
| **PayPal** | PayPal Inc. | No | Seconds–days | Yes, account frozen |
| **Razorpay** | Razorpay | No | Seconds | Yes, by regulator |
| **PEMRIX** | No single company | No for users, yes for validators | ~2–5 seconds | Harder to block because many validators |

**PEMRIX is the rails, not the app.**
- UPI is a national rail owned by NPCI.
- PEMRIX is a global rail owned by no one and run by validators.
- PhonePe/PayPal are apps *on top* of rails. PEMRIX will have wallets and merchant apps built on it.

---

## 3. Is PEMRIX a coin, a wallet, or real money?

All three, depending on who is using it:

1. **Coin / token:** PRX is the native asset on the PEMRIX blockchain.
2. **Wallet:** PEMRIX Wallet is an app that holds your PRX and keys.
3. **Real money value:** PRX has value when someone is willing to trade goods, services, or fiat for it.

**How does value come?**
- Scarcity: only 1 billion PRX ever.
- Utility: needed to pay network fees, settle merchant payments, run AI-agent contracts.
- Demand: more users and merchants = more people want PRX.
- Trading: listed on exchanges, people buy/sell for USD/INR/EUR.

At launch, the value starts at whatever the first willing buyer and seller agree on. There is no magic number.

---

## 4. Who validates transactions? Can they cheat?

**Validators** are companies, developers, or institutions that run PEMRIX server software.

- They receive transactions, group them into blocks, vote, and finalize them.
- They cannot cheat because:
  - Every block is cryptographically signed.
  - 2/3 of validators must agree.
  - Invalid transactions are rejected by the rules hard-coded in the software.
  - If a validator tries to print free PRX or rewrite history, the other validators reject it.

**Can one validator change the rules?** No. It requires a network-wide software upgrade accepted by the community.

**Can PEMRIX be hacked?** No system is 100% unhackable. PEMRIX uses:
- Ed25519 classical signatures today.
- Hybrid post-quantum signatures (Dilithium + Ed25519) as a configurable upgrade path.
- BFT consensus tolerates up to 1/3 malicious validators.

---

## 5. Can PRX be converted to USD, INR, EUR, etc.?

**Yes, through fiat partners and exchanges.**

PEMRIX Labs (Quanvio) does not have to become a bank. The model is:

1. **On-ramp:** User sends INR/USSD to a licensed fiat partner → partner mints PRX to user’s wallet.
2. **Off-ramp:** User sends PRX to a fiat partner → partner sends INR/USD/EUR to user’s bank account.
3. **Exchange:** Crypto exchanges list PRX trading pairs (PRX/USDT, PRX/INR, etc.).

**Does every country need approval?**
- To operate legally, yes. Each country has its own rules.
- The network itself cannot be shut down easily, but fiat partners inside a country can be regulated.
- A country could block local exchanges or fiat partners, but the blockchain keeps running globally.

---

## 6. Can a country block PEMRIX?

| What can be blocked | What is hard to block |
|---------------------|----------------------|
| Local fiat partners | The global validator network |
| Local app stores | Peer-to-peer PRX transfers |
| Local exchange access | The open-source code |
| Local DNS for websites | Wallet apps already downloaded |

If one country blocks PEMRIX, users in other countries keep using it.

---

## 7. How do I become a validator?

1. Get a server (cloud VPS or bare metal) meeting minimum specs.
2. Download the PEMRIX node binary from the official release.
3. Generate validator keys.
4. Stake the required PRX amount.
5. Join the validator set (governance vote for mainnet).
6. Keep the node online 24/7.

**Minimum realistic server:**
- 4 vCPU
- 8 GB RAM
- 200 GB SSD
- Stable internet, static IP preferred

**How do validators earn?**
- Transaction fees from blocks they help finalize.
- Block rewards from the inflation schedule (decays over time).

---

## 8. Is Quanvio the validator? How does Quanvio earn?

At the start, **yes, Quanvio runs the first validator** on server 3.

Over time, Quanvio should become one of many validators so the network is decentralized.

**How Quanvio earns:**
- Runs a validator and collects fees/rewards.
- Provides fiat on/off-ramp services.
- Builds wallet, merchant, and AI-agent products on top of PEMRIX.
- Consulting/enterprise node hosting.

Quanvio does **not** control the network just because it started it.

---

## 9. Why 1 billion PRX? Why not 1 trillion?

- **1 billion** keeps the supply scarce and the unit price meaningful.
- **18 decimal places** mean tiny payments are still possible (0.000000001 PRX).
- A smaller cap means each PRX is worth more if demand grows.
- A larger cap would make the price look cheap but does not create real value.

Think of it like shares in a company: 1 billion shares is a standard, liquid amount.

---

## 10. What is the technology core?

| Layer | Technology |
|-------|------------|
| Consensus | BFT (Byzantine Fault Tolerant) voting, like Cosmos/Tendermint |
| Networking | Custom TCP P2P with libp2p-style peer IDs |
| Cryptography | Ed25519 + optional hybrid Dilithium post-quantum |
| Storage | RocksDB persistent state |
| Smart contracts | Native VM (Rust-based) |
| RPC API | JSON-RPC over HTTP |
| Language | Rust |

---

## 11. Do users need a server? Do they need internet?

**Users do not run servers.** They use a wallet app.

**For a payment, both payer and payee need internet** at the moment of the transaction, because the wallet must reach a validator.

**Offline later?** You can show a QR code without internet, but the actual settlement needs a validator to see it.

---

## 12. What is one PRX worth?

Nobody knows at launch. Value is discovered by:

1. First exchange listing price.
2. Merchant acceptance.
3. Network usage (fees burned, demand).

It could start at $0.0001, $0.01, or any other price the market decides.

---

## 13. Summary of the game plan

1. Finish core Rust node, wallet SDK, and APIs.
2. Launch private testnet with Quanvio as first validator.
3. Invite trusted partners to run more validators.
4. List PRX on exchanges for fiat conversion.
5. Launch PEMRIX Pay and Wallet apps.
6. Open validator set gradually.
7. Upgrade cryptography to full hybrid post-quantum.

This is a multi-year project. There is no shortcut.
