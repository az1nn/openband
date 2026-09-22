# Verification — Source-aware Region Split and Trim

## Evidence model

Required checks use repository evidence states only:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

Any required FAIL/BLOCKED/FLAKY/STALE or missing result blocks the evidence-driven Merge Gate.

## Feature identity

- Canonical issue: #53 — Source-aware region split and trim.
- Tier: T3.
- Branch: `agent/53-source-aware-region-split-trim`.
- PR: #71.
- Design Baseline: `2514843ec7870ddab06c0309da19a16908333d86`.
- Initial branch base: `2aa887e3bd2ab4643407ae96532966ec1fed9767`.
- Canonical reconciled master: `ac46b4df2775a8d8b2d480459e43a3c3093d5b47`.
- Current reconciliation merge commit: `9bdc438aadf572352c63fb8f75a2a625115c06e7`.

## Historical design evidence

The original T3 design baseline and owner approval remain part of the audit trail, but they are not current merge authorization. Repository governance has since moved to automated design validation plus an evidence-driven Merge Gate.

The earlier Architecture Graph run `35226545143` remains useful historical evidence that the planned shared surfaces were HIGH impact and did not expose a T4 trigger. Because the base and governance policy moved materially, this evidence is STALE for current merge eligibility until the affected validation is refreshed.

## Current governance reconciliation

The feature now uses schemaVersion 2 metadata with explicit required checks. Current authority is the Constitution, `AGENTS.md`, Spec Kit artifacts, Graph/semantic impact, exact-HEAD CI and the trusted evidence-driven Merge Gate.

## Base reconciliation

The branch was 62 commits behind current `master@ac46b4df2775a8d8b2d480459e43a3c3093d5b47` and was reconciled through merge commit `9bdc438aadf572352c63fb8f75a2a625115c06e7`.

The reconciliation is material to governance/evidence freshness. Product overlap was bounded: among the 14 #53 files, only `src/lib/midiSynth.ts` also changed on master. The merged result preserves #53 source-window scheduling and master PR #100's `applyPanAutomationToParam()` behavior. No new persistence owner, bridge boundary, security boundary or T4 trigger is introduced by the reconciliation.

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
| Historical owner approval | RECORDED — non-authoritative under current policy |
| Current automated design/policy validation | PENDING exact-HEAD refresh |
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
| Temporary scaffolding removed | PASS |
| PR review state / mergeability | PENDING exact clean HEAD |
| Evidence-driven Merge Gate | PENDING current exact-HEAD contract |

## Gate freshness

The evidence-driven Merge Gate binds to the exact merge-candidate HEAD and its current target-base relationship. All required checks must be current on that state; any subsequent product, normative-document, HEAD, or materially relevant base change makes affected evidence STALE and requires refresh.

No real-microphone smoke is required by #53; that remains owned by #51 release readiness.
