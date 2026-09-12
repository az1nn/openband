# Plan

## Impact

Architecture Graph preflight against the #49 branch, rooted on the current `master` baseline:

- `src/lib/universalAudio.ts`: HIGH — 26 direct / 140 transitive dependents.
- `src/components/BounceDialog.tsx`: HIGH — 1 direct / 63 transitive dependents.
- `app/studio/StudioModals.tsx`: HIGH — 4 direct / 5 transitive dependents.
- `src/lib/audio.ts`: HIGH — 15 direct / 123 transitive dependents.
- `src/lib/midiSynth.ts`: HIGH — 6 direct / 71 transitive dependents.
- `src/lib/busRouter.ts`: HIGH — 5 direct / 142 transitive dependents.
- `src/lib/pluginChain.ts`: HIGH — 11 direct / 147 transitive dependents.
- `app/studio/[id].tsx`: HIGH — 4 direct / 4 transitive dependents.

Keep T3 by changing the export orchestration and strict-render contract without replacing DSP algorithms or persistent data models. Elevate to T4 before implementation if convergence requires changing deterministic DSP/plugin/codec mathematics or introduces a credible corruption/data-loss path.

## Current gaps

- `BounceDialog` narrows `TrackDef` to id/name/mute/solo/volume/pan/regions before export. MIDI notes, track plugins, sends/output routing and other renderer-owned state are discarded at the UI boundary.
- `BounceDialog` advertises WAV/AIFF/FLAC, multiple bit depths and sample rates, but `audioSystem.renderMixdown` returns WAV and does not consume the selected bit depth. Changing the filename extension does not change the codec.
- The audio dialog fabricates a header-sized silent buffer when there are no tracks and can present that as a successful export.
- The dialog silently clamps export duration to 300 seconds.
- `audioSystem.renderMixdown` is region-oriented and treats a project with no audio regions as silence, so a MIDI-only project can export a technically valid but musically empty WAV.
- The current Web `busRouter` applies `TrackDef.volume` and `TrackDef.pan` directly even though Studio track values are percentage-scaled; this boundary is not suitable as-is for proving launch export volume/pan correctness.
- The richer Studio offline renderer in `midiSynth` already understands MIDI, durable audio regions, track plugin chains, buses, mood and master plugins, but its ordinary playback-oriented failure handling is tolerant: failed sources/effects can warn and fall through. Export trust needs strict failure semantics.
- `renderTracksCached` deliberately excludes live mixer controls from its playback cache key. Reusing that cache for export could produce stale mixer state, so export must be one-shot and uncached.
- Current tests mostly prove that a Blob exists. They do not prove RIFF/WAVE validity, audible PCM, mixer-state fidelity or non-destructive failure behavior.

## Design

1. **Use one existing full-project rendering lineage, not the reduced Bounce renderer.** The launch WAV path will build on the offline project renderer in `src/lib/midiSynth.ts`, because it already owns audio regions, MIDI, track plugins, bus routing inputs and the master-rack chain. Do not create a second independent MIDI/plugin renderer inside `BounceDialog` or `universalAudio`.

2. **Separate Blob production from playback URL materialization.** Refactor the full-project renderer so a reusable function can produce a WAV `Blob` directly. Existing playback URL behavior remains a wrapper that converts its rendered Blob to a tracked object URL. This keeps blob URLs runtime-only and lets export avoid a create-URL/fetch-back round trip.

3. **Add an explicit strict export mode without changing tolerant playback semantics by default.** The export call uses a strict option/profile. In strict mode, missing `asset://` resolution, source fetch/decode failure, track-plugin failure, master-plugin failure, or Web offline-render failure rejects the export. The existing playback path may retain its current tolerant fallback behavior unless a separately justified correction is required.

4. **Normalize mixer units at the export boundary.** In strict export mode, `TrackDef.volume` is converted from 0–100 to 0–1 and `TrackDef.pan` from -100–100 to -1–1 before Web Audio parameters are set. Bus volume remains on its existing normalized Studio scale (the UI creates buses at `1` and edits them in 0.1 increments). Do not globally change `busRouter` or PlaybackEngine behavior in #49; their broader semantics have much larger blast radius and are not required to establish an export-specific contract.

5. **Snapshot complete render state once.** Introduce a focused export helper under `src/lib/` that accepts the current full tracks, BPM, optional mood, buses and active master-rack plugins and creates an immutable/deep-enough render snapshot before asynchronous work begins. The export path never consults `renderTracksCached`.

6. **Make the launch format truthful and narrow.** For #49, Bounce exposes WAV as the guaranteed audio format. The UI must not offer AIFF/FLAC/MP3 unless a real encoder is wired. It must not advertise bit depth/sample-rate choices that the invoked renderer ignores. The actual WAV metadata/encoding emitted by the renderer is shown or described truthfully rather than inferred from unused controls.

7. **Eliminate fake success and silent truncation.** A project with no renderable musical content returns an explicit error; no synthetic silent placeholder is downloaded as success. Remove the `Math.min(duration, 300)` success-path truncation for WAV. Browser/resource failures for a long project are explicit failures and remain non-destructive.

8. **Validate the produced WAV before download.** The export helper performs inexpensive structural checks before `exportToFile`: Blob type/size and RIFF/WAVE/data-chunk sanity. Audible-energy assertions belong to deterministic tests rather than a universal runtime rule, because a user may intentionally export silence through mixer state.

9. **Preserve side-effect isolation.** Export reads project state and local assets only. It does not call project save/migration APIs, rewrite `asset://` identities, mutate tracks, or delete/re-key persisted data. Failure leaves the current project and persistence state untouched.

10. **Define launch-scope effects narrowly.** Export includes the effects already owned by the full Studio offline renderer: enabled track plugin chains and active master-rack plugins. This feature does not introduce bus-plugin processing or redesign live modulation/mastering paths that are not already part of that renderer.

11. **Keep legacy render consumers compatible.** `audioSystem.renderMixdown` remains available for existing video/native and legacy consumers unless implementation evidence requires a compatible adapter. #49 moves the Studio WAV bounce to the strict full-project path rather than broadening every historical consumer at once.

12. **Reconcile the durable contract.** Add `docs/contracts/audio-export.md` describing truthful WAV format semantics, immutable render snapshot inputs, strict source/effect failure, mixer-unit interpretation, no silent success, and side-effect-free export. `docs/architecture.md` does not require a new boundary because the existing Audio/DSP boundary remains; this feature hardens one contract within it. No ADR is required unless implementation introduces a materially new renderer architecture.

## Planned implementation surface

- `src/lib/midiSynth.ts`
  - expose Blob-producing full-project render path;
  - add strict export profile/options;
  - apply export-specific percentage normalization without changing default playback behavior;
  - propagate strict source/effect failures.
- `src/lib/exportTrust.ts` (new)
  - immutable export snapshot;
  - strict WAV invocation;
  - RIFF/WAVE structural validation and export-specific error taxonomy.
- `src/components/BounceDialog.tsx`
  - accept complete render inputs;
  - use the strict export helper;
  - make WAV-only MVP controls truthful;
  - remove fake empty-project success and silent 300-second truncation.
- `app/studio/StudioModals.tsx`
  - stop reducing tracks to region-only export objects;
  - forward buses/mood/master-rack state required by the renderer.
- `app/studio/[id].tsx`
  - provide current render state to `StudioModals`.
- Tests
  - deterministic export fixture and failure-path coverage;
  - BounceDialog contract/UI tests;
  - compatibility tests for ordinary playback renderer behavior.

## Knowledge impact

- Architecture: NO_BOUNDARY_CHANGE — existing Audio/DSP ownership remains authoritative.
- Contract: ADD_REQUIRED — `docs/contracts/audio-export.md`.
- ADR: NOT_REQUIRED unless implementation changes renderer architecture materially.
- Governance: UNCHANGED.
- Historical note: merged #48 documentation mentions portable archive correctness under #49, but the current canonical #49 issue is explicitly the launch audio mixdown contract. Per flow-forward policy, do not rewrite merged #48 history and do not silently widen #49 to archive packaging.

## Verification

### Deterministic unit/integration fixture

Create a short synthetic project whose source PCM is deterministic and avoids stochastic mood/reverb behavior. Verify:

- output starts with RIFF/WAVE and contains a non-empty data chunk;
- exported PCM is non-silent when the fixture is audible;
- mute removes the muted track's contribution;
- solo isolates soloed tracks;
- volume changes produce the expected relative amplitude relationship within tolerance;
- left/right energy changes materially with pan direction;
- a deterministic enabled track effect changes output in the expected direction;
- MIDI-only content produces audible WAV rather than region-count silence;
- current master-rack plugin path is represented in export where deterministic for the chosen fixture.

### Failure behavior

- unresolved `asset://` source rejects export;
- fetch/decode failure rejects export;
- strict enabled-plugin/master-render failure rejects instead of silently claiming success;
- no-track/no-renderable-content project returns explicit failure;
- export failure does not mutate the input snapshot, project store or durable asset records;
- unsupported format selections are not exposed as successful export choices.

### Compatibility

- existing tolerant `renderTracksToUrl` playback call remains compatible when strict export options are not supplied;
- existing `audioSystem.renderMixdown` consumers remain type/runtime compatible unless changed through an explicit adapter;
- `asset://` resolution continues through `assetStore`.

### Browser smoke

On the Web preview with persistent local assets:

1. open a deterministic project containing audio and/or MIDI;
2. set distinct mute/solo/volume/pan states and an enabled launch-scope effect;
3. export WAV;
4. decode/play the downloaded result and verify it is audible and reflects the intended mixer state;
5. reload/reopen the project and repeat using persisted `asset://` sources;
6. inject one missing/corrupt asset and prove export fails visibly without changing project state.

### Full gate

Run frontend/backend typecheck, targeted Vitest, full Vitest/legacy tests, Web build, `sdd:check`, Graph tests and `graph:ci`. Re-run Graph impact if implementation expands beyond the approved surface. Verification evidence is bound to the exact implementation HEAD and becomes stale if HEAD changes.
