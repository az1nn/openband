# Verification Evidence — Launch MVP Export Trust (#49)

## Scope

This record separates product verification from merge-process evidence.

- Product implementation commit: `ad293ecca532c4a4121c661709c59f76557ceb42` (PR #61).
- Follow-up verification/reconciliation PR: #63.
- Current canonical base advanced after the product merge through documentation-only PR #62; PR #63 CI validates compatibility with the current merge base.

## Product evidence

### Deterministic renderer/export tests

The implementation is covered by deterministic tests for:

- RIFF/WAVE structure and non-silent PCM output;
- mute/solo behavior;
- relative volume and stereo pan;
- MIDI-only export;
- track and master effects;
- strict missing/decode/effect failures;
- immutable render inputs / project state;
- legacy playback and audio export compatibility.

### Browser smoke

Actions run `34758195121` checked out the exact product commit `ad293ecca532c4a4121c661709c59f76557ceb42` and passed in Chromium.

Observed evidence:

- durable IndexedDB `asset://fixture` -> downloadable RIFF/WAV;
- output size: 396,944 bytes;
- WAV data chunk: 396,900 bytes;
- PCM peak: 10,898;
- missing `asset://` source -> no download, strict `ExportTrustError`, stabilized functional project payload unchanged;
- corrupt `asset://` source -> no download, strict `ExportTrustError`, stabilized functional project payload unchanged.

The browser smoke intentionally verifies the export boundary and persistence behavior. Explicit user-facing error signaling is verified separately at component level because React Native Web `Alert.alert` is not represented as a native browser `window.alert` in this build.

### Explicit failure signal

PR #63 adds a component-level test proving that a strict render failure:

- calls `Alert.alert("Erro", "Falha ao exportar mix. O projeto não foi alterado.")`;
- does not call `audioSystem.exportToFile`.

### Architecture Graph

Implemented-surface impact remained HIGH/T3. Verification run `34758100698` passed against the product implementation.

Measured impact included:

- `src/lib/exportTrust.ts`: 3 direct / 66 transitive dependents;
- `src/lib/midiSynth.ts`: 9 direct / 76 transitive dependents;
- `src/components/BounceDialog.tsx`: 2 direct / 64 transitive dependents;
- Studio integration surfaces remained HIGH impact.

This confirms the approved T3 classification remained appropriate after implementation.

## Process exception

PR #61 was merged before the planned Human Merge Gate. No document in this feature may retroactively claim that gate was approved.

PR #63 exists to reconcile stale tests, add explicit failure-signal evidence, and materialize the post-merge verification record. It contains no production behavior change.

## Final PR #63 verification

Pending until the final documentation commit is present on PR #63:

1. OpenBand CI V2 must pass on the exact final PR #63 HEAD, including Graph/SDD, frontend/backend typecheck, Vitest, legacy tests and Web build.
2. The exact verified HEAD must be recorded in the PR conversation and frozen without another commit.
3. Human Merge Gate approval must explicitly apply to that exact verified PR #63 HEAD.
4. Any subsequent HEAD change invalidates the frozen verification and requires affected checks to be rerun.
