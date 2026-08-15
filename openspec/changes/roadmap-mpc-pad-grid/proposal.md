# Proposal: Roadmap MPC Pad Grid with Velocity Sensitivity

## Context
The `MIDI/MPC` roadmap section lists **"MPC pad grid with velocity sensitivity"** as unimplemented. There is currently no pad-grid UI; only `Sampler` and `PianoRoll` (which shows velocity) exist. An MPC pad grid is a core production surface: a 4×4 grid of 16 pads that trigger MIDI notes with velocity derived from input pressure/velocity, suitable for finger-drumming and clip launching.

This change adds a reusable `MpcPadGrid` component (`src/components/MpcPadGrid.tsx`) and wires no app screen yet (kept as a library/design-system component), with full unit tests.

## Objectives
1. Build `MpcPadGrid` rendering 16 pads (4×4) using the existing design-system component style (React Native `View`/`className`, no `StyleSheet.create`).
2. Emit `onPadDown(padIndex, velocity)` / `onPadUp(padIndex)` callbacks. Velocity derived from `PointerEvent.pressure` when available, else from a `velocity` prop or a sensible default (e.g., 100).
3. Visual active state (highlighted pad) while held; configurable pad colors and an octave/base-note control.
4. Optional computer-keyboard mapping (e.g., 1-4 / q-r / a-f / z-v) to trigger pads for desktop.
5. Unit tests covering rendering, pointer down/up callbacks, velocity resolution, and keyboard triggers.
