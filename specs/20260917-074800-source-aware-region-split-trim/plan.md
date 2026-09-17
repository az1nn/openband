# Plan — Source-aware Region Split and Trim

## Classification

**Tier:** T3  
**Issue:** #53  
**Integration base:** current canonical `master` (`cd996d807615d56ffebf6073f28e0161fcc54b88`) reconciled into the feature branch  
**Durable contract:** `docs/contracts/region-source-semantics.md`  
**ADR:** NOT REQUIRED — this feature makes an additive, backward-compatible project-shape extension inside existing persistence/audio boundaries; the durable cross-feature semantics are owned by the contract above.

## Current-state diagnosis

- `TrackRegion` originally owned only `id`, timeline `start`, timeline `duration` and optional `url`.
- `regionEdit.ts` had a parallel `EditableRegion` extension with optional `offset` / `length` and already calculated split/trim source windows.
- `midiSynth.ts` decoded-region structures discarded source-window metadata and scheduled `AudioBufferSourceNode.start(..., 0, duration)`.
- `universalAudio.ts` Web mixdown also scheduled from source offset `0`; its pure-JS/native mixdown copied source samples starting at index `0`.
- `projectStore` serializes track objects without reshaping them, so additive `TrackRegion` fields are naturally retained by JSON save/load.
- Existing #49 export semantics and #48 `asset://` persistence boundaries remain authoritative.

## Implemented design

### 1. Promote source-window fields into `TrackRegion`

Optional persisted fields:

```ts
offset?: number;
length?: number;
```

Semantics are seconds into the decoded source. Omitted values resolve to `offset = 0`, `length = duration`.

The additive shape is mirrored in the backend `TrackRegion` type. No bulk migration or version bump is introduced.

### 2. One pure source-window resolver

`regionEdit.ts` now uses canonical `TrackRegion` semantics and exports `resolveRegionSourceWindow()`, which returns finite/clamped `{ offset, length }` values. `EditableRegion` remains only as a compatibility alias.

The resolver does not fetch/decode audio and does not mutate regions.

### 3. Preserve edit mathematics

- split partitions the selected source window;
- start trim advances source and timeline together;
- end trim preserves source start;
- move changes only timeline placement;
- source bounds clamp safely.

### 4. Thread source metadata through the primary renderer

Decoded-region structures in `midiSynth.ts` retain source offset/length.

Web Audio scheduling uses:

```text
source.start(timelineStart, sourceOffset, scheduledLength)
```

where scheduled length is bounded by the selected source window, decoded buffer remainder and remaining project render duration.

The same semantics cover Studio playback because `renderTracksCached` delegates to the same `midiSynth` render path, while strict export uses the same source-window model under #49 strict failure semantics.

### 5. Align `universalAudio` Web and pure-JS/native paths

The internal mixdown region shape includes optional source-window fields.

- Web: resolved source offset/length controls scheduling.
- Web + track plugins: the selected source window is isolated before the plugin chain so pre-trim audio cannot affect stateful effects such as delay/reverb.
- Pure JS/native: offset/length convert to source sample indices and reads begin at `floor(offset * sampleRate)` with bounded length.

No native bridge API changes were introduced.

### 6. Persistence compatibility

`projectStore` and `assetStore` ownership remain unchanged. Focused regression coverage proves `offset` / `length` and `asset://` identity survive save → load and JSON export/import.

### 7. Deterministic verification fixture

A deterministic PCM/WAV fixture has distinguishable early positive and late negative segments. Tests prove:

- split-left and split-right source content;
- start-trim and end-trim source content;
- legacy no-offset scheduling;
- persistence round-trip;
- strict/full-project Web scheduling;
- `universalAudio` Web scheduling;
- pure-JS/native source sample indexing.

Resetting source offset to zero causes these assertions to fail deterministically.

## Touched surfaces

Primary:

- `src/lib/types.ts`
- `backend/src/types.ts`
- `src/lib/regionEdit.ts`
- `src/lib/midiSynth.ts`
- `src/lib/universalAudio.ts`
- `tests/sourceAwareRegion.test.ts`
- `tests/sourceAwareRender.test.ts`

No persistence owner, bridge, deployment topology, auth boundary, CRDT model or generic time-stretch system was changed.

## Architecture assessment

Architecture Graph evidence on exact Design Baseline `2514843ec7870ddab06c0309da19a16908333d86` confirms the planned surfaces were already highly shared:

- `src/lib/types.ts`: HIGH — 83 direct / 239 transitive dependents;
- `src/lib/regionEdit.ts`: HIGH — 4 / 81;
- `src/lib/midiSynth.ts`: HIGH — 9 / 78;
- `src/lib/universalAudio.ts`: HIGH — 27 / 146;
- `src/lib/projectStore.ts`: HIGH — 25 / 120.

The evidence was collected after Design Gate rather than before it; this sequencing deviation is recorded explicitly in `verification.md`. It was executed against the exact frozen baseline and confirmed the already-selected T3 classification without discovering a new boundary or T4 trigger.

Post-implementation Graph remained HIGH on the same shared surfaces and passed validation/CI. Added dependents are primarily the new resolver and regression tests rather than a new architectural owner.

## Base reconciliation

The feature branch was initially prepared from `2aa887e3bd2ab4643407ae96532966ec1fed9767`. Before implementation was frozen:

1. the project owner explicitly directed #53 to proceed independently while #51 / PR #69 remains blocked only on deferred human release validation;
2. current `master` advanced to `cd996d807615d56ffebf6073f28e0161fcc54b88` through PR #70;
3. the master delta was marketing documentation only and did not touch region, persistence or renderer contracts;
4. the branch was reconciled with current `master` by merge commit `be1906d3d8f5c9ef2cc39385d4437e1107058d55`;
5. no material scope, architecture, tier or verification change resulted, so the approved Design Gate remained valid.

## Specialist review

- **Architecture:** additive persistent shape; existing `projectStore`/`assetStore` ownership preserved; no bridge/runtime/security/topology expansion; T3 remains appropriate.
- **Audio/DSP:** review found one semantic inconsistency in `universalAudio` Web where track effects were applied before source-window selection. Commit `a058b162ca5676b006a467ef9f6893a9be3ecde5` corrected the order and added deterministic content proof. No new AudioContext, blob lifecycle or realtime-thread behavior was introduced.

## Verification strategy

Required before Human Merge Gate on one exact clean HEAD:

- Spec Kit consistency/analyze PASS (15/15 requirements mapped);
- Architecture Graph sync/validation PASS with no unreviewed tier escalation;
- frontend typecheck PASS;
- backend typecheck PASS;
- focused source-window/edit/persistence/render tests PASS;
- full Vitest PASS;
- legacy tests PASS;
- Web build PASS;
- existing launch-critical Playwright/export regression PASS when included by CI;
- architecture + audio specialist review PASS;
- temporary implementation/Graph workflows removed;
- no required evidence in FAIL/BLOCKED/FLAKY state.

No real-microphone smoke is added by #53; that remains owned by #51 release evidence.
