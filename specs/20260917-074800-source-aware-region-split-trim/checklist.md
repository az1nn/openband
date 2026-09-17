# Checklist — Source-aware Region Split and Trim

## Design completeness

- [x] Canonical demand is Issue #53 under Launch MVP #46.
- [x] Tier is T3 minimum; T4 escalation triggers are explicit.
- [x] Existing bug is traced from `regionEdit` source metadata to renderer offset reset.
- [x] Additive `TrackRegion.offset/length` semantics are defined.
- [x] Legacy defaults are defined without project migration.
- [x] Split/start-trim/end-trim invariants are explicit.
- [x] Persistence ownership remains `projectStore` + `assetStore` / `asset://`.
- [x] Web Audio and pure-JS/native renderer behavior are covered.
- [x] #49 strict export failure behavior remains authoritative.
- [x] Time stretching, CRDT, migration, native-build hardening and unrelated UX are excluded.

## Proof quality

- [x] Verification requires sample-content evidence, not duration-only assertions.
- [x] Legacy project compatibility has an explicit test requirement.
- [x] Persistence round-trip has an explicit test requirement.
- [x] Web and pure-JS/native render paths have explicit proof requirements.
- [x] Exact-HEAD SDD/Graph/typecheck/test/build verification is required.
- [x] Architecture and audio/DSP specialist review are required for T3.
- [ ] Architecture Graph preflight evidence recorded.
- [ ] Spec Kit analyze evidence recorded.

## Gate readiness

- [x] Branch exists only for #53 design/preparation.
- [x] Product implementation is explicitly blocked before Human Design Gate.
- [x] Product implementation is also blocked until branch reconciliation with the canonical post-#69 `master`.
- [ ] Exact Design Baseline SHA frozen.
- [ ] Human Design Gate approved.
