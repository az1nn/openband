---
name: openband-handoff-keeper
description: Keep docs/chatgpt-handoff.md current before each ChatGPT planning session — run the staleness checklist, refresh counts, and commit to the docs/chatgpt-handoff branch. Use when: "update the handoff doc", "regenerate handoff", "staleness check", "refresh handoff", or "keep handoff live".
---

# OpenBand Handoff Keeper

Keeps `docs/chatgpt-handoff.md` (and its companion `docs/chatgpt-handoff-HOWTO.md`) current so every ChatGPT planning session is based on the latest repo state. **Doc edits only — never touches source.**

## When to invoke
- Before each ChatGPT planning session.
- After any SDD change that touched `src/lib/*`, `src/components/`, `src/bridge/`, a 3D scene (`app/virtual-studio.tsx` or the 12 tool rooms), `backend/src/`, or verification counts.

## Process

1. **Branch** — ensure `docs/chatgpt-handoff` is checked out (WSL):
   `wsl -e bash -lc "cd /home/az1nn/openband && git checkout docs/chatgpt-handoff"`
2. **Staleness checklist** (run in WSL, all via `wsl -e bash -lc` — vitest/tsc cannot run from the Windows UNC mount):
   - `npx tsc --noEmit` (frontend) and `cd backend && npx tsc --noEmit` — 0 errors each.
   - `npx vitest run | tail -3` — record pass/total; update §6.
    - `grep -nE "1479|83 files|94 modules|72 components|1680|128 shipped|91 files|~91|~1650" docs/chatgpt-handoff.md` — must be clean (no stale figures). The doc should state 1650 tests, 93 modules, 71 components; any older token is stale.
    - `ls src/lib/*.ts 2>/dev/null | wc -l` — update §3 "modules" number (currently 93).
    - `ls src/components/*.tsx 2>/dev/null | wc -l` and `grep -c '^export' src/components/index.ts` — update §3 components number (currently 71).
   - `ls src/bridge/` — confirm §4 impls (electron/tauri/browser).
   - `ls openspec/archive | wc -l` — reflect shipped-changes count in §7/§8.
   - `ls openspec/changes/` — reconcile §8 next-steps backlog against the real in-flight specs.
3. **Refresh** `docs/chatgpt-handoff.md` in place (edit, do not fork): update §3 counts, §6 totals/commands, §7 archived-spec count, §8 next-steps + entry-point files (verify each path with `ls`). Keep the "Feed this to ChatGPT" intro block.
4. **Commit flow** (always branch `docs/chatgpt-handoff`; never a feature branch):
   - `git add docs/chatgpt-handoff.md docs/chatgpt-handoff-HOWTO.md`
   - `git commit -m "docs(handoff): keep current with <brief reason>" -m "<touched areas>"`
   - Push → open a Draft PR via `gh pr create` from `docs/chatgpt-handoff` (refresh the same PR on future updates).
5. **Handoff** — after a green push, copy `docs/chatgpt-handoff.md` contents into the ChatGPT project session.

## Gate
After editing, re-run the §2 staleness checklist: counts must match `tsc`/`vitest`, and `grep -nE "1479|83 files|94 modules|72 components|1680|128 shipped|91 files|~91|~1650" docs/chatgpt-handoff.md` must be clean. The PR from `docs/chatgpt-handoff` (CI) must stay green.

## Note
opencode loads skills at startup. This skill lives at `.agents/skills/openband-handoff-keeper/SKILL.md` (project convention shared by the other OpenBand skills), so a fresh opencode session will surface it.
