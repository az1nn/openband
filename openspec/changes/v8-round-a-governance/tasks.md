# Tasks: V8 Round A — Reconciliation, PR-First Governance & CI V2

## 1. OpenSpec Reconciliation (V8-01)
- [ ] Document CRDT sync status as deferred in archival notes.
- [ ] Verify clean status of `openspec/changes/`.

## 2. PR-First Governance (V8-02)
- [ ] Edit `opencode.json` to allow branch pushes (`ask`), protect `master` pushes (`deny`), and permit `gh pr create`.
- [ ] Edit `AGENTS.md` to mandate PR-first workflow and remove direct push-to-master instructions.

## 3. CI V2 (V8-03)
- [ ] Rewrite `.github/workflows/ci.yml` into parallel domain jobs (`graph-check`, `frontend-typecheck`, `backend-typecheck`, `vitest`, `legacy-tests`, `web-build`).
- [ ] Add conditional non-blocking `android-build` and `electron-build` jobs.

## 4. Verification
- [ ] Run `npx tsc --noEmit`
- [ ] Run `cd backend && npx tsc --noEmit`
- [ ] Run `npx vitest run`
- [ ] Run `npm run test:legacy`
- [ ] Run `npm run graph:ci`
- [ ] Run `npm run build`
