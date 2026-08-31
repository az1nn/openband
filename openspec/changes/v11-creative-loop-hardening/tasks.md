# Tasks — V11 Creative Loop Hardening

- [x] run preview collision suite (creativeIdentity PV05/PV06/PV07)
- [x] run bar-boundary suite (previewBudget)
- [x] run lock cardinality mismatch suite (CreativeSession + CardinalityPolicy)
- [x] run nested telemetry secret suite (telemetry)
- [x] run external history mutation protection suite (getHistory readonly copy)
- [x] run async audio rejection cleanup suite (previewLifecycle)
- [x] run natural-ended cleanup suite (previewLifecycle)
- [x] run long-session stress suite (creativeLoopStress, 120 generations)
- [x] run remount idempotency suite (creativeLoopStress deterministic hash)
- [x] run restart-like idempotency suite (creativeLoopStress dedupe + ownership release)
- [x] re-run V10/V11 regressions (full vitest 1817 + legacy 24 green)
- [x] update final handoff with actual counts
