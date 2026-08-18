# Design: V8 Round A — Reconciliation, PR-First Governance & CI V2

## 1. OpenSpec Reconciliation (V8-01)
- Audit `openspec/archive/roadmap-step2-crdt-sync` and note its incomplete tasks as deferred to Round D (CRDT Collaboration).
- Update documentation or create an archival note confirming spec states.

## 2. PR-First Governance (V8-02)
- **`opencode.json` updates:**
  - Change `git push*` from `deny` to `ask` for feature branches.
  - Add explicit denial rules for master pushes: `"git push* master*": "deny"`, `"git push* origin master*": "deny"`.
  - Maintain `git commit*`: `ask`.
  - Allow `gh pr create` after gate verification.
  - Deny `gh pr merge` and `git merge` for agents (human-only).
- **`AGENTS.md` updates:**
  - Replace "ALWAYS commit and push after completing changes" with the PR-first workflow: commit on `agent/<slug>`, open Draft PR, never push to master, human merges.

## 3. CI V2 Parallel Workflow (V8-03)
- Refactor `.github/workflows/ci.yml`:
  - **Required Parallel Jobs:**
    - `graph-check`: runs `npm run graph:ci`
    - `frontend-typecheck`: runs `npx tsc --noEmit`
    - `backend-typecheck`: runs `cd backend && npm install && npx tsc --noEmit`
    - `vitest`: runs `npx vitest run`
    - `legacy-tests`: runs `npm run test:legacy`
    - `web-build`: runs `npm run build`
  - **Conditional / Non-Blocking Jobs:**
    - `android-build`: runs Android Gradle assemble release (conditional on `workflow_dispatch`, labels, or secrets).
    - `electron-build`: runs electron-builder Linux packaging (conditional).
