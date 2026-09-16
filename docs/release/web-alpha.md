# Web Alpha Release Runbook

This document is operational release evidence for the OpenBand Web alpha. It does not authorize broader marketing claims.

Human-only validation that can be performed later is tracked in [`human-validation-pending.md`](./human-validation-pending.md). Deferred human validation remains a release blocker; it is never inferred as PASS from CI.

## Release identity

| Field | Value |
| --- | --- |
| Canonical public URL | `https://openband-one.vercel.app` — production target; final candidate promotion still requires exact revision proof |
| Last product-code candidate with full automated PASS | `582889e238fe65afe2b627d3e91365a969344e6e` |
| CI evidence | OpenBand CI V2 `35026016724` — PASS |
| Candidate Vercel deployment | `5wmHeQysZVPDE5vnxadKrX3Dvec3` — deployment completed |
| Promoted production revision | `PENDING_CANONICAL_PROMOTION_PROOF` |
| Release state | Automated candidate green; human/deployed validation pending |

Documentation reconciliation after the product-code candidate changes the PR HEAD without changing runtime behavior. The final PR SHA is recorded in the PR conversation after the documentation-only CI passes rather than self-referentially in this file.

A successful smoke without revision identity is not release evidence.

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
| Chromium desktop | EXPERIMENTAL | Playwright launch → visitor → import → persistence/reload → WAV export PASS on candidate `582889e…` | Becomes `SUPPORTED` only after exact-deployed-revision real-microphone + audible export smoke passes |
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

The durable checklist is `docs/release/human-validation-pending.md`.

## Permissions and storage limitations

### Microphone

Recording requires browser microphone permission. If permission is denied or no input device is available, recording must fail visibly; the release does not treat fabricated/silent material as success. Users can still use non-microphone first actions such as Import audio, Instrument, or Drums / sample.

### Browser storage

Local projects and durable Web audio depend on browser storage. Quota, private/incognito mode, browser cleanup policies, enterprise policies, or manual site-data deletion can reduce persistence guarantees. While the product is alpha, keep an independent backup of important work and verify the project after browser/storage changes.

## Candidate verification

Product-code candidate `582889e238fe65afe2b627d3e91365a969344e6e` completed OpenBand CI V2 `35026016724` with all required automated gates green:

- `npm run sdd:check` — PASS;
- `npm run test:graph-sdd` — PASS;
- `npm run graph:ci` — PASS;
- frontend TypeScript check — PASS;
- backend TypeScript check — PASS;
- full Vitest — PASS;
- legacy tests — PASS;
- production Web build — PASS;
- `web-launch-e2e` — PASS;
- focused public-root/auth-shell/CTA tests — PASS via full Vitest.

Android and Electron jobs were only the expected conditional skips.

The final documentation-reconciled PR HEAD must also receive a clean CI before Human Merge Gate. A skipped, masked, flaky, or stale required check is not PASS.

## Production smoke

State: **PENDING HUMAN / EXACT PRODUCTION-REVISION IDENTITY**.

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

The deterministic import path is already automated. At least one browser intended as `SUPPORTED` must additionally complete the real-microphone path below.

## Real-microphone smoke

State: **PENDING HUMAN**.

Against the exact deployed candidate:

**landing → Start creating → Começar sem conta → Gravar áudio → grant microphone → record audible material → stop → playback → reload/reopen → playback → export WAV**

Record browser/version/OS, deployed SHA, and result in the PR conversation. Imported-audio CI does not replace this evidence.

See [`human-validation-pending.md`](./human-validation-pending.md) for the full HVT checklist and copy/paste evidence template.

## Rollback

Rollback is promotion of a known-good existing deployment/revision, not an incident-time code edit.

### Previous known-good

The rollback target is already concrete:

- revision: `2aa887e3bd2ab4643407ae96532966ec1fed9767`;
- release: merged #50 / PR #67 first-run launch journey;
- Vercel commit status: deployment completed successfully;
- Vercel deployment identifier: `BvCLtXBmtRY4iuofRi3pTkYWxRDB`.

### Procedure

1. Stop further promotion/distribution.
2. Select the recorded previous known-good revision/deployment above.
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

Post-rollback smoke is required if rollback is actually executed. The rollback target itself is no longer hypothetical.

## Deferred human validation policy

Human checks may be performed later, but they remain explicit release debt. While they are pending:

- Chromium desktop stays `EXPERIMENTAL`;
- no browser is promoted to `SUPPORTED` from CI alone;
- Human Merge Gate remains blocked;
- the PR may continue receiving non-human verification/documentation work;
- any runtime change after the automated candidate requires fresh automated evidence before the human smoke is accepted for Merge Gate.

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