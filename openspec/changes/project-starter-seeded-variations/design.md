# Design: Project Starter — Seeded Variations and Locks

## 1. Architecture Overview
```
NewProject details step  ──┐
                           ▼
              ProjectPreviewSession  (project-starter-live-preview, v9-01)
                           │
                           ▼
                   useSeededVariations
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  seededVariations   PreviewSnapshot[]  (bounded history)
   ├── GenerationRecipe        (dim hashes, blob URL)
   ├── GenerationLocks
   ├── createSeededPRNG
   ├── dimensionHash(...)       rhythm/bass/harmony/melody/fx
   └── computeVariationSnapshot(recipe, locks)
```
Variations build on top of the live-preview session (v9-01). This design targets
master-lineage imports only; the `ProjectPreviewSession`/`useProjectPreview`
APIs are expected to land via v9-01 and are referenced as a dependency.

## 2. Core Modules

### `seededVariations`
- **`GenerationRecipe` (versioned)** — `{ version, genreId, mood, bpm, key, timeSignature, numBars, previewBars, seed }`; `normalizedRecipe()` strips transient IDs (blob URLs, revision) for hashing.
- **`GenerationLocks`** — `{ rhythm?, bass?, harmony?, melody?, fx? }` (boolean); optional `trackRoles?` map.
- **`createSeededPRNG(seed: string|number): () => number`** — deterministic PRNG (e.g. mulberry32); **no ambient `Math.random()`** in the variation path (R8).
- **`dimensionHash(recipe, dimension, prng): string`** — stable hash per musical dimension for lock-invariant checks (R5).
- **`computeVariationSnapshot(recipe, locks): PreviewSnapshot`** — generates a new seed (R3) and returns `{ revision, recipe, contentHash, dimensionHashes, uri, approved:false }`.

## 3. State Machine (per preview session)
`idle → rendering → ready → playing | paused` ; variation actions:
- **New variation** — `pendingLocks` resolved against `activeSnapshot`; new revision enqueued; latest-only render.
- **Lock toggle** — applies to active snapshot; does not trigger render until Regenerate.
- **Genre/subgenre change** — R6 validation: compute compatibility; if incompatible with active locks, surface explicit state, block generation until resolved.
- **A/B history** — select snapshot (≤5); selected is protected from eviction (R7).

## 4. Concurrency & Budget
- Single in-flight variation render (latest-only); rapid Regenerate calls collapse
  to one pending render with a 200ms debounce (consistent with live-preview).
- **Preview budget** — variations render only bounded preview windows (≤
  `MAX_PREVIEW_BARS`); never the full arrangement on every change (R5 preview budget).

## 5. Lifecycle & Cleanup
- On history eviction / recipe change / session close: stop playback and revoke
  all stale blob URLs (`URL.revokeObjectURL`).
- `previewBars` and dimension hashes are part of the snapshot metadata so A/B
  comparison is exact (R2).

## 6. Creation Boundary
- Approving a snapshot (promoting to the project) is handled by
  `project-starter-approved-snapshot-promotion`; this spec only owns variation
  generation and locking.

## Status: PROPOSED
