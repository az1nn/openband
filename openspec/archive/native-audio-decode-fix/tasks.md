# Tasks: Native Pure-JS Audio Decode Fix

- [ ] 1. Implement dynamic chunk scanning and multi-bit-depth PCM decoding (8-bit, 16-bit, 24-bit, 32-bit) in `decodeAudioPureJS` (`src/lib/universalAudio.ts`).
- [ ] 2. Implement robust non-WAV / MP3 fallback handling in `decodeAudioPureJS`.
- [ ] 3. Run TypeScript type check (`npx tsc --noEmit`) and unit tests (`npx vitest run`).
- [ ] 4. Verify native audio decoding and ensure implementation is left uncommitted.
