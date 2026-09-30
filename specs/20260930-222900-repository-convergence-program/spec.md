# Feature: Repository Convergence Program

**Issue:** #117  
**Tier:** T3 umbrella coordination. Child work keeps its own risk tier; #43 / PR #72 remains T4.  
**Baseline:** `master@dd72218b6a673421225664bd3cfc3ea7694acb2d`

## Goal

Converge the current repository into one clean, verified post-MVP baseline by resolving the remaining native-build, tracking, Web-release, MVP-acceptance, and branch-hygiene work in an explicit dependency order.

This feature is an orchestration specification. It does not lower, replace, or aggregate the evidence contracts of the features it sequences.

## Current proven state

- PR #72 implements #43, is based on current baseline, is mergeable, and has exact-HEAD T4 CI evidence on `5fc2b3bf4defcac539c3eb9e8d6e50c477f27c76`.
- PR #74 implementing the #73 Android signing boundary is merged into `master`.
- Issue #73 is still open and therefore disagrees with repository history.
- PR #69 implements #51 but is 110 commits behind current `master`, 60 commits ahead of its merge base, is non-mergeable, draft, and carries pre-#102 governance language.
- #48, #49, and #50 are closed.
- #47 remains open even though PR #54 was merged.
- #46 remains open as the Web MVP umbrella.
- The repository has a large historical branch set; branch presence alone is not deletion evidence.

## Functional requirements

### FR-001 — Reconcile before every phase

Each phase MUST begin by re-reading the canonical repository state: default-branch HEAD, target PR/issue state, base/head relationship, current required evidence, open blocking reviews, and relevant deployment state.

No phase may execute from this document alone.

### FR-002 — Finish #43 / PR #72 first

The program MUST complete the native-build verification feature before recovery of #51.

PR #72 may merge only when:

- its head is current enough with the target base for the risk contract;
- its schemaVersion 2 evidence metadata remains valid;
- all required T4 checks are exact-HEAD PASS or justified NOT_REQUIRED;
- Android and Electron evidence are both trustworthy;
- no blocking review/policy state exists;
- the evidence-driven Merge Gate is satisfied.

A Vercel rate-limit status unrelated to the native-build evidence contract MUST NOT be silently relabeled as a native-build failure or PASS.

### FR-003 — Reconcile #43 and #73 tracking after repository truth changes

After #72 lands, the program MUST re-read #43 and #73 against `master`.

- Close #43 only after its acceptance contract is present on `master`.
- Close #73 when its merged signing-boundary acceptance is proven from repository history and current policy.
- If a residual real-world credential rotation/inventory action is still required, split it into a new narrowly scoped operational/security issue rather than leaving #73 ambiguously open.

### FR-004 — Recover #51 from current master, not from stale assumptions

PR #69 MUST NOT be merged from its current diverged state.

Recovery MUST start from the then-current `master` and perform a semantic diff of PR #69:

- classify each changed surface as still required, already superseded, stale, or conflicting;
- replay only required behavior;
- preserve product intent without preserving obsolete implementation or policy text;
- retain old PR #69 as historical evidence and close/supersede it only after the replacement PR exists.

### FR-005 — Migrate #51 to current governance

The recovered #51 feature MUST use current Constitution/AGENTS rules:

- schemaVersion 2 evidence metadata;
- automated design validation rather than the removed generic Human Design Gate;
- evidence-driven Merge Gate rather than a generic Human Merge Gate;
- exact-HEAD/base freshness;
- current PASS/FAIL/BLOCKED/FLAKY/NOT_REQUIRED/STALE semantics;
- current release/deployment evidence and rollback identity.

Historical approvals/evidence from PR #69 may inform analysis but MUST NOT authorize the recovered candidate.

### FR-006 — Preserve Web-release acceptance

The recovered #51 scope MUST still prove:

- public Web landing/entry behavior;
- existing visitor/first-run path reuse;
- truthful Web-alpha/local-first claims;
- launch-critical E2E from entry through persistence/reload and WAV export;
- canonical deployed revision identity;
- browser support claims backed by evidence;
- microphone/storage limitations documented;
- deterministic deployed smoke;
- rollback to a known-good deployment.

Real-microphone evidence remains a distinct real-world evidence class and MUST be PASS or explicitly BLOCKED; automation may not impersonate it.

### FR-007 — Re-prove #47 rather than assuming the merged PR closed the issue

Because #47 is still open, the program MUST verify its acceptance against the current release candidate.

If current code already satisfies #47, capture fresh evidence and close it without unnecessary product changes.

If acceptance is not satisfied, open a focused follow-up feature with the minimum appropriate tier rather than mutating #47 history ad hoc.

### FR-008 — Close #46 only from current end-to-end evidence

The #46 umbrella may close only after #47, #48, #49, #50, and #51 are complete and the current release candidate proves the launch loop:

`blank project → first sound → edit → save/reopen → valid audible WAV export`

The launch evidence MUST also prove that failure paths do not silently destroy work and that the product claims shown to users match the actually supported release state.

### FR-009 — Branch hygiene must be evidence-driven

After product/release convergence, classify remote branches into:

- ACTIVE — open PR, live task/lease, or active Spec Kit dependency;
- KEEP — intentional long-lived/default/protected branch;
- MERGED — ancestry/history proves integrated;
- SUPERSEDED — explicitly replaced by a canonical branch/PR and no unique required work remains;
- UNKNOWN — insufficient evidence.

Only MERGED and SUPERSEDED branches may be pruned automatically. UNKNOWN branches MUST remain.

### FR-010 — Final canonical-state audit

The program completes only when a final audit records:

- exact `master` HEAD;
- open PRs and why each is open;
- open issues and why each is open;
- release/deployment evidence state;
- CI/evidence health;
- remaining branches by classification;
- no contradictory completed-vs-open tracking for the work covered here;
- one exact next action if unrelated backlog remains.

## Non-goals

- Rewriting merged feature history merely to make old checklists look current.
- Folding unrelated feature backlog such as #3 into the MVP convergence.
- Introducing new audio, persistence, auth, bridge, or native product architecture.
- Creating a central SIGA service or cross-repository state.
- Treating branch count reduction as a goal independent of deletion safety.
- Weakening release evidence because an external service is unavailable.
- Rotating real credentials or performing destructive production mutations without their separate authorization.

## Acceptance

1. #72/#43 is merged and tracking reconciled under its T4 contract.
2. #73 tracking matches the already merged signing-boundary reality or a residual security operation has been split explicitly.
3. #51 has a current-master recovery PR with current Spec Kit governance and fresh exact-HEAD evidence.
4. #47 is either closed from fresh proof or has a focused corrective feature.
5. #46 is closed only after its complete launch contract is proven on the current candidate.
6. Branch hygiene removes only deletion-safe branches and leaves an auditable classification.
7. Final repository state has no known contradiction across Git, PRs, issues, Spec Kit state, CI, and deployment evidence for this program.
