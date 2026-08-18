# Tasks: docs-agents-update — Document Hardening Outcomes & Conventions

## Status: SHIPPED
> edits are applied and `npm run build` confirms no regressions (light, because
> no source is touched).

## Phase 1 — Spec (this change)
- [x] `proposal.md` — context, problem, objectives, non-goals (written).
- [x] `design.md` — Current → New sketches per file, plus the 3D doc edit
      description (written).
- [x] `tasks.md` — this checklist (written).

## Phase 2 — Implement (after spec approval)

### A. AGENTS.md — new conventions section
- [ ] Insert `## Known Issues & Project Conventions` immediately after
      `## Session Recovery (Bad Session / Abort Flow)` and immediately before
      `## Graph Engineering & Architecture Toolchain`, using the exact text in
      `design.md` §1 (WSL wrapper, `react-native` types, `Expo.fx` stub,
      verification matrix order, full-repo review partitioning).

### B. docs/features-implementation.md — new hardening section
- [ ] Insert `## Stability & Code-Review Hardening (Latest)` near the other
      `(Latest)` sections, after `## Studio Audio & DSP Correctness (Latest)`,
      using the exact text in `design.md` §2.
- [ ] Add a short operational note elsewhere in the file if a natural location
      exists (build/verification prose), referencing the `Expo.fx` stub,
      `src/declarations.d.ts`, and the verification matrix order.

### C. docs/3d-scene-guidelines.md — lifecycle update (modification)
- [ ] Update the Lifecycle guidance to require: traverse-dispose
      geometry/material/textures, call `renderer.forceContextLoss()`, and use
      the shared `disposeScene(THREE, scene, renderer)` helper from
      `src/lib/sceneLighting.ts`.
- [ ] Document the async-init cancellation pattern: outer effect returns
      `() => { cancelled = true; cleanup?.(); }`; `loadThree()` `.then`
      disposes immediately if unmounted during load.
- [ ] Preserve the existing ACESFilmicToneMapping and rAF/dispose framing.

## Phase 3 — Check (documentation-only verification)
- [ ] Confirm the three sections/modifications are present and exact (match
      `design.md` §1–§3).
- [ ] `npm run build` → still GREEN (no source modified).

## Remaining
- None. This is a documentation-only change; no source, no dependencies, no
  SHIPPED marking.
