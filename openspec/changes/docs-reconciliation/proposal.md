# Proposal: Docs & Specs Full Reconciliation

## Context
The repository has drifted significantly between what was implemented and what the
documentation and specs claim. Recent git history shows a steady stream of features
(`ai-cover-generation`, `vercel-performance`, `mixer-functions`, `studio-add-clip`,
`mixer-console-vu-groups`, `recorded-url-persistence`, `ci-workflow-fix`) that are
absent from the roadmap, status docs, and AGENTS.md, while completed change folders
were never archived.

## Problem Description

1. **18 completed changes never archived.** `openspec/changes/` contains 26 folders;
   research confirms 16 are fully implemented plus 2 empty stubs (`mastering-preset-fixes`,
   `project-starter-fixes`). Their `tasks.md` checkboxes are stale while code clearly exists.
2. **6 partial changes** have completed and incomplete parts. Done portions should be
   archived into canonical `openspec/specs/`; only the open work stays in `changes/`.
3. **Conflicting status docs.** `docs/unimplemented-specs.md` claims ~14 domains are
   unimplemented, while `docs/pending-implementations.md` (reconciled 2026-07-16) marks the
   same checkboxes DONE. One must be the source of truth and the other reconciled.
4. **`docs/roadmap.md` is stale.** Dated July 3, 2026, it omits AI cover generation,
   Vercel performance work, CI-workflow fixes, mixer functions, studio-add-clip, VU groups,
   and recorded-url persistence.
5. **`docs/pending-implementations.md` predates recent work.** Header date 2026-07-16;
   does not cover the last ~8 commits.
6. **AGENTS.md drift.** Pre-flight references SDK 56 / expo-audio, but `package.json` is on
   SDK 57 / RN 0.86 / vitest 4 / TypeScript 6. Test counts and component counts may be stale.
7. **Spec line-number drift.** `openspec/specs/` specs reference file line numbers
   (`app/studio/[id].tsx:101`, etc.) that drift as code changes.

## Objectives
- Archive the 16 fully-implemented changes (plus 2 empty stubs) into `openspec/archive/`,
  ensuring each has `proposal.md`/`design.md`/`tasks.md` and, where a canonical spec
  exists, the spec is updated to reflect the archived work.
- For the 6 partial changes, promote completed requirement portions into canonical
  `openspec/specs/` specs (create new spec files where none exist) and reduce the
  `changes/` folder to the remaining open work.
- Reconcile `docs/unimplemented-specs.md` and `docs/pending-implementations.md` so they
  agree and reflect the current code state; `pending-implementations.md` is the source of
  truth (it was reconciled against code on 2026-07-16).
- Update `docs/roadmap.md` with shipped features and a fresh date.
- Update `AGENTS.md` to SDK 57, current test/component counts, and current commands.
- Refresh test-count claims in specs/docs from an actual `npx vitest run` + `test:legacy`.
- Fix only high-confidence spec line-number drift (do not chase every ref).

## Non-Goals
- No source code behavior changes (except none).
- No new features.
- Do not rewrite spec prose wholesale; only reconcile drift.
