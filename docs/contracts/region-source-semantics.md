# Region Source Semantics Contract

## Scope

This contract defines source-window semantics for audio `TrackRegion` objects used by Studio editing, persistence, playback, mixdown and launch WAV export.

It does not redesign project persistence, asset identity, time stretching, MIDI regions or native bridge ownership.

## Region model

An audio region has two coordinate spaces:

- **timeline** — `start` and `duration`, in seconds, place the region in the project;
- **source** — optional `offset` and `length`, in seconds, select the audible window inside the decoded audio source.

Compatibility defaults are authoritative:

```text
offset = 0 when omitted
length = duration when omitted
```

Existing persisted projects without `offset` / `length` therefore retain current whole-prefix behavior without migration or destructive rewrite.

For split/trim-created audio regions, `duration` and `length` remain equal unless a future approved feature introduces an explicit time-stretch contract.

## Invariants

For a decoded source of duration `S`:

```text
0 <= offset <= S
0 <= length <= S - offset
0 <= duration
```

Renderers must additionally clamp the scheduled source window to the decoded buffer and remaining project render duration. Invalid or non-finite values must never cause out-of-bounds source reads.

## Editing semantics

- **Move** changes only timeline `start`.
- **Split** preserves one source identity. The left region keeps the original source offset; the right region starts at `offset + leftDuration`. The two source lengths partition the selected source window.
- **Start trim** moves timeline `start` and source `offset` by the same accepted delta while reducing `duration` / `length` accordingly.
- **End trim** changes `duration` / `length` without changing `start` / `offset`.
- Edits clamp rather than manufacture source material outside the decoded asset.

## Rendering semantics

Every audio renderer that consumes `TrackRegion` must schedule the same resolved source window:

```text
sourceOffset = resolved offset
sourceLength = resolved length
```

Web Audio paths use the source-offset argument of `AudioBufferSourceNode.start(...)`. Pure-JS/native mixdown paths begin sample reads at the equivalent source sample offset.

A right-hand split or start-trim must therefore render the selected later segment, never replay the source from second `0` and never treat a shorter timeline duration as an implicit time-stretch request.

## Persistence and compatibility

`projectStore` remains the project JSON boundary and `asset://` remains the persisted binary-audio identity. Adding optional source-window fields is an additive project-shape extension only.

Save, reload, export/import and bridge JSON serialization must preserve `offset` / `length` when present. No schema-wide migration, asset re-key, or persistence replacement is part of this contract.

## Verification

Deterministic fixtures must distinguish source segments by sample content and prove:

1. split left/right outputs map to the expected source windows;
2. start/end trim outputs map to the expected source windows;
3. persisted/reloaded regions retain source-window fields;
4. playback/mixdown and strict WAV export resolve the same window semantics;
5. legacy regions without source-window fields remain compatible.
