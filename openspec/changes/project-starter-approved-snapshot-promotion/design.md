# Design: Project Starter — Approved Snapshot Promotion

## 1. Architecture Overview
```
NewProject details step  ──┐
                           ▼
              ProjectPreviewSession  (project-starter-live-preview, v9-01)
                           │
            ┌──────────────┼──────────────┐
            ▼                             ▼
   ApprovedStarterSnapshot        promoteStarterSnapshot()
   (immutable; recipe + revision     │
    + seed/version + contentHash)   ▼
                            projectStore / Supabase
                            (single Create per approval token)
```
Builds on the live-preview session (v9-01) and consumes variation/arrangement
snapshots. Master-lineage imports only; `ProjectPreviewSession`/`useProjectPreview`
land via v9-01 (dependency). `setupProjectStarter` in `src/lib/projectStarter.ts`
is the Create entry point.

## 2. Core Modules

### `projectStarter` (extended) / `snapshotPromotion`
- **`GeneratedStarterSnapshot`** — `{ revision, recipe, seed, version, contentHash, dimensionHashes?, windows?, uri, approved:false }`. Immutable once rendered.
- **`ApprovedStarterSnapshot`** — `GeneratedStarterSnapshot` plus `{ approvalToken, approvedAt }`; non-stale relative to the session config at approval time.
- **`contentHash`/normalized form** — excludes transient IDs and blob URLs (re-uses
  `normalizedRecipe` from seeded-variations) so re-keying persistent IDs does not
  change the hash (R3).
- **`computeStale(sessionConfig, snapshot): boolean`** — R4: true when UI config
  changed since the approved render.
- **`promoteStarterSnapshot(session, snapshot): Promise<projectId>`** — R3 exact:
  re-uses the snapshot's rendered/normalized content; never calls the genre
  generator again.
  - R5 idempotency: keyed by `approvalToken`; concurrent/duplicate Create calls
    for the same token resolve to a single project (dedup gate).

## 3. State Machine / Approval flow
- Snapshots render as non-approved revisions.
- User taps **Approve** on a non-stale snapshot ⇒ `ApprovedStarterSnapshot` with a
  unique `approvalToken` (R2).
- **Create Project**:
  - R4 gate: if the active session config changed since approval ⇔ promote the
    last *explicitly approved* snapshot and surface an explicit "promoting
    approved snapshot #N" notice; never silently merge new UI values.
  - R5 gate: if an in-flight Create for the same `approvalToken` exists, coalesce.
- **Start From Scratch** (no preview) and unapproved sessions cannot Create.

## 4. Ephemeral cleanup (R6)
- On successful promotion / close / cancel / session replacement:
  - stop playback, revoke all preview blob URLs, drop snapshot history.
  - no `ProjectStore`/Supabase write unless promotion succeeded and was the sole
    approved Create for that token (acceptance scenario 4).

## 5. Creation Boundary
- `NewProject.tsx` Create button calls `promoteStarterSnapshot(session, snapshot)`
  with the approved snapshot; full `numBars` is taken from the approved snapshot's
  recipe, not from the live UI (R3/R4).
- Reentrancy guard ensures `onCreate` fires exactly once per approval token (R5).

## Status: PROPOSED
