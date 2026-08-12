# Tasks: Studio Components Responsivity Polish

## 1. Spec & Commit
- [x] Create proposal.md, design.md, tasks.md under openspec/changes/studio-responsiveness-polish/
- [x] Commit spec files before writing any implementation code

## 2. Implementation
- [x] Update `app/studio/parts.tsx` with responsive timeline minimum width calculation (`minTimelineWidth`).
- [x] Improve toolbar responsiveness and touch target sizing for mobile viewports in `app/studio/[id].tsx`.
- [x] Adjust bottom panel heights and touch targets for mobile.

## 3. Verification & Code Review
- [x] Run `npx tsc --noEmit` and `cd backend && npx tsc --noEmit`
- [x] Run `code-review` subagent
- [x] Final commit & push
