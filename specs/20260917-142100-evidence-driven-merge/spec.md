# Feature: Evidence-Driven Merge Gate

**Tier:** T4 — security-sensitive engineering governance
**Issue:** #81

## Goal

Replace the mandatory human Merge Gate with an evidence-driven gate that can merge automatically when the exact PR HEAD satisfies the complete risk-derived verification contract, without turning privileged GitHub Actions into a path for untrusted PR code to obtain repository write authority.

## Requirements

- **FR-001** Merge eligibility is evaluated against the exact PR HEAD; changed HEAD invalidates stale evidence and reruns affected checks.
- **FR-002** Required evidence is derived from risk tier, impacted architecture/contracts, acceptance criteria and specialist requirements; it is not a fixed minimal CI list.
- **FR-003** Required evidence uses `PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE`; only `PASS` and justified `NOT_REQUIRED` satisfy a required gate.
- **FR-004** A regression class that matters to correctness, safety, compatibility or user-visible behavior must have executable or otherwise machine-verifiable evidence before automatic merge is trusted for that class. Missing required evidence is `BLOCKED`, never implicit `PASS`.
- **FR-005** Automatic merge is allowed for T0–T4 once all required evidence is satisfied, policy checks are green, required specialist evidence is satisfied and the target-base relationship is fresh.
- **FR-006** If the target branch moves in a way that can affect the PR, the merge/revalidation path must refresh the candidate and rerun affected checks before merge.
- **FR-007** Human Design Gate remains required for T2+ material design decisions. This feature removes the mandatory human action at merge time; it does not remove human ownership of design intent.
- **FR-008** Destructive production actions, credential changes, data repair and other runtime mutations remain governed independently; automatic merge authorization does not authorize production mutation.
- **FR-009** Masked, skipped, cancelled, timed-out, flaky, stale or blocked required checks cannot be treated as successful merge evidence.
- **FR-010** Historical feature specs remain immutable flow-forward history; only live governance surfaces are reconciled.
- **FR-011** The privileged `workflow_run` path MUST execute trusted default-branch policy only. It MUST NOT check out or execute the candidate PR HEAD, candidate-provided artifacts, or candidate-controlled scripts in the privileged context.
- **FR-012** A PR whose head repository is not the canonical `az1nn/openband` repository is `BLOCKED` from privileged automatic merge. External/fork work must be reviewed and re-homed onto a trusted same-repository branch before it can enter the privileged merge path.
- **FR-013** T2+ work MUST expose a machine-readable required-evidence contract approved at Design Gate; the privileged evaluator unions that contract with non-optional repository checks instead of trusting a fixed minimal list.
- **FR-014** Changes to merge-policy trust roots — including the privileged merger, CI evidence producers, tier/evidence policy, or repository-write permissions — are T4 and cannot prove their own trustworthiness solely through candidate-controlled checks. They require independent security/adversarial evidence and a GitHub-native record of the human Design Gate; merge execution may remain automated after those prerequisites are satisfied.
- **FR-015** The system MUST have a documented recovery/kill-switch path for a defective privileged merger: disable the privileged workflow, stop further automatic merges, revert the defective governance change, and audit any merges performed by the affected revision.

## Acceptance

1. Live governance no longer requires a human to click/approve the Merge Gate for ordinary T2+ changes.
2. The merge contract fails closed when required evidence is missing, stale, flaky, blocked or failing.
3. A changed PR HEAD or materially stale base cannot reuse prior verification as current evidence.
4. T4 can merge automatically only after stronger adversarial/security/recovery evidence is satisfied.
5. Human Design Gate semantics remain intact; trust-root changes have a durable GitHub-native Design Gate record.
6. Automatic merge does not grant permission for destructive runtime/production actions.
7. Existing historical specs are not rewritten to pretend this policy always existed.
8. Fork/untrusted PR code is never executed in the privileged `workflow_run` context and cannot directly enter the repository-write merge path.
9. A candidate cannot lower its own tier or replace its own required-evidence contract to bypass the trusted evaluator.
10. The recovery path can halt the privileged merger without relying on the candidate being evaluated.
