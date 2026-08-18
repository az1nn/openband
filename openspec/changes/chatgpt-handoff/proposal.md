# Proposal: ChatGPT Handoff Document for OpenBand Architecture Planning

## Context
The user works with a separate ChatGPT project to architect and plan the next
steps for the OpenBand DAW. ChatGPT needs a self-contained, up-to-date handoff
document that lets it understand the stack, architecture, current state,
conventions, and the concrete next-step work to plan.

The repo already contains `docs/HY3-HANDOFF.md` plus an extensive `AGENTS.md`, but
those drift and are not tailored to "what can ChatGPT build/plan next." This change
adds a fresh, focused handoff doc: `docs/chatgpt-handoff.md`, written from the
perspective of "hand this to ChatGPT; tell it what to plan."

This is **documentation-only** — no source or test changes.

## Objectives
- Give ChatGPT (an external planner) a single readable artifact that covers:
  product scope, the 5-domain architecture, the key libraries/services, the
  desktop-bridge & 3D scene patterns, the verification/convention harness, and a
  prioritized "next steps" backlog with entry-point files.
- Reflect the just-completed round-2 code review + regression tests so ChatGPT
  does not re-plan already-fixed ground truth.
- Reference the existing next-product pillars from `openspec/changes/next-product-design`
  and link to canonical files for each.

## Out of Scope
- No code changes.
- No new features; only a planning handoff.
- Do not duplicate `docs/roadmap.md` wholesale — link to it.
