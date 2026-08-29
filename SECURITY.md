# Security Policy

## Supported Versions

PEMRIX is in active development. Security updates are applied to the latest `main` branch.

| Version | Supported |
|---|---|
| main | Yes |
| Earlier commits | No |

## Reporting a Vulnerability

If you discover a security vulnerability in PEMRIX, please report it privately:

- Email: `security@pemrix.com`
- Subject: `[PEMRIX SECURITY] <brief description>`

Please include:
- A clear description of the vulnerability.
- Steps to reproduce it.
- Potential impact.
- Suggested fix, if any.

We aim to acknowledge reports within 72 hours and provide a timeline for resolution.

## Security Practices

- Consensus-critical code is kept minimal and deterministic.
- All transactions are cryptographically signed.
- Cryptographic primitives are crypto-agile to allow future upgrades.
- Dependencies are pinned and audited via `cargo-deny`.
- External security audits are planned before mainnet launch.

## Bug Bounty

A public bug bounty program will be announced before mainnet launch. Until then, responsible disclosure is appreciated.
