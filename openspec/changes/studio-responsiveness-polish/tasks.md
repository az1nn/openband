# Tasks: Studio Components Responsivity Polish

## 1. Spec & Commit
- [x] Create proposal.md, design.md, tasks.md under openspec/changes/studio-responsiveness-polish/
- [ ] Commit spec files before writing any implementation code

## 2. Implementation
- [ ] Update `app/studio/parts.tsx` with responsive timeline minimum width calculation (`minTimelineWidth`).
- [ ] Improve toolbar responsiveness and touch target sizing for mobile viewports in `app/studio/[id].tsx`.
- [ ] Adjust bottom panel heights and channel strip touch targets for mixer/FX panels on mobile.

## 3. Verification & Code Review
- [ ] Run `npx tsc --noEmit` and `cd backend && npx tsc --noEmit`
- [ ] Run `npx vitest run`
- [ ] Run `code-review` subagent
- [ ] Final commit & push
