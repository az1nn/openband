# Proposal: Project Starter — Seeded Variations and Locks

## Context & Problem
OpenBand's `NewProject` wizard generates a full track arrangement from a genre +
mood selection (see `project-starter-live-preview` on `agent/v9-01-project-starter-preview`
for the preview session that consumes generated tracks). Users need to request
alternate generated versions **while preserving selected musical elements**
(R1–R4): a deterministic seed must drive regeneration, and locked dimensions
(rhythm, bass, harmony, melody, FX/preset layer) must remain unchanged across
variations. Without this, every "Regenerate" is a full re-roll and users cannot
steer the result, leading to repeated retries and lost creative direction.

In addition, unbounded A/B history and ambient `Math.random()` make results
unpredictable and leak resources (R7, R8).

## Objectives
1. **Versioned recipe + seed** — A `GenerationRecipe` carries a versioned schema
   and an explicit seed (R1).
2. **Deterministic musical content** — Same generator version + normalized
   recipe + seed ⇒ same normalized content hash (R2). Generation MUST NOT depend
   on ambient `Math.random()` (R8).
3. **New variation** — Regenerate produces a new seed and a new snapshot revision
   (R3).
4. **Locks** — Users may lock rhythm, bass, harmony, melody, and FX/preset layer
   (R4); track-role locks are permitted when roles are available.
5. **Lock invariants** — Locked dimensions remain unchanged across variation
   generation (R5).
6. **Compatibility** — Genre/subgenre changes validate locks; incompatible locks
   require explicit resolution (R6).
7. **Bounded history** — Preview retains 3 snapshots by default (5 max); the
   selected snapshot is protected from eviction (R7). Stale snapshots and their
   blob URLs are evicted and released.
8. **Minimal UI surface** — Regenerate, lock toggles, A/B history selector;
   seed/variation label hidden by default, available in diagnostics (UX).

Non-objectives: this spec covers variation generation *within* a preview session.
Project persistence and cloud sync of approved snapshots are covered by
`project-starter-approved-snapshot-promotion`.

## Acceptance scenarios
- Same seed twice ⇒ same normalized hash.
- Different seed with rhythm locked ⇒ rhythm hash identical, ≥1 unlocked
  dimension changes.
- Genre switch with incompatible bass lock ⇒ explicit incompatibility state.
- History > max (5) ⇒ oldest unselected snapshot evicted; resources cleaned.

## Status: PROPOSED
