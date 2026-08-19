# Design: Project Starter — Arrangement-aware Preview

## 1. Architecture Overview
```
NewProject details step  ──┐
                           ▼
              ProjectPreviewSession  (project-starter-live-preview, v9-01)
                           │
                           ▼
                  useArrangementPreview
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  arrangementPreview   arrangementGenerator.ts  (section/energy metadata)
   ├── PreviewWindow { section, startBar, barCount, energy }
   ├── selectRepresentativeWindows(arrangement, budget, locks)
   └── renderPreviewWindows(tracks, windows)
```
Builds on the live-preview session (v9-01). This design targets master-lineage
imports; `ProjectPreviewSession`/`useProjectPreview` land via v9-01 and are
treated as a dependency. Arrangement metadata comes from
`src/lib/arrangementGenerator.ts` (section + energy per bar) and subgenre options
from `src/lib/genreTree.ts`.

## 2. Core Modules

### `arrangementPreview`
- **`PreviewWindow`** — `{ section: string, startBar: number, barCount: number, energy: number }`.
- **`selectRepresentativeWindows(arrangement, budget: PreviewBudget, locks?: LockSet): PreviewWindow[]`**
  - Returns ≤ budget windows.
  - Energy diversity (R3): ensures a low-energy + a high-energy window when both
    exist within budget.
  - Locks: locked section/energy is preserved across regeneration.
- **`PreviewBudget`** — `{ maxBars: number }` (≤ `MAX_PREVIEW_BARS`); honored on every regeneration (R5).
- **`renderPreviewWindows(tracks, windows)`** — renders only the selected windows
  through the existing render/playback pipeline.

## 3. State Machine
Extends the variation session:
- **Subgenre/arrangement selection** — shown only when
  `arrangementGenerator` exposes compatible options (R1).
- **Window selection** — automatic (energy-diverse) or manual section picker (R4).
- **BPM change** — re-selects windows within budget; never renders the full
  arrangement (R2, R5).
- **Manual section pick** — invalidates only the preview window, preserving the
  recipe (acceptance scenario 4).

## 4. Fallback & Budget
- If `arrangementGenerator` returns no sections for the selected genre/subgenre,
  fall back to the short-loop preview (R6).
- Budget always enforced: `maxBars ≤ MAX_PREVIEW_BARS`; cached windows + history
  only (no full-track re-render).

## 5. Snapshot Metadata
- Selected windows, section, energy, and the active budget are stored in the
  `ProjectPreviewSnapshot` metadata so promotion preserves the user's structural
  choice (R7), integrated with `project-starter-seeded-variations`.

## 6. Creation Boundary
- Promotion of a window-selected preview is handled by
  `project-starter-approved-snapshot-promotion`. This spec owns window selection
  and rendering budget only.

## Status: PROPOSED
