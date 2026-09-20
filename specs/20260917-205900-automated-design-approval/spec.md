# Feature Specification: Automated Design Approval

**Issue**: #101  
**Tier**: T4

## Intent

OpenBand must not require a separate Human Design Gate for routine T2+ engineering work. When an agent follows the repository Spec Kit lifecycle and the complete risk-derived evidence contract is satisfied, the work is approved to proceed and, after exact-HEAD verification, eligible for evidence-driven merge.

## Requirements

- **FR-001** T2+ work MUST still use Spec Kit artifacts, risk tiering, analysis, tasks, convergence, and schemaVersion 2 `openband.json` evidence metadata.
- **FR-002** Implementation MUST NOT pause for a generic Human Design Gate once the Spec Kit design artifacts and required pre-implementation validations are structurally valid.
- **FR-003** The privileged merge evaluator MUST NOT require an `openband-design-gate` PR comment.
- **FR-004** Required checks remain fail-closed: missing, stale, failed, blocked, flaky, cancelled, or timed-out evidence is not approval.
- **FR-005** Exact candidate HEAD, target-base freshness, same-repository identity, mergeability, risk-tier requirements, and active request-for-changes checks remain mandatory.
- **FR-006** Material design/risk/evidence-contract drift MUST be caught by Spec Kit/SDD policy, risk classification, changed metadata, review, or failing evidence rather than by a generic manual approval token.
- **FR-007** Genuine non-automatable decisions remain human boundaries: ambiguous product intent, destructive production actions, credentials/access changes, real hardware/device judgment, or explicit external authorization.
- **FR-008** Historical feature specs and historical Design Gate records are immutable history and need not be rewritten.

## Success criteria

1. A new T2+ feature can move from Spec Kit design/analyze into implementation without an owner-authored design-gate comment.
2. A T2+ or T4 PR still cannot merge unless its declared and repository-mandated evidence passes on the exact eligible candidate.
3. Live agent/session docs no longer treat a generic Design Gate as a stopping boundary.
4. Governance/security tests assert the evidence-driven contract and no longer assert the presence of `openband-design-gate`.
