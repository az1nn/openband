# Test Plan: Project Starter — Seeded Variations and Locks

## 1. Unit tests (seededVariations)
- `createSeededPRNG`:
  - two PRNGs seeded identically produce identical sequences.
  - different seeds produce different sequences.
- `normalizedRecipe`:
  - drops `uri`/blob URL and `revision` from content hash input.
- `dimensionHash`:
  - same recipe+dimension+dimension-lock ⇒ identical hash.
  - a locked dimension's hash is invariant across variations (R5).
- `computeVariationSnapshot`:
  - produces a new seed and a strictly increasing revision (R3).
  - same recipe+seed ⇒ identical normalized content hash (R2).
- Determinism guard:
  - variation generation never reads `Math.random()` (R8) — verify PRNG is the
    sole entropy source in the variation path (stub/monkey-check).

## 2. Lock compatibility (projectStarterLocks)
- Genre/subgenre change with incompatible bass lock ⇒ explicit incompatibility
  state, no generation (R6).
- Compatible change ⇒ generation proceeds with lock carry-forward (R5).

## 3. History & eviction
- Selecting a snapshot protects it from eviction at max history (R7).
- Exceeding max (5) evicts oldest unselected snapshot.
- Eviction revokes blob URL and stops playback (no leak).

## 4. Acceptance scenarios (integration)
- Same seed twice ⇒ same normalized hash.
- Different seed + rhythm locked ⇒ rhythm hash identical, ≥1 unlocked dimension
  changes.
- Genre switch + incompatible bass lock ⇒ incompatibility state (no silent mix).
- History > 5 ⇒ oldest unselected evicted + resources cleaned.

## Status: PROPOSED
