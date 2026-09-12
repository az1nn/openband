# Export Trust

Issue #49 · Launch MVP #46 · Tier T3

## Goal

Make Web Studio WAV export a trustworthy projection of the current project state: the file the user downloads must be a real, decodable WAV derived from the same launch-scope musical content and mixer intent that the Studio owns, without mutating the project or silently omitting failed sources.

## Acceptance

- Web Studio exposes a WAV mixdown path for a valid project without requiring authentication or cloud storage.
- Export snapshots the current project inputs at invocation time. The snapshot includes full `TrackDef` content needed by the renderer, current BPM/mood, buses and the active master-rack plugin chain; later UI edits do not partially alter an in-flight export.
- Export handles both durable audio regions (`asset://` through the existing resolver) and MIDI content. The modal must not reduce tracks to a region-only shape before rendering.
- Mute/solo and track volume/pan are reflected using the Studio's persisted percentage semantics (`volume` 0–100, `pan` -100–100). Bus gain remains in its existing normalized Studio scale.
- Launch-scope effects already owned by the Studio offline renderer are reflected: enabled track plugin chains and the active master-rack chain. This feature does not invent new bus/plugin capabilities that are not currently audible in the Studio path.
- The downloaded result is truthfully encoded and named as WAV. Unsupported AIFF/FLAC/MP3 choices must not be advertised as successful WAV alternatives; MP3 remains optional and must not delay launch.
- A successful export is larger than a header-only file and has valid RIFF/WAVE structure. A deterministic audible fixture proves decodability, non-silent PCM, mute/solo isolation, volume response and stereo pan behavior.
- Missing/corrupt source assets, decode failures, render failures, or enabled effect failures in the strict export path fail explicitly. Export must not silently drop the failing source and claim success.
- Empty/invalid projects do not receive a fabricated silent placeholder presented as a successful mix.
- Export does not reuse the Studio playback render cache. Each export is rendered from its immutable invocation snapshot.
- Export failure is user-visible and side-effect free: tracks, project persistence, durable `asset://` records and saved project state remain unchanged.
- The current arbitrary 300-second UI truncation must not silently shorten a successful WAV. If the browser cannot render the requested project, the operation fails explicitly instead.

## Affected surface

- `src/components/BounceDialog.tsx`
- `app/studio/StudioModals.tsx`
- `app/studio/[id].tsx`
- `src/lib/midiSynth.ts`
- a focused export-trust helper under `src/lib/`
- `src/lib/audio.ts` only through the existing WAV encoder contract unless implementation evidence proves a correction is required
- export/render tests and browser smoke coverage
- `docs/contracts/audio-export.md`

## Risk boundary

Keep this feature at T3 while implementation is limited to export orchestration, strict failure semantics, truthful format presentation, render snapshotting and correction of unit normalization at the export boundary.

Elevate to T4 before implementation if the approved design must change a correctness-critical deterministic DSP algorithm, codec math, plugin algorithm semantics, or introduces a credible project/data corruption path.

## Non-goals

- MP3 as a launch requirement.
- Implementing AIFF or FLAC encoders merely to preserve the current selector UI.
- Video export redesign.
- Native/mobile export parity for this Web MVP slice.
- New DSP algorithms, new plugin types, or mastering redesign.
- Redesigning Studio playback, its stem cache, or its live automation engine.
- Portable `.openband` project/archive packaging. The merged persistence feature historically deferred portable archive work to #49, but the current canonical #49 issue defines launch audio mixdown trust; flow-forward policy keeps that older record intact rather than expanding this feature silently.
