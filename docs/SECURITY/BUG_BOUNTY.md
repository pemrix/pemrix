# PEMRIX Bug Bounty Program

## Introduction

The PEMRIX Bug Bounty Program rewards security researchers who help us identify and fix vulnerabilities in the PEMRIX protocol, node software, and developer services.

## Scope

### In scope

- `pemrix-node` consensus, networking, and state transition code
- `pemrix-crypto` signature and key-handling code
- `pemrix-rpc` REST API and authentication
- `pemrix-vm` execution engine and gas metering
- `pemrix-faucet`, `pemrix-explorer`, and `pemrix-webhooks` services
- PEMRIX SDKs and CLI
- Smart contract VM sandbox escapes
- Cryptographic weaknesses affecting transaction or consensus security

### Out of scope

- Third-party dependencies unless they affect PEMRIX-specific usage
- Physical attacks on infrastructure
- Social engineering
- DoS attacks against testnet infrastructure without prior approval
- Vulnerabilities in already-released public announcements

## Rules

1. **Safe harbor:** We will not pursue legal action against researchers who follow these rules.
2. **No exploitation:** Do not exploit vulnerabilities beyond what is necessary to demonstrate impact.
3. **No user data:** Do not access, modify, or destroy other users' data.
4. **No public disclosure:** Do not publicly disclose vulnerabilities before we have fixed them.
5. **Minimal impact:** Make every effort to avoid disruption to services.
6. **No automated scanning:** Avoid high-volume automated scanning without prior approval.

## Reward tiers

| Severity | Examples | Reward range |
|---|---|---|
| Critical | Consensus failure, infinite mint, private key recovery | To be determined |
| High | VM sandbox escape, RPC authentication bypass, validator slashing exploit | To be determined |
| Medium | Denial of service, information disclosure, replay attacks | To be determined |
| Low | Best practices, configuration issues, documentation fixes | To be determined |

Final rewards depend on impact, exploitability, and quality of the report.

## How to report

Send reports to **security@pemrix.com** with:

1. Clear title and severity assessment.
2. Step-by-step reproduction instructions.
3. Minimal proof of concept or exploit code.
4. Impact description.
5. Suggested mitigation if available.
6. Your preferred contact method and payment details.

We aim to acknowledge reports within 72 hours and provide an initial assessment within 7 days.

## Disclosure policy

- Reports are kept confidential.
- We will work with researchers to coordinate public disclosure after a fix is deployed.
- Researchers may be credited publicly if they choose.

## Thank you

Thank you for helping make PEMRIX safer.
