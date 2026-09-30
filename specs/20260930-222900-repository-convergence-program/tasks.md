# Tasks: Repository Convergence Program

## Phase 0 — orchestration design

- [x] **T0001** Reconcile current master, PR #72, PR #69, issues #43/#46/#47/#51/#73, current Constitution, AGENTS policy, and recent repository cleanup state.
- [x] **T0002** Create umbrella tracking issue #117.
- [x] **T0003** Create isolated planning branch `agent/117-repository-convergence-program` from `master@dd72218b6a673421225664bd3cfc3ea7694acb2d`.
- [x] **T0004** Define sequence, requirements, recovery strategy, branch-hygiene rules, and final audit contract.
- [x] **T0005** Run automated design validation for #117 and fix any Spec Kit/Graph policy defect.
- [x] **T0006** Obtain exact-HEAD CI for the #117 documentation-only candidate (OpenBand CI V2 run #568 / 36787485386 PASS on prior exact planning HEAD).
- [ ] **T0007** Merge #117 when its evidence-driven Merge Gate is satisfied.

## Phase 1 — finish #43 / PR #72 (T4)

- [ ] **T1001** Re-read current master HEAD and PR #72 base/head relationship.
- [ ] **T1002** Confirm PR #72 still contains the #74 Android signing boundary and remains free of stale/conflicting CI policy.
- [ ] **T1003** Inspect current PR #72 reviews, draft state, labels, required checks, retained native artifacts, and merge eligibility.
- [ ] **T1004** If master moved materially, reconcile #72 with master and invalidate prior exact-HEAD evidence.
- [ ] **T1005** Re-run/confirm T4 adversarial target-selection and failure-swallowing checks.
- [ ] **T1006** Require exact-HEAD PASS for graph-check.
- [ ] **T1007** Require exact-HEAD PASS for security-policy.
- [ ] **T1008** Require exact-HEAD PASS for frontend-typecheck and backend-typecheck.
- [ ] **T1009** Require exact-HEAD PASS for vitest and legacy-tests.
- [ ] **T1010** Require exact-HEAD PASS for web-build and web-launch-e2e.
- [ ] **T1011** Require exact-HEAD PASS for android-build, including applicable signing-boundary evidence.
- [ ] **T1012** Require exact-HEAD PASS for electron-build.
- [ ] **T1013** Require exact-HEAD PASS for merge-gate.
- [ ] **T1014** Confirm native evidence manifests bind source SHA, job result, artifacts, and output hashes truthfully.
- [ ] **T1015** Mark PR #72 ready if draft is the only remaining mechanical blocker.
- [ ] **T1016** Merge PR #72 when the complete T4 evidence contract is satisfied.
- [ ] **T1017** Verify resulting master contains the intended #43 changes.
- [ ] **T1018** Reconcile and close issue #43 only after master verification.

## Phase 2 — reconcile #73 tracking

- [ ] **T2001** Re-read issue #73 and merged PR #74 against current master.
- [ ] **T2002** Verify the merged signing-boundary ADR, Gradle policy, adversarial harness, and CI evidence still satisfy repository-side #73 acceptance.
- [ ] **T2003** Determine whether any real account-level credential inventory/rotation action remains unresolved.
- [ ] **T2004** If external security action remains, create a new narrowly scoped operational security issue.
- [ ] **T2005** Close #73 when its implementation acceptance is proven and residual external work, if any, has its own owner.

## Phase 3 — recover #51 / replace stale PR #69

- [ ] **T3001** Re-read #51, PR #69, current master, current release docs, and current deployment state.
- [ ] **T3002** Create a new #51 recovery branch from exact current master.
- [ ] **T3003** Create a new schemaVersion 2 Spec Kit recovery feature for #51; preserve old #69 artifacts as history.
- [ ] **T3004** Enumerate all PR #69 changed files/hunks and classify each as REQUIRED / ALREADY_PRESENT / STALE / CONFLICTING.
- [ ] **T3005** Re-run Architecture Graph preflight on the current surfaces before replaying behavior.
- [ ] **T3006** Re-specify #51 under current automated design validation and evidence-driven merge policy.
- [ ] **T3007** Remove obsolete generic Human Design Gate / Human Merge Gate semantics from the recovered design.
- [ ] **T3008** Preserve Web-root, auth-shell, visitor-flow, launch-copy, browser-evidence, deployment, smoke, and rollback acceptance.
- [ ] **T3009** Run automated design validation on the recovery design before product mutation.
- [ ] **T3010** Replay only the minimum semantic delta still required on current master.
- [ ] **T3011** Add/update focused tests for Web landing, protected-route behavior, CTA integration, alpha claims, and current regressions.
- [ ] **T3012** Reconcile launch Playwright E2E to the current first-run/persistence/export behavior.
- [ ] **T3013** Run convergence review; append remediation tasks instead of weakening requirements.
- [ ] **T3014** Run exact-HEAD Graph, security, typecheck, Vitest, legacy, Web build, Web E2E, and merge-gate evidence required by the recovered tier.
- [ ] **T3015** Deploy/promote the exact candidate through the existing Web path when the deployment service is available.
- [ ] **T3016** Record canonical deployed URL and exact source revision identity.
- [ ] **T3017** Run deterministic deployed smoke for landing → visitor → create/import → persistence/reopen → WAV export.
- [ ] **T3018** Run real-microphone smoke on each browser intended to receive SUPPORTED status.
- [ ] **T3019** Derive browser support matrix from actual evidence; leave unproven combinations EXPERIMENTAL/UNVERIFIED.
- [ ] **T3020** Verify a concrete rollback target and procedure.
- [ ] **T3021** Reconcile README/product/release claims against the proven candidate.
- [ ] **T3022** Open the replacement PR and link it to #51 and #46.
- [ ] **T3023** Close PR #69 as superseded only after the replacement PR exists and traceability is recorded.
- [ ] **T3024** Merge the recovered #51 PR when its complete evidence-driven gate is satisfied.
- [ ] **T3025** Verify post-merge/deployed health and close #51 only when release acceptance is actually satisfied.

## Phase 4 — current-candidate reproof of #47

- [ ] **T4001** Re-read #47 acceptance and merged PR #54 history.
- [ ] **T4002** Verify visitor can reach the creation flow without mandatory signup.
- [ ] **T4003** Measure/prove an obvious first-sound path.
- [ ] **T4004** Verify Web recording start/stop and immediate audible result.
- [ ] **T4005** Verify move, duplicate, delete, and repeat/loop region operations.
- [ ] **T4006** Verify transport, BPM, metronome, undo/redo, mute/solo/volume/pan in the same current flow.
- [ ] **T4007** Verify interaction/recording failures are visible and non-destructive.
- [ ] **T4008** Reuse #51 evidence only where candidate identity and requirement semantics match exactly.
- [ ] **T4009** If all acceptance passes, record proof and close #47.
- [ ] **T4010** If any acceptance fails, create a focused corrective feature with explicit tier; do not expand #117.

## Phase 5 — close #46 MVP umbrella

- [ ] **T5001** Confirm #47, #48, #49, #50, and #51 are all complete from real GitHub state.
- [ ] **T5002** Run/collect one current-candidate end-to-end journey from blank project to first sound.
- [ ] **T5003** Verify edit/arrangement and mixer behavior required by #46.
- [ ] **T5004** Verify save/reopen preserves project structure and audio.
- [ ] **T5005** Verify WAV export is valid, decodable, non-empty, and audibly represents the project.
- [ ] **T5006** Verify critical failure paths do not silently destroy work.
- [ ] **T5007** Measure first-sound target (<60s) from an explicit smoke.
- [ ] **T5008** Measure blank-project-to-valid-export target (<10m) from an explicit smoke.
- [ ] **T5009** Reconcile public claims with the supported release evidence.
- [ ] **T5010** Close #46 only when the umbrella launch contract is satisfied.

## Phase 6 — branch hygiene

- [ ] **T6001** Inventory every non-default remote branch.
- [ ] **T6002** Map each branch to open/closed/merged PRs, Spec Kit dependencies, live session leases, and unique commits.
- [ ] **T6003** Classify each branch ACTIVE / KEEP / MERGED / SUPERSEDED / UNKNOWN.
- [ ] **T6004** Produce deletion evidence for every MERGED candidate.
- [ ] **T6005** Produce supersession/unique-work evidence for every SUPERSEDED candidate.
- [ ] **T6006** Delete only MERGED/SUPERSEDED branches with no live dependency.
- [ ] **T6007** Re-read branch inventory after deletion and confirm no active/default/protected/unknown branch was removed.
- [ ] **T6008** Record remaining UNKNOWN branches with the exact missing evidence.

## Phase 7 — final audit

- [ ] **T7001** Record final master SHA.
- [ ] **T7002** Record all remaining open PRs and why each is open.
- [ ] **T7003** Record all remaining open issues and why each is open.
- [ ] **T7004** Record current CI/evidence health.
- [ ] **T7005** Record current deployed Web revision and support state.
- [ ] **T7006** Record branch classification counts after hygiene.
- [ ] **T7007** Verify no completed-vs-open contradiction remains for #43/#46/#47/#51/#73.
- [ ] **T7008** Verify no stale recovery PR remains presented as canonical.
- [ ] **T7009** Emit the final compact repository report with unresolved blockers separated from unrelated backlog.
- [ ] **T7010** Persist exactly one next canonical action for SIGA.
