# Proposal: Project Starter — Approved Snapshot Promotion

## Context & Problem
After the Live Preview session (`project-starter-live-preview`, v9-01) and during
variation/arrangement exploration (`project-starter-seeded-variations`,
`project-starter-arrangement-preview`), the user approves a specific generated
snapshot. **Project creation must preserve that exact result** rather than
regenerating from wizard inputs: re-rolling would discard the user's creative
approval. Promotion must be exact (content-hash stable), idempotent under double
tap/re-render, and must not silently mix new UI values with old audio content.

## Objectives
1. **Snapshot boundary** — expose an immutable generated snapshot carrying recipe
   metadata, revision, seed/version, and normalized musical content (R1).
2. **Approval** — a user action explicitly marks one non-stale snapshot as
   approved before Create Project can promote it (R2).
3. **Exact promotion** — promotion preserves normalized musical content; re-keying
   persistent IDs is allowed, regeneration is not (R3).
4. **Stale protection** — if the UI configuration changed since the approved
   render, Create must either require approval of the newest snapshot or clearly
   promote the last explicitly approved snapshot; it MUST NOT silently mix new UI
   values with old audio (R4).
5. **Idempotency** — repeated Create events from double tap/re-render create at
   most one project per approval token (R5).
6. **Ephemeral cleanup** — preview-only rendered assets are stopped and released
   after successful promotion, close, cancellation, or session replacement (R6).

## Acceptance scenarios
- Given revision 8 is playing and approved, and revision 9 starts rendering but is
  unapproved, Create promotes revision 8 only.
- Given the same approval token submitted twice, only one persistent project is
  created.
- Given promotion re-keys IDs, the normalized music content hash remains equal.
- Given the wizard closes, no unapproved project is created via `ProjectStore`/
  Supabase.

## Status: PROPOSED
