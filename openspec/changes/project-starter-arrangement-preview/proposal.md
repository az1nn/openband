# Proposal: Project Starter — Arrangement-aware Preview

## Context & Problem
A short loop provides fast feedback but does not communicate song structure;
rendering the full long arrangement on every edit is too expensive. Users need
**representative preview windows** sampled from arrangement sections, with
contrasting energy (e.g. a low-energy "trap" section alongside a high-energy
"hook/drop"), without re-rendering the entire track map on each change. Genres
without arrangement metadata must fall back to the existing short-loop preview.

## Objectives
1. **Optional subgenre/arrangement** — when the selected genre exposes compatible
   subgenres/arrangements, the starter SHOULD expose subgenre/structure
   selection (R1).
2. **Representative windows** — system selects bounded preview windows from
   arrangement sections (R2).
3. **Energy diversity** — automatic selection includes contrasting energy levels
   when available (R3).
4. **Manual section** — user may select a specific arrangement section to preview
   (R4).
5. **Preview budget** — regeneration respects bar/time limits and MUST NOT render
   the full long arrangement on every change (R5).
6. **Fallback** — if no arrangement definition exists, use the existing
   short-loop preview (R6).
7. **Snapshot metadata** — arrangement metadata and selected preview windows are
   part of the generated snapshot/recipe metadata when relevant (R7).

## Acceptance scenarios
- A genre with sections selects a low-energy section and a
  high-energy section within budget.
- House does not render all 64 bars after a BPM change.
- Unknown / no-arrangement genre falls back safely.
- Manual selection of a section invalidates only the preview window, not the
  underlying recipe.

## Status: PROPOSED
