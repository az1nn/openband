# Verification — First-run and Launch E2E

## Evidence model

Verification is bound to exact Git SHAs. A later product-code change invalidates affected runtime evidence.

## Design evidence

- Canonical base before feature branch: `aadb015e465beba5549c711a9663f5a3221f9c9e`.
- Issue #50 was open; no active #50 PR existed at preflight.
- No pre-existing Spec Kit feature for #50 existed.
- Architecture Graph preflight workflow run: `34763778745` — PASS.
- Preflight Graph build: 504 nodes / 1364 edges.
- Preflight impact:
  - login: MEDIUM, 2 direct / 2 transitive;
  - onboarding: HIGH, 3 direct / 92 transitive;
  - Feed entry: HIGH, 4 direct / 90 transitive;
  - Studio route: HIGH, 5 direct / 5 transitive;
  - Studio hooks: HIGH, 8 direct / 10 transitive.
- Temporary preflight Graph workflow was removed after evidence collection.
- Design baseline: `3d1f26c73deeb3e7b804d155a02c707bbe9bbcc5`.
- OpenBand CI V2 run `34764012188` / run #315: PASS on the exact design baseline.
- Human Design Gate: APPROVED in the active user session and recorded in PR #67; approval applies to the design baseline above and is not merge authorization.

## Implemented behavior

The implementation stays inside the approved T2 envelope:

- `app/(auth)/login.tsx` makes the existing visitor path explicit as **Começar sem conta**; visitor-session semantics remain owned by the unchanged `AuthContext`.
- `src/lib/firstRun.ts` defines exactly four first-run actions and maps them to existing Studio capabilities.
- `src/components/OnboardingFlow.tsx` presents Record audio / Instrument / Drums-Sample / Import audio first, with the existing full NewProject wizard retained as a secondary path.
- `app/tabs/index.tsx` creates/routes the scratch first-run project without introducing a new persistence or auth boundary.
- `app/studio/[id].tsx` dispatches action-specific entry to existing record, Synth, Sampler and persistent import behavior.
- Import keeps a real user click in Studio before opening the browser file chooser, preserving browser user-activation requirements.
- Action consumption is ephemeral in `sessionStorage`; it does not alter project schema or persisted project data.
- `.github/workflows/ci.yml` now runs the launch-critical Playwright spec after Web build.
- No implementation change was made to `AuthContext`, project schema, `projectStore`, `assetStore`, `persistenceTrust`, `exportTrust`, bridge/runtime ownership or DSP algorithms.

## Launch E2E convergence

The deterministic launch journey uses a generated audible mono PCM WAV and verifies:

1. explicit no-account entry;
2. Import audio first-run choice;
3. local project route creation;
4. a real browser file chooser receives the WAV fixture;
5. imported track becomes visible;
6. persisted region identity becomes `asset://...`;
7. the referenced IndexedDB asset contains non-empty Blob bytes;
8. one real title edit persists;
9. reload retains the edit and durable audio identity/bytes;
10. real Bounce export triggers a browser download;
11. downloaded file is RIFF/WAVE with a non-empty data chunk, 16-bit PCM and non-zero PCM energy;
12. first imported audible material is reached in <60 seconds;
13. export completes within the <10 minute launch target.

### Defect found by launch E2E

OpenBand CI V2 run `34767835260` / run #321 on implementation candidate `784c26c1ddc637c50e97bc9e131d73927c130339` failed only `web-launch-e2e`.

The failure was a real product UX defect: the desktop persistent navigation/sidebar intercepted pointer events over the visible `onboarding-action-import` control. The Playwright test was **not** weakened with a forced click. `OnboardingFlow` was corrected to own the intended overlay stacking layer, and its JSX formatting was normalized.

The E2E was subsequently strengthened to verify non-empty IndexedDB asset bytes before and after reload. Final exact-HEAD CI evidence remains pending after this convergence change.

## Post-implementation Architecture Graph

Temporary post-impact workflow run `34768180405` — PASS on `0e0c114b097a2e14a305d17f614373c7affeb32e` after the stacking fix.

- Graph build: 506 nodes / 1373 edges.
- login: MEDIUM, 2 direct / 2 transitive.
- onboarding: HIGH, 4 direct / 93 transitive.
- first-run helper: HIGH, 4 direct / 94 transitive.
- Feed entry: HIGH, 4 direct / 91 transitive.
- Studio route: HIGH, 6 direct / 6 transitive.

The HIGH classifications reflect graph centrality/composition. The implementation did not cross the semantic T3 escalation boundary: auth identity/session semantics, project schema/persistence ownership, `asset://`, bridge/runtime boundaries and export architecture remain unchanged.

The temporary post-impact workflow was removed after evidence collection.

## Repository gates required on final exact HEAD

The final PR HEAD must pass:

- frontend typecheck;
- backend typecheck;
- full Vitest;
- legacy tests;
- Web build;
- launch Playwright spec in CI;
- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`.

Exact final verified PR HEAD: **PENDING**.

## Human microphone release evidence required

This cannot be replaced by mocked CI.

On a Web browser with a real microphone, a human must:

1. use a fresh/isolated first-run state;
2. choose **Começar sem conta**;
3. choose **Gravar áudio**;
4. grant microphone permission;
5. record an audible phrase/instrument;
6. stop recording and confirm the new audio material exists;
7. play it back and confirm it is audible;
8. reload or reopen the same project and confirm the recording remains;
9. export the mix as WAV;
10. confirm the exported file is present and audibly contains the recording.

Record browser/platform, result and exact verified PR HEAD in the PR conversation before Human Merge Gate.

## Process gates

- Human Design Gate was approved before product implementation.
- Human Merge Gate MUST reference the exact fully verified PR HEAD plus real-microphone evidence.
- Merge remains human-only.
