# PEMRIX Validator Operational Security Guide

This guide describes the minimum operational security practices for anyone running a PEMRIX validator or full node with significant responsibilities.

## 1. Threat Model

Validators are high-value targets. Assume the following threats:

- **Key theft**: attackers want validator signing keys to slash, censor, or steal funds.
- **Infrastructure compromise**: cloud accounts, servers, and networks are targets.
- **Supply chain**: malicious dependencies, fake binaries, or compromised build machines.
- **Social engineering**: attackers target operators, support staff, and seed phrase backups.
- **Insider risk**: co-founders, employees, or hosting providers with privileged access.

## 2. Key Separation

Never reuse keys across roles:

| Key | Purpose | Storage |
|---|---|---|
| Validator signing key | Sign blocks and votes | Hardware security module (HSM) or air-gapped signer |
| Withdrawal / treasury key | Move stake or treasury funds | Offline cold storage, multi-sig |
| Node operator key | SSH, server login | Password manager + hardware authenticator |
| Monitoring key | Read-only dashboards | Separate low-privilege account |

## 3. Validator Signing Key

- Use an HSM (YubiHSM, Ledger HSM, AWS CloudHSM, etc.) or a dedicated signing server.
- Keep the signing server on a separate network segment from the public-facing node.
- Use a remote signer protocol (e.g., gRPC or IPC) between the validator node and the signer.
- Rotate signing keys through on-chain rotation procedures after any suspected exposure.
- Never store the validator private key in plaintext on the validator machine.

## 4. Node Hardening

- Run the node as an unprivileged user with no shell login.
- Disable password SSH; use key-based authentication only.
- Keep only required ports open (P2P, RPC if public).
- Apply OS and dependency security updates within 24–48 hours of release.
- Use a firewall to restrict RPC to known IP ranges.
- Enable full-disk encryption on machines that hold any sensitive data.
- Use fail2ban or equivalent to limit brute-force attempts.

## 5. Network Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Signer    │◄────┤  Validator  │◄────┤  Public RPC │
│   (HSM)     │     │    Node     │     │   Gateway   │
└─────────────┘     └─────────────┘     └─────────────┘
      ▲                                      ▲
      └────────── private link ──────────────┘
```

- The signer never has direct internet access.
- The public RPC gateway does not hold validator keys.
- Use TLS for all external-facing APIs.

## 6. Monitoring and Alerting

Monitor at least:

- Validator is online and signing.
- Block height is advancing.
- Disk, memory, and CPU usage.
- Unauthorized SSH or login attempts.
- Changes to validator binary or config files.
- Unusual network traffic.

Set alerts for:

- Missed blocks or rounds.
- Double-signing attempts.
- Signing key access outside expected windows.

## 7. Backups

- Back up node configuration and chain data daily.
- Encrypt backups before leaving the server.
- Store a copy off-site or in a separate cloud account.
- Test restore procedures quarterly.
- Never back up validator signing keys with the node; use HSM backup procedures instead.

## 8. Software Supply Chain

- Build from source or verify signed release binaries.
- Pin dependency versions and review lockfiles before updates.
- Run builds in isolated CI environments.
- Sign release binaries with a project release key.
- Maintain a Software Bill of Materials (SBOM) for releases.

## 9. Personnel

- Use multi-person approval for any change that affects validator keys or network parameters.
- Maintain an up-to-date contact list with escalation paths.
- Require security training for anyone with privileged access.
- Revoke access immediately when someone leaves the team.

## 10. Recovery

- Document a step-by-step validator migration procedure.
- Keep a cold spare machine imaged and ready.
- Practice key rotation and node failover at least once per quarter.

## References

- [PEMRIX Bug Bounty Program](BUG_BOUNTY.md)
- [PEMRIX Incident Response Plan](INCIDENT_RESPONSE.md)
- [PEMRIX Architecture](../ARCHITECTURE.md)
