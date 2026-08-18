# Design: docs-agents-update — Document Hardening Outcomes & Conventions

> **Status: DRAFT.** Not started. Source of truth once shipped:
> `tasks.md` (checklist). Do NOT mark SHIPPED until the doc edits are applied.

## 1. AGENTS.md — new `## Known Issues & Project Conventions` section

### Current
`AGENTS.md` ends the recovery block at `## Session Recovery (Bad Session /
Abort Flow)` and continues into `## Graph Engineering & Architecture
Toolchain`. There is no section capturing operational conventions learned during
the hardening work.

### New
Insert the following section **immediately after** `## Session Recovery (Bad
Session / Abort Flow)` and **immediately before** `## Graph Engineering &
Architecture Toolchain`:

```
## Known Issues & Project Conventions

Operational facts learned during the hardening work (keep these in mind before editing build/config/types):

- **WSL execution wrapper:** Run git/tsc/vitest via `wsl -e bash -lc "cd /home/az1nn/openband && <cmd>"`. Vitest cannot run from the Windows UNC mount (it must execute inside WSL). Pure file edits may use the `\\wsl.localhost\...` UNC path; bash commands must not.
- **TypeScript types:** `react-native@0.86` ships real type definitions. Do NOT add `src/react-native.d.ts` — it shadows the real types and triggers a ~52-error cascade. For asset module declarations (png/mp3/wasm/etc.) use `src/declarations.d.ts`.
- **Build / `Expo.fx`:** The published `expo@57.0.4` package omits `Expo.fx`; `metro.config.js` keeps a defensive stub for it. The earlier build break was caused by a corrupted `node_modules/expo` extraction (missing `.tsx` src files), fixed by reinstalling `expo`.
- **Verification matrix order (Phase 3):** `npx tsc --noEmit` → `cd backend && npx tsc --noEmit` → `npx vitest run` → `npm run test:legacy` → `npm run graph:ci` → `npm run build`.
- **Full-repo code review:** Partition into 5 domains (Audio/DSP, State/Collab, UI/3D, Backend, 3D+lib) and review in parallel subagents; fix HIGH then MED, then LOW (empty catches, dead vars) in a follow-up pass.
```

## 2. docs/features-implementation.md — new `## Stability & Code-Review Hardening (Latest)` section

### Current
The file has a set of `(Latest)` sections. The most recent before this change is
`## Studio Audio & DSP Correctness (Latest)`. There is no stabilization section
covering the six archived hardening changes.

### New
Insert the following section **near the other `(Latest)` sections, after
`## Studio Audio & DSP Correctness (Latest)`**. If a natural operational note
location exists elsewhere (e.g. near the build/verification prose), append a
short note there as well.

```
## Stability & Code-Review Hardening (Latest)

Post-implementation stabilization across six archived changes (see `openspec/archive/`):

- **Audio/DSP:** Guarded `OfflineAudioContext.close()` after every render; guarded `audioWorklet.addModule()` with blob-URL revoke in `finally`; real `bpm` threading into native MIDI render; worker blob-URL revoke moved off the synchronous `new Worker` tick; sample-rate-keyed shared buffer context; separate true peak-CPU accumulator.
- **State/Collab:** CRDT `*.add` now merges commutatively (no lost update) with Lamport-clock ordering; `projectBranching.mergeBranch` applies modified tracks always and gates only added tracks by the accept list, with a single `main.state` assignment and a filtered `crdtOperations` log; bridge-save queue bounded; presence/collaboration reconnect + timer guards; `Set`-based listeners; `supabaseRemote` does a remote-preferring rebase on divergence.
- **UI / 3D:** All 13 Three.js screens dispose on async unmount (cancelled flag + immediate teardown), remove resize listeners, traverse-dispose geometry/material/textures and `renderer.forceContextLoss()` via `src/lib/sceneLighting.ts`'s `disposeScene`; `GenerateCoverModal` uses `@bridge` `isElectron` instead of `window.electronAPI`; init failures are logged; `aiAutoMixAnalysis` guards zero-length/zero-channel buffers.
- **Backend:** SSE subscribe routes use `requireAuthQuery` (token via `Authorization` header OR `?token=` query, since browser `EventSource` cannot send headers); queue artifacts survive until job eviction; `extract.ts`/`master.ts` close file descriptors in `try/finally`; stem/master downloads require auth; generator/extract errors are logged.
- **LOW pass:** empty `catch` blocks now bind `e` and log; dead `reconnectOnLineRef` removed; defensive worker-URL revoke added.

Operational notes: `metro.config.js` keeps an `Expo.fx` stub; asset module types live in `src/declarations.d.ts` (do NOT add `src/react-native.d.ts`); verification runs `tsc` → backend `tsc` → `vitest` → legacy → `graph:ci` → `build`.
```

## 3. docs/3d-scene-guidelines.md — Lifecycle guidance update (modification)

### Current
The Lifecycle bullet states that the rAF loop is cancelled, listeners removed,
and `renderer.dispose()` is called on unmount. It does not require full scene
graph disposal (geometry / material / textures) nor `renderer.forceContextLoss()`,
and does not document the async-init cancellation pattern.

### New
Modify the Lifecycle guidance so it states, in addition to the existing
ACESFilmic / rAF / dispose content:

- On unmount, **traverse the scene** disposing `geometry`, every `material` and
  its texture-valued props, then call **`renderer.forceContextLoss()`**.
- Use the shared **`disposeScene(THREE, scene, renderer)`** helper from
  `src/lib/sceneLighting.ts` to perform this teardown.
- Document the **async-init cancellation pattern**: the outer `useEffect`
  returns `() => { cancelled = true; cleanup?.(); }`, and the `loadThree()`
  `.then` callback disposes the scene/renderer **immediately** if the component
  unmounted during the async load (`cancelled` is already true).

Keep the existing ACESFilmicToneMapping and rAF/dispose framing; only extend the
Lifecycle paragraph to mandate full disposal + `forceContextLoss()` and the
async-init cancellation pattern.

## 4. Components / Files Affected

| File | Change |
| --- | --- |
| `AGENTS.md` | **ADD** `## Known Issues & Project Conventions` section (after Session Recovery, before Graph Engineering). |
| `docs/features-implementation.md` | **ADD** `## Stability & Code-Review Hardening (Latest)` section (after Studio Audio & DSP Correctness (Latest)); natural operational note elsewhere. |
| `docs/3d-scene-guidelines.md` | **MODIFY** Lifecycle guidance (full disposal + `forceContextLoss()` + async-init cancellation). |

> No `app/`, `src/`, or `backend/` files are modified. This is a
> documentation-only change.

## 5. Verification

1. Confirm the three sections/modifications are present and exact.
2. `npm run build` → still GREEN (documentation-only; no source impact).
