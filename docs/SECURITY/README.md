# PEMRIX Security Portal

This portal centralizes all security information for the PEMRIX network, validators, developers, and users.

## Report a vulnerability

- **Email:** [security@pemrix.com](mailto:security@pemrix.com)
- **PGP key:** available upon request
- **Response time:** initial acknowledgment within 48 hours; detailed response within 5 business days for valid reports.

Please do not disclose vulnerabilities publicly until we have had a chance to address them.

## Security programs

| Program | Description | Link |
|---|---|---|
| Bug Bounty | Rewards for eligible vulnerability reports | [BUG_BOUNTY.md](BUG_BOUNTY.md) |
| Operational Security | Validator and node hardening guide | [OPERATIONAL_SECURITY.md](OPERATIONAL_SECURITY.md) |
| Incident Response | Response plan and runbooks | [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) |
| Key Custody | Reference custody architecture | [KEY_CUSTODY.md](KEY_CUSTODY.md) |

## Audits

| Scope | Firm | Status | Report |
|---|---|---|---|
| Consensus + cryptography | TBD | Planned | — |
| VM + RPC | TBD | Planned | — |

Reports will be published here once audits are complete.

## Security advisories

No public advisories yet. Advisories will be published here and announced through the official PEMRIX communication channels.

## Best practices for users

- Use a hardware wallet or reputable custody solution for significant balances.
- Verify addresses before sending transactions.
- Never share seed phrases or private keys.
- Keep software updated.
- Be cautious of phishing sites impersonating PEMRIX.

## Best practices for validators

- Run the validator on hardened infrastructure.
- Use an HSM or remote signer for validator keys.
- Follow the [operational security guide](OPERATIONAL_SECURITY.md).
- Monitor for missed blocks and suspicious activity.

## Coordination

- **Status page:** [status.pemrix.com](https://status.pemrix.com) (planned)
- **Security announcements:** follow the official PEMRIX channels

## Scope

The bug bounty and vulnerability disclosure program cover:

- `node/pemrix-node`
- `crates/pemrix-*`
- Public testnet and mainnet endpoints once deployed
- Official websites and infrastructure under `pemrix.com`

## License

Security documentation is provided under the same license as the PEMRIX project: MIT OR Apache-2.0.
