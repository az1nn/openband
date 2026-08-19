# Test Plan: Project Starter — Approved Snapshot Promotion

## 1. Unit tests (projectStarterPromotion)
- `contentHash`:
  - re-keying persistent IDs (without musical change) yields identical hash (R3,
    acceptance scenario 3).
  - changes in recipe (genre/bpm/key/seed) yield different hash.
- `computeStale`:
  - true when session config changed since the approved render (R4).
  - false when config unchanged.
- `promoteStarterSnapshot`:
  - reuses the approved snapshot's recipe uri (no regeneration) (R3).
  - R5 gate: same `approvalToken` submitted twice resolves to a single project
    (acceptance scenario 2).

## 2. Staleness (R4)
- When config changes after approval and Create is pressed, the last explicitly
  approved snapshot is promoted and a notice is surfaced — no silent mix of new
  UI values with old audio.

## 3. Ephemeral cleanup (R6)
- On wizard close with an unapproved session: no `ProjectStore`/Supabase write
  occurs (acceptance scenario 4).
- After successful promotion: all preview blob URLs revoked and playback stopped.

## 4. Integration (acceptance scenarios)
- Revision 8 playing+approved, revision 9 unapproved ⇒ Create promotes revision 8
  only.
- Same approval token twice ⇒ exactly one project created.
- Promotion re-keys IDs ⇒ normalized content hash equal.
- Wizard close ⇒ no project created.

## Status: PROPOSED
