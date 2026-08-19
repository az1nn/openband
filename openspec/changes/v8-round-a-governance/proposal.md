# Proposal: V8 Round A — Reconciliation, PR-First Governance & CI V2

## Context & Problem
The V8 roadmap transitions OpenBand into an operational software factory. However, analysis of the repository reveals:
1. `openspec/changes/` is empty while several prior changes in archive (`roadmap-step2-crdt-sync`) have incomplete task checkboxes, causing specification drift.
2. Contradiction between `AGENTS.md` ("always commit and push") and `opencode.json` (`push: deny`), blocking a clean PR-first workflow.
3. CI workflow (`.github/workflows/ci.yml`) is monolithic (single job with 6 sequential steps) with no modular failure isolation or conditional native build hooks.

## Objectives
1. **OpenSpec Reconciliation (V8-01):** Audit archived changes vs actual state, document drift, and clean up unmapped specifications.
2. **PR-First Governance (V8-02):** Unify `AGENTS.md` and `opencode.json` so that agents work on feature branches, commit with approval, open Draft PRs via `gh`, and never push directly to `master`.
3. **CI V2 (V8-03):** Refactor GitHub Actions into parallel domain-specific jobs (`graph-check`, `frontend-typecheck`, `backend-typecheck`, `vitest`, `legacy-tests`, `web-build`) plus conditional non-blocking native build jobs (`android-build`, `electron-build`).
