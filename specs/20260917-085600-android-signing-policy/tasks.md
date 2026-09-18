# Tasks — #73 Android signing policy

## Phase 0 — design and gate

- [x] T73-001 Confirm #73 as T4 security-sensitive work.
- [x] T73-002 Diagnose current release→debug fallback and repository-owned credential assumptions.
- [x] T73-003 Define verification vs production signing boundary in ADR.
- [x] T73-004 Define adversarial verification, recovery and gate-invalidation conditions.
- [x] T73-005 Run SDD/Graph design checks and freeze exact Design Baseline SHA.
- [x] T73-006 Obtain Human Design Gate approval for the original exact SHA (historical; now stale after post-#82 verification-contract reconciliation).
- [ ] T73-007 Obtain a fresh Human Design Gate for the reconciled schemaVersion 2 evidence/risk contract before further implementation mutation.

## Phase 1 — implementation after Design Gate

- [x] T73-101 Remove repository-embedded production signing secret values from Android Gradle configuration.
- [x] T73-102 Introduce explicit `verification|production` signing-mode validation.
- [x] T73-103 Ensure verification mode packages `release` unsigned and never resolves production credentials.
- [x] T73-104 Ensure production mode resolves only external signing inputs and fails closed on incomplete/invalid configuration.
- [x] T73-105 Remove release→debug signing fallback while preserving normal debug-build semantics.
- [x] T73-106 Add focused signing-policy tests/helper for deterministic validation.
- [x] T73-107 Reconcile CI so ordinary PR verification cannot opt into privileged signing.

## Phase 2 — T4 adversarial verification

- [ ] T73-201 Prove unsigned `assembleRelease` succeeds with no production inputs.
- [ ] T73-202 Prove invalid signing mode fails closed.
- [ ] T73-203 Prove production mode with zero inputs fails closed.
- [ ] T73-204 Prove each required production input missing individually fails closed.
- [ ] T73-205 Prove unreadable/missing keystore path fails closed.
- [ ] T73-206 Generate an ephemeral throwaway signing identity at runtime and prove the positive production-signing path.
- [ ] T73-207 Verify signature state distinguishes unsigned verification from ephemeral signed test output.
- [ ] T73-208 Run canary leakage tests proving supplied sensitive values are absent from logs/errors/evidence.
- [x] T73-209 Prove release configuration contains no debug fallback.
- [x] T73-210 Review PR workflow permissions/conditions for least privilege.
- [x] T73-211 Convergence remediation: explicitly exercise every required input as an empty string and reject each as missing.
- [x] T73-212 Convergence remediation: prevalidate keystore/password/alias/key before AGP and collapse incompatibilities to value-free errors.
- [x] T73-213 Convergence remediation: include keystore path and alias in runtime leakage-canary assertions, not only passwords.

## Phase 3 — convergence and dependency proof

- [x] T73-301 Run equivalent append-only convergence review; remediation items T73-211 through T73-213 were added and implemented without changing the approved trust model.
- [x] T73-302 Reconcile ADR/security docs with implemented behavior.
- [ ] T73-303 Re-run SDD policy, Engineering Graph, typechecks and regression tests on exact final HEAD.
- [ ] T73-304 Reconcile #43 against the resulting #73 integration candidate and demonstrate Android release verification can pass without production signing credentials.
- [ ] T73-305 Freeze exact verified HEAD and evidence links.
- [ ] T73-306 Satisfy the evidence-driven Merge Gate on the exact merge-candidate HEAD.
- [x] T73-307 Reconcile #73 onto post-#82 governance: schemaVersion 2 required checks, current fail-closed CI semantics, and no change to the approved signing trust model.
- [ ] T73-308 Resolve inherited Electron lockfile/native-build blocker #104 outside #73, then rerun feature-specific native evidence without weakening either job.

## Recovery tasks if exposure is suspected

These tasks are conditional and MUST NOT be silently marked complete:

- [ ] T73-R01 Determine whether any repository-exposed credential assumption was used with a real production/upload key.
- [ ] T73-R02 If yes or uncertain, disable privileged signing/publication and rotate/reset the affected credential/key through the platform-supported process.
- [ ] T73-R03 Re-run adversarial verification after rotation before privileged signing is re-enabled.
