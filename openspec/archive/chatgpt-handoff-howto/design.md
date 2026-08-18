# Design: Instructions Doc to Keep the ChatGPT Handoff Live

## Outputs
- New file `docs/chatgpt-handoff-HOWTO.md`
- One-line edit in `docs/chatgpt-handoff.md` under the intro: a "Maintaining
  this doc" note linking to the HOWTO.

## `docs/chatgpt-handoff-HOWTO.md` content (section outline)
1. **Goal** — keep `docs/chatgpt-handoff.md` current; never hand ChatGPT a stale
   architecture.
2. **Trigger** — regenerate before every major ChatGPT planning session, and any
   time one of the staleness signals below fires.
3. **Staleness checklist (run before regenerating)**
   - `wsl -e bash -lc "cd /home/az1nn/openband && npx tsc --noEmit"` → 0 errors.
   - `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run | tail -3"` → new totals.
   - `grep -rn "1479\|83 files" docs/chatgpt-handoff.md` → must be only the intentional delta note.
   - `ls src/lib/*.ts | wc -l` → recount the "77 modules" / library manifest.
   - `ls src/components/*.tsx` → recount the design-system component count.
   - `ls src/components/index.ts` exports → recount exported components.
   - `openspec/changes/` and `openspec/archive/` → list archived spec count; new next-product pillars.
   - `backend/src/routes /src/lib/` → confirm the inter-agent channel facts.
4. **What to refresh (per section of the handoff)**
   - §1 stack tags (SDK version, RN Web, library versions), product surface.
   - §3 library manifest — `ls src/lib/`; add new modules, mark deprecated/removed.
   - §3 frontend boundaries — recount components / design-system exports.
   - §5 3D scenes — tool-room count (12 + hub), CDN loader path.
   - §6 verification counts + matrix commands (WSL note).
   - §7 hardened set — add new round commit hashes + domains.
   - §8 next-steps backlog — reconcile against `openspec/changes/next-product-design`.
5. **Editing rules** — edit the live file in place (don't fork); keep tone planner-oriented;
   preserve the "Feed this to ChatGPT" intro block.
6. **Commit flow**
   - Branch: `docs/chatgpt-handoff` (never commit handoff edits to feature branches).
   - Commit msg: `docs(handoff): keep current with <brief reason>; <touched areas>`.
   - Push → PR #13 auto-updates (Draft). Do NOT force-push history that others depend on.
7. **Gate** — after edit, re-run the staleness checklist above; ensure `grep "1479\|83 files"`
   is clean (only the intentional delta) and counts match `tsc`/`vitest`.

## Link-in `docs/chatgpt-handoff.md`
Add under the "Feed this to ChatGPT" block:
`> **Maintaining this doc:** this file is live. Before each planning session, refresh it using
\`docs/chatgpt-handoff-HOWTO.md\` (commit to the \`docs/chatgpt-handoff\` branch, PR #13).`
