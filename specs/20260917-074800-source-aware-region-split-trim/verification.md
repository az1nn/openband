# Verification — Source-aware Region Split and Trim

## Evidence model

Required checks use repository evidence states only:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED
```

Any required FAIL/BLOCKED/FLAKY result blocks the Human Merge Gate.

## Feature identity

- Canonical issue: #53 — Source-aware region split and trim.
- Tier: T3.
- Branch: `agent/53-source-aware-region-split-trim`.
- PR: #71.
- Design Baseline: `2514843ec7870ddab06c0309da19a16908333d86`.
- Initial branch base: `2aa887e3bd2ab4643407ae96532966ec1fed9767`.
- Canonical reconciled master: `cd996d807615d56ffebf6073f28e0161fcc54b88`.
- Master reconciliation merge commit: `be1906d3d8f5c9ef2cc39385d4437e1107058d55`.

## Human Design Gate

The project owner explicitly instructed #53 to proceed after the T3 design baseline was prepared. The approval was recorded in PR #71 against exact Design Baseline `2514843ec7870ddab06c0309da19a16908333d86` before product-code mutation.

The owner also explicitly directed work to continue independently while #51 / PR #69 remains open only for deferred real-browser/microphone release evidence. #53 does not depend on #51 landing, deployment or microphone behavior.

## Governance sequencing note

Architecture Graph preflight evidence was intended to precede the Human Design Gate but was captured later. This is recorded as a sequencing deviation rather than rewritten as historical preflight.

Run `35226545143` subsequently checked the exact frozen Design Baseline SHA and confirmed the planned shared surfaces were already HIGH impact and consistent with the selected T3 tier. No T4 trigger or new architecture boundary was discovered. The implementation was not re-scoped based on this late evidence.

## Base reconciliation

After Design Gate, `master` advanced via PR #70 to `cd996d807615d56ffebf6073f28e0161fcc54b88`. The delta was marketing documentation only and did not change `TrackRegion`, `regionEdit`, persistence ownership, audio renderers or export semantics.

The feature branch was reconciled with canonical master through merge commit `be1906d3d8f5c9ef2cc39385d4437e1107058d55`. The reconciliation was non-material to #53 and did not invalidate the Design Gate.

## Implemented source-window contract

`TrackRegion` now carries optional source-window fields:

```ts
offset?: number;
length?: number;
```

Legacy resolution remains:

```text
missing offset -> 0
missing length -> region.duration
```

`resolveRegionSourceWindow()` is the shared pure resolver for fallback and decoded-source clamping.

For a region whose selected source window is `(O, L)`:

### Split at timeline delta `D`

```text
left:  offset = O,     length = D
right: offset = O + D, length = L - D
```

### Start trim inward by `D`

```text
start'    = start + D
offset'   = O + D
duration' = duration - D
length'   = L - D
```

### End trim inward by `D`

```text
start'    = start
offset'   = O
duration' = duration - D
length'   = L - D
```

All renderer reads are bounded by decoded-source duration and remaining render duration.

## Persistence evidence

Focused regression coverage proves an edited region with non-zero offset/shorter length survives:

- `saveProject` → `loadProject`;
- JSON `exportProject` → `importProject` → load;
- existing `asset://` identity.

No persistence owner, IndexedDB contract, asset re-keying or project schema migration was introduced.

## Renderer / playback / export evidence

### Primary Studio + strict export path

`midiSynth` decoded-region structures carry source offset/length and Web Audio schedules the resolved window. Studio playback uses `renderTracksCached`/`renderTracksToUrl` from the same renderer family; region metadata participates in the cache key, so split/trim metadata changes invalidate the cached render. Strict #49 export uses the same source-window semantics while retaining the existing strict failure contract.

### universalAudio Web path

Web mixdown schedules the resolved source window. Audio/DSP review found that track effects were initially applied to the whole decoded source before the window was selected. That could let pre-trim audio influence stateful effects. Commit `a058b162ca5676b006a467ef9f6893a9be3ecde5` remediated this by isolating the selected source window before the plugin chain.

### pure-JS/native path

Native/pure-JS mixdown converts resolved offset/length to sample indices and reads from the selected source start instead of sample zero.

## Deterministic source-content proof

The focused renderer fixture uses an early positive-amplitude segment followed by a late negative-amplitude segment. The tests prove actual selected content rather than duration alone:

- legacy region schedules source prefix;
- direct non-zero source offset reads the late segment;
- split-left renders the early segment;
- split-right renders the late segment;
- inward start trim renders the late segment;
- inward end trim retains the early segment and stops at the shortened boundary;
- full-project/strict Web renderer passes the expected `start(timeline, offset, length)` arguments;
- `universalAudio` Web passes the same scheduling window.

This satisfies FR-013/FR-014 and deterministically fails if any covered renderer resets source offset to zero.

## Focused implementation evidence

Temporary bounded implementation workflow `35226307146` / job `105218678578` passed after the audio review remediation:

- source-window patch shape check: PASS;
- focused region/render/persistence tests: 17/17 PASS;
- frontend typecheck: PASS;
- reviewed implementation commit: `a058b162ca5676b006a467ef9f6893a9be3ecde5`.

Additional left-split, end-trim and explicit legacy renderer proof was added afterward and is required to pass again in final full CI.

Initial bounded implementation also passed backend typecheck before the reviewed delta; final CI must re-prove backend typecheck on the clean HEAD.

## Architecture Graph evidence

Graph run `35226545143` / job `105219491870` completed successfully.

### Exact Design Baseline `2514843ec7870ddab06c0309da19a16908333d86`

- graph: 508 nodes / 1374 edges;
- validation: PASS, 0 errors;
- `src/lib/types.ts`: HIGH — 83 direct / 239 transitive dependents;
- `src/lib/regionEdit.ts`: HIGH — 4 / 81;
- `src/lib/midiSynth.ts`: HIGH — 9 / 78;
- `src/lib/universalAudio.ts`: HIGH — 27 / 146;
- `src/lib/projectStore.ts`: HIGH — 25 / 120.

### Implementation evidence state

- graph: 510 nodes / 1381 edges;
- validation: PASS, 0 errors;
- Graph CI: PASS;
- `src/lib/types.ts`: HIGH — 84 direct / 241 transitive dependents;
- `src/lib/regionEdit.ts`: HIGH — 7 / 151;
- `src/lib/midiSynth.ts`: HIGH — 10 / 79;
- `src/lib/universalAudio.ts`: HIGH — 28 / 147.

The higher counts are explained by the new shared resolver import and regression tests. No new persistence owner, runtime/bridge boundary, security boundary or T4 escalation trigger appeared. Existing Graph warnings remain repository-wide baseline warnings and Graph CI passed.

## Specialist reviews

### Architecture — PASS

- additive persistent shape only;
- `projectStore` / `assetStore` ownership unchanged;
- no new backend service or native bridge contract;
- no auth/security/deployment topology change;
- all central surfaces were already HIGH impact, appropriately handled as T3;
- no T4 trigger remains.

### Audio/DSP — PASS after remediation

- source selection is consistent across primary renderer, Web mixdown and native sample indexing;
- selected source window now feeds track effects before processing in `universalAudio` Web;
- no new AudioContext lifecycle, blob ownership, realtime-thread or latency-sensitive control path was introduced;
- deterministic content proof covers the semantic regression.

## Spec Kit consistency / convergence

Manual consistency review maps FR-001 through FR-015 to implementation and deterministic proof: 15/15 mapped. No requirement was weakened during convergence. The only specialist finding was remediated in code and the proof surface was expanded.

Final `npm run sdd:check` remains required on the exact clean HEAD after temporary scaffolding removal.

## Final verification matrix

| Evidence | State before clean-HEAD CI |
|---|---|
| Human Design Gate on exact Design Baseline | PASS |
| Spec Kit requirement mapping | PASS — 15/15 |
| Architecture Graph baseline + implementation evidence | PASS |
| Architecture specialist review | PASS |
| Audio/DSP specialist review | PASS after remediation |
| Focused source-window tests | PASS pre-cleanup; rerun required on clean HEAD |
| Frontend typecheck | PASS pre-cleanup; rerun required on clean HEAD |
| Backend typecheck | PASS initial implementation; rerun required on clean HEAD |
| Full Vitest | PENDING clean-HEAD CI |
| Legacy test suite | PENDING clean-HEAD CI |
| Web build | PENDING clean-HEAD CI |
| SDD/Graph CI | PENDING clean-HEAD CI |
| Launch-critical Playwright/export regression | PENDING current CI policy |
| Temporary scaffolding removed | PENDING |
| PR review state / mergeability | PENDING exact clean HEAD |
| Human Merge Gate | PENDING |

## Gate freshness

The Human Merge Gate binds to one exact verified implementation HEAD. After temporary scaffolding is removed, all required final CI evidence must pass on that same clean HEAD. Any subsequent code or normative-document change invalidates the freeze and requires affected evidence to run again.

No real-microphone smoke is required by #53; that remains owned by #51 release readiness.
