# Test Plan: Project Starter — Arrangement-aware Preview

## 1. Unit tests (arrangementPreview)
- `selectRepresentativeWindows`:
  - returns ≤ `maxBars` windows.
  - includes a low-energy and a high-energy window when both exist within budget (R3).
  - preserves a locked section/energy across regeneration (R5).
  - returns `[]` (trigger fallback) when arrangement has no sections.
- `PreviewBudget`:
  - never exceeds `MAX_PREVIEW_BARS`.

## 2. Budget & regeneration (projectStarterArrangement)
- House (long arrangement) after a BPM change: only windows within budget are
  re-rendered; full arrangement is NOT rendered (acceptance scenario 2).
- Manual section pick invalidates the preview window only; the underlying recipe
  hash is unchanged (acceptance scenario 4).

## 3. Fallback
- Unknown / no-arrangement genre ⇒ falls back to short-loop preview (acceptance
  scenario 3); no generation error.

## 4. Integration
- A multi-section genre selects a low-energy and a high-energy section within
  budget (acceptance scenario 1).
- Preview-window selection is persisted in snapshot metadata and survives window
  re-render (R7).

## Status: PROPOSED
