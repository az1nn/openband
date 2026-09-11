# Plan

## Impact

Graph preflight on current `master`:
- `app/studio/[id].tsx`: MEDIUM — 2 transitive dependents.
- `app/tabs/library.tsx`: HIGH — 88 transitive dependents.
- `src/components/NewProject.tsx`: HIGH — 95 transitive dependents.
- `src/lib/regionEdit.ts`: HIGH — 70 transitive dependents.

Keep T2 by making the implementation Studio-local. Touching persistence, `NewProject`, Library flow, shared region semantics, or audio-rendering contracts requires re-analysis and likely tier elevation.

## Design

1. Add a compact empty-Studio quick-start surface using existing Studio actions: record, synth/instrument, and samples.
2. Harden the existing recording interaction: actionable errors, single-flight behavior, and immediate audible refresh after a successful stop.
3. Add Studio-local region selection and source-neutral actions: move, duplicate, delete, repeat. Reuse existing track state/history; do not implement split/trim here.
4. Re-render/sync audio after edits through existing Studio transport/render paths.

## Knowledge impact

- Architecture: UNCHANGED
- Contracts: UNCHANGED
- ADR: NOT REQUIRED
- Governance: UNCHANGED

## Verification

- Targeted Vitest for recording success/failure and region actions.
- Existing region-edit/history/Studio regressions remain green.
- Frontend typecheck, full Vitest, legacy tests, web build, `sdd:check`, Graph tests and `graph:ci`.
- Manual Web smoke: visitor → blank project → first sound <60s → record → hear → edit → undo/redo.

Full save/reopen/export E2E remains owned by #48–#50.
