# PEMRIX Incident Response Plan

This plan defines how the PEMRIX project and validator operators respond to security incidents.

## 1. Incident Severity

| Severity | Definition | Examples |
|---|---|---|
| **P0 — Critical** | Active threat to network consensus, funds, or validator keys. | Double-signing exploit, validator key compromise, consensus bug, chain halt. |
| **P1 — High** | Significant risk of network disruption or financial loss. | Large-scale DoS, RPC gateway compromise, critical dependency CVE. |
| **P2 — Medium** | Limited impact, needs investigation and mitigation. | Minor dependency CVE, suspicious login attempt, misconfiguration. |
| **P3 — Low** | No immediate risk, tracked for remediation. | Documentation typo with security implications, expired TLS certificate. |

## 2. Response Team

| Role | Responsibility |
|---|---|
| Incident Commander | Coordinates response, makes go/no-go decisions, communicates externally. |
| Technical Lead | Investigates root cause, implements fixes, validates patches. |
| Communications Lead | Manages public status updates, Discord/Telegram, media, and user alerts. |
| Validator Liaison | Alerts validators, collects signatures for emergency upgrades if needed. |
| Legal/Compliance | Handles regulatory, law enforcement, and disclosure requirements. |

## 3. Response Phases

### 3.1 Detect

- Alerts from monitoring, bug bounty, community reports, or automated scans.
- Log suspicious events with timestamps, affected systems, and indicators of compromise.
- Open a private incident channel immediately.

### 3.2 Triage

- Assign severity within 15 minutes.
- Determine whether the incident is active or contained.
- Identify affected systems, keys, accounts, and data.

### 3.3 Contain

For validator key compromise:
1. Stop the validator process if double-signing is possible.
2. Rotate the compromised signing key through on-chain rotation.
3. Move funds if the withdrawal key is also at risk.

For node compromise:
1. Isolate the machine from the network.
2. Preserve logs and disk images for forensics.
3. Spin up a clean node from a verified backup.

For consensus bugs:
1. Halt new deployments and alert validators.
2. Reproduce the bug in the sandbox.
3. Prepare an emergency patch or on-chain parameter change.

### 3.4 Eradicate

- Remove attacker access (rotate credentials, revoke sessions, patch vulnerabilities).
- Rebuild affected systems from trusted images.
- Validate that the root cause is fixed.

### 3.5 Recover

- Restart services in a known-good state.
- Monitor closely for recurrence.
- Confirm network finality and validator participation return to normal.

### 3.6 Post-Incident

- Write a post-mortem within 72 hours for P0/P1, within 1 week for P2.
- Publish a public incident report for P0/P1 unless law enforcement requests delay.
- Update runbooks, monitoring, and code to prevent recurrence.

## 4. Communication Playbook

### Internal

- P0: Page incident commander within 5 minutes.
- P1: Notify response team within 30 minutes.
- P2/P3: Track in security backlog, review weekly.

### External

- P0: Status page update within 30 minutes; public post-mortem within 72 hours.
- P1: Status update within 2 hours; post-mortem within 1 week.
- P2: Optional status update; include in routine security report.
- P3: Track internally.

## 5. Emergency Contacts

| Channel | Purpose |
|---|---|
| security@pemrix.com | Vulnerability and incident reports. |
| #incidents (private) | Real-time response coordination. |
| status.pemrix.com | Public status page. |

Keep this list updated and accessible offline.

## 6. Runbook Templates

### Validator Key Compromise

1. Stop validator.
2. Rotate signing key.
3. Verify no double-signed blocks on chain.
4. Restart with new key.
5. Notify Incident Commander.

### Suspected Consensus Bug

1. Alert validators to pause upgrades.
2. Reproduce in `pemrix-sandbox`.
3. Open a private fix branch.
4. Coordinate emergency patch release.
5. Monitor network finality after patch.

### Dependency CVE

1. Assess exploitability in PEMRIX context.
2. Update dependency and run full test suite.
3. Issue patch release if exploitable; otherwise schedule with next release.

## 7. References

- [PEMRIX Operational Security Guide](OPERATIONAL_SECURITY.md)
- [PEMRIX Bug Bounty Program](BUG_BOUNTY.md)
- [PEMRIX Architecture](../ARCHITECTURE.md)
