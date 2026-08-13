# Design: Add Fourth Round of Unit Tests and Validation

## Architecture & Test Mapping

### 1. Collabs Tab Lightweight Metadata (`tests/cloudSync.test.ts` / `tests/feedApi.test.ts`)
- Test `saveProject()` and `listProjectIndex()` with `parentProjectId` set.
- Verify that `listProjectIndex()` returns entries containing `parentProjectId` without needing `loadProject()`.

### 2. Native Audio Decode Pure-JS Multi-Bit-Depth (`tests/audioExport.test.ts`)
- Test decoding WAV buffers with 8-bit unsigned PCM.
- Test decoding WAV buffers with 24-bit signed 3-byte LE PCM.
- Test decoding WAV buffers with 32-bit float PCM.
- Verify channel separation and sample-accurate scaling.

### 3. Graph Validation Missing Source & Target (`tests/lib3.test.ts`)
- Test `wouldCreateCycle` when `fromId` is missing.
- Test `wouldCreateCycle` when `toId` is missing.
- Test `wouldCreateCycle` when both `fromId` and `toId` are missing or in complex graphs with missing intermediate nodes.
