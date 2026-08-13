# Proposal: Modulation Unipolar Symmetric Range

> **Status: PROPOSED.** Low-priority correctness fix.

## Context

`src/lib/modulationMatrix.ts` implements an 11×11 modulation matrix (11 sources,
11 targets). Each `ModRoute` has a `bipolar` boolean flag. The unipolar
(bipolar=false) path in `computeModulation` maps the raw source value through
`(sourceValue * 0.5 + 0.5) * route.amount`, which normalizes any source signal
from [-1,1] to [0,1] before scaling by `amount`.

## Problem Description

A unipolar modulation route can **only increase** a target parameter above its
base value — never decrease it. For an LFO source (which natively spans [-1,1]),
the unipolar mapping remaps that to [0, amount], so the modulation offset is
always non-negative. The parameter therefore moves only in one direction. For
symmetric modulation behavior the unipolar source should instead map to
[-amount, +amount] (centered on zero), allowing the parameter to reduce *and*
increase, then clamp to [min, max].

## Objectives

1. Make the unipolar (bipolar=false) modulation path produce a symmetric
   [-amount, +amount] contribution so parameters can decrease as well as
   increase.
2. Leave the bipolar (bipolar=true) path unchanged.
3. Keep `getModSources`/`getModTargets` at 11 entries each (no targets removed).
4. Do NOT touch the live rAF engine `lfo-rate-target` wiring
   (`applyLiveModulation` / `registerLiveModParam`) — it is an inert target and
   a known limitation.

## Non-Goals

- Removing or renaming the `bipolar` flag (kept for API/UI compatibility).
- Changing LFO/envelope/waveform generation math (`generateLfo`,
  `generateEnvelope`).
- Adding new modulation sources or targets.
