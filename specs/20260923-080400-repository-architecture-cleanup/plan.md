# Plan: Repository Architecture and Folder Cleanup

## Architecture assessment

The repository currently contains one canonical TypeScript backend used by the serverless adapter and CI plus a separate, unreferenced Python microservice prototype. The cleanup removes only the duplicate inactive boundary and obvious root scratch artifacts. No live application module boundary is moved.

ADR: NOT REQUIRED

The durable architecture remains unchanged: Expo/React frontend under `app/` and `src/`, runtime-specific access through the bridge, the TypeScript service under `backend/`, native projects under `android/` and `electron/`, and repository-owned Spec Kit/Graph governance.

## Deletion set

Initial high-confidence removals:

- `diff.txt`
- `diff_utf8.txt`
- `image.png`
- every tracked file under `openband-backend/`

Additional removals are allowed only when the audit produces the same level of evidence: no live references, no build/tool ownership, and no required historical/governance role.

## Explicit non-goals

- no dependency-version or lockfile churn;
- no Android signing/security repair (owned by existing work);
- no native build scheduler changes;
- no deletion of marketing screenshots/knowledge, agent compatibility paths, Spec Kit files, Storybook stories, WASM assets, or release assets while they remain referenced;
- no product feature refactor.

## Verification

Before deletion:

- repository tree audit for generated/vendor/temp artifacts;
- reference search for every deletion candidate;
- confirm the canonical backend and tool-owned directories are still live.

After deletion:

- negative repository-reference audit for removed surfaces;
- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`;
- frontend and backend typechecks;
- full Vitest and legacy tests;
- Web export build;
- launch Playwright E2E;
- security policy;
- exact-HEAD evidence-driven Merge Gate.

Rollback is the branch parent commit; no production data or runtime mutation is involved.
