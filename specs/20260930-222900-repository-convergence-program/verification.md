# Verification: Repository Convergence Program

## Evidence principle

#117 is a T3 coordination feature. It may prove that the sequence and governance are coherent, but it MUST NOT convert child-feature evidence into an umbrella shortcut.

Allowed evidence states:

`PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE`

Only PASS and justified NOT_REQUIRED satisfy required evidence.

## #117 planning candidate

Required exact-HEAD checks for this documentation-only feature:

- graph-check;
- security-policy;
- frontend-typecheck;
- backend-typecheck;
- vitest;
- legacy-tests;
- web-build;
- web-launch-e2e;
- merge-gate.

Android/Electron native jobs are NOT_REQUIRED for the #117 planning branch unless branch contents or current policy independently require them.

## Phase-gate verification

### Gate P1 — #43 / PR #72

Required evidence is owned by #43, not #117.

Verify:

- candidate/base identity;
- schemaVersion 2 risk metadata;
- graph/security/typecheck/test/build/E2E checks;
- android-build;
- electron-build;
- merge-gate;
- target-selection adversarial cases;
- no swallowed native failure;
- retained artifact/manifests match exact candidate SHA;
- Android signing-boundary proof remains compatible.

Exit only after merge and post-merge repository reconciliation.

### Gate P2 — #73

Verify from current master:

- merged PR #74 identity;
- ADR present;
- default release verification is unsigned/unprivileged;
- production mode is explicit;
- incomplete/invalid production inputs fail closed;
- release has no debug-signing fallback;
- CI does not expose production signing inputs to ordinary PR verification;
- adversarial harness/policy tests exist and were part of the merged evidence.

If real credential/account inventory is unresolved, mark that separate operation BLOCKED/HUMAN_REQUIRED without reopening repository implementation status.

### Gate P3 — #51 recovery

Before implementation:

- replacement branch starts at then-current master;
- old PR #69 semantic-diff inventory is complete;
- new recovery Spec Kit feature is schemaVersion 2;
- current Graph impact is recorded;
- automated design validation PASS.

Before merge:

- exact-HEAD required checks PASS;
- no unresolved blocking review;
- deployment source revision equals candidate revision;
- deployed deterministic smoke PASS;
- browser support labels match evidence;
- real-microphone evidence PASS for any browser claimed SUPPORTED;
- rollback target is concrete and viable;
- public docs/README claims match proven behavior;
- old #69 is superseded only after replacement traceability is durable.

A Vercel rate-limit or other external deployment outage is BLOCKED, not PASS.

### Gate P4 — #47 reproof

Verify against the current release candidate:

- visitor path without mandatory signup;
- path to first sound;
- Web recording start/stop and audible result;
- region move/duplicate/delete/repeat;
- transport/BPM/metronome/undo/redo/mute/solo/volume/pan;
- visible non-destructive failure handling.

Evidence may be reused from #51 only when the exact candidate and semantic requirement match.

### Gate P5 — #46 closure

Required child states:

- #47 complete;
- #48 complete;
- #49 complete;
- #50 complete;
- #51 complete.

Current-candidate launch proof:

- blank/local project starts;
- first sound achieved and timed;
- edit/arrangement works;
- save/reopen preserves project/audio;
- WAV export exists, is decodable, non-empty, and audibly reflects project state;
- relevant failure paths are non-destructive;
- blank-to-export journey is timed;
- release claims match support state.

### Gate P6 — branch hygiene

For every deletion:

- branch identity recorded;
- no open PR depends on it;
- no live session/task lease depends on it;
- no active Spec Kit dependency depends on it;
- merged ancestry OR explicit supersession is proven;
- unique commits are absent or proven intentionally superseded;
- post-delete inventory confirms no protected/default/active/unknown branch was removed.

No evidence => UNKNOWN => keep.

### Gate P7 — final audit

Final report must be generated from fresh GitHub/deployment evidence and include:

- exact master SHA;
- open PR inventory;
- open issue inventory;
- current release/deployment revision/state;
- current CI state;
- branch classification totals;
- unresolved blockers;
- exactly one next canonical action.

## Staleness rules

Evidence becomes STALE when any relevant condition changes, including:

- candidate HEAD changes;
- base changes materially;
- recovery branch is recreated;
- required-check policy changes;
- deployment source revision changes;
- release support claim changes;
- a branch targeted for deletion gains a PR/lease/dependency.

Stale evidence must be rerun; it cannot be grandfathered by #117.

## Failure handling

- **TRANSIENT:** retry only safe/idempotent checks.
- **CONFLICT:** reconcile real state before mutation.
- **BLOCKED:** record exact blocker and deterministic re-probe.
- **HUMAN_REQUIRED:** use only for a real external/human action with no autonomous substitute.
- **PERMANENT:** preserve evidence and create/fix the owning feature rather than weakening gates.

## Program completion proof

#117 is operationally complete only when all phases have either:

1. reached their defined exit gate; or
2. produced an explicit independent follow-up for a genuine residual action and the main repository state is no longer contradictory.

The final state must not claim the MVP complete if #46/#51 release evidence remains blocked.
