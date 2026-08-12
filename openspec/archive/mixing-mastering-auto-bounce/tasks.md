# Tasks: Automatic Mixdown Transfer to Mastering Suite

## 1. Spec & Commit
- [x] Create proposal.md, design.md, tasks.md under openspec/changes/mixing-mastering-auto-bounce/
- [x] Commit spec files before writing any code

## 2. Implementation
- [x] Update `app/mastering/index.tsx` and `MasteringSuite` to support receiving studio project tracks or pre-rendered audio URI (`masteringBridge.ts`).
- [x] Implement auto-bounce / mixdown transfer when navigating from Studio (`app/studio/[id].tsx`) to Mastering via the "Masterizar" button.
- [x] Ensure fallback file upload still works when opened independently.

## 3. Verification & Code Review
- [x] Run `npx tsc --noEmit` and `cd backend && npx tsc --noEmit`
- [x] Run `code-review` subagent
- [x] Archive change and final commit
