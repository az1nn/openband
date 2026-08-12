# Tasks: Automatic Mixdown Transfer to Mastering Suite

## 1. Spec & Commit
- [x] Create proposal.md, design.md, tasks.md under openspec/changes/mixing-mastering-auto-bounce/
- [ ] Commit spec files before writing any code

## 2. Implementation
- [ ] Update `app/mastering/index.tsx` and `MasteringSuite` to support receiving studio project tracks or pre-rendered audio URI.
- [ ] Implement auto-bounce / mixdown transfer when navigating from Studio (`app/studio/[id].tsx`) to Mastering.
- [ ] Ensure fallback file upload still works when opened independently.

## 3. Verification & Code Review
- [ ] Run `npx tsc --noEmit` and `cd backend && npx tsc --noEmit`
- [ ] Run `code-review` subagent
- [ ] Archive change and final commit
