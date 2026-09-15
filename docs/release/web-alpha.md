# Web Alpha Release Runbook

This document is operational release evidence for the OpenBand Web alpha. It does not authorize broader marketing claims.

## Release identity

| Field | Value |
| --- | --- |
| Canonical public URL | `https://openband-one.vercel.app` |
| Candidate Git revision | `PENDING_FINAL_HEAD` |
| Promoted/deployed revision | `BLOCKED_UNTIL_PROMOTION` |
| Deployment identifier | `BLOCKED_UNTIL_PROMOTION` |
| Release state | Candidate implementation |

The candidate and deployed revision fields must be replaced with exact evidence before Human Merge Gate. A successful smoke without a revision identity is not release evidence.

## Public contract

The launch-grade Web promise is deliberately narrow:

- start from the public Web entry;
- continue without mandatory signup through the existing visitor flow;
- record, instrument, sample/drum, or import as the first creative action;
- edit and save a local-first project;
- reload/reopen it;
- export a valid audible WAV.

OpenBand is alpha software. Keep an independent backup of important work.

`Local-first` describes the local project workflow. It does **not** mean every OpenBand workflow stays on-device: account sync, collaboration, stem processing, AI providers, and other configured hosted capabilities can cross that boundary.

## Browser evidence matrix

Use only these states:

- `SUPPORTED` — complete release-specific launch smoke, including real microphone evidence, exists;
- `EXPERIMENTAL` — partial/automated evidence exists or a material limitation remains;
- `UNVERIFIED` — no release claim.

| Browser/runtime | State | Current evidence | Release note |
| --- | --- | --- | --- |
| Chromium desktop | EXPERIMENTAL | Deterministic Playwright launch path is required in CI | Becomes `SUPPORTED` only after exact-deployed-revision real-microphone smoke passes |
| Firefox desktop | UNVERIFIED | None for this candidate | Do not claim support |
| Safari desktop | UNVERIFIED | None for this candidate | Do not claim support |
| Mobile browsers | UNVERIFIED | Not part of this Web release proof | Creation remains desktop-browser optimized for this release |
| Electron / Android / iOS native | UNVERIFIED for public release | Codebase targets/build-from-source only | No signed public binary/store claim in this release |

### Evidence required for `SUPPORTED`

For each browser labeled `SUPPORTED`, record browser/version, OS, exact deployed Git SHA, date/time, and PASS evidence for:

1. landing and navigation;
2. visitor/no-account start;
3. microphone permission + audible capture;
4. playback;
5. local save/reload/reopen;
6. persistent audio availability;
7. valid audible WAV export.

## Permissions and storage limitations

### Microphone

Recording requires browser microphone permission. If permission is denied or no input device is available, recording must fail visibly; the release does not treat fabricated/silent material as success. Users can still use non-microphone first actions such as Import audio, Instrument, or Drums / sample.

### Browser storage

Local projects and durable Web audio depend on browser storage. Quota, private/incognito mode, browser cleanup policies, enterprise policies, or manual site-data deletion can reduce persistence guarantees. While the product is alpha, keep an independent backup of important work and verify the project after browser/storage changes.

## Candidate verification

The exact final PR HEAD must have PASS evidence for:

- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`;
- frontend TypeScript check;
- backend TypeScript check;
- full Vitest;
- legacy tests;
- production Web build;
- `web-launch-e2e`;
- focused public-root/auth-shell/CTA tests.

A skipped, masked, flaky, or stale required check is not PASS.

## Production smoke

Record the exact deployment revision before starting.

1. Open the canonical URL at `/` in a clean browser context.
2. Confirm `Web alpha`, `Make music. Keep the project.`, **Start creating**, and **View source** are visible.
3. Confirm **View source** resolves to `https://github.com/az1nn/openband`.
4. Select **Start creating** and confirm the existing login surface opens.
5. Select **Começar sem conta**.
6. Use one launch action to reach audible material.
7. Make a persisted edit.
8. Reload/reopen and confirm project state + audio remain available.
9. Export WAV and confirm the result is non-empty and audible.
10. Record PASS/FAIL/BLOCKED per step with browser/version/OS and deployed SHA.

The deterministic import path may be automated. At least one browser intended as `SUPPORTED` must additionally complete the real-microphone path below.

## Real-microphone smoke

Against the exact deployed candidate:

**landing → Start creating → Começar sem conta → Gravar áudio → grant microphone → record audible material → stop → playback → reload/reopen → playback → export WAV**

Record browser/version/OS, deployed SHA, and result in the PR conversation. Imported-audio CI does not replace this evidence.

## Rollback

Rollback is promotion of a known-good existing deployment/revision, not an incident-time code edit.

### Freeze before promotion

Before promoting the candidate, record:

- current production deployment/revision as `PREVIOUS_KNOWN_GOOD`;
- its deployment identifier when available;
- a short smoke proving entry, visitor start, persistence/reopen, and export.

### Procedure

1. Stop further promotion/distribution.
2. Identify the recorded `PREVIOUS_KNOWN_GOOD` revision/deployment.
3. Restore/promote that revision using the existing Vercel/Git deployment mechanism; do not patch production code during rollback.
4. Confirm the canonical public URL resolves to the restored release.
5. Run the post-rollback smoke below.
6. Record the incident result and only resume promotion after the launch-blocking regression is understood.

### Post-rollback smoke

- public entry loads;
- visitor/no-account start works;
- one audible-material path works;
- saved state survives reload/reopen;
- WAV export succeeds.

A hypothetical rollback target is insufficient for release. `PREVIOUS_KNOWN_GOOD` must be concrete before Human Merge Gate.

## Claim guardrails

Do not claim any of the following from this release unless separate evidence explicitly establishes it:

- mature desktop-DAW parity;
- universal offline behavior;
- "everything stays local";
- unlimited hosted capacity;
- public native/mobile availability;
- pricing/subscription commitments;
- support for unverified browsers.

Launch copy must describe the same deployed revision that the release evidence verifies.
