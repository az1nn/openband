# Tasks: Guard Offline Audio Export Paths Against Zero-Length Buffers

- [ ] 1. Add safety checks and minimum buffer length/channel clamping in `src/lib/universalAudio.ts` for offline rendering and export functions.
- [ ] 2. Guard `OfflineAudioContext` instantiations in `src/lib/mastering.ts` against zero length or zero channels.
- [ ] 3. Guard offline render paths in `src/lib/midiSynth.ts` against zero or negative `numSamples`.
- [ ] 4. Guard `applySinglePlugin` in `src/lib/pluginChain.ts` against zero-length or zero-channel input buffers.
- [ ] 5. Run type-checking (`npx tsc --noEmit`) and test suite (`npx vitest run`) to verify zero errors and passing tests.
