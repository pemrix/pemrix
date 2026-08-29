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

## Support

- Documentation: `docs.pemrix.com`
- Security issues: `security@pemrix.com`
- General questions: `validators@pemrix.com`

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-29 | Kimi Code / Quanvio Labs | Initial validator handbook |
