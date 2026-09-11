# Project Persistence Contract

This contract captures durable project-state and asset-integrity boundaries. It does not prescribe UI flows or a specific cloud storage vendor.

## Boundary

- `src/lib/projectStore.ts` owns the application-facing project save/load/import/export boundary.
- Native/desktop persistence is accessed through `OpenBandNative`; frontend code must not bypass the bridge with direct filesystem/Electron APIs.
- On Web, compact serialized project state and binary audio assets are intentionally separate: project JSON uses the project-store boundary, while durable local audio bytes use `assetStore`/IndexedDB and are referenced by `asset://` identity.
- Runtime `blob:` URLs are ephemeral materializations. They must not replace a durable `asset://` reference in persisted project state.
- Remote/cloud asset storage remains a separate object-storage boundary; local Web durability must not require network access or authentication.

## Invariants

1. **Validate on trust boundaries.** Data read from storage or import must be parsed/sanitized before becoming `ProjectData`; structurally invalid payloads are rejected rather than trusted.
2. **Web/native persistence stays behind explicit boundaries.** Runtime implementations may differ, but callers use project/asset persistence APIs rather than platform-specific I/O.
3. **Durable success means durable success.** A project or asset write must not be reported as successful when only volatile memory/cache state was updated or when the underlying durable write failed.
4. **Bytes before references.** New recorded/imported audio bytes must be durably stored before project state commits the corresponding durable asset reference.
5. **Project payload is source of truth; index is derived.** Loss/corruption of a project-list index must not make otherwise valid stored project payloads unrecoverable.
6. **Archive corruption is detectable.** The `.openband` archive format must retain an explicit format/magic boundary plus integrity checking; corrupted archives must not be accepted as valid project state.
7. **State identity is deterministic.** Versioned project-state commits use content hashing for state identity; changes to canonical serialization/hashing are compatibility-sensitive.
8. **Assets are referential.** Project state tracks stable asset references/hashes and resolves bytes through the applicable asset/object-storage abstraction rather than coupling domain state to one storage provider.
9. **Identical asset bytes remain dedup-compatible.** Content hashing used by content-addressed asset paths must remain stable enough that byte-identical assets can map to the same content identity.
10. **Failure is explicit and non-destructive.** Storage/quota/bridge/import/asset-resolution failure must be visible and must not silently replace or discard the last valid durable project state.
11. **Compatibility is flow-forward.** Existing valid `asset://` references remain readable unless a separately approved migration provides recovery and rollback evidence.

## Evidence surfaces

Primary implementation is under `src/lib/projectStore.ts`, `src/lib/assetStore.ts`, `src/lib/openbandFormat.ts`, `src/lib/stateAssetSeparation.ts`, `src/lib/objectStorage.ts`, Studio persistence flows, bridge implementations, backend storage routes, and associated tests.

## Change rule

Changes to persisted schema, local/remote asset identity, archive compatibility, state hashing, or cross-runtime persistence are at least T3. Destructive migration or credible data-loss/corruption risk introduced by the change is T4 and requires rollback/recovery evidence.
