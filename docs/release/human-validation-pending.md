# Pending Human Validation — Web Alpha

This document is the durable handoff for release checks that require a real person, real browser/device permissions, and audible judgment. These checks are intentionally **not** replaced by CI, synthetic media, or agent assertions.

## Status

- Feature: #51 — Web release readiness
- PR: #69
- Automated candidate proven before this documentation reconciliation: `582889e238fe65afe2b627d3e91365a969344e6e`
- CI: OpenBand CI V2 run `35026016724` — PASS
- Vercel status for that SHA: deployment completed successfully
- Human validation state: **PENDING**
- Human Merge Gate: **BLOCKED only by release evidence that still requires human/deployed validation**

Because this document itself changes the PR HEAD, the exact final evidence SHA must be updated after the documentation-only CI completes. Human validation must always record the SHA/deployment actually tested.

## What CI already proves

The release candidate has automated PASS evidence for:

- Spec Kit / SDD checks;
- Architecture Graph checks;
- frontend TypeScript;
- backend TypeScript;
- Vitest;
- legacy tests;
- Web production build;
- deterministic launch E2E;
- public landing → Start creating → visitor flow;
- deterministic first-run import;
- persisted project title across reload;
- durable imported audio path;
- WAV export in the launch E2E.

These checks reduce the human pass to things automation cannot honestly prove: real microphone permission/capture, audible playback/export, browser-specific behavior, and exact deployed-release identity.

## Pending human checks

### HVT-001 — Exact deployed candidate identity

**Goal:** make sure the browser test is running the intended candidate, not an older deployment.

Record:

- public/preview URL;
- deployment identifier;
- exact Git SHA;
- date/time;
- browser/version;
- OS/version.

**PASS:** deployment mechanism identifies the exact SHA being tested.

### HVT-002 — Public entry and visitor start

1. Open `/` in a clean browser context.
2. Confirm `Web alpha` is visible.
3. Confirm `Make music. Keep the project.` is visible.
4. Confirm **Start creating** is clickable.
5. Confirm **View source** resolves to `https://github.com/az1nn/openband`.
6. Select **Start creating**.
7. Select **Começar sem conta**.

**PASS:** no mandatory signup is introduced and the visitor reaches the existing first-run flow.

### HVT-003 — Real microphone capture

1. Choose **Record / Gravar áudio** from the first-run actions.
2. Grant microphone permission when requested.
3. Record several seconds of clearly audible material.
4. Stop recording.
5. Play it back.

**PASS:** permission succeeds, captured audio is non-silent/audible, and playback is correct.

**FAIL:** silent/fabricated capture, hidden permission failure, broken playback, or an unrecoverable UI state.

### HVT-004 — Persistence and reopen

1. Make a visible persisted edit, such as renaming the project.
2. Reload the page or reopen the project.
3. Confirm the project edit remains.
4. Confirm the recorded audio remains available.
5. Play the recording again.

**PASS:** project state and recorded audio both survive reload/reopen.

### HVT-005 — Audible WAV export

1. Export the project as WAV.
2. Confirm the downloaded file is non-empty.
3. Open it in a local player/browser.
4. Listen to the exported content.

**PASS:** the WAV opens and contains the expected audible material.

Automation may prove file structure/non-empty output, but the human check is the audible-content judgment.

### HVT-006 — Protected-route regression sanity check

In a clean unauthenticated browser context, open a representative protected route directly.

**PASS:** it still follows the existing authentication/visitor protection contract instead of becoming publicly accessible because `/` is public.

## Browser support decision

Do not upgrade a browser to `SUPPORTED` without all required release-specific human evidence.

- `SUPPORTED`: HVT-001 through HVT-006 PASS for that browser/runtime, including real microphone and audible WAV.
- `EXPERIMENTAL`: automated/partial evidence exists, but one or more human checks are pending or a material limitation remains.
- `UNVERIFIED`: no release-specific evidence exists.

Until the human run is recorded, Chromium desktop remains `EXPERIMENTAL`; Firefox, Safari, mobile browsers, and native public releases remain `UNVERIFIED` unless separately proven.

## Evidence template

Paste the following into PR #69 or send it back to the project agent when the test is eventually run:

```text
Human Web Alpha Smoke

URL:
Deployment ID:
Git SHA:
Date/time:
Browser/version:
OS/version:

HVT-001 exact deployment identity: PASS | FAIL | BLOCKED
HVT-002 public entry + visitor start: PASS | FAIL | BLOCKED
HVT-003 real microphone capture + playback: PASS | FAIL | BLOCKED
HVT-004 persistence/reopen + recorded audio: PASS | FAIL | BLOCKED
HVT-005 audible WAV export: PASS | FAIL | BLOCKED
HVT-006 protected-route sanity: PASS | FAIL | BLOCKED

Notes:
```

A concise response such as `PASS — Chrome <version>, Windows 11` is acceptable only when the tester has completed the full sequence and the tested deployment/SHA can be recovered from deployment evidence. Otherwise use the expanded template.

## Failure handling

If any step fails:

1. do **not** reinterpret it as PASS;
2. record browser/OS, exact step, visible behavior, and deployment SHA;
3. preserve screenshots/console details if convenient;
4. keep the Human Merge Gate blocked;
5. fix the product or documentation in a new verified HEAD;
6. rerun only the affected human path plus any automated regression gates required by the change.

## Completion rule

This document is resolved only when:

- at least one intended desktop browser has complete real-microphone release evidence;
- the exact tested deployed revision is known;
- persistence/reopen and audible WAV export pass on that revision;
- the browser matrix is updated from evidence;
- rollback target/procedure remains concrete;
- the final PR HEAD is green and mergeable;
- the Human Merge Gate is explicitly presented and approved.

The human tests may be performed later; until then they remain an explicit release debt, not an assumed success.