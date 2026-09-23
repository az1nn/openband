# Design Checklist — SIGA Operational Orchestration

- [x] Canonical repository verified as `az1nn/openband`.
- [x] Canonical SIGA verified at `.agents/skills/openband-session-router/SKILL.md`.
- [x] Compatibility `.qwen` router is delegation-only.
- [x] Existing session leases prove OpenBand has a real concurrency coordination need.
- [x] Existing CI job names were read from successful OpenBand CI V2 evidence.
- [x] Scope preserves Git/GitHub/Spec Kit/CI authority.
- [x] No Maestri project/service is planned.
- [x] No global/cross-repository state is planned.
- [x] No product/runtime behavior is changed.
- [x] T3 rollback is a clean PR revert.
- [x] Automated design/policy validation passed on design HEAD `599c6c9fc147a41625b60e4c99473e4ac94f71f8` via OpenBand CI V2 run `35920623010` (`graph-check` PASS).
