# Verification — Web Release Readiness

## Evidence policy

Required states are `PASS`, `FAIL`, `BLOCKED`, `FLAKY`, or `NOT_REQUIRED`. A required `FAIL`, `BLOCKED`, or `FLAKY` result blocks Human Merge Gate.

Release evidence is valid only when it identifies the exact PR HEAD or exact deployed revision it verifies.

## Design-stage evidence

| Evidence | Required | State | Notes |
| --- | --- | --- | --- |
| Issue/feature identity | yes | PASS | #51 / `20260915-083000-web-release-readiness` |
| Base revision | yes | PASS | branch created from `master` after PR #67 merge |
| Tier classification | yes | PASS | T2 with explicit T3/T4 escalation triggers |
| Existing Web root reviewed | yes | PASS | current `/` redirects to `/tabs`; root shell redirects unauthenticated non-auth routes to `/login` |
| Existing deployment config reviewed | yes | PASS | reuse current Vercel Web export topology |
| Existing CI launch E2E reviewed | yes | PASS | `web-launch-e2e` already required in PR CI |
| Marketing/product guardrails reviewed | yes | PASS | launch kit/checklist/product docs are source material |
| Architecture Graph preflight | yes | PASS | runs `34963915926` + `34964085935`: root MEDIUM/0, root shell MEDIUM/1, login MEDIUM/2, Feed HIGH/91, Onboarding HIGH/93; no semantic T3 trigger |
| Spec Kit analysis | yes | BLOCKED | run after graph-refined design baseline is complete |
| Human Design Gate | yes | BLOCKED | cannot occur until analyze evidence converges |

## Automated candidate verification

The exact final PR HEAD must pass:

| Check | Required state |
| --- | --- |
| `npm run sdd:check` | PASS |
| `npm run test:graph-sdd` | PASS |
| `npm run graph:ci` | PASS |
| frontend TypeScript check | PASS |
| backend TypeScript check | PASS |
| full Vitest | PASS |
| legacy tests | PASS |
| production Web build | PASS |
| existing `web-launch-e2e` | PASS |
| focused Web landing/root-auth-shell tests | PASS |
| focused primary/source CTA tests | PASS |

The root-auth-shell tests must prove that unauthenticated Web `/` is public while existing protected routes keep their current redirect behavior and non-Web root behavior is preserved.

No required job may be converted to a soft failure, skipped through a release-only condition, or satisfied by stale evidence from another HEAD.

## Deployed release smoke

Record:

- canonical URL;
- exact deployed Git SHA;
- deployment identifier when exposed by the platform;
- date/time;
- browser + version + OS for human checks;
- result state per step.

Required smoke:

1. `/` loads the public launch entry without requiring a session.
2. Alpha status and core promise are visible.
3. **Start creating** enters the existing login/visitor path.
4. Visitor/no-account entry succeeds.
5. One deterministic launch path reaches audible material.
6. A persisted edit survives reload/reopen.
7. WAV export downloads and is valid/audible under the existing #49/#50 contract.
8. **View source** resolves to the canonical repository.
9. A failure in permission/storage/export surfaces visibly rather than fabricating success.
10. A representative existing protected route still redirects an unauthenticated visitor according to the current auth contract.

## Real microphone evidence

At least one desktop browser intended to be labeled `SUPPORTED` must have human evidence for:

**landing → Start creating → no-account visitor → Record audio → grant mic → record audible material → stop → playback → reload/reopen → playback → WAV export**

Record browser/version/OS and exact deployed SHA. Imported-audio Playwright does not replace this evidence.

## Browser support matrix evidence

The release document must use only:

- `SUPPORTED` — complete release-specific smoke evidence exists;
- `EXPERIMENTAL` — partial evidence exists or known limitations remain;
- `UNVERIFIED` — no release claim.

For any `SUPPORTED` browser, verify at minimum:

- public landing and navigation;
- microphone permission and capture;
- playback;
- local save/reload/reopen;
- persistent audio asset availability;
- WAV export.

Storage quota/private-mode behavior may be documented as a limitation rather than treated as supported if the browser imposes known restrictions.

## Data/copy reconciliation

Before Merge Gate, inspect the exact release candidate for these forbidden overclaims:

- mature desktop DAW parity;
- "everything stays local" or equivalent blanket privacy claim;
- universal offline operation;
- unlimited hosted capacity;
- public pricing commitments not represented by product policy/code;
- competitor-paid-status claims without current evidence;
- native/mobile availability beyond verified public releases.

README, launch entry, product docs and release notes must agree on alpha status and launch scope.

## Rollback evidence

Before Merge Gate, record a concrete previous known-good Web revision/deployment and verify that the runbook contains:

1. how to identify/promote the known-good deployment using the existing platform/Git mechanism;
2. how to verify the public URL now serves the restored release;
3. a post-rollback smoke covering entry, visitor start, persistence and export;
4. how the incident/release result is recorded.

A hypothetical rollback statement without a concrete known-good target is insufficient.

## Architecture convergence

Post-implementation Graph evidence must be compared with preflight. High centrality alone does not force T3, but new cross-runtime, backend, auth identity/session, broader route-protection, persistence, export/DSP, or deployment-boundary coupling requires re-analysis and a fresh Design Gate.

## Human Merge Gate

Present the gate only when:

- exact PR HEAD is known;
- all required automated evidence is PASS;
- deployed candidate maps to the intended revision;
- real-microphone evidence is PASS for at least one supported browser;
- browser matrix and limitations are evidence-backed;
- rollback target/procedure are concrete;
- documentation claims are reconciled;
- no blocking review thread remains;
- PR is mergeable/current;
- no temporary evidence workflow remains in the final diff.

Merge remains human-only.
