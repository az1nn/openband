# Plan: Repository Convergence Program

## Strategy

Use one umbrella plan to force dependency order, while keeping execution inside the existing feature/PR boundaries. The umbrella never substitutes its own evidence for a child feature.

Execution model:

```text
P0  Freeze orchestration design
 ↓
P1  #72 / #43 native evidence closure (T4)
 ↓
P2  #43 / #73 tracking reconciliation
 ↓
P3  #51 recovery from current master
 ↓
P4  #47 current-candidate reproof
 ↓
P5  #46 MVP release closure
 ↓
P6  branch hygiene
 ↓
P7  final repository audit
```

A phase is complete only when its exit gate is recorded from real state.

## Architecture assessment

No new runtime architecture is introduced by #117.

The repository remains:

- Expo Router / React / React Native Web frontend;
- runtime-specific I/O through the OpenBand bridge;
- TypeScript backend under `backend/`;
- Android and Electron native targets;
- Spec Kit + Architecture Graph + evidence-driven merge policy.

**ADR:** NOT REQUIRED for the umbrella.

Child features still require their own ADR/architecture handling when applicable. In particular, #43 remains a T4 privileged CI/evidence-policy change and #51 may elevate if recovery crosses deployment, auth, persistence, security, or runtime boundaries.

## Phase 0 — Program baseline

1. Reconcile `master`, open PRs, relevant issues, CI and deployment state.
2. Freeze this orchestration design as documentation-only.
3. Run automated design validation for #117.
4. Do not start product/native implementation from this branch.
5. Merge #117 only when its own docs-only evidence contract is green.

Exit gate:

- #117 artifacts structurally complete;
- no Constitution conflict;
- no code/runtime mutation;
- exact-HEAD docs-governance checks green.

## Phase 1 — #72 / #43 native verification closure

Canonical owner remains PR #72 / feature #43.

### Reconcile

- compare PR #72 head to current `master`;
- inspect mergeability, draft state, reviews, required checks and exact workflow run;
- confirm #74 signing boundary is present in both base and candidate;
- confirm target-specific scheduler semantics still match the T4 spec.

### Execute

If base moved materially, reconcile #72 with current master and invalidate stale evidence. Otherwise preserve the current candidate.

Do not rewrite #72 into #117.

### Verify

Require the #43 contract on the exact candidate:

- graph-check;
- security-policy;
- frontend-typecheck;
- backend-typecheck;
- vitest;
- legacy-tests;
- web-build;
- web-launch-e2e;
- android-build;
- electron-build;
- merge-gate;
- applicable Android signing-boundary proof.

Confirm retained native manifests and output hashes are truthful and no failure-swallowing path exists.

### Integrate

When exact-HEAD evidence is satisfied:

- mark ready if draft state is the only remaining mechanical blocker;
- merge through repository policy;
- verify resulting `master` contains the intended change;
- re-read #43 before closing it.

Exit gate: #43 implementation is on `master`, #72 is merged, and #43 tracking is reconciled.

## Phase 2 — #73 tracking reconciliation

PR #74 is already merged. Issue #73 remains open.

### Reconcile

Read the merged ADR, current Gradle signing behavior, adversarial harness, CI job, and issue scope.

### Decision

Close #73 only if the merged repository proves the issue's repository-side acceptance:

- release verification is unprivileged/unsigned;
- production signing is explicit and fail-closed;
- release cannot downgrade to debug signing;
- secret values are external;
- adversarial/leakage evidence exists.

If account-level historical credential usage or rotation is still genuinely unresolved, create a new operational security issue scoped only to that external action. Do not keep the implementation issue open to represent an unrelated account operation.

Exit gate: #73 status tells the truth and any residual action has a separate owner.

## Phase 3 — Recover #51 / supersede PR #69

PR #69 is too stale for blind merge reconciliation. Default recovery strategy is **semantic replay onto a new branch from current master**.

### Step 3.1 — Establish a recovery baseline

After Phase 1/2, create a new #51 recovery branch from exact current `master`.

Create a new Spec Kit feature directory for the recovery rather than modifying stale feature history. The recovered feature must be schemaVersion 2.

### Step 3.2 — Semantic diff of PR #69

For every changed file/hunk in #69, classify:

- REQUIRED — behavior still absent from current master;
- ALREADY_PRESENT — later master work already supplies it;
- STALE — obsolete implementation/governance text;
- CONFLICTING — clashes with current architecture/policy and needs redesign.

The old 60-commit branch is input evidence, not a merge source of authority.

### Step 3.3 — Re-specify current acceptance

Preserve the #51 product intent while replacing stale lifecycle language.

At minimum cover:

- Web-only public root behavior;
- protected-route/native behavior preservation;
- visitor → first-run reuse;
- launch copy and claim guardrails;
- release docs;
- launch E2E;
- browser/microphone/storage evidence;
- deployment identity;
- rollback.

Remove the obsolete generic Human Design Gate and Human Merge Gate requirements. Use current automated design validation and evidence-driven merge policy.

### Step 3.4 — Architecture/Graph analysis

Re-run Graph impact against the current implementation surfaces before replay.

If recovery now touches auth identity/session semantics, persistence ownership, bridge/native boundaries, backend topology, security-sensitive deployment, or another T3/T4 trigger, elevate before implementation.

### Step 3.5 — Implement minimum semantic delta

Replay only what current master still needs. Prefer current repository abstractions over preserving old code shapes from #69.

### Step 3.6 — Verify release candidate

Require current exact-HEAD CI and deployment proof.

Vercel/account rate limiting is `BLOCKED`/external evidence, never PASS. Once deployment is available:

- record canonical URL and deployed source revision;
- run deterministic deployed smoke;
- verify persistence/reopen/export;
- run real-microphone evidence on intended supported browser(s);
- derive browser support labels only from proof;
- verify rollback target/procedure.

### Step 3.7 — Supersede old PR

Only after the replacement recovery PR exists with traceability:

- close #69 as superseded, with link to the replacement;
- preserve #69 as historical evidence;
- do not delete its branch until branch-hygiene phase proves deletion safety.

Exit gate: #51 is implemented on a current-base candidate with current governance and complete required release evidence, then merged/closed.

## Phase 4 — Re-prove #47 against the current candidate

PR #54 merged, but #47 remained open. Treat this as a tracking/evidence discrepancy first, not an invitation to rewrite product code.

### Reproof matrix

Verify current candidate behavior for:

- visitor access without mandatory signup;
- obvious path to first sound;
- reliable record start/stop and immediately audible recording;
- move/duplicate/delete/repeat region operations;
- transport, BPM, metronome, undo/redo, mute/solo/volume/pan;
- visible, non-destructive failure behavior.

Reuse evidence from #51 only when it proves the same requirement against the same relevant candidate/revision. Otherwise produce dedicated proof.

If all acceptance passes, close #47.

If not, create a focused corrective issue/feature with explicit tier and dependency on #51/current master. Do not silently expand #117.

Exit gate: #47 is truthfully closed or has a bounded corrective feature.

## Phase 5 — Close #46 Web MVP umbrella

Reconcile child status:

- #47 complete;
- #48 complete;
- #49 complete;
- #50 complete;
- #51 complete.

Run/collect current release-candidate proof for the umbrella journey:

```text
entry
→ blank/local project
→ first sound
→ record/import/edit
→ save
→ reload/reopen
→ audible project preserved
→ WAV export
→ exported file valid and audible
```

Also verify creator-visible failure behavior and product claims.

The <60s first-sound and <10m blank-to-export targets should be measured from an explicit smoke run rather than inferred from unit coverage.

Close #46 only when the current release candidate satisfies the umbrella contract.

## Phase 6 — Branch hygiene

Run only after the convergence work no longer depends on historical branches.

### Inventory

For every non-default branch collect:

- open PR association;
- merged PR association;
- compare-to-master ahead/behind state;
- active Spec Kit/session lease dependency;
- unique commits not present elsewhere;
- superseding branch/PR if any.

### Classification and action

- ACTIVE → keep;
- KEEP → keep;
- MERGED → delete if no live dependency;
- SUPERSEDED → delete if no unique required work remains;
- UNKNOWN → keep and document why.

Never infer deletion safety from branch age, naming, or a closed PR alone.

Exit gate: every remaining branch has a reason to exist or is explicitly UNKNOWN pending further evidence.

## Phase 7 — Final repository audit

Produce a final state snapshot from real systems:

- `master` exact SHA;
- open PR inventory;
- open issue inventory;
- CI/evidence state;
- Vercel/release state;
- current MVP status;
- branch classification counts;
- unresolved blockers;
- one exact next action.

The final report must distinguish:

- product backlog;
- repository hygiene;
- external/account blockers;
- intentionally deferred work.

## Sequencing law

Normal order is strict. A later phase may only begin early if the active phase is in a genuine WATCH state and the later work is demonstrably independent under SIGA's concurrency rules. Any such exception must be recorded; it must not create overlapping ownership of the same feature.

## Rollback

#117 itself is documentation-only and can be reverted as one planning change.

Each child phase uses its own rollback/recovery contract. In particular, this umbrella does not authorize:

- production redeploy/rollback;
- credential rotation;
- destructive branch deletion without classification evidence;
- weakening CI/evidence producers.
