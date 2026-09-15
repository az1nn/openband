# Plan — First-run and Launch E2E

## Classification

**Tier:** T2  
**Issue:** #50  
**Depends on:** #48 Persistence Trust, #49 Export Trust

The implementation is bounded UX orchestration plus launch verification. It reuses existing visitor auth, project starter, Studio tools, persistence and strict WAV export. It does not introduce a new runtime boundary or durable data contract.

ADR: NOT REQUIRED — implementation remains inside existing authentication, project, Studio, persistence and export boundaries; create an ADR only if that premise changes.

### T3 escalation boundary

Stop and reclassify to T3 with a fresh Design Gate if implementation requires changing any of the following:

- authentication identity/session semantics;
- project schema or persistence ownership;
- `asset://` durable identity semantics;
- Web/native bridge or runtime boundaries;
- export renderer architecture or DSP algorithms.

No such escalation was required during implementation.

## Implemented design

### 1. Explicit no-account entry

`app/(auth)/login.tsx` exposes the existing visitor path as **Começar sem conta**. `AuthContext.signInAsVisitor()` remains unchanged and authoritative; no automatic anonymous session was introduced.

### 2. Action-first onboarding

`src/components/OnboardingFlow.tsx` now asks for the creative action first and exposes exactly four primary choices:

1. **Gravar áudio**
2. **Instrumento**
3. **Bateria / sample**
4. **Importar áudio**

The existing `NewProject` genre/mood wizard remains available as a secondary advanced path and continues to serve normal project creation.

### 3. Fast scratch project

`src/lib/firstRun.ts` uses the existing project-starter boundary with safe defaults:

- title: `Meu primeiro projeto`;
- genre: pop;
- BPM: 120;
- key: C;
- 8 bars;
- 4/4;
- scratch start enabled.

The generated Studio route carries `fromOnboarding=1`, `scratch=1` and a bounded `tool` value. No first-run intent is added to persisted `ProjectData`.

### 4. Existing Studio capability dispatch

`app/studio/[id].tsx` reuses existing capabilities:

- Record → `recordOptions`;
- Instrument → Synth;
- Drums / sample → Sampler;
- Import → existing persistent `handleImportAudio` path.

Action consumption is ephemeral in Web `sessionStorage`, preventing the same first-run action from reopening after reload without changing durable project data.

### 5. Browser user activation for Import

Import never auto-opens a browser file chooser after navigation. Studio renders an explicit **Importar áudio agora** CTA and that click directly invokes the existing persistent importer, preserving browser user-activation requirements.

Generic Studio onboarding coachmarks are suppressed for action-specific routes so they cannot obscure the intended action.

### 6. Desktop overlay convergence

The first launch E2E found a real stacking defect: the persistent desktop sidebar intercepted pointer events over a visible onboarding action. The product overlay was fixed to own the intended stacking layer. Playwright was not weakened with `force: true` or another bypass.

## Launch-critical Playwright

PR CI runs `e2e/launch-first-run.spec.ts` after the Web build using a deterministic audible generated WAV fixture.

The journey proves:

1. browser begins unauthenticated for the launch test;
2. user chooses **Começar sem conta**;
3. user chooses **Importar áudio**;
4. Studio presents the action-aware import CTA;
5. a real Playwright file chooser receives the WAV fixture;
6. the imported track becomes visible;
7. persisted region identity becomes `asset://...`;
8. referenced IndexedDB Blob has non-zero bytes;
9. first imported audible material is reached in <60 seconds;
10. project title is edited through real UI and persisted;
11. reload retains title, track, `asset://` identity and non-empty IndexedDB bytes;
12. real Bounce UI exports a browser download;
13. downloaded file is RIFF/WAVE, 16-bit, contains a non-empty data chunk and non-zero PCM energy;
14. export completes within the <10 minute launch target.

The E2E CI job uses synthetic Supabase public env values only so `getSession()` starts empty instead of using the repository's no-env development mock session. Product auth behavior is unchanged.

## Focused tests

Focused tests cover:

- exactly four first-run actions;
- action → Studio tool mapping;
- route parameters;
- advanced/full-project wizard availability;
- onboarding completion / don't-show behavior;
- explicit visitor CTA copy.

## Architecture Graph

### Preflight

Workflow `34763778745`:

- Graph: 504 nodes / 1364 edges;
- login: MEDIUM 2/2;
- onboarding: HIGH 3/92;
- Feed entry: HIGH 4/90;
- Studio route: HIGH 5/5;
- Studio hooks: HIGH 8/10.

### Post-implementation

Workflow `34768180405` on `0e0c114b097a2e14a305d17f614373c7affeb32e`:

- Graph: 506 nodes / 1373 edges;
- login: MEDIUM 2/2;
- onboarding: HIGH 4/93;
- first-run helper: HIGH 4/94;
- Feed entry: HIGH 4/91;
- Studio route: HIGH 6/6.

The HIGH classifications reflect graph centrality/composition. The implementation did not cross the semantic T3 boundary.

## Implementation surface

Production:

- `app/(auth)/login.tsx`
- `app/tabs/index.tsx`
- `src/components/OnboardingFlow.tsx`
- `src/lib/firstRun.ts`
- `app/studio/[id].tsx`

Verification / CI:

- `tests/onboarding.test.tsx`
- `tests/screens2.test.tsx`
- `e2e/launch-first-run.spec.ts`
- `.github/workflows/ci.yml`

Explicitly unchanged architectural ownership:

- `src/context/AuthContext.tsx`
- project persistence schema/contracts
- `assetStore`
- `app/studio/persistenceTrust.ts`
- `src/lib/exportTrust.ts`
- bridge/runtime code
- DSP algorithms

## Final convergence

Before requesting human microphone evidence, the exact final PR HEAD must pass:

1. frontend typecheck;
2. backend typecheck;
3. full Vitest;
4. legacy tests;
5. Web build;
6. launch-critical Playwright;
7. `npm run sdd:check`;
8. `npm run test:graph-sdd`;
9. `npm run graph:ci`.

Temporary evidence workflows must be absent from the final diff and the PR must remain current with `master` and mergeable.

## Human release evidence

Microphone behavior cannot be honestly replaced by imported-audio CI. Before Human Merge Gate, a human must validate on Web with a real microphone:

**Começar sem conta → Gravar áudio → grant mic → record audible material → stop → playback → reload/reopen → playback → export WAV**.

The human result is recorded in the PR conversation against the exact verified HEAD without changing that HEAD afterward.

After automated convergence, stop for the real-microphone evidence. After that evidence is green, present Human Merge Gate. Merge remains human-only.
