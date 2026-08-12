# Tasks — Docs Accuracy Fix

## Verification Prerequisites
- [x] Capture real vitest test count: `npx vitest run` → 1479 passed
- [x] Capture legacy node:test count: `npm run test:legacy` → 24 passed
- [x] Confirm Expo version: `package.json` → `^57.0.4`
- [x] Confirm backend type: `backend/src/index.ts` → Express (port 3001)

## Implementation Steps

1. **README.md line 11** — Update SDK 56 → 57 in Framework row
   - Old URL: `v56.0.0` → New URL: `v57.0.0`
   - Old text: `SDK 56` → New text: `SDK 57`

2. **README.md line 16** — Update SDK 56 → 57 in Audio row
   - Old URL: `v56.0.0/sdk/audio/` → New URL: `v57.0.0/sdk/audio/`
   - Old text: `(SDK 56)` → New text: `(SDK 57)`

3. **README.md line 20** — Rewrite Backend row to reflect Express reality
   - Replace `FastAPI + Redis + Celery (Docker microservices, optional)` with accurate Express description

4. **README.md line 21** — Update test count from 505 → 1479 in Testing row

5. **AGENTS.md line 202** — Update `(SDK 56)` → `(SDK 57)` in Audio System section

6. **AGENTS.md line 400** — Update `1456` → `1479` in Full suite totals line

## Post-Implementation Sanity Checks
- [ ] Verify README.md table rows are syntactically valid (pipe-separated cells, no broken links)
- [ ] Verify AGENTS.md lines match expected content
- [ ] Confirm NO source code files (`.ts`, `.tsx`, `.js`) were modified
- [ ] Confirm `git diff --name-only` shows only README.md and AGENTS.md

## Commit Strategy
- Spec commit: `spec: reconcile README + AGENTS doc mismatches vs actual stack`
- Implementation (doc edits): LEFTO UNCOMMITTED for code review
