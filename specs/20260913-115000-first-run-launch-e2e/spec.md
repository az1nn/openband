# Feature: First-run and Launch E2E

**Tier:** T2 — bounded launch UX and verification
**Issue:** #50

## Goal

Make the first OpenBand session lead from a no-account visitor entry to a real Studio action quickly, then prove the launch-critical Web journey through persisted editing and trustworthy WAV export.

## User journey

A new Web visitor can start without creating an account, choose what they want to do first, create a local project, make or import sound, edit it, reload without losing the work, and export a valid WAV.

The first-run screen MUST be action-first rather than feature-inventory-first. It offers exactly these primary choices:

1. **Record audio**
2. **Instrument**
3. **Drums / sample**
4. **Import audio**

Advanced tools remain available elsewhere but MUST NOT block this first creative action.

## Requirements

- **FR-001 — No mandatory signup.** The existing local visitor session remains the no-account path. First-run UX MUST make that path obvious without changing authentication identity semantics.
- **FR-002 — Action-first onboarding.** `src/components/OnboardingFlow.tsx` MUST lead with the four launch actions above instead of requiring genre/mood selection before the user can act.
- **FR-003 — Fast project start.** Choosing a launch action creates/opens a local project with safe defaults and routes directly to `app/studio/[id].tsx`; the existing full `NewProject` wizard remains available outside this first-run shortcut.
- **FR-004 — Existing Studio capabilities are reused.** Record routes to the existing record-options flow, Instrument to the existing Synth entry, Drums / sample to the existing Sampler entry, and Import audio to the existing persistent audio-import path.
- **FR-005 — Import remains gesture-safe.** Web file selection MUST still be initiated from an explicit user click in Studio; route navigation MUST NOT depend on a programmatic file picker that may lose browser user activation.
- **FR-006 — No blocking generic overlay.** When a specific launch action is selected, generic onboarding coachmarks MUST NOT obscure or supersede that action. Any first-run guidance shown in Studio must be action-aware and dismissible.
- **FR-007 — Existing trust contracts remain authoritative.** Project persistence continues through `src/lib/projectStore.ts` and durable audio through the existing `asset://` / IndexedDB boundary. Export continues through the #49 strict WAV path. No duplicate persistence or export mechanism is introduced.
- **FR-008 — Deterministic launch E2E.** Playwright MUST cover one complete Web journey using a generated audible WAV fixture: visitor entry → Import audio choice → project creation → durable import / first sound → one real persisted edit → save/autosave → reload/reopen → WAV export.
- **FR-009 — Export assertion.** The E2E download MUST be structurally RIFF/WAVE, contain a non-empty data chunk, and contain non-zero PCM energy.
- **FR-010 — Persistence assertion.** After reload/reopen, the imported material and the selected edit MUST still be present; persisted audio identity MUST remain `asset://`, never `blob:`.
- **FR-011 — Entry-point coverage.** Automated component/integration coverage MUST prove all four first-run choices dispatch to the intended Studio entry behavior even though the full E2E uses Import audio for determinism.
- **FR-012 — CI enforcement.** The launch-critical Playwright spec MUST run in pull-request CI; existing shallow screen-presence smoke tests do not satisfy this requirement.
- **FR-013 — Timing evidence.** Automated evidence MUST record the elapsed deterministic journey and assert first imported sound is reached within 60 seconds and export within 10 minutes. These are launch targets, not a substitute for later real-user telemetry.
- **FR-014 — Real microphone evidence.** Before Human Merge Gate, a human MUST perform one Web microphone smoke: enter as visitor, choose Record audio, grant mic permission, record audible material, stop, play it, reload/reopen, and export it. CI does not fake this evidence.
- **FR-015 — Failure transparency.** If visitor entry, project creation, import, persistence, reload, or export fails, the test or UI MUST surface failure rather than silently continue with fabricated success.

## Non-goals

- Replacing Supabase authentication or the existing visitor-session model.
- Changing project schema, durable asset identity, autosave ownership, or export codec semantics.
- Redesigning the complete Feed, QuickTools, NewProject wizard, Studio transport, DSP, or mobile/native onboarding.
- Building new instruments, drum engines, sample engines, or recording infrastructure.
- Using microphone capture in CI.

## Acceptance

1. A clean Web visitor can visibly choose a no-account start path.
2. First-run presents Record audio, Instrument, Drums / sample, and Import audio as the four primary starts.
3. Each choice enters Studio in the matching existing capability without an unrelated advanced-feature gate.
4. The deterministic Playwright journey creates a project, imports audible WAV material, performs a persisted edit, reloads/reopens, and exports an audible valid WAV.
5. The Playwright launch journey runs in PR CI and passes on the exact verified HEAD.
6. A real-microphone manual smoke is recorded as evidence before Merge Gate.
7. Frontend/backend typecheck, Vitest, legacy tests, Web build, SDD checks, Graph checks, and the launch E2E are green on the verified HEAD.

## Risk boundary

This remains **T2** because it orchestrates existing guest auth, project creation, Studio entrypoints, persistence, and export without changing their contracts. Architecture Graph reports high centrality for `OnboardingFlow`, Feed, and Studio surfaces, so verification must be broad.

Escalate to **T3 + fresh Human Design Gate** if implementation requires changing visitor identity/auth semantics, project or `asset://` persistence ownership, project schema, cross-runtime bridge boundaries, export architecture, or another durable architectural contract.
