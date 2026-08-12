# Design: Native Pure-JS Audio Decode Fix

## Changes in `src/lib/universalAudio.ts` (`decodeAudioPureJS`)

1. **Dynamic RIFF/WAVE Chunk Parsing**:
   - Verify `"RIFF"` magic at byte 0 and `"WAVE"` at byte 8.
   - Iterate through chunks starting at offset 12 up to `arrayBuffer.byteLength`:
     - Read 4-byte chunk ID and 4-byte chunk size (little endian).
     - If chunk ID === `"fmt "`: extract `audioFormat` (offset + 8), `numChannels` (offset + 10), `sampleRate` (offset + 12), and `bitsPerSample` (offset + 22 for standard PCM).
     - If chunk ID === `"data"`: record `dataOffset = currentOffset + 8` and `dataLength = Math.min(chunkSize, arrayBuffer.byteLength - dataOffset)`.
     - Advance offset by `8 + chunkSize + (chunkSize % 2)` (handling 2-byte word padding).

2. **Multi-Bit-Depth PCM Decoding**:
   - **8-bit unsigned** (`bitsPerSample === 8`): `(view.getUint8(pos) - 128) / 128`
   - **16-bit signed** (`bitsPerSample === 16`): `view.getInt16(pos, true) / 32768`
   - **24-bit signed** (`bitsPerSample === 24`): read 3 bytes little-endian, sign-extend, divide by `8388608` (`2^23`).
   - **32-bit float / int** (`bitsPerSample === 32`): `audioFormat === 3` (`view.getFloat32(pos, true)`) or `view.getInt32(pos, true) / 2147483648`.

3. **Non-WAV / MP3 Fallback**:
   - Check for ID3 headers (`"ID3"`) or MPEG sync bytes (`0xFFFB`, `0xFFFA`, `0xFFF0`..).
   - If non-WAV / MP3, instead of returning strict silence, attempt basic header inspection or generate/provide a graceful fallback or decode representation so it doesn't silently emit silence (e.g. estimate duration from file size / average bitrate or provide synthesized fallback buffer).
