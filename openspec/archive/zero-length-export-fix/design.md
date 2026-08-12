# Design: Guard Offline Audio Export Paths Against Zero-Length Buffers

## Changes
1. **`src/lib/universalAudio.ts` (`renderMixdownWeb`, `exportTone`)**:
   - Ensure `duration > 0` (default to 1 if `<= 0`).
   - Ensure `len = Math.max(1, Math.ceil(sampleRate * duration))` (or minimum samples).
   - Guard against empty audible tracks list in mixdown rendering (return a silent WAV blob if no tracks/regions).
2. **`src/lib/mastering.ts` (`applyEq`, `applyCompressor`, `applyLimiter`, `masterAudio`, etc.)**:
   - Guard `numCh = Math.max(1, buffer.numberOfChannels)` and `len = Math.max(1, buffer.length)`.
   - If input buffer has length 0 or channels 0, return a clone or silent buffer of safe minimum length.
3. **`src/lib/midiSynth.ts` (`renderTracksToUrl`, `renderTrackStem`, `renderTrackBuffer`)**:
   - Guard `numSamples = Math.max(1000, Math.ceil(sampleRate * totalDuration))`.
   - If no valid notes or regions and zero duration, handle gracefully without constructing zero-length `OfflineAudioContext`.
4. **`src/lib/pluginChain.ts` (`applySinglePlugin`)**:
   - Guard `len = Math.max(1, buffer.length)` and `numCh = Math.max(1, buffer.numberOfChannels)`.
