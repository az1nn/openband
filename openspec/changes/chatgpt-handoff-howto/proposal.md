# Proposal: Instructions Doc to Keep the ChatGPT Handoff Live

## Context
`docs/chatgpt-handoff.md` is a **live** planning document handed to a ChatGPT
project to architect next steps. If it goes stale, ChatGPT will plan against
obsolete reality (wrong library list, stale test counts, wrong conventions).
OpenBand evolves in every SDD round (new `src/lib/*` modules, new plugins,
architecture tweaks, verification-count changes). We need an explicit
**maintainer instructions** doc so the handoff is always regenerated from the
current repo state before each planning session.

## Objectives
- Add `docs/chatgpt-handoff-HOWTO.md` describing how to detect staleness, what
  sections to refresh, and the commit/push flow that keeps PR #13 current.
- Add a short "Maintaining this doc" callout at the top of
  `docs/chatgpt-handoff.md` cross-linking the HOWTO.
- Pin the trigger rule: **before every major ChatGPT handoff session, regenerate
  the handoff from this repo + commit to `docs/chatgpt-handoff`.**

## Out of Scope
- No source changes.
- Does not automate generation (no script required) — it is a manual checklist
  (explicit is better than a brittle generator).
