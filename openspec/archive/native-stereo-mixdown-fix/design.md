# Design: Preserve Stereo Channels in Native Audio Mixdown

## Changes in `src/lib/universalAudio.ts`

### 1. `decodeAudioPureJS`
- Return type: `Promise<Float32Array[]>` (array of channel float32 arrays, one per channel).
- When parsing WAV data with `numChannels`, allocate `numChannels` separate `Float32Array(numSamples)` buffers.
- Populate `channels[ch][i]` with decoded sample values per channel without averaging across channels.
- Fallback paths (ID3/MP3 or generic fallback) return `[fallback, fallback]` or `[fallback]`.

### 2. `renderMixdownNative`
- Retrieve decoded channels via `await this.decodeAudioPureJS(ab, sampleRate)`.
- If `decodedChannels.length === 1`:
  - Process mono channel into `left` and `right` using existing `leftGain` and `rightGain`.
- If `decodedChannels.length >= 2` (stereo / multi-channel):
  - Use `decodedChannels[0]` as Left source and `decodedChannels[1]` (or fallback to `decodedChannels[0]`) as Right source.
  - Apply track volume and stereo pan scaling (`srcL_gain` and `srcR_gain`) directly to left and right channels respectively.
