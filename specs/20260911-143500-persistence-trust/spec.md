# Persistence Trust

Issue: #48 · Launch umbrella: #46 · Tier: T3

## Goal

Make Web project ownership durably trustworthy without replacing the existing project persistence boundary or folding portable export work into this feature.

## Acceptance

- Manual save and autosave report success only after the project-state write actually succeeds; quota/storage failures are visible and never shown as `Saved`.
- Reloading the page or closing and reopening the browser preserves project structure, mixer state, MIDI state, and other serialized `ProjectData` fields.
- Web recordings and imported audio that are added to a project are persisted as durable `asset://` references backed by local asset bytes, and remain resolvable after in-memory/object-URL caches are cleared or a new page session starts.
- A new recorded/imported region is committed to project state only after its asset bytes are durably stored. Asset-write failure does not add an orphaned region or discard existing project state.
- Missing/corrupt local assets are surfaced as persistence failures; they do not silently delete tracks or mutate the last durable project snapshot.
- The Library project index can recover from a missing/corrupt derived index without losing otherwise valid locally stored projects.
- Existing `asset://` project references remain readable; this feature performs no destructive re-key/migration of previously stored project or asset records.
- Existing JSON import/export recovery remains structurally compatible for the same local profile and preserves durable asset references. Portable cross-device asset packaging remains owned by #49.
- Local Web persistence does not require authentication, cloud sync, or network availability.

## Affected surface

- `src/lib/projectStore.ts`
- `src/lib/assetStore.ts`
- `app/studio/hooks.ts`
- `app/studio/[id].tsx`
- persistence/Studio tests
- `docs/architecture.md`
- `docs/contracts/project-persistence.md`
- `docs/adr/2026-09-11-web-local-audio-asset-persistence.md`

## Non-goals

- Portable `.openband` asset bundling / export correctness: #49.
- Creative-loop editing behavior: #47.
- Source-aware split/trim semantics: #53.
- Cloud-sync redesign, collaboration/CRDT persistence, encryption, or server storage changes.
- A wholesale async rewrite of the `projectStore` API or migration of all project JSON from `localStorage` to IndexedDB.
- Destructive migration or deletion/re-keying of existing `asset://` records.
