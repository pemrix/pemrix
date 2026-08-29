# PEMRIX Validator Handbook

**Version:** 1.0  
**Date:** 2026-08-29  
**Purpose:** Guide for running a PEMRIX validator node.

---

## What Is a Validator?

A validator is a server that runs the `pemrix-node` software, participates in consensus, and helps secure the PEMRIX network. Validators earn rewards from block production and transaction fees.

---

## Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **CPU** | 4 cores | 8+ cores (modern x86_64 or ARM64) |
| **RAM** | 16 GB | 32+ GB |
| **Storage** | 500 GB SSD | 1+ TB NVMe SSD |
| **Network** | 100 Mbps symmetric | 1 Gbps, redundant connection |
| **Uptime** | 95% | 99.9% or higher |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS or RHEL-compatible |

---

## Software Prerequisites

- Linux server (Ubuntu 22.04 LTS recommended)
- Git
- Rust toolchain 1.75 or later
- Stable internet connection with a static IP
- Open ports:
  - `60303`/tcp for P2P (configurable)
  - `60001`/tcp for RPC (optional, can be localhost-only)

---

## Quick Start

### 1. Run the setup script

```bash
curl -sSL https://raw.githubusercontent.com/pemrix/pemrix/main/scripts/install-validator.sh | bash -s -- --service
```

This will:
- Install Rust if missing.
- Clone the PEMRIX repository.
- Build the release binary.
- Initialize a validator data directory at `/var/lib/pemrix`.
- Create and enable a systemd service.

### 2. Or install manually

```bash
# Clone the repository
git clone https://github.com/pemrix/pemrix.git
cd pemrix

# Build the release binary
cargo build --release

# Initialize the validator
./target/release/pemrix init --validator --data-dir /var/lib/pemrix

# Start the validator
./target/release/pemrix start --validator --data-dir /var/lib/pemrix
```

---

## Key Management

When you run `pemrix init --validator`, a keypair is generated and saved to:

```
/var/lib/pemrix/validator_key.json
```

This file contains:
- `address`: Your validator's on-chain address.
- `public_key`: Your validator's public key.
- `secret_key`: Your validator's private key.

**Protect the secret key at all costs.**

- Never share it.
- Never commit it to Git.
- Store an offline backup in an encrypted location.
- For production, use an HSM, secure enclave, or key management service.

View your validator address without revealing the secret key:

```bash
./target/release/pemrix keys --data-dir /var/lib/pemrix
```

---

## Becoming a Genesis Validator

At mainnet launch, a small set of trusted validators will be included in the genesis block. To become a genesis validator:

1. Run `pemrix init --validator` and record your address and public key.
2. Submit your address and public key to the PEMRIX genesis coordinator.
3. Ensure your node is online at the coordinated launch time.
4. The genesis block will include your validator in the initial committee.

---

## Joining After Launch

After mainnet is live, new validators can join permissionlessly by:

1. Acquiring the minimum required stake.
2. Running a validator node.
3. Submitting a validator registration transaction on-chain.
4. Waiting for the next validator set update.

The exact staking amount and registration process will be published before mainnet.

---

## Configuration

The node configuration is stored in:

```
/var/lib/pemrix/node.json
```

Important fields:

| Field | Meaning |
|---|---|
| `validator` | Whether this node runs as a validator |
| `p2p_listen` | Address and port for peer connections |
| `rpc_listen` | Address and port for RPC |
| `bootstrap_nodes` | List of known peers to connect to |
| `validator_set` | Committee addresses (usually set automatically) |
| `local_validator_address` | Your validator's address (loaded from key file) |

Example `node.json`:

```json
{
  "data_dir": "/var/lib/pemrix",
  "rpc_listen": "127.0.0.1:60001",
  "p2p_listen": "0.0.0.0:60303",
  "validator": true,
  "bootstrap_nodes": {},
  "validator_set": null,
  "local_validator_address": null
}
```

---

## Running as a Service

The setup script can install a systemd service. To manage it:

```bash
# Start
systemctl enable --now pemrix-validator

# Status
systemctl status pemrix-validator

# Logs
journalctl -u pemrix-validator -f

# Restart
systemctl restart pemrix-validator
```

---

## Monitoring

Monitor these key metrics:

| Metric | How to Check | Healthy Range |
|---|---|---|
| Uptime | `systemctl status pemrix-validator` | >99.9% |
| Peer count | Logs | >1 peer |
| Block height | RPC `/v1/status` | Increasing |
| Missed blocks | Logs | Near zero |
| Disk usage | `df -h` | <80% |
| Memory usage | `free -h` | <80% |

---

## Security Checklist

- [ ] Server is dedicated to PEMRIX, not shared with other services.
- [ ] Firewall allows only necessary ports.
- [ ] SSH is key-based and root login is disabled.
- [ ] Automatic security updates are enabled.
- [ ] Validator key file has restricted permissions (`chmod 600`).
- [ ] Secret key is backed up offline in an encrypted location.
- [ ] Server is in a physically secure location or trusted data center.
- [ ] Monitoring and alerting are configured.

---

## Troubleshooting

### Node fails to start

- Check that `validator_key.json` exists and is valid JSON.
- Check that `genesis.json` exists.
- Check logs with `journalctl -u pemrix-validator -f`.

### No peers

- Verify `p2p_listen` is correct and the port is open.
- Add bootstrap nodes to `node.json`.
- Check firewall rules.

### Low balance

- Ensure the validator address is funded with the minimum stake.
- Check balance via RPC: `curl http://127.0.0.1:60001/v1/accounts/<address>/balance`.

---

## Validator Reality, Security, and Governance

This section answers the hard questions about what validators can and cannot do, how the network protects itself, and how validator participation is governed.

### 1. Can a validator hack PEMRIX?

**No single validator can change the ledger.** PEMRIX uses BFT consensus: a block only finalizes when >2/3 of voting power agrees. If one validator tries to create invalid balances, skip signatures, or mint free tokens, honest validators reject the block. The attacker loses rewards and can be slashed.

A successful attack would require:
- Breaking the cryptography (Ed25519 today, hybrid/PQC in the future), or
- Controlling >2/3 of the staked voting power, or
- A bug present in every honest validator's code.

This is why decentralization, audits, bug bounties, and crypto-agility matter.

### 2. Can a validator spread a virus or corrupt PEMRIX?

A validator can only send consensus messages, blocks, and transactions. It cannot force other validators to run arbitrary code. The node software:
- Rejects malformed messages.
- Verifies every signature, balance, nonce, and state root independently.
- Does not download or execute code from peers.

Validator keys and server access are the main risks. A compromised validator server can sign invalid messages, but those messages are rejected by the network. Proper key custody (HSM, secure enclave, offline backup) and server hardening are mandatory.

### 3. Can a bad validator be removed?

**Yes, through protocol rules, not manual intervention.** Slashing and jailing are automatic:

| Misbehavior | Consequence |
|---|---|
| Double signing two blocks at the same height | Slash stake, jail validator |
| Extended downtime | Missed rewards, eventual jail |
| Equivocation (conflicting votes) | Slash stake, jail validator |
| Invalid block proposal | Rejected by peers, no reward |

After a jail period, a validator can rejoin if it fixes the issue. Governance can also propose permanent exclusion in extreme cases.

### 4. What happens if a validator goes offline and online repeatedly?

- While offline, the validator misses block proposals and rewards.
- If downtime exceeds a threshold, the validator is jailed and stops earning rewards.
- Other validators continue finalizing blocks; the network is unaffected as long as <1/3 of voting power is offline.
- When the validator comes back online, it syncs the blocks it missed and resumes participation.

This is why professional validators use redundant power, networking, and monitoring.

### 5. Is validator onboarding automated or manual?

**The protocol layer is automated.** After mainnet, anyone who meets the stake and technical requirements can register on-chain. The validator set updates automatically at defined intervals.

**At genesis, onboarding is manual and gated.** The first validator set is chosen for operational security and network stability. This is standard practice for every major BFT chain. Permissionless entry opens after launch.

### 6. Why would someone become a validator?

Validators earn block rewards and transaction fees proportional to their stake. They also:
- Secure a global payment and settlement network.
- Build reputation and attract delegated stake.
- Support the ecosystem they participate in.

It is a business activity, not charity. Professional validators run infrastructure and are compensated for it.

### 7. Do validators earn money?

Yes. Revenue comes from:
- **Block rewards**: new issuance per block, split among validators.
- **Transaction fees**: paid by users for transfers and smart-contract calls.
- **Commission on delegated stake**: if users delegate PEMRIX to a validator, the validator may charge a commission (e.g., 0–20%).

Earnings depend on total network stake, the validator's own stake, delegated stake, transaction volume, and commission rate.

### 8. Is validator information public?

**On-chain data is public:** validator addresses, stake amounts, rewards, commission rates, uptime, and slashing history. Anyone can see which validators are active and how they perform.

**Off-chain identity is optional.** A validator can remain pseudonymous or publicly identify itself. Reputation systems, dashboards, and rating services can rank validators by uptime, commission, decentralization contribution, and community participation.

### 9. Can validators run on Windows, Raspberry Pi, or mobile?

- **Primary target:** Linux server (Ubuntu LTS, RHEL-compatible) on x86_64 or ARM64.
- **Windows:** Not recommended for production validators. A Windows build may exist for development but is not supported for consensus participation.
- **Raspberry Pi / edge devices:** Possible for light nodes or testnet, but not recommended for mainnet validators due to bandwidth, storage, and reliability requirements.
- **Mobile:** No. Mobile devices cannot meet uptime, bandwidth, or security requirements.

### 10. Are more validators always more secure?

More independent, geographically distributed validators increase security up to a point. The key metrics are:
- **Number of independent operators** (not one company running many nodes).
- **Stake distribution** (no single validator holding >1/3 of stake).
- **Geographic and jurisdictional diversity**.

PEMRIX targets 100+ independent validators at genesis and 1,000+ over time.

### 11. Can the validator set or stake minimum change after mainnet?

Yes, through on-chain governance. Examples:
- Minimum stake can be adjusted.
- Validator cap can be changed.
- Reward rate can be tuned within constitutional bounds.

Quanvio Labs cannot change these alone. A super-majority of validators and voting stake is required.

### 12. What legal rules apply to validators?

Validators are independent operators. Responsibilities vary by country:
- Report staking income for tax.
- Comply with local data-hosting or cyber-security laws.
- In some jurisdictions, professional staking may require registration.

PEMRIX recommends every validator seek local legal advice. The protocol itself has no terms of service; regulated fiat interfaces are provided by licensed partners, not validators.

### 13. How does a validator update safely?

Updates are delivered through the normal GitHub release process:
1. A new release is tagged and announced.
2. Validators pull the source, build, or download signed binaries.
3. The validator is restarted with the new binary.
4. State is preserved; the node re-syncs any missed blocks and rejoins consensus.

Validator state lives in `/var/lib/pemrix`. Replacing the binary does not delete state. Backups of `validator_key.json` and `node.json` are required before any upgrade.

### 14. What makes PEMRIX different from Bitcoin, Ethereum, UPI, PayPal, etc.?

See `docs/PEMRIX_VS_MARKET.md` for a detailed comparison. In short:
- **Like Bitcoin/Ethereum:** open blockchain, self-custody, global, programmable.
- **Like UPI/PhonePe/PayPal/Razorpay/Stripe:** fast, simple payments, merchant tools.
- **Unlike all of them:** crypto-agile, deterministic finality in seconds, AI-native policy wallets, and a design meant to upgrade cryptography and consensus without forking.

---

## Support

- Documentation: `docs.pemrix.com`
- Security issues: `security@pemrix.com`
- General questions: `validators@pemrix.com`

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-29 | Kimi Code / Quanvio Labs | Initial validator handbook |
| 1.1 | 2026-08-30 | Kimi Code / Quanvio Labs | Added validator reality, security, governance, and onboarding answers |
