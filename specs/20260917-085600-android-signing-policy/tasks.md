# Tasks — #73 Android signing policy

## Phase 0 — design and gate

- [x] T73-001 Confirm #73 as T4 security-sensitive work.
- [x] T73-002 Diagnose current release→debug fallback and repository-owned credential assumptions.
- [x] T73-003 Define verification vs production signing boundary in ADR.
- [x] T73-004 Define adversarial verification, recovery and gate-invalidation conditions.
- [ ] T73-005 Run SDD/Graph design checks and freeze exact Design Baseline SHA.
- [ ] T73-006 Obtain Human Design Gate approval for that exact SHA.

## Phase 1 — implementation after Design Gate

- [ ] T73-101 Remove repository-embedded production signing secret values from Android Gradle configuration.
- [ ] T73-102 Introduce explicit `verification|production` signing-mode validation.
- [ ] T73-103 Ensure verification mode packages `release` unsigned and never resolves production credentials.
- [ ] T73-104 Ensure production mode resolves only external signing inputs and fails closed on incomplete/invalid configuration.
- [ ] T73-105 Remove release→debug signing fallback while preserving normal debug-build semantics.
- [ ] T73-106 Add focused signing-policy tests/helper if needed for deterministic validation.
- [ ] T73-107 Reconcile CI so ordinary PR verification cannot opt into privileged signing.

## Phase 2 — T4 adversarial verification

- [ ] T73-201 Prove unsigned `assembleRelease` succeeds with no production inputs.
- [ ] T73-202 Prove invalid signing mode fails closed.
- [ ] T73-203 Prove production mode with zero inputs fails closed.
- [ ] T73-204 Prove each required production input missing individually fails closed.
- [ ] T73-205 Prove unreadable/missing keystore path fails closed.
- [ ] T73-206 Generate an ephemeral throwaway signing identity at runtime and prove the positive production-signing path.
- [ ] T73-207 Verify signature state distinguishes unsigned verification from ephemeral signed test output.
- [ ] T73-208 Run canary leakage tests proving supplied sensitive values are absent from logs/errors/evidence.
- [ ] T73-209 Prove release configuration contains no debug fallback.
- [ ] T73-210 Review PR workflow permissions/conditions for least privilege.

## Phase 3 — convergence and dependency proof

- [ ] T73-301 Run `/speckit.converge` or equivalent append-only convergence review.
- [ ] T73-302 Reconcile ADR/security docs with implemented behavior.
- [ ] T73-303 Re-run SDD policy, Engineering Graph, typechecks and regression tests on exact HEAD.
- [ ] T73-304 Reconcile #43 onto the resulting canonical base and demonstrate Android release verification can pass without production signing credentials.
- [ ] T73-305 Freeze exact verified HEAD and evidence links.
- [ ] T73-306 Obtain Human Merge Gate; human performs merge.

## Recovery tasks if exposure is suspected

These tasks are conditional and MUST NOT be silently marked complete:

- [ ] T73-R01 Determine whether any repository-exposed credential assumption was used with a real production/upload key.
- [ ] T73-R02 If yes or uncertain, disable privileged signing/publication and rotate/reset the affected credential/key through the platform-supported process.
- [ ] T73-R03 Re-run adversarial verification after rotation before privileged signing is re-enabled.
