# ADR — Web Local Audio Asset Persistence

## Context

OpenBand already has two different local Web persistence concerns:

- serialized `ProjectData` is stored synchronously through `projectStore` in `localStorage`;
- binary audio uses `assetStore`, which represents bytes as `asset://` pointers and materializes runtime blob URLs from IndexedDB.

The boundaries are directionally correct, but durability is not yet trustworthy. `assetStore` can silently fall back to memory if IndexedDB fails, while the caller still receives an `asset://` pointer. Studio save UI can also display `Saved` without checking whether the project-state write succeeded. Moving all project state to an async store would affect a very large dependency surface and is unnecessary to close #48.

## Decision

1. `projectStore` remains the application-facing project-state boundary and Web project JSON remains in `localStorage` for this MVP.
2. `assetStore` is the authoritative local binary-audio boundary on Web. IndexedDB (`openband_assets`) owns durable bytes; in-memory blob/object-URL caches are runtime optimizations only.
3. Persisted audio identity continues to use the existing `asset://` reference carried by `TrackRegion.url`. Runtime `blob:` URLs must never replace that persisted identity.
4. A new `asset://` reference is successful only after the durable IndexedDB transaction completes. Memory-only fallback must not be reported as durable success.
5. Audio-producing/importing flows persist bytes before committing a reference into project state.
6. Existing project and `asset://` records are read compatibly. #48 performs no destructive migration, mass rewrite, or re-keying.
7. The local project index is derived metadata. Valid project payloads remain the source of truth and may be used to recover a missing/corrupt index.
8. `objectStorage` remains the remote/cloud object boundary; it is not substituted for local offline durability in #48.
9. Portable cross-device archive bundling remains a separate concern owned by #49.

## Consequences

- Web projects remain local-first and available without authentication/network access.
- Binary assets survive reload/browser reopen without inflating project JSON or persisting ephemeral object URLs.
- Save/failure behavior becomes observable and testable.
- The synchronous `projectStore` API remains compatible with its large dependency graph.
- Two Web storage technologies remain by design: `localStorage` for compact serialized project state and IndexedDB for binary assets.
- A future all-IndexedDB state migration remains possible, but would require its own design and compatibility plan.

## Alternatives

- **Move all project state to IndexedDB now:** rejected for #48 because it forces a broad async API migration across a high-impact boundary without being necessary for the acceptance criteria.
- **Use cloud/object storage as the only asset store:** rejected because local persistence must work offline and without authentication.
- **Persist `blob:`/data URLs inside project JSON:** rejected because blob URLs are session-scoped and binary payloads do not belong in ordinary mutable state JSON.
- **Introduce a second durable asset-reference field/store:** rejected because the existing `asset://` abstraction already provides the required compatible boundary and should be hardened rather than duplicated.
