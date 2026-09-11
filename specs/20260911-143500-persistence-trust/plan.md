# Plan

## Impact

Graph preflight on `master`:

- `src/lib/projectStore.ts`: HIGH — 20 direct / 113 transitive dependents.
- `app/studio/hooks.ts`: HIGH — 4 direct / 6 transitive dependents.
- `src/lib/stateAssetSeparation.ts`: HIGH — 8 direct / 102 transitive dependents.
- `src/lib/objectStorage.ts`: HIGH — 5 direct / 105 transitive dependents.
- `src/lib/openbandFormat.ts`: MEDIUM — 3 dependents and no inbound production import edge.

Keep T3 by evolving the existing local boundaries compatibly. Elevate to T4 before implementation if the design requires destructive migration, deletion/re-keying of existing persisted data, or another credible new data-loss/corruption path.

## Current gaps

- Web project JSON is stored synchronously in `localStorage`, while the Studio currently displays `Saved` without checking the boolean result from `saveProject`.
- `assetStore` already owns `asset://` pointers and IndexedDB (`openband_assets`), but its durable write path silently falls back to memory and can return a pointer even when IndexedDB persistence failed.
- Recording already calls `saveAsset(blob)` before creating its persisted region.
- Web audio import currently creates tracks without storing the selected file bytes or assigning a durable region URL.
- Runtime blob URLs are correctly resolvable from `asset://`, but missing assets are primarily console-level failures today.

## Design

1. **Keep the existing state boundary.** `projectStore` remains the application-facing project save/load/import/export boundary. Web project JSON stays in `localStorage` for this MVP so 113 transitive dependents do not inherit an unnecessary async API migration.
2. **Make the existing local asset boundary authoritative.** `assetStore` remains the owner of Web binary audio durability through IndexedDB and the existing `asset://` pointer format. Memory/object-URL caches are performance/runtime materializations only; they are never evidence of a durable write.
3. **Make asset writes fail explicitly.** On Web, `saveAsset` may return a durable pointer only after the IndexedDB transaction completes. IndexedDB/quota failure rejects instead of silently accepting memory-only durability. Existing `asset://` IDs remain compatible; no re-key migration is required.
4. **Commit bytes before references.** Recording and audio import persist bytes first, then add the region/track reference. A failed asset write leaves the previous project state intact and produces user-visible failure feedback. Multi-file import may commit successful files independently but must never create a track for a failed asset.
5. **Treat `asset://` as persisted identity and blob URLs as ephemeral.** Hydration/playback resolves persisted pointers through `assetStore`; it never replaces the persisted pointer with a blob URL. Missing/corrupt assets become visible degraded-state evidence without deleting project structure.
6. **Make save state truthful.** `useStudioPersistence` consumes `saveProject` failure, shows success only on successful project-state writes, and exposes failure visibly. Flush the latest synchronous project snapshot on an appropriate browser lifecycle boundary (`pagehide`/equivalent) so the 2-second debounce is not the only protection against closing the page.
7. **Treat the project index as derived.** A missing/corrupt index must be recoverable from valid `openband_project_*` records rather than making projects appear lost. Project payload remains the local source of truth.
8. **Preserve recovery boundaries.** JSON import/export must continue to preserve project structure and `asset://` references for the same local profile. Do not wire or redesign `.openband` binary bundling here; #49 owns portable archive correctness.
9. **No destructive migration.** This change only hardens new writes and compatible reads. Rollback is code rollback; existing localStorage/IndexedDB records remain valid and are not deleted or rewritten en masse.

## Knowledge impact

- Architecture: UPDATE_REQUIRED — document Web state-vs-binary local persistence responsibilities.
- Contracts: UPDATE_REQUIRED — make durable-success, `asset://`, and derived-index semantics explicit.
- ADR: CREATE — `2026-09-11-web-local-audio-asset-persistence.md`.
- Governance: UNCHANGED.

## Verification

- `assetStore` tests with a controllable IndexedDB double:
  - durable write survives cache/module-session reset;
  - IndexedDB/quota failure rejects rather than returning durable success;
  - existing `asset://` references continue to resolve.
- `projectStore` tests:
  - project-state write failure returns failure without overwriting the prior valid snapshot;
  - missing/corrupt index is rebuilt from valid project records;
  - import/export preserves durable asset pointers structurally.
- Studio tests:
  - autosave/manual save never show success when `saveProject` fails;
  - recording/import add state only after asset persistence succeeds;
  - failed import/record leaves existing state intact and shows an actionable error;
  - hydration surfaces unresolved local assets without deleting tracks.
- Browser behavioral smoke with persistent browser storage:
  - visitor creates a project, records or imports audio, reloads, and the region remains resolvable/playable;
  - close/reopen-equivalent context preserves state and local asset bytes;
  - simulated quota/IndexedDB failure is visible and non-destructive.
- Full frontend/backend typecheck, Vitest, legacy tests, Web build, `sdd:check`, Graph tests and `graph:ci`.
- Re-run Graph impact if implementation leaves the planned persistence surfaces or introduces a new cross-runtime/storage boundary.
