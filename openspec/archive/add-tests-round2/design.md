# Design: Second Round of Unit Tests

## Test Coverage Map
1. **Studio Edit Freeze Fix**:
   - Test `renderTracksCached` behavior when track `volume`, `pan`, `muted`, or `solo` properties are modified, verifying that cache key generation ignores these properties and avoids re-rendering.
2. **Native Audio Decode Fix**:
   - Test pure-JS WAV decoding with 8-bit, 16-bit, 24-bit, and 32-bit float PCM WAV ArrayBuffers, verifying correct float sample reconstruction.
3. **Zero-Length Export & 0-Track Crash Guard**:
   - Test mixdown / export functions with 0 tracks or 0 duration / empty regions, ensuring they return a valid silent AudioBuffer / blob without throwing.
4. **Native Stereo Mixdown**:
   - Test multi-channel stereo mixdown processing, ensuring Left and Right channels maintain independent sample paths and do not collapse to mono.
