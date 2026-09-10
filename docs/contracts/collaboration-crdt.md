# Collaboration / CRDT Contract

This contract captures cross-feature collaboration correctness boundaries. Presence UX and transport implementation may evolve independently as long as these invariants remain true.

## Boundary

- `src/lib/crdt.ts` owns operation identity, ordering, merge, application and state encoding semantics.
- Higher-level collaboration/presence modules transport and queue operations; they must not silently redefine CRDT conflict semantics.
- Backend collaboration/presence routes relay state changes and presence; transport choice is not the conflict-resolution authority.

## Invariants

1. **Operation identity is stable.** Re-receiving the same operation id is idempotent and must not duplicate the operation.
2. **Lamport ordering is deterministic.** Conflict ordering compares logical `timestamp` first and `clientId` as the deterministic tie-breaker.
3. **Independent work is preserved.** Distinct operations that do not conflict remain in the merged log; merge must not discard unrelated edits.
4. **Conflicts resolve deterministically.** Competing operations targeting the same conflict domain use the CRDT ordering rule, not arrival order.
5. **Add deduplication uses domain identity.** Add operations with the same target/path/type and value id collapse deterministically rather than producing duplicate entities.
6. **Clock monotonicity is preserved.** Receiving remote operations cannot move the local logical clock backward.
7. **Encoding round-trips collaboration identity.** Serialized CRDT state preserves operations plus the clock/client identity needed to continue deterministic ordering.
8. **Offline delivery is not conflict authority.** Offline queues/reconnect may delay operations, but eventual arrival still goes through the same merge semantics.
9. **Presence is ephemeral.** Cursor/playhead presence may be throttled or dropped and must not become authoritative persisted project state.

## Evidence surfaces

Primary implementation is `src/lib/crdt.ts`, `src/lib/collaboration.ts`, `src/lib/presence.ts`, collaboration/presence backend routes, and their regression tests.

## Change rule

Any change to operation identity, conflict domain, Lamport comparison, merge semantics, offline replay, or persisted collaboration state is T4 because concurrency correctness can cause silent state loss/corruption. It requires adversarial multi-client tests and recovery/rollback planning.
