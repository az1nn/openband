# Tasks: Preserve Stereo Channels in Native Audio Mixdown

- [ ] 1. Update `decodeAudioPureJS` in `src/lib/universalAudio.ts` to return `Float32Array[]` preserving per-channel buffers.
- [ ] 2. Update `renderMixdownNative` in `src/lib/universalAudio.ts` to handle multi-channel/stereo decoded buffers without mono downmixing.
- [ ] 3. Run `npx tsc --noEmit` and `npx vitest run` to verify zero type errors and passing tests.
