# Proposal: Guard Offline Audio Export Paths Against Zero-Length Buffers

## Problem
Empty or zero-duration projects, or projects with 0 audible tracks, result in `len === 0` or `numCh === 0` when instantiating `OfflineAudioContext(numCh, len, sampleRate)` across mastering, plugin chains, mixdown rendering, and MIDI synthesis. This causes exceptions and crashes during export/bounce operations.

## Objectives
1. Prevent `OfflineAudioContext` construction failures and crashes when encountering zero-length or zero-channel buffers, durations, or tracks.
2. Gracefully handle zero-length/zero-channel cases by enforcing minimum safety bounds (e.g., minimum 1 channel and minimum 1 sample / 1000 samples / 1 second of silence) or returning silent buffers/skipping cleanly.
3. Ensure robust behavior across `universalAudio.ts`, `mastering.ts`, `midiSynth.ts`, and `pluginChain.ts`.
