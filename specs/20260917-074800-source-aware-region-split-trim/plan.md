# Plan — Source-aware Region Split and Trim

## Classification

**Tier:** T3  
**Issue:** #53  
**Integration base:** `master` after #51 / PR #69 is merged and the feature branch is reconciled  
**Durable contract:** `docs/contracts/region-source-semantics.md`  
**ADR:** NOT REQUIRED — this feature makes an additive, backward-compatible project-shape extension inside existing persistence/audio boundaries; the durable cross-feature semantics are owned by the contract above.

## Current-state diagnosis

- `TrackRegion` currently owns only `id`, timeline `start`, timeline `duration` and optional `url`.
- `regionEdit.ts` introduces a parallel `EditableRegion` extension with optional `offset` / `length` and already calculates split/trim source windows.
- `midiSynth.ts` decoded-region structures discard source-window metadata and schedule `AudioBufferSourceNode.start(..., 0, duration)`.
- `universalAudio.ts` Web mixdown also schedules from source offset `0`; its pure-JS/native mixdown copies source samples starting at index `0`.
- `projectStore` serializes track objects without reshaping them, so an additive `TrackRegion` field is naturally retained by JSON save/load as long as sanitization does not strip nested region fields.
- Existing #49 export semantics and #48 `asset://` persistence boundaries remain authoritative.

## Design

### 1. Promote source-window fields into `TrackRegion`

Add optional:

```ts
offset?: number;
length?: number;
```

Semantics are seconds into the decoded source. Omitted values resolve to `offset = 0`, `length = duration`.

Mirror the additive shape in the backend `TrackRegion` type where the shared project model is duplicated. No bulk migration or version bump is introduced.

### 2. One pure source-window resolver

Refactor `regionEdit.ts` so `TrackRegion` itself is the editable type and export a small pure resolver that accepts a region plus optional decoded source duration and returns finite/clamped:

```ts
{ offset, length }
```

Editing helpers use the same normalization rules. Renderer code consumes that resolver rather than duplicating fallback/clamp logic.

The resolver does not fetch/decode audio and does not mutate the region.

### 3. Preserve edit mathematics

Keep the existing behavior envelope:

- split partitions the selected source window;
- start trim advances source and timeline together;
- end trim preserves source start;
- move changes only timeline placement;
- source bounds clamp safely.

`EditableRegion` may remain as a compatibility alias if current imports require it, but it must not define a second semantic model.

### 4. Thread source metadata through renderers

Update decoded-region structures in `midiSynth.ts` to retain source offset/length.

For Web Audio scheduling:

```text
source.start(timelineStart, sourceOffset, scheduledLength)
```

where scheduled length is bounded by the selected source window, decoded buffer remainder and remaining project render duration.

Update both full-project export and track/stem/plugin-buffer paths that schedule decoded regions.

### 5. Align `universalAudio` Web and pure-JS/native paths

Expand the internal region shape accepted by mixdown to include optional source-window fields.

- Web: use resolved source offset/length in `AudioBufferSourceNode.start`.
- Pure JS/native: convert offset/length to source sample indices, begin reads at `floor(offset * sampleRate)` and copy only the bounded selected sample count.

No native bridge API changes are expected.

### 6. Persistence compatibility

Do not alter `projectStore` storage ownership. Add focused regression coverage proving nested `TrackRegion.offset/length` survive save → load and JSON export/import.

Existing projects with no fields remain valid via resolver defaults.

### 7. Deterministic verification fixture

Create an audible WAV/AudioBuffer fixture divided into distinguishable segments (for example low positive amplitude followed by high/negative amplitude). Tests must assert sample content/energy/sign from the selected segment so resetting offset to zero fails deterministically.

Prove at minimum:

- split-left;
- split-right;
- start trim;
- end trim;
- legacy no-offset region;
- persistence round-trip;
- Web/offline renderer scheduling arguments or decoded output;
- pure-JS/native sample-window behavior;
- strict WAV export regression.

## Expected touched surfaces

Primary:

- `src/lib/types.ts`
- `backend/src/types.ts`
- `src/lib/regionEdit.ts`
- `src/lib/midiSynth.ts`
- `src/lib/universalAudio.ts`
- focused tests under `tests/`

Potential only if evidence requires it:

- `docs/contracts/audio-export.md` — clarify that source-window semantics are delegated to the region contract; no export redesign.

## Architecture assessment

The persistent model change is additive and the renderer behavior becomes more explicit; no new service, runtime, bridge or storage owner is introduced. The highest-risk aspect is semantic divergence across multiple render paths, controlled by one pure resolver plus renderer-specific deterministic regression tests.

Specialist review before Merge Gate:

- architecture/Graph review for persistent-shape and shared-renderer impact;
- audio/DSP review focused on Web Audio source scheduling and pure-JS sample indexing;
- code review for backward compatibility and failure behavior.

## Integration ordering

The branch was created from current `master` only to prepare the Design Baseline. Product implementation MUST NOT start until:

1. Human Design Gate approves the exact baseline SHA;
2. #51 / PR #69 is integrated into `master` or explicitly superseded;
3. this branch is reconciled with that canonical `master`;
4. material diff from reconciliation is analyzed; if it changes scope/architecture/verification, the Design Gate is invalidated and must be refreshed.

## Verification strategy

Required before Human Merge Gate on one exact HEAD:

- Spec Kit consistency/analyze PASS;
- Architecture Graph sync/validation PASS with no unreviewed tier escalation;
- frontend typecheck PASS;
- backend typecheck PASS;
- focused source-window/edit/persistence/render tests PASS;
- full Vitest PASS;
- legacy tests PASS;
- Web build PASS;
- existing launch-critical Playwright/export regression PASS when applicable to the reconciled base;
- architecture + audio specialist review PASS;
- no required evidence in FAIL/BLOCKED/FLAKY state.

No real-microphone smoke is added by #53; that remains owned by #51 release evidence.
