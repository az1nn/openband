# Design: Add Third Round of Unit Tests and Validation

## Changes & Test Architecture

### 1. Offline Mixdown Buses & Sends (`tests/audioExport.test.ts` or `tests/mixer.test.ts`)
- Test `renderMixdownWeb` when passing custom `buses` array, track `outputId` (assigning tracks to sub-mix buses), and `sends` (aux send levels).
- Verify that `buildBusRouteGraph` is successfully utilized and returns a valid output blob without throwing.

### 2. Native Stereo Mixdown & Multi-Channel WAV (`tests/audioExport.test.ts`)
- Test decoding and mixing multi-channel WAV audio buffers (e.g. 3-channel or 4-channel audio) in `renderMixdownNative` / `decodeAudioPureJS`.
- Verify stereo channel mapping and channel routing robustness.

### 3. Unknown Plugin Warnings (`tests/plugins/dsp.test.ts` or `tests/lib.test.ts`)
- Spy on `console.warn` via `vi.spyOn(console, 'warn')`.
- Pass an unknown plugin type (e.g., `{ type: "unknownCustomEffect", params: {} }`) to `applyPluginChain` and `applyMasteringPlugin`.
- Verify that `console.warn` is called with the expected warning message and audio passes through successfully.
