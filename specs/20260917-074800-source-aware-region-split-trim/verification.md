# Verification — Source-aware Region Split and Trim

## Evidence model

Required checks use repository evidence states only:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED
```

Any required FAIL/BLOCKED/FLAKY result blocks the Human Merge Gate.

## Preflight snapshot

- Canonical issue: #53 — Source-aware region split and trim.
- Tier: T3 minimum.
- Design branch: `agent/53-source-aware-region-split-trim`.
- Branch creation base: `2aa887e3bd2ab4643407ae96532966ec1fed9767`.
- #51 / PR #69 was still open/draft at feature preflight; #53 product implementation is intentionally deferred until canonical base reconciliation.
- No pre-existing #53 branch or implementation feature was found.

## Diagnosis evidence

Current source model:

- `src/lib/types.ts`: `TrackRegion` has no source-window fields.
- `src/lib/regionEdit.ts`: parallel `EditableRegion` already carries optional `offset` / `length` and calculates source-aware split/trim values.
- `src/lib/midiSynth.ts`: decoded audio scheduling starts source reads at offset `0`.
- `src/lib/universalAudio.ts`: Web mixdown starts at source offset `0`; pure-JS/native mixdown copies from source sample index `0`.
- `src/lib/projectStore.ts`: project JSON persists nested track objects without a region-field migration layer, allowing an additive nested shape.
- `docs/contracts/audio-export.md`: strict export requires trustworthy full-snapshot render and remains authoritative for failure semantics.

## Design proof

The approved design must preserve these equations for an audio region whose resolved selected source window is `(O, L)`:

### Split at timeline delta `D`

```text
left:  offset = O,     length = D
right: offset = O + D, length = L - D
```

### Start trim inward by `D`

```text
start'  = start + D
offset' = O + D
duration' = duration - D
length'   = L - D
```

### End trim inward by `D`

```text
start'  = start
offset' = O
duration' = duration - D
length'   = L - D
```

All accepted values are clamped to finite non-negative source/timeline bounds.

## Planned deterministic tests

### Editing

- legacy fallback: absent `offset/length` resolves to `0/duration`;
- split partitions a non-zero-offset source window correctly;
- start trim advances source offset;
- end trim preserves source offset;
- edits cannot select beyond decoded source bounds.

### Persistence

Save a project containing a region with non-zero source offset and shorter source length; load it and JSON export/import it. Assert exact source-window preservation and unchanged `asset://` identity.

### Renderer fixture

Use a deterministic source whose early and late segments have observably different PCM values. Rendering the right split/start-trim must produce the late segment. Any implementation that resets source offset to `0` must fail the assertion.

Cover:

- `midiSynth` full-project/strict-export path;
- renderer path used for track/stem/plugin processing when applicable;
- `universalAudio` Web scheduling;
- `universalAudio` pure-JS/native source sample indexing.

### Legacy compatibility

A persisted/constructed region with only `id/start/duration/url` must render from source offset `0` for `duration`, matching pre-#53 behavior.

## Required final verification matrix

| Evidence | Required state |
|---|---|
| Spec Kit analyze / consistency | PASS |
| Architecture Graph preflight + final sync/validation | PASS |
| Frontend typecheck | PASS |
| Backend typecheck | PASS |
| Focused region/render/persistence tests | PASS |
| Full Vitest | PASS |
| Legacy test suite | PASS |
| Web build | PASS |
| Launch-critical Playwright/export regression, when CI requires it | PASS |
| Architecture specialist review | PASS |
| Audio/DSP specialist review | PASS |
| Required PR review threads | resolved / no blocker |

## Gate freshness

The Human Design Gate binds to one exact Design Baseline SHA. After approval, reconciliation with the post-#69 `master` is mandatory before implementation. A reconciliation change that alters scope, architecture/contract, tier, structural dependencies or verification strategy invalidates Design Gate approval.

The Human Merge Gate binds to one exact verified implementation HEAD. Any code or normative-document change after verification requires rerunning affected evidence.
