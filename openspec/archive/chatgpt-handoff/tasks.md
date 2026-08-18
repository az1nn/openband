# Tasks: ChatGPT Handoff Document

- [ ] Compute actual vitest test-file count and legacy count on current master/v8 (for §6).
- [ ] Create `docs/chatgpt-handoff.md` with sections 1–11 (see design.md).
  - Source facts from: AGENTS.md architecture section, docs/HY3-HANDOFF.md,
    docs/features-implementation.md, docs/roadmap.md, src/lib manifest.
  - Reference commit `0f3a45b` (round-2 hardening) and the `tests/regression-round2-*`
    suites and the `tests/backend-routes.test.ts` exclusion.
  - Keep it accurate, not aspirational where real data exists; flag aspirational clearly.
- [ ] `grep -n "1479"` and `grep -n "83 files"` in the new doc must return nothing stale.
- [ ] Commit spec files, then (after implementation) archive spec →
      `openspec/archive/chatgpt-handoff` with `## Status: SHIPPED`, commit doc, push.
