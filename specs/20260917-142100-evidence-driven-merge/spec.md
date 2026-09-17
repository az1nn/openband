# Feature: Evidence-Driven Merge Gate

**Tier:** T3 — engineering governance
**Issue:** #81

## Goal

Replace the mandatory human Merge Gate with an evidence-driven gate that can merge automatically when the exact PR HEAD satisfies the complete risk-derived verification contract.

## Requirements

- **FR-001** Merge eligibility is evaluated against the exact PR HEAD; changed HEAD invalidates stale evidence and reruns affected checks.
- **FR-002** Required evidence is derived from risk tier, impacted architecture/contracts, acceptance criteria and specialist requirements; it is not a fixed minimal CI list.
- **FR-003** Required evidence uses `PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED`; only `PASS` and justified `NOT_REQUIRED` satisfy a required gate.
- **FR-004** A regression class that matters to correctness, safety, compatibility or user-visible behavior must have executable or otherwise machine-verifiable evidence before automatic merge is trusted for that class. Missing required evidence is `BLOCKED`, never implicit `PASS`.
- **FR-005** Automatic merge is allowed for T0–T4 once all required evidence is satisfied, policy checks are green, required specialist reviews are satisfied and the target-base relationship is fresh.
- **FR-006** If the target branch moves in a way that can affect the PR, the merge queue/revalidation path must refresh the candidate and rerun affected checks before merge.
- **FR-007** Human Design Gate remains required for T2+ material design decisions. This feature removes the mandatory human action at merge time; it does not remove human ownership of design intent.
- **FR-008** Destructive production actions, credential changes, data repair and other runtime mutations remain governed independently; automatic merge authorization does not authorize production mutation.
- **FR-009** Masked, skipped, cancelled, timed-out, flaky or blocked required checks cannot be treated as successful merge evidence.
- **FR-010** Historical feature specs remain immutable flow-forward history; only live governance surfaces are reconciled.

## Acceptance

1. Live governance no longer requires a human to click/approve the Merge Gate for T2+ changes.
2. The merge contract fails closed when required evidence is missing, stale, flaky, blocked or failing.
3. A changed PR HEAD or materially stale base cannot reuse prior verification as current evidence.
4. T4 can merge automatically only after its stronger adversarial/security/recovery evidence is satisfied; it is not downgraded to ordinary CI.
5. Human Design Gate semantics remain intact.
6. Automatic merge does not grant permission for destructive runtime/production actions.
7. Existing historical specs are not rewritten to pretend this policy always existed.