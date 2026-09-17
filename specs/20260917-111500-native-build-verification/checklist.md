# Checklist — Trustworthy Native Build Verification

## Design completeness

- [x] Canonical demand is Issue #43.
- [x] Tier is T3 minimum with explicit T4 escalation boundary.
- [x] Current Android/Electron failure masking is identified.
- [x] `PASS|FAIL|BLOCKED` semantics are durable and machine-readable.
- [x] `SKIPPED` is explicitly not treated as build evidence.
- [x] Expected Android/Electron artifact proof is defined.
- [x] Exact-SHA, size and SHA-256 evidence is required.
- [x] Opt-in native scheduling is preserved.
- [x] Production signing/secrets/publication are excluded.
- [x] Runtime application/bridge behavior is excluded.
- [x] Deterministic regression tests are specified.

## Gate readiness

- [x] Dedicated #43 design branch exists.
- [x] Product/CI mutation is blocked before Human Design Gate.
- [ ] SDD policy PASS on exact Design Baseline SHA.
- [ ] Graph/Spec Kit tests PASS on exact Design Baseline SHA.
- [ ] Engineering Graph CI PASS on exact Design Baseline SHA.
- [ ] Exact Design Baseline SHA frozen.
- [ ] Human Design Gate approved.
