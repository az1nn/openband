# Verification — First-run and Launch E2E

## Evidence model

Verification is bound to exact Git SHAs. A later product-code change invalidates affected evidence.

### Design evidence

- Canonical base before feature branch: `aadb015e465beba5549c711a9663f5a3221f9c9e`.
- Issue #50 open; no active #50 PR at preflight.
- No pre-existing Spec Kit feature for #50.
- Architecture Graph preflight workflow run: `34763778745` — PASS.
- Graph build: 504 nodes / 1364 edges.
- Impact:
  - login: MEDIUM, 2 direct / 2 transitive;
  - onboarding: HIGH, 3 direct / 92 transitive;
  - Feed entry: HIGH, 4 direct / 90 transitive;
  - Studio route: HIGH, 5 direct / 5 transitive;
  - Studio hooks: HIGH, 8 direct / 10 transitive.
- Temporary Graph workflow removed after evidence collection.

Design-baseline CI / SDD evidence: pending exact clean design HEAD.
Human Design Gate: pending.

## Automated implementation evidence required

### Focused behavior

- Visitor CTA uses existing `signInAsVisitor()` behavior.
- Four first-run choices render and dispatch correctly.
- Specific launch action is not blocked by generic coachmark behavior.
- Existing normal NewProject path remains available.

### Launch Playwright journey

Clean browser state must prove:

1. explicit no-account entry;
2. Import audio first-run choice;
3. local project route created;
4. real file chooser receives a generated valid audible WAV;
5. imported track becomes visible;
6. persisted region identity becomes `asset://...`;
7. IndexedDB contains non-empty asset bytes;
8. one real UI edit is persisted;
9. reload/reopen retains audio and edit;
10. Bounce downloads a WAV;
11. WAV has RIFF/WAVE structure, non-empty data, and non-zero PCM peak;
12. elapsed first-sound time <60 seconds;
13. elapsed export time <10 minutes.

### Repository gates

Exact final PR HEAD must pass:

- frontend typecheck;
- backend typecheck;
- full Vitest;
- legacy tests;
- Web build;
- launch Playwright spec in CI;
- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`;
- post-implementation Graph impact.

## Human microphone release evidence required

This cannot be replaced by mocked CI.

On a Web browser with a real microphone, a human must:

1. clear/isolated first-run state or use a fresh profile;
2. choose the no-account visitor path;
3. choose **Record audio**;
4. grant microphone permission;
5. record an audible phrase/instrument;
6. stop recording and confirm the new audio material exists;
7. play it back and confirm it is audible;
8. allow/save the project, reload or reopen it, and confirm the recording remains;
9. export the mix as WAV;
10. confirm the exported file is present and audibly contains the recording.

Record browser/platform, result, and exact verified PR HEAD in the PR conversation before Human Merge Gate.

## Process gates

- Product implementation MUST NOT start before Human Design Gate.
- Human Merge Gate MUST reference the exact fully verified PR HEAD.
- Merge remains human-only.
