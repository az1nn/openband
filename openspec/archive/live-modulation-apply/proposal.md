# Proposal: Apply Modulation Routes During Live Playback

## Context

Live modulation (LFO / envelope / macro → plugin / AudioParam) is currently a **NO-OP**
during Studio playback. Audit findings:

- `src/lib/modulationMatrix.ts` `startModulationEngine()` (lines 336-345) only advances an
  internal `lfoTime` via `requestAnimationFrame`; nothing reads it, and the function is
  **never invoked anywhere** in the codebase.
- `applyModulation` / `computeModulatedParams` are ONLY used offline:
  `src/lib/pluginChain.ts:207,212` (stem render), `src/lib/mastering.ts:227`, and
  `src/components/PluginEditor.tsx:84` (a knob preview, not playback).
- The live audio graph (`src/lib/playbackEngine.ts`) is `source → gain → panner → master`,
  built per-track in `buildNode`. Plugins are rendered offline into stems, so the only
  **retained live AudioParams** are `gain.gain` (track volume) and `panner.pan` (track pan).

## Problem

When a user creates a modulation route (e.g. `lfo1 → volume`) and presses Play, the route
has zero audible effect because (a) the modulation engine never runs, and (b) nothing pushes
the computed modulated value onto a live `AudioParam`.

## Objectives

1. Start the modulation engine during live PlaybackEngine playback and feed it the **transport
   clock** (not an independent `lfoTime`) so the math matches the offline path.
2. Maintain a lightweight registry of retained live AudioParams and, each animation frame,
   write the modulated value for every active route onto the corresponding `AudioParam`.
3. Only affect targets whose nodes are actually retained by the live graph (`volume`,
   `pan.position`). Plugin-level targets (filter cutoff/Q, etc.) remain offline-only since
   those nodes are not retained live — this is by design, not a regression.
4. Do **not** change offline rendering behavior or the existing offline call sites.
5. No new dependencies. Respect mute/solo (skip writing when inaudible) and volume/pan
   automation (already baked into the stem → skip live writes).
