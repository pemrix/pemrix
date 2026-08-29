# PEMRIX Frequently Asked Questions

**Version:** 1.5  
**Date:** 2026-08-29  
**Purpose:** Plain-language answers to the most common questions about PEMRIX, validators, regulation, trading, and security.

---

## 1. Can PEMRIX Be Converted into USD, INR, EUR, etc.?

**Yes, indirectly.** PEMRIX is a digital asset. It can be traded on cryptocurrency exchanges or through licensed on-ramp/off-ramp partners for fiat currency.

**How it works:**
1. You have 10 PEMRIX in your wallet.
2. You send it to an exchange or a licensed partner.
3. The exchange sells it and sends USD/INR/EUR to your bank account.
4. The reverse also works: deposit fiat → receive PEMRIX.

**Important:** This depends on:
- Whether an exchange or partner operates in your country.
- Whether your country's laws allow crypto trading.
- Whether banks are willing to process such transactions.

PEMRIX itself does not care about borders. The conversion layer depends on local businesses and regulations.

---

## 2. Will Countries Need to Approve PEMRIX?

**PEMRIX the protocol cannot be approved or disapproved** because it is open-source software running on computers worldwide. No one owns it.

However, **fiat on/off-ramp services** (exchanges, payment partners) usually need licenses:
- In India: RBI/SEBI/FIU-India registration may be required.
- In the US: MSB license, state money transmitter licenses.
- In the EU: MiCA compliance.
- In other countries: respective financial regulators.

So the **technology** is permissionless, but the **businesses connecting it to fiat money** must follow local laws.

---

## 3. Can a Country Block PEMRIX?

**A country can try, but it cannot fully stop the network.**

| What a Country Can Block | What It Cannot Block |
|---|---|
| Local exchanges and bank transfers to crypto platforms | The global PEMRIX blockchain running on validators outside that country |
| PEMRIX Wallet app downloads from local app stores | Wallet apps already installed on phones |
| Official websites | Open-source code and peer-to-peer downloads |
| Licensed fiat partners | Person-to-person trades of PEMRIX |

**Examples from real life:**
- China has banned crypto trading multiple times, yet Bitcoin and Ethereum still run globally.
- India has heavy crypto taxation, yet millions still hold crypto.

If a country blocks fiat on/off-ramps, PEMRIX becomes harder to use there, but the network itself continues elsewhere.

---

## 4. What About Trading PEMRIX?

PEMRIX can be traded on:
- **Centralized exchanges** (Binance, Coinbase, etc., if listed).
- **Decentralized exchanges (DEX)** built on PEMRIX smart contracts.
- **OTC desks** for large trades.
- **P2P platforms** where buyers and sellers meet directly.

Trading price is set by supply and demand, just like Bitcoin or stocks.

---

## 5. How Difficult Is It to Set Up a Validator?

**Not extremely difficult for a technical person, but not as easy as installing an app.**

### Minimum Requirements (estimated, not finalized)

| Component | Minimum | Recommended |
|---|---|---|
| **Server** | Cloud VPS or dedicated machine | Dedicated server or high-end cloud instance |
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 16 GB | 32+ GB |
| **Storage** | 500 GB SSD | 1+ TB NVMe SSD |
| **Network** | 100 Mbps symmetric, low latency | 1 Gbps, redundant connection |
| **Uptime** | 95% | 99.9% |
| **OS** | Linux (Ubuntu LTS recommended) | Linux |

### Skills Needed
- Basic Linux server administration.
- Understanding of networking and security.
- Ability to monitor uptime and respond to alerts.
- Not required: advanced cryptography or blockchain PhD.

### Setup Steps (simplified)
1. Rent a server.
2. Install Linux and dependencies.
3. Download and compile `pemrix-node` from the official PEMRIX GitHub repository.
4. Generate validator keys securely.
5. Acquire the minimum stake in PEMRIX.
6. Register as a validator on-chain.
7. Keep the node online and updated.

---

## 6. How Much Stake Is Required?

**Not finalized.** The exact minimum stake will be decided before mainnet launch and published in the genesis parameters.

### Design Principles
- High enough to prevent spam validators.
- Low enough to allow hundreds of independent validators.
- May be adjusted by governance over time.

### Example Ranges (for Reference Only)

| Network | Minimum Stake | Approximate Fiat Value (rough, varies) |
|---|---|---|
| **Ethereum** | 32 ETH | ~$100,000+ |
| **Cosmos (ATOM)** | 1 ATOM historically, now varies | Varies |
| **Polygon** | No fixed minimum | Varies |
| **PEMRIX (target)** | Not decided | Likely designed to be accessible but meaningful |

### How the Stake Amount Might Be Set
PEMRIX may use one of these approaches:
1. **Fixed minimum:** e.g., 10,000 PEMRIX.
2. **Dynamic minimum:** adjusts based on total staked amount.
3. **Delegation-friendly:** allow users to pool stake with a validator.

The goal is to balance security with decentralization.

---

## 6a. What Is a Fiat Partner or Exchange? Give Examples.

A **fiat partner** is a licensed business that converts crypto to traditional money (fiat) and vice versa.

### Examples by Type

| Type | Examples | What They Do |
|---|---|---|
| **Centralized exchange (global)** | Coinbase, Binance, Kraken | Buy/sell PEMRIX for USD, EUR, etc. |
| **India-focused exchange** | CoinDCX, WazirX, ZebPay | INR to crypto and back |
| **Payment processor** | MoonPay, Transak, Onramper | Simple buy/sell widget in apps |
| **OTC desk** | Galaxy Digital, Genesis (institutional) | Large trades without moving market price |

### Is PEMRIX Itself an Exchange?
**No.** PEMRIX is a blockchain protocol. It does not hold user deposits or execute trades. Exchanges are separate businesses built on top of PEMRIX or that list PEMRIX for trading.

### Is Quanvio Labs an Exchange?
**No.** Quanvio Labs is the originator and builder of PEMRIX technology. A future product called **PEMRIX Exchange** may be built, but it would be a separate regulated entity, not the protocol itself.

---

## 6b. If the Source Code Is Public, Can Anyone Modify PEMRIX and Hack It?

**No. This is the most important misunderstanding.**

### Anyone Can Modify *Their Own Copy*

Because PEMRIX is open-source, anyone can:
- Download the code.
- Change it on their own computer.
- Run their own modified version.

**But that only affects their own computer.** It does not change PEMRIX for everyone else.

### The Network Runs on Consensus, Not One Copy

PEMRIX is not one program running on one server. It is thousands of validators running the same rules. For a block to be accepted, **>2/3 of validators must agree** it follows the rules.

### What Happens If Someone Modifies Their Node to Cheat?

Suppose a validator changes their code to say:
> "Give me 1 million free PEMRIX."

They broadcast this block to other validators. Other validators run the **real** rules and check:
- Did this PEMRIX come from a valid transaction?
- Does the block follow the protocol?

The answer is **no**. So they **reject** the block. The cheating validator loses rewards and may be slashed.

### Real-World Analogy

Imagine someone prints their own fake ₹500 notes at home. They can print as many as they want, but no shop will accept them because the shop checks against the real RBI rules.

Modifying PEMRIX code is like printing fake notes. Running it on your own computer does nothing unless the rest of the network agrees — and the network will not agree if you break the rules.

### Why Open Source Is Actually Safer

| Closed Source | Open Source |
|---|---|
| Only the company knows how it works | Everyone can audit and verify |
| One hack can be hidden for years | Bugs are found faster by the community |
| Users must trust the company | Users verify the code themselves |
| Company can change rules secretly | Rule changes are public and must be agreed by validators |

Bitcoin and Ethereum are open-source. They have not been hacked at the protocol level for 15+ years and 10+ years respectively.

### What *Would* Be a Real Hack?

A real hack would require one of these:

1. **Breaking the cryptography** — finding a way to forge signatures or crack private keys.
2. **Controlling >2/3 of validators** — economically extremely expensive.
3. **A bug in the code** that all validators run — this is why audits, fuzzing, and bug bounties matter.

Just editing code on your laptop is none of the above.

---

## 6b1. Why Is the Initial Supply 1 Billion Tokens? Is That a Hard Cap?

**1 billion is the initial supply, not a hard cap.** New tokens continue to be created as block rewards, but the rate keeps decreasing forever.

### The Actual Numbers

From `crates/pemrix-primitives/src/tokenomics.rs`:

| Parameter | Value |
|---|---|
| Initial supply | 1,000,000,000 PEMRIX |
| Initial block reward | 10 PEMRIX per block |
| Reward decay interval | 2,000,000 blocks (~4.6 years) |
| Decay rate | 10% reduction per interval |
| Minimum block reward | 0.1 PEMRIX per block |
| **Asymptotic maximum supply** | ~1,100,000,000 PEMRIX |

So the total supply slowly grows from 1 billion toward roughly **1.1 billion** over many decades. It never truly reaches 1.1 billion, but it gets very close.

### Why 1 Billion?

1. **Psychological simplicity.** People understand "1 billion" more easily than weird numbers like 21 million or 1 trillion.
2. **Enough granularity.** With 9 decimal places, 1 PEMRIX can be split into 1,000,000,000 tiny units. So even if 1 PEMRIX becomes valuable, small payments are still possible.
3. **Scarcity without starvation.** 1 billion is scarce enough to create value from demand, but large enough that billions of users and machines can transact.
4. **Comparison:**

| Asset | Supply Model | Total Supply |
|---|---|---|
| Bitcoin | Hard cap | 21 million |
| Ethereum | No cap, burn reduces supply | ~120 million and growing |
| Solana | No hard cap | ~580 million and growing |
| PEMRIX | Soft cap (asymptotic max) | ~1.1 billion |

### Why Not a Hard Cap Like Bitcoin?

Bitcoin's 21 million cap works for a store of value, but it is poorly suited for a global payment network:

- Once all Bitcoin is mined, miners depend only on fees. If fees are too low, security drops.
- With only 21 million units, each unit becomes very valuable, making small-price goods awkward to price.
- A global payment network serving billions needs perpetual incentives for validators.

PEMRIX solves this with a **soft cap**: supply is bounded and predictable, but small rewards continue forever to keep validators incentivized.

### Can the Supply Be Changed?

**Before mainnet:** Yes, the genesis parameters can be adjusted based on market design, community feedback, and economics review.

**After mainnet:** Supply parameters can only be changed through **on-chain governance** with high thresholds. They are not controlled by Quanvio Labs alone.

---

### Why Not 1 Trillion Tokens?

A trillion tokens is technically possible, but it creates practical problems:

| Issue | Why It Matters |
|---|---|
| **Low unit price perception** | If total supply is huge, each PEMRIX may be worth a tiny fraction of a cent. People trust and understand prices like "1 PEMRIX = ₹10" better than "1 PEMRIX = ₹0.00001". |
| **Psychological adoption** | A low unit price can make the asset feel like a joke token or unstable micro-currency, even if the market cap is large. |
| **Pricing goods** | Merchants prefer clean prices. "0.0002 PEMRIX for tea" is awkward compared to "2 PEMRIX for tea". |
| **Scarcity signal** | Scarce supply creates long-term holding demand. Oversupply can dilute value. |
| **Exchange listings** | Many exchanges prefer assets with reasonable supply and decimal precision. |

With 9 decimals, 1 billion PEMRIX already gives **1 billion × 1 billion = 10^18** tiny units. That is more than enough for global micropayments.

**However**, 1 billion is not sacred. It can be changed before mainnet based on market design, tokenomics modeling, and community feedback.

---

### Who Can Change the Supply After Mainnet?

**Not Quanvio Labs alone.** After mainnet, the protocol is controlled by **on-chain governance**.

### How Governance Works

| Action | Required Approval |
|---|---|
| Normal protocol upgrade | Majority of validators + token holders |
| Major change (e.g., supply formula) | Super-majority, e.g., 2/3 of validators and majority of voting stake |
| Constitutional change | Even higher bar, possibly universal agreement or long lock-up periods |

### Participants in Governance

| Participant | Role |
|---|---|
| **Validators** | Vote with their staked PEMRIX. More stake = more voting power, but caps prevent centralization. |
| **Token holders** | Can vote directly or delegate to validators. |
| **Developers** | Propose code changes, but cannot force them through. |
| **Quanvio Labs** | One participant among many. No special override key. |

### 1000+ Year View

PEMRIX is designed to outlive Quanvio Labs. Over time:

1. **Governance becomes more decentralized** — Quanvio's voting share shrinks.
2. **Crypto-agility** lets the network upgrade cryptography without fracture.
3. **Perpetual validator rewards** keep the network secure even 1,000 years from now.
4. **Constitution and invariants** protect core properties like supply bounds and user rights.
5. **Multiple independent implementations** ensure no single codebase controls the network.

**Honest limit:** No governance system is perfect. If someday 2/3 of validators collude, they could change the rules. This is why decentralization and wide stake distribution are critical from day one.

---

## 6c. Should Quanvio Labs Run Validators at Launch?

**Yes, at first, but only as one of many.**

At mainnet launch, Quanvio Labs should run some validators to ensure the network is stable and reliable. But the long-term goal is to have hundreds or thousands of **independent** validators.

If Quanvio controls most validators forever, PEMRIX becomes centralized. The whole design is built to avoid that.

**Launch plan:**
1. **Genesis validators:** A small set of trusted launch validators, including Quanvio Labs and early partners.
2. **Permissionless growth:** Anyone who meets the stake and hardware requirements can join.
3. **Decentralization target:** 100+ independent validators at genesis, growing to 1,000+ over time.

Quanvio's influence should decrease over time, not increase.

---

## 6d. How Does Quanvio Labs Earn Money If PEMRIX Is Open and Decentralized?

Quanvio Labs does **not** earn money by secretly controlling the network. Instead, it earns by building products and services **on top** of PEMRIX, just like any other company in the ecosystem.

### Possible Revenue Streams for Quanvio Labs

| Revenue Source | What It Means | Example |
|---|---|---|
| **PEMRIX Wallet** | A user-friendly wallet app | Revenue from optional premium features, card fees, or partner integrations |
| **PEMRIX Pay / Merchant Services** | Payment processing for shops | Small merchant service fee, similar to Razorpay/Stripe |
| **PEMRIX Exchange** | A regulated exchange listing PEMRIX | Trading fees |
| **Developer SDK / API** | Paid API plans for high-volume developers | Subscription or per-call fees |
| **Enterprise consulting** | Helping businesses integrate PEMRIX | Service fees |
| **Validator rewards** | Quanvio-run validators earn rewards same as anyone else | Block rewards + fees proportional to stake |

### Important Principle

Quanvio Labs should **not** depend on validator rewards as its main business. Validator rewards go to whoever stakes and runs a node. If Quanvio wants rewards, it must stake and run nodes like everyone else.

The business value comes from user adoption, merchant adoption, and developer adoption — not from controlling the protocol.

---

## 6e. How Much Can Quanvio Labs Earn?

**No fixed number. It depends entirely on adoption.**

Examples from the market:

| Company | Model | Scale |
|---|---|---|
| **Coinbase** | Exchange + wallet fees | Billions of USD per year |
| **Stripe** | Merchant payment processing | Billions of USD per year |
| **PhonePe / Google Pay** | Payment apps + merchant services | Large revenue in India |
| **Ethereum Foundation** | Grants + ecosystem support | Non-profit, funded by early holdings |

For PEMRIX, possible earnings depend on:
- How many users download the wallet.
- How many merchants accept PEMRIX Pay.
- How many developers build apps.
- How much trading volume the exchange handles.

**Honest answer:** At launch, revenue may be zero or small. If PEMRIX grows into a global payment network, revenue can be significant. There is no guarantee.

---

## 6f. How Does a Validator Earn Money?

Validators earn from two sources:

### 1. Block Rewards

New PEMRIX tokens are created with each block and given to the validator that produces the block. The current planned parameters are:

| Parameter | Value |
|---|---|
| Initial block reward | 10 PEMRIX per block |
| Block time target | ~7.5 seconds |
| Reward decay interval | 2,000,000 blocks (~4.6 years) |
| Decay rate | 10% reduction per interval (multiply by 9/10) |
| Minimum block reward | 0.1 PEMRIX per block |

**Example calculation at launch:**

```
10 PEMRIX/block × ~4,608 blocks/day = ~46,080 PEMRIX/day
```

This reward is split among all validators proportional to their stake and participation.

### 2. Transaction Fees

Users pay a small fee to send transactions. Part of the fee goes to validators, and part may be burned.

**Example:**
- User sends 5 PEMRIX and pays 0.001 PEMRIX fee.
- Most of that fee goes to the validator who includes the transaction in a block.

### Validator Commission

If users delegate their stake to a validator, the validator may charge a commission (e.g., 5-10%) on the rewards earned by that delegated stake.

**Example:**
- You delegate 1,000 PEMRIX to Validator X.
- Validator X earns 100 PEMRIX in rewards on your stake.
- Validator X keeps 5 PEMRIX (5% commission) and gives you 95 PEMRIX.

### How Much Can One Validator Earn?

It depends on:
- Total staked PEMRIX in the network.
- The validator's own stake.
- Amount delegated to the validator.
- Network transaction volume.
- Commission rate.

**Rough example (hypothetical, not a prediction):**

| Scenario | Daily Validator Earnings |
|---|---|
| Small validator with 0.1% of total stake, low network usage | A few PEMRIX per day |
| Medium validator with 1% of total stake, moderate usage | Tens to hundreds of PEMRIX per day |
| Large validator with 5% of total stake, high usage | Thousands of PEMRIX per day |

The actual fiat value (INR/USD) depends on the market price of PEMRIX, which is set by supply and demand on exchanges.

---

## 7. Who Assigns Validators?

**No one assigns validators.**

Anyone who meets the technical and staking requirements can become a validator. This is the meaning of **permissionless**.

However, at launch, the genesis validator set may be pre-selected from trusted early partners to ensure stability. After launch, new validators can join permissionlessly by staking.

---

## 7a. Can Anyone Become a Validator? Is It Secure?

**Yes, anyone can become a validator, but security depends on design, not trust.**

A permissionless validator set is secure because:

1. **Economic stake:** Validators must lock up PEMRIX as collateral. Cheating means losing money.
2. **BFT consensus:** A block only finalizes if >2/3 of validators agree. One bad actor cannot change history.
3. **Many independent validators:** The more spread out the stake, the harder it is to collude.
4. **Open-source code:** Everyone runs the same software. If a validator tries to cheat, other validators reject it.

**But there are limits:**
- If a small number of validators hold most of the stake, the network is more centralized.
- If >2/3 of stake is controlled by attackers, they can harm the network.
- If there is a bug in the software, all validators are affected.

So "anyone can validate" is a feature, but real security comes from **widespread, independent participation**.

---

## 7b. How Do I Become a Validator?

**Right now, you cannot.** PEMRIX mainnet is not live yet. The current `pemrix-node` software is a testnet implementation.

### Steps After Mainnet Launch

1. **Wait for mainnet launch announcement** from the PEMRIX team.
2. **Read the official validator documentation** at `docs.pemrix.com/validators` or the GitHub repository.
3. **Prepare hardware:** Rent or buy a Linux server that meets the minimum requirements.
4. **Download `pemrix-node`:** From the official PEMRIX GitHub releases page.
5. **Install and configure:** Follow the setup guide to compile and run the node.
6. **Generate validator keys:** Keep the private key extremely secure (preferably in an HSM or secure enclave).
7. **Acquire stake:** Buy the minimum required PEMRIX from an exchange.
8. **Register on-chain:** Submit a transaction to become a validator.
9. **Monitor 24/7:** Set up alerts for downtime, missed blocks, and security.
10. **Join the validator community:** Discord, forum, or governance channels for updates.

---

## 7c. Where Is the Software Downloaded From?

From the official PEMRIX open-source repository.

| Location | Purpose |
|---|---|
| **GitHub (`github.com/pemrix`)** | Source code, releases, documentation |
| **Official website (`docs.pemrix.com`)** | Setup guides, validator handbook |
| **Package repositories (future)** | Pre-built binaries for easy installation |

**Warning:** Only download from official sources. Fake websites and malware can steal validator keys.

---

## 7d. Is the Source Code Protected?

**The source code is open-source, not secret.**

This is intentional. Open-source means:
- Anyone can read, audit, and verify the code.
- Anyone can build and run `pemrix-node`.
- No one needs permission from Quanvio to participate.

**"Protected" in the security sense:**
- Validator keys are **private** and must be protected by the validator.
- User private keys are **never** stored on validators or by Quanvio.
- The protocol is protected by cryptography, consensus rules, and economic incentives.

**Not protected:**
- The code itself is public.
- The blockchain ledger is public.
- Transaction hashes and account balances are public.

Open-source does not mean insecure. Bitcoin and Ethereum are also open-source, and their security comes from transparency and peer review.

---

## 8. What Legal Processes, Terms, and Conditions Apply?

**This is not legal advice.** PEMRIX is a protocol, not a company, so it does not have "terms and conditions" in the traditional sense.

But different participants have different legal responsibilities:

| Participant | Legal Considerations |
|---|---|
| **User** | Must follow local laws about owning and using crypto assets. |
| **Merchant** | Must follow tax, accounting, and consumer protection laws. |
| **Validator** | May need to report income, follow data/local hosting laws. In some jurisdictions, running a validator may require registration. |
| **Exchange / fiat partner** | Must follow financial regulations, KYC/AML, licenses. |
| **Quanvio Labs** | As the originator, must comply with laws where it operates, but it does not control the network. |

Each validator should consult local legal counsel before operating.

---

## 9. What Does a Validator Actually Do?

A validator:
1. Receives transactions from wallets and apps.
2. Verifies signatures, balances, and rules.
3. Stores a copy of the blockchain.
4. Proposes blocks when selected.
5. Votes on blocks proposed by others.
6. Executes smart contracts.
7. Keeps the network synchronized and secure.
8. Earns rewards for honest participation.

A validator does **not**:
- Review transactions manually.
- Control user funds.
- Change the rules unilaterally.
- Need approval from Quanvio for every action.

---

## 10. Is a Developer the Same as a Validator?

**No, but one person or company can be both.**

| Role | Builds Apps? | Runs a Node? | Stake Required? |
|---|---|---|---|
| **Developer** | Yes | Optional | No |
| **Validator** | No | Yes | Yes |
| **Developer + Validator** | Yes | Yes | Yes |

A developer writes apps that use PEMRIX. A validator runs the network. They are separate jobs.

---

## 11. Is PEMRIX Quantum-Ready?

**Not fully yet, but it is designed to become quantum-resistant.**

### Current State
- Default signatures: Ed25519 (classical cryptography).
- This is secure against today's computers but vulnerable to future large-scale quantum computers running Shor's algorithm.

### Future Roadmap
- **Testnet:** Hybrid signatures (Ed25519 + ML-DSA) as an option.
- **Mainnet v1:** Classical default, hybrid opt-in.
- **Mainnet v2:** Hybrid default.
- **Future:** Post-quantum-only signatures after standards and performance mature.

### Why "Crypto-Agility" Matters
PEMRIX is designed so that the signature algorithm can be upgraded without breaking the network. Bitcoin and Ethereum today would require extremely difficult social coordination to migrate algorithms. PEMRIX builds the migration path into the protocol.

**Honest limit:** "Quantum-ready" is a journey, not a switch. The architecture supports it, but the actual migration depends on future standards, audits, and governance.

---

## 12. Is There a Separate Setup for Validators?

**Yes.** A validator needs a dedicated server, not just a wallet app.

| Setup | What You Need |
|---|---|
| **Wallet user** | Phone app, private key backup |
| **Merchant** | Merchant app or API integration |
| **Developer** | Laptop, SDK, maybe a local test node |
| **Validator** | Dedicated 24/7 server, stake, monitoring, security |

Validators have the most responsibility and the highest hardware/security requirements.

---

## 13. Is There a "Parent PEMRIX Server" That Controls Everything?

**No.** There is no single PEMRIX server that controls the network.

- The protocol is open-source.
- Validators run independent servers.
- No central database holds all balances.
- Quanvio Labs cannot stop transactions, freeze accounts, or change balances.

This is the difference between PEMRIX and centralized systems like PayPal or UPI:

| System | Central Server? | Can One Company Stop Transactions? |
|---|---|---|
| **PayPal** | Yes | Yes |
| **UPI** | Yes (NPCI) | Yes |
| **PEMRIX** | No | No |

Your wallet connects to any validator or RPC node. If one validator is down, your wallet can use another. There is no single point of control.

---

## 14. Do Validators Need to Buy PEMRIX?

**Yes, to stake.**

A validator must acquire PEMRIX tokens equal to or above the minimum stake. This stake is locked as a security deposit.

The validator can:
- Buy PEMRIX from an exchange.
- Receive delegated stake from users who trust them.
- Earn rewards over time and compound the stake.

The stake is not spent; it is a deposit. If the validator behaves honestly, it can unstake later and get it back.

---

## 15. What Happens If a Validator Wants to Stop?

A validator can:
1. Stop proposing blocks.
2. Initiate an **unbonding period** (e.g., 14–28 days).
3. After the unbonding period, withdraw the stake.

During unbonding, the stake is locked to prevent "rug pull" attacks where a validator misbehaves and immediately runs away with funds.

---

## 16. Can a Validator Be a Company?

**Yes.** Many validators in blockchain networks are companies. They often:
- Run multiple validators.
- Provide staking services to users.
- Charge a commission on rewards.
- Operate professional data centers.

This is similar to how mining pools operate in Bitcoin.

---

## 17. Summary: Validator vs. User vs. Developer vs. Regulator

| Question | User | Developer | Validator | Regulator |
|---|---|---|---|---|
| **Runs a server?** | No | Optional | Yes | No |
| **Needs stake?** | No | No | Yes | N/A |
| **Earns rewards?** | No | No | Yes | N/A |
| **Can be blocked by a country?** | App access can be blocked | Website can be blocked | Server can be seized locally | Cannot block global network |
| **Controls user funds?** | Own funds only | No | No | No |
| **Needs license?** | Usually no | Usually no | Maybe, depends on country | Issues licenses to fiat partners |

---

## 18. Can Any Country Block PEMRIX?

A country can block local fiat on-ramps, app stores, and exchange access, but it cannot stop the global validator network. Users with existing wallets can still transact peer-to-peer. The protocol has no single server to shut down.

## 19. Is PEMRIX Permissionless, Yet Regulated?

Yes. The base blockchain is permissionless and global. The interfaces that touch fiat money (exchanges, payment partners, on-ramps) are regulated locally. This separation is intentional: openness at the protocol layer, compliance at the service layer.

## 20. What Is the Role of Quanvio Labs After Mainnet?

Quanvio Labs originates the technology and builds products on top of PEMRIX, but it does not own or control the network. Over time, governance moves to validators, token holders, and the PEMRIX Foundation.

## 21. How Is PEMRIX Promoted?

Promotion happens organically and through ecosystem building:
- User-friendly wallet and merchant apps.
- Developer grants and hackathons.
- Merchant onboarding incentives.
- Exchange listings and liquidity partnerships.
- Educational content and university partnerships.
- Community governance and ambassador programs.

No single company controls the narrative; the ecosystem does.

## 22. Can Anyone Build a Wallet on Top of PEMRIX?

Yes. PEMRIX is open-source and permissionless. Anyone can build:
- Mobile wallets.
- Web wallets.
- Hardware wallet integrations.
- Merchant POS apps.
- Exchange integrations.
- AI agent wallets.

The benefit to builders is the same as building on Bitcoin or Ethereum: access to a global, open settlement network. The benefit to PEMRIX is more choice, more security through client diversity, and faster adoption.

## 23. Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.6 | 2026-08-30 | Kimi Code / Quanvio Labs | Added country blocking, permissionless vs regulated, Quanvio role, promotion, and open-wallet building |
| 1.5 | 2026-08-29 | Kimi Code / Quanvio Labs | Added "Why not 1 trillion?", governance, and 1000-year supply view |
| 1.4 | 2026-08-29 | Kimi Code / Quanvio Labs | Added "Why 1 billion tokens?" supply explanation |
| 1.3 | 2026-08-29 | Kimi Code / Quanvio Labs | Added originator earnings, validator earnings, and Quanvio validator role |
| 1.2 | 2026-08-29 | Kimi Code / Quanvio Labs | Added "If source code is public, can anyone modify PEMRIX?" section |
| 1.1 | 2026-08-29 | Kimi Code / Quanvio Labs | Added stake examples, fiat partner details, validator setup, and source-code answers |
| 1.0 | 2026-08-29 | Kimi Code / Quanvio Labs | Initial FAQ document |
