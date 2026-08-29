# PEMRIX Key Custody Reference Architecture

This document describes reference custody models for PEMRIX keys. The goal is to minimize the risk of theft, loss, and misuse while keeping operations practical.

## 1. Key Categories

| Key | Risk if Stolen | Risk if Lost | Custody Priority |
|---|---|---|---|
| Validator signing key | Slashing, censorship, network instability | Validator downtime | High |
| Withdrawal / staking key | Direct fund loss | Funds locked forever | Critical |
| Treasury / foundation key | Large fund loss | Governance deadlock | Critical |
| User wallet key | Personal fund loss | Personal fund loss | High |
| Node operator key | Node compromise | Operational disruption | Medium |
| Backup / recovery key | Fund theft | Unrecoverable loss | Critical |

## 2. Principles

1. **Least privilege**: each key can only perform its intended action.
2. **Separation of duties**: no single person can move large funds alone.
3. **Defense in depth**: combine hardware, software, geographic, and procedural controls.
4. **Recoverability**: every critical key has a tested recovery path.
5. **No hot keys for cold funds**: treasury keys are never on internet-connected machines.

## 3. Validator Signing Key

### Recommended Model: HSM + Remote Signer

```
┌─────────────────────────────────────────┐
│           Validator Node                │
│  (public network, no signing key)       │
└─────────────┬───────────────────────────┘
              │ remote signer protocol
┌─────────────▼───────────────────────────┐
│           Remote Signer                 │
│  (private network, talks to HSM)        │
└─────────────┬───────────────────────────┘
              │ PKCS#11 / USB
┌─────────────▼───────────────────────────┐
│              HSM                        │
│  (key never leaves hardware)            │
└─────────────────────────────────────────┘
```

### Controls

- Key generated inside the HSM; no plaintext export.
- Remote signer validates block hashes before signing.
- Dual-authorization for key migration or rotation.
- Signer machine has no outbound internet access.
- Audit all signing requests.

## 4. Withdrawal / Staking Key

### Recommended Model: Multi-Signature Cold Storage

- Use a threshold scheme (e.g., 3-of-5) among independent custodians.
- Custodians use hardware wallets from different manufacturers.
- Seed phrases split using Shamir's Secret Sharing (e.g., 2-of-3).
- Store shares in geographically separated physical vaults.
- Require in-person ceremony for any withdrawal.

### Alternative: MPC Custody

- Use multi-party computation so no single party ever holds the full key.
- Suitable for institutional validators and treasuries.
- Requires audited MPC vendor or open-source implementation.

## 5. Treasury / Foundation Key

### Recommended Model: On-Chain Multi-Sig + Timelock

- Multi-sig with high threshold (e.g., 4-of-7).
- Add time-delay for large outflows.
- Separate daily operations key (small amounts) from treasury key.
- Publish a transparency report for treasury movements.

### Signers

- Mix of founders, external directors, and community representatives.
- Each signer uses a dedicated hardware wallet stored separately.
- Annual key rotation and signer attestation.

## 6. User Wallet Key

### Recommended Models

| User Type | Recommended Custody |
|---|---|
| Self-custody power user | Hardware wallet + steel seed backup |
| Everyday user | Mobile wallet with encrypted cloud backup |
| Institutional | Custodian or MPC service |
| AI agent | Policy wallet with spending rules |

### User Guidance

- Never store seed phrases in password managers or cloud notes unencrypted.
- Verify addresses before large transfers.
- Use separate wallets for daily spending and long-term savings.

## 7. Backup and Recovery

### Seed Phrase Backup

- Write on metal or high-quality paper.
- Store in at least two geographically separate locations.
- Use tamper-evident bags.
- Test recovery annually.

### HSM Backup

- Use HSM manufacturer backup procedure.
- Encrypt backup with a separate offline key.
- Store backup in a bank vault or equivalent.

### Recovery Testing

- Simulate key loss quarterly.
- Verify multi-sig participants can still sign.
- Update recovery contacts and locations after any personnel change.

## 8. Threat Mitigations

| Threat | Mitigation |
|---|---|
| Physical theft | Secure vaults, multi-location, no single point of failure. |
| Remote malware | Air-gapped signing, HSM, no hot keys for cold funds. |
| Insider abuse | Multi-sig, separation of duties, audit logs. |
| Natural disaster | Geographic distribution, metal backups, off-site HSM backups. |
| Death / incapacity | Social recovery or trusted executor with encrypted instructions. |
| Supply chain | Diversify hardware vendors, verify firmware. |

## 9. Reference Configurations

### Solo Validator

- Validator signing key: Ledger or YubiHSM.
- Withdrawal key: 2-of-3 multi-sig with family/trusted friends.
- Backup: metal seed phrase in two locations.

### Institutional Validator

- Validator signing key: YubiHSM or Cloud HSM.
- Withdrawal key: 3-of-5 multi-sig with legal/compliance officers.
- Treasury key: 4-of-7 on-chain multi-sig with timelock.
- Backup: MPC shard backup + encrypted HSM backup in vault.

## 10. References

- [PEMRIX Operational Security Guide](OPERATIONAL_SECURITY.md)
- [PEMRIX Incident Response Plan](INCIDENT_RESPONSE.md)
- [PEMRIX Bug Bounty Program](BUG_BOUNTY.md)
- [PEMRIX Architecture](../ARCHITECTURE.md)
