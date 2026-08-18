# Tasks: Code Review LOW-Severity Cleanup

## Status: SHIPPED
> implementation checklist for the LOW-severity cleanup (L1–L3).

## Phase 1 — Spec (this change)
- [ ] `proposal.md` — context/problem/objectives/non-goals/approach/risks (L1–L3) + deferred list
- [ ] `design.md` — per-item Current vs New + file-change tables
- [ ] `tasks.md` — this file

## Phase 2 — Implement (by file)

### A. AUDIO — `src/lib/clockManager.ts` (L1)
- [ ] `:53-56` — in the `if (workerInstance)` terminate branch, add `if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }` defensively (mirrors the normal stop path).

### B. STATE — `src/lib/presence.ts` (L2)
- [ ] `:116` — remove the dead `reconnectOnLineRef` declaration.
- [ ] `:230` — remove the assignment to `reconnectOnLineRef` inside the `online` handler.
- [ ] `:235` — remove the `reconnectOnLineRef = null;` statement.
- [ ] Preserve the `window.addEventListener("online", ...)` / `window.addEventListener("offline", ...)` registrations exactly as-is.

### C. BACKEND — empty `catch {}` error binding (L3)
- [ ] `backend/src/routes/collab.ts:69` — `catch {}` → `catch (e) { console.error("[collab] ...", e); }`.
- [ ] `backend/src/routes/collab.ts:185` — `catch {}` → `catch (e) { console.error("[collab] ...", e); }`.
- [ ] `backend/src/routes/presence.ts:67` — `catch {}` → `catch (e) { console.error("[presence] ...", e); }`.
- [ ] `backend/src/routes/presence.ts:181` — `catch {}` → `catch (e) { console.error("[presence] ...", e); }`.
- [ ] `backend/src/services/queue.ts:118` — `catch {}` → `catch (e) { console.error("[queue] ...", e); }`.

## Phase 3 — Specs update
- [ ] No spec file changes required; note the change in `openspec/changes/code-review-low-cleanup/` only.

## Verification (must all pass)
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `cd backend && npx tsc --noEmit` → 0 errors
- [ ] `npx vitest run` → all pass (no regression)
- [ ] `npm run graph:ci` → CI PASS

## Code Review
- [ ] Run `code-review` subagent before commit (per AGENTS.md).
