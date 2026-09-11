# Project Persistence Contract

This contract captures durable project-state and asset-integrity boundaries. It does not prescribe UI flows or a specific storage vendor.

## Boundary

- `src/lib/projectStore.ts` owns the application-facing project save/load/import/export boundary.
- Native/desktop persistence is accessed through `OpenBandNative`; frontend code must not bypass the bridge with direct filesystem/Electron APIs.
- Serialized project state and binary/audio assets are distinct concerns. State may reference assets; large binary payloads should not become ordinary mutable project JSON by accident.

## Invariants

1. **Validate on trust boundaries.** Data read from storage or import must be parsed/sanitized before becoming `ProjectData`; structurally invalid payloads are rejected rather than trusted.
2. **Web/native persistence stays behind one boundary.** Web storage and native bridge implementations may differ, but callers use the project persistence API rather than platform-specific I/O.
3. **Archive corruption is detectable.** The `.openband` archive format must retain an explicit format/magic boundary plus integrity checking; corrupted archives must not be accepted as valid project state.
4. **State identity is deterministic.** Versioned project-state commits use content hashing for state identity; changes to canonical serialization/hashing are compatibility-sensitive.
5. **Assets are referential.** Project state tracks stable asset references/hashes and resolves bytes through the object-storage abstraction rather than coupling domain state to one storage provider.
6. **Identical asset bytes remain dedup-compatible.** Content hashing must remain stable enough that byte-identical assets can map to the same content identity.
7. **Failure is explicit.** A bridge/storage/import failure must not be reported as a successful durable write when persistence did not occur.

## Evidence surfaces

Primary implementation is under `src/lib/projectStore.ts`, `src/lib/openbandFormat.ts`, `src/lib/stateAssetSeparation.ts`, `src/lib/objectStorage.ts`, bridge implementations, backend storage routes, and associated tests.

## Change rule

Changes to persisted schema, archive compatibility, state hashing, asset identity, or cross-runtime persistence are at least T3. Destructive migration or credible data-loss/corruption risk is T4 and requires rollback/recovery evidence.
