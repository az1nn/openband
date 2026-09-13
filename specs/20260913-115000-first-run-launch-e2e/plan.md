# Plan — First-run and Launch E2E

## Classification

**Tier:** T2

The change is bounded UX orchestration plus launch verification. It reuses existing visitor auth, project starter, Studio tools, persistence, and strict WAV export. It does not introduce a new runtime boundary or durable data contract.

Architecture Graph preflight on `aadb015e465beba5549c711a9663f5a3221f9c9e`:

- `app/(auth)/login.tsx`: MEDIUM — 2 direct / 2 transitive dependents.
- `src/components/OnboardingFlow.tsx`: HIGH — 3 direct / 92 transitive dependents. Most transitive spread comes through the component barrel and app composition; preserve its export and avoid unrelated component API churn.
- `app/tabs/index.tsx`: HIGH — 4 direct / 90 transitive dependents. Keep the change to first-run orchestration only.
- `app/studio/[id].tsx`: HIGH — 5 direct / 5 transitive dependents.
- `app/studio/hooks.ts`: HIGH — 8 direct / 10 transitive dependents. The approved implementation should avoid changing this surface unless convergence proves necessary.

Graph build at preflight: 504 nodes / 1364 edges.

The Graph evidence increases required regression breadth but does not by itself change the semantic tier. If the implementation crosses the Risk boundary from `spec.md`, stop and reclassify to T3.

ADR: NOT REQUIRED — the design stays inside existing authentication, project, Studio, persistence, and export boundaries; create an ADR only if that premise changes.

## Design

### 1. Guest entry clarity

Keep `AuthContext.signInAsVisitor()` unchanged. Adjust `app/(auth)/login.tsx` so the no-account path is explicit and launch-oriented (for example, “Começar sem conta”), while account sign-in remains available.

No automatic anonymous session is introduced. The user still makes an explicit choice.

### 2. Action-first onboarding

Refactor `src/components/OnboardingFlow.tsx` so the first decision is the creative action, not genre/mood.

Define a small first-run action union local to this feature, conceptually:

- `record`
- `instrument`
- `drums`
- `import`

The component forwards the selected action to the Feed orchestration. The existing `NewProject` wizard remains intact for normal project creation and is not deleted.

### 3. Fast local project creation

In `app/tabs/index.tsx`, create a scratch/local project result using the existing project-starter boundary and safe defaults, then route to Studio with:

- `fromOnboarding=1`
- a launch-action query value (`tool` or an equivalently bounded route parameter)
- existing title/BPM/key/time-signature fields required by the Studio route.

Do not add launch-action state to persisted `ProjectData`; it is ephemeral navigation intent.

### 4. Studio action dispatch

Use existing Studio capabilities only:

- Record → `recordOptions`
- Instrument → Synth
- Drums / sample → Sampler
- Import → existing `handleImportAudio` path

For record/synth/sampler, opening the existing modal/flow from route intent is sufficient.

For Import, do **not** auto-open the browser file chooser after navigation. Present an action-aware Studio prompt/button whose click calls the existing import handler so browser user activation is preserved.

When a launch action is present, suppress or adapt the generic `StudioOnboardingCoachmark` so it cannot cover the intended action.

Avoid modifying `app/studio/hooks.ts` if the route can dispatch with its existing `rawTool` string and stable `openModal` API.

### 5. Launch-critical E2E

Add a dedicated Playwright launch spec rather than extending shallow screen-presence tests.

Deterministic E2E path:

1. Start with clean browser storage.
2. Load the app and choose the explicit no-account visitor path.
3. Choose **Import audio** from first-run.
4. Verify Studio opens for the new project and presents the import action.
5. Generate/provide a small valid audible WAV fixture in test code and import it through the real file chooser.
6. Assert the track appears and its persisted region URL becomes `asset://...` with durable IndexedDB bytes.
7. Perform one real user-visible persisted edit. Prefer a stable existing mixer/arrangement control; if the UI lacks a reliable accessible selector, add only an accessibility label/test ID to the real control rather than a test-only behavior path.
8. Wait for save/autosave completion, reload, and reopen the same project.
9. Assert the audio and edit survived.
10. Export through the real Bounce UI.
11. Validate the downloaded file as RIFF/WAVE with non-empty data and non-zero PCM energy.
12. Record elapsed time to first imported sound and export, asserting `< 60s` and `< 10m` respectively.

Add focused component/integration tests for the four first-run action dispatches so CI proves Record, Instrument, Drums/sample, and Import mapping even though only Import is the deterministic full journey.

### 6. CI

Extend `.github/workflows/ci.yml` with a Web launch-E2E job that:

- installs dependencies;
- installs Playwright Chromium/deps;
- runs only the launch-critical first-run spec;
- fails normally on E2E failure (no `|| true` or equivalent masking).

Keep native build conditions unchanged.

## Planned implementation surface

Expected product/test files:

- `app/(auth)/login.tsx`
- `src/components/OnboardingFlow.tsx`
- `app/tabs/index.tsx`
- `app/studio/[id].tsx`
- possibly `app/studio/parts.tsx` for action-aware coachmark/prompt behavior
- `tests/onboarding.test.tsx` and/or focused first-run tests
- `e2e/launch-first-run.spec.ts`
- `.github/workflows/ci.yml`

Avoid unless required by convergence:

- `src/context/AuthContext.tsx`
- `src/lib/projectStore.ts`
- `app/studio/persistenceTrust.ts`
- `app/studio/hooks.ts`
- `src/lib/exportTrust.ts`
- bridge/runtime code

## Verification

Before Human Merge Gate:

1. focused first-run/component tests;
2. deterministic Playwright launch journey;
3. frontend and backend typecheck;
4. full Vitest + legacy tests;
5. Web build;
6. `npm run sdd:check`;
7. `npm run test:graph-sdd`;
8. `npm run graph:ci`;
9. post-implementation Graph impact on touched production surfaces;
10. exact-HEAD PR CI;
11. human real-microphone Web smoke with evidence recorded on the PR.

Any product-code change after verification invalidates affected evidence and requires re-verification before Merge Gate.
