# Tasks: App Page-Load Performance Polish

## 1. Spec & Commit
- [x] Create proposal.md, design.md, tasks.md under openspec/changes/app-load-perf/
- [ ] Commit spec files before writing any implementation code

## 2. Implementation
- [ ] Library (`app/tabs/library.tsx`): build the project list from `listProjectIndex()`
      metadata only; remove the per-project `loadProject(id)` full decode on mount; load full
      `ProjectData` lazily on open/tap.
- [ ] Feed (`app/tabs/index.tsx`): lazy-load `NewProject` + `OnboardingFlow` (own chunk); gate
      preview preloading behind `document.visibilityState === "visible"` and cap to 3 posts.

## 3. Verification & Code Review
- [ ] `npx tsc --noEmit` and `cd backend && npx tsc --noEmit` pass
- [ ] `npx vitest run` passes
- [ ] `npm run test:legacy` passes
- [ ] `npm run build` succeeds
- [ ] `code-review` subagent passes
- [ ] Archive change + final commit & push
