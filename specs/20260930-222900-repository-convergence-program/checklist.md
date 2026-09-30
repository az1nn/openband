# Checklist: Repository Convergence Program

## Design completeness

- [x] Current repository baseline is explicit.
- [x] #117 is an umbrella coordination feature, not a replacement for child feature specs.
- [x] Dependency order is explicit and acyclic.
- [x] #72/#43 remains T4 and keeps its own exact-HEAD contract.
- [x] #69/#51 recovery is based on current master, not blind reconciliation of a 110-commit stale branch.
- [x] #51 recovery explicitly migrates to schemaVersion 2/current governance.
- [x] #47 open-vs-merged discrepancy is handled as reproof before new implementation.
- [x] #46 closes only after child acceptance and current end-to-end evidence.
- [x] Branch cleanup uses proof-based classification.
- [x] Final audit defines canonical completion state.

## Constitution / governance

- [x] No direct push to master is planned.
- [x] REAL STATE remains authoritative.
- [x] Existing child feature tiers cannot be downgraded by #117.
- [x] Exact-HEAD evidence is invalidated after candidate/base changes when relevant.
- [x] Missing/external evidence remains BLOCKED rather than implicit PASS.
- [x] Generic Human Design Gate language is not reintroduced.
- [x] Generic Human Merge Gate language is not reintroduced.
- [x] Evidence-driven merge remains the canonical merge authorization mechanism.
- [x] No production mutation is authorized by merge authorization alone.
- [x] No secret value or credential is introduced.

## #43 / native-build closure

- [x] Android and Electron evidence are both required for #43 final verification.
- [x] #74 signing-boundary integration is a prerequisite to trustworthy Android verification.
- [x] Vercel rate-limit state is not conflated with native-build correctness.
- [x] Retained native evidence must bind source SHA, job state, artifact identity, and hashes.
- [x] Failure swallowing/continue-on-error regressions remain prohibited.

## #73 reconciliation

- [x] Merged PR #74 is treated as repository truth.
- [x] Open issue #73 is recognized as a tracking inconsistency to reconcile.
- [x] External credential inventory/rotation, if genuinely needed, is separated from repository implementation status.
- [x] No real credential rotation is authorized by this plan.

## #51 recovery

- [x] PR #69 is explicitly non-canonical for merge in its current diverged state.
- [x] Recovery begins from then-current master.
- [x] Every old hunk must be semantically classified before replay.
- [x] Historical evidence can inform but cannot authorize a new candidate.
- [x] Current Graph analysis is required before replay.
- [x] Current automated design validation is required before implementation.
- [x] Release claims are evidence-derived.
- [x] Deployment identity and rollback identity are explicit requirements.
- [x] Real-microphone evidence is not substituted by import-only automation.
- [x] Old PR #69 is closed only after replacement traceability exists.

## #47 / #46 acceptance

- [x] A merged implementation does not by itself prove an open issue's current acceptance.
- [x] #47 gets fresh proof against the current candidate.
- [x] Failures in #47 produce a bounded corrective feature rather than scope creep in #117.
- [x] #46 requires #47–#51 child completion.
- [x] #46 end-to-end evidence covers first sound, edit, persistence/reopen, and valid audible WAV export.
- [x] <60s and <10m targets are measured, not inferred.

## Branch hygiene

- [x] Branch age/name is not deletion evidence.
- [x] Open PR/live lease/active Spec Kit dependency blocks deletion.
- [x] Unique unmerged commits block deletion unless explicitly superseded and proven unnecessary.
- [x] UNKNOWN means keep.
- [x] Deletion is followed by a fresh inventory check.

## Scope guardrails

- [x] #3 and unrelated feature backlog are excluded.
- [x] No new auth, persistence, bridge, DSP, or native product architecture is introduced by #117.
- [x] No central SIGA state/service is introduced.
- [x] No merged feature history is rewritten solely for cosmetic status alignment.
- [x] No checks are weakened to accelerate convergence.

## Verification quality

- [x] #117 has its own docs-only evidence contract.
- [x] Every child phase re-reads its own required checks.
- [x] Child evidence is never aggregated into a weaker umbrella verdict.
- [x] Final audit distinguishes product backlog, repository hygiene, and external blockers.
- [x] Completion leaves exactly one canonical next action for SIGA.
