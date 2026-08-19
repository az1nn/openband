# ChatGPT Handoff — Maintainer's HOWTO

`docs/chatgpt-handoff.md` is a **live** document handed to a ChatGPT project to
architect the next development phase. If it goes stale, ChatGPT plans against
obsolete reality (wrong library list, stale test counts, old conventions). This
HOWTO keeps it current.

## 1. Goal
Refresh `docs/chatgpt-handoff.md` from the current repo state before **every**
major ChatGPT planning session.

## 2. When to regenerate (trigger)
- Before each ChatGPT handoff session.
- After any SDD change that touched: `src/lib/*` modules, `src/components/`,
  `src/bridge/`, any 3D screen (`app/virtual-studio.tsx` or the 12 tool rooms),
  audio backend (`backend/src/`), or verification counts.

## 3. Staleness checklist (run before regenerating)
Run in WSL: `wsl -e bash -lc "cd /home/az1nn/openband && <cmd>"`
- `npx tsc --noEmit` — must be **0 errors**; `cd backend && npx tsc --noEmit` — 0.
- `npx vitest run | tail -3` — record pass/total; update §6.
- `grep -n "1479\|83 files" docs/chatgpt-handoff.md` — must be empty except the
  single intentional "1479 → 1650" delta sentence in §6; fix any other hit.
- `ls src/lib/*.ts | wc -l` — recount the library manifest in §3.
- `ls src/components/*.tsx | wc -l` and `grep -c '^export' src/components/index.ts` — recount the design system in §3.
- `ls src/bridge/` — confirm bridge impls (electron/tauri/browser) in §4.
- `grep -rn 'tool rooms\|tool-room\|tool room' app/ docs/` — confirm the 12+hub count in §5.
- `ls openspec/archive | wc -l` — reflect the shipped-changes count in §7/§8.
- `ls openspec/changes/next-product-design/` — reconcile the next-steps backlog in §8.

## 4. What to refresh (by handoff section)
- **§1 stack/product** — SDK version, RN Web version, `expo-audio` note, Three.js CDN version.
- **§3 library manifest + frontend boundaries** — `ls src/lib/`; add new modules, remove deleted; recount components and exports.
- **§4 desktop bridge** — `src/bridge/` file list + `OpenBandNative` usage note.
- **§5 3D scenes** — hub + tool-room count, `src/lib/loadThree.ts` path, `sceneLighting.ts` lifecycle.
- **§6 verification harness** — update totals (Vitest / legacy / files) and the 6-step matrix commands.
- **§7 already-hardened** — add new round commit hashes + domains fixed.
- **§8 next steps backlog** — reconcile pillars against `openspec/changes/next-product-design`; update entry-point files.

## 5. Editing rules
- Edit in place (do **not** fork the handoff into a new file).
- Keep the "Feed this to ChatGPT" intro block and the planner-oriented tone.
- Keep numbers factual; if a figure is aspirational, mark it clearly.

## 6. Commit flow
- Branch: `docs/chatgpt-handoff` (never handoff edits on feature branches).
- Commit msg: `docs(handoff): keep current with <brief reason>; <touched areas>`
  e.g. `docs(handoff): add modulationMatrix v2 per round-3; lib + §3 + §8`
- Push → **PR #13** (Draft) auto-updates.
- Do NOT force-push history that other handoff iterations depend on; append commits.

## 7. Gate (after edit)
- Re-run the §3 staleness checklist — counts must match `tsc`/`vitest`.
- `grep -n "1479\|83 files" docs/chatgpt-handoff.md` must be clean (only the intentional delta).
- Confirm PR #13 CI (if any) still green.
