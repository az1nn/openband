# Feature: Source-aware Region Split and Trim

**Tier:** T3 — additive persistent project shape + shared audio-render semantics  
**Issue:** #53  
**Part of:** #46 Launch MVP

## Goal

Make split and trim source-accurate across Studio editing, save/reopen, playback/mixdown and launch WAV export without redesigning persistence or asset ownership.

## Problem

`src/lib/regionEdit.ts` already calculates `offset` / `length`, but `TrackRegion` does not own those fields and the current render paths schedule decoded audio from source offset `0`. A right-hand split or start-trim can therefore replay the wrong source segment.

## Requirements

- **FR-001 — Canonical region shape.** `TrackRegion` MUST support optional `offset` and `length` fields, in seconds, as the persisted source-window contract for audio regions.
- **FR-002 — Backward compatibility.** When omitted, `offset` resolves to `0` and `length` resolves to the region timeline `duration`; existing project JSON MUST require no destructive migration.
- **FR-003 — Single semantic resolver.** Source-window resolution/clamping MUST live in one shared pure helper used by editing and renderer paths rather than being reimplemented independently.
- **FR-004 — Split accuracy.** Splitting an audio region MUST preserve the original source identity, keep the left source start, and advance the right source start by the left split duration. The two selected source windows MUST partition the original selected window.
- **FR-005 — Start-trim accuracy.** Trimming the start inward MUST advance timeline `start` and source `offset` by the same accepted delta and shorten `duration` / `length` accordingly.
- **FR-006 — End-trim accuracy.** Trimming the end MUST change `duration` / `length` without changing timeline `start` or source `offset`.
- **FR-007 — Bounds safety.** Editing and rendering MUST clamp source-window reads to finite non-negative values and the decoded source duration; no path may request samples outside the decoded asset.
- **FR-008 — Persistence fidelity.** `saveProject`, load/reopen, JSON export/import and bridge serialization MUST retain source-window fields when present. `projectStore`, `assetStore` and `asset://` ownership MUST remain unchanged.
- **FR-009 — Playback agreement.** Tolerant playback/mixdown paths MUST schedule the resolved source offset/length rather than always starting decoded audio at `0`.
- **FR-010 — Strict export agreement.** The #49 launch WAV renderer MUST use the same source-window semantics as playback and MUST still fail according to the existing strict export contract when required source decoding/rendering fails.
- **FR-011 — Native/pure-JS agreement.** Pure-JS/native mixdown sample reads MUST begin at the resolved source sample offset and respect the resolved source length.
- **FR-012 — No implicit time-stretch.** A split or trim MUST select a source segment; shortening the region MUST NOT be interpreted as replaying or time-stretching a prefix from source second `0`.
- **FR-013 — Deterministic proof.** Tests MUST use a source fixture with distinguishable time segments and prove that left/right split and start/end trim render the expected segment, not merely the expected duration.
- **FR-014 — Legacy proof.** Tests MUST prove a region with only `start`, `duration` and `url` retains legacy source-prefix semantics.
- **FR-015 — Persist/reopen proof.** A persisted edited region MUST retain `offset` / `length` after load/reopen and produce the same resolved source window.

## Non-goals

- Replacing `projectStore`, `assetStore`, IndexedDB or `asset://`.
- Introducing project schema versioning or a bulk migration.
- Redesigning MIDI regions, waveform UI, CRDT/collaboration, automation or plugin architecture.
- Adding generic time stretching, slip editing, fades or crossfades.
- Changing authentication, release landing, browser-support policy or deployment topology.
- Solving unrelated native build verification from #43.

## Acceptance

1. `TrackRegion` carries optional persisted source-window fields with legacy defaults.
2. Split and trim helpers produce mathematically correct, bounded source windows.
3. Save → load/reopen preserves those windows without migration/re-keying.
4. Web playback/mixdown, strict WAV export and pure-JS/native mixdown read the same selected source segment.
5. Deterministic tests fail if a renderer resets source offset to `0`.
6. Frontend/backend typecheck, focused Vitest, existing legacy tests, Web build, SDD/Graph checks and renderer/export regressions pass on the same verified HEAD.

## Risk boundary

This is **T3 minimum** because it changes the persistent `TrackRegion` shape and semantics consumed by multiple audio render paths. The change remains additive and backward-compatible.

Escalate to **T4 + fresh Design Gate** if implementation requires destructive project migration, possible data loss/corruption, deterministic DSP/time-stretch redesign, concurrency/CRDT changes, asset re-keying, or a security-sensitive boundary.
