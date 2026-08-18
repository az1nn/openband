# Proposal: docs-agents-update — Document Hardening Outcomes & Conventions

> **Status: DRAFT.** Not started. Do NOT mark SHIPPED until the documentation
> edits are applied and a `npm run build` confirms no regressions (no source is
> touched, so verification is light — the gates are documentation-only).

## Context

Across this session, six changes were archived:

- `audio-recording-fixes`
- `env-build-and-types-fixes`
- `tsc-error-cleanup`
- `vitest-failure-cleanup`
- `code-review-hardening`
- `code-review-low-cleanup`

These changes fixed real Audio/DSP, State/Collab, UI/3D, and Backend issues and
hardened the codebase via a full-repo code review (HIGH → MED → LOW passes).
However, the project documentation and the agent orchestration file
(`AGENTS.md`, `docs/features-implementation.md`, `docs/3d-scene-guidelines.md`)
drifted from the implemented code. Several non-obvious operational conventions
(WSL execution wrapper, the `react-native.d.ts` shadowing trap, the `Expo.fx`
stub, the verification matrix order, and the 3D lifecycle disposal pattern)
were learned during the work but never recorded.

## Problem Description

Three documentation gaps exist:

1. **AGENTS.md** has no section recording the operational facts learned during
   the hardening work (WSL execution wrapper, `react-native` types, `Expo.fx`
   build quirk, verification matrix order, full-repo review partitioning). An
   engineer unaware of these will re-introduce the ~52-error cascade or run
   commands in a way that fails on the Windows UNC mount.

2. **docs/features-implementation.md** has no section capturing the
   stabilization outcomes of the six archived changes, so the hardening work is
   invisible to future readers.

3. **docs/3d-scene-guidelines.md** documents the 3D screen lifecycle
   (`renderer.dispose()` on unmount) but does **not** require full scene
   disposal (geometry/material/texture) plus `renderer.forceContextLoss()`, nor
   the async-init cancellation pattern used by all 13 Three.js screens after the
   hardening.

## Objectives

1. Record non-obvious operational conventions in `AGENTS.md` under a new
   `## Known Issues & Project Conventions` section.
2. Document the six archived changes' hardening outcomes in
   `docs/features-implementation.md` under a new
   `## Stability & Code-Review Hardening (Latest)` section, plus a short
   operational note elsewhere is natural.
3. Correct the `docs/3d-scene-guidelines.md` Lifecycle guidance to require full
   scene disposal (geometry/material/texture + `renderer.forceContextLoss()`)
   and the async-init cancellation pattern, while keeping the existing
   ACESFilmic/rAF/dispose content.

## Non-Goals

- **Do NOT** modify any source code (`app/`, `src/`, `backend/`).
- **Do NOT** modify any other docs beyond the three files listed.
- **Do NOT** add new dependencies.
- **Do NOT** mark these spec files SHIPPED.

## Approach Summary

- Add the `## Known Issues & Project Conventions` section to `AGENTS.md`
  (placed after `## Session Recovery (Bad Session / Abort Flow)` and before
  `## Graph Engineering & Architecture Toolchain`).
- Add the `## Stability & Code-Review Hardening (Latest)` section to
  `docs/features-implementation.md` (near the other `(Latest)` sections, after
  `## Studio Audio & DSP Correctness (Latest)`), plus an operational note if
  natural.
- Update the Lifecycle guidance in `docs/3d-scene-guidelines.md` to require full
  scene disposal and the async-init cancellation pattern (modification, not an
  addition).

## Risks

- Documentation-only change. No runtime or type impact; `npm run build` is
  expected to remain GREEN.
