# Tasks: Instructions Doc to Keep the ChatGPT Handoff Live

- [ ] Checkout `docs/chatgpt-handoff` branch (WSL) from current (v9).
- [ ] Write `docs/chatgpt-handoff-HOWTO.md` (sections in design.md).
- [ ] Prepend the "Maintaining this doc" note to `docs/chatgpt-handoff.md` intro.
- [ ] Prepend `## Status: SHIPPED` to `openspec/changes/chatgpt-handoff-howto/proposal.md`.
- [ ] `git mv openspec/changes/chatgpt-handoff-howto openspec/archive/chatgpt-handoff-howto`.
- [ ] `git add docs/chatgpt-handoff-HOWTO.md docs/chatgpt-handoff.md openspec/archive/chatgpt-handoff-howto/`.
- [ ] Commit:
  ```
  docs: add HOWTO to keep ChatGPT handoff doc live

  - docs/chatgpt-handoff-HOWTO.md: staleness checklist, refresh map, commit flow
  - link it from docs/chatgpt-handoff.md intro
  ```
- [ ] Push `docs/chatgpt-handoff` (updates PR #13).
- [ ] Return to `agent/v9-01-project-starter-preview` (preserve untracked work).
- [ ] Verify: grep for stale counts in the handoff doc is clean; PR #13 updated.
