# Proposal: Add Third Round of Unit Tests and Validation

## Context
OpenBand requires maximum test coverage across core modules, specifically focusing on offline mixdown bus routing & aux sends, native stereo & multi-channel WAV decoding, and unknown plugin warning handling.

## Objectives
1. Add Vitest coverage for `renderMixdownWeb` invoking `buildBusRouteGraph` with custom track bus outputs and aux sends.
2. Add Vitest coverage for native stereo mixdown and multi-channel WAV decoding/routing (`decodeAudioPureJS` / `renderMixdownNative`).
3. Add Vitest coverage for unknown plugin types in `applyPluginChain`, `applyMasteringPlugin`, and pedal factory emitting `console.warn` instead of throwing.
