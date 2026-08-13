# Design: Fifth Round of Unit Tests and Validation

## Architecture & Test Specifications

### 1. Live Modulation Route Application (`tests/modulationMatrix.test.ts`)
- **Functions tested**: `startModulationEngine`, `applyLiveModulation`, `registerLiveModParam`, `clearLiveModParams`.
- **Scenario**: Register a mock `AudioParam` with `registerLiveModParam`, add a volume or pan modulation route (e.g. LFO1 or Macro1), invoke `applyLiveModulation(time)` or start/tick the modulation engine callback, and verify that the audio parameter value is updated according to the modulation computation.

### 2. Transport Replay Reset (`tests/transport.test.ts` / `tests/studio-audio-pure.test.ts`)
- **Functions/Behaviors tested**: Playback engine `onEnded` vs explicit pause.
- **Scenario**: 
  - When playback naturally ends (`onEnded`), `currentSeekRef` (or playback position) resets to `0`.
  - When paused explicitly (`pause()`), the current playback position (`currentSeekRef`) is preserved.

### 3. Library Lightweight Index Cover URL (`tests/cloudSync.test.ts` / `tests/projectCover.test.ts`)
- **Functions tested**: `listProjectIndex`, project store metadata indexing.
- **Scenario**: Save a project containing a `coverUrl` (data URI or thumbnail path), retrieve project index via `listProjectIndex()`, and verify that `coverUrl` is correctly present in the lightweight index metadata for `ProjectCard` rendering without invoking full `loadProject()`.
