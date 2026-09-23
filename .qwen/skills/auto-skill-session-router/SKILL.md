---
name: session-router
description: Compatibility entrypoint for standalone `siga`; delegates all canonical behavior to the project-scoped OpenBand session router.
source: project-skill
created_at: '2026-09-17'
---

# Session Router — OpenBand Adapter

This entrypoint exists so existing OpenBand policy and tooling can keep invoking the historical `.qwen` path.

The canonical project-owned behavior lives at:

`.agents/skills/openband-session-router/SKILL.md`

## Mandatory delegation

On every standalone `siga`:

1. read `.agents/skills/openband-session-router/SKILL.md` in full;
2. apply its repository lock before any task-state lookup or mutation;
3. require canonical repository identity to be exactly `az1nn/openband`;
4. render the required `OPENBAND AGENT TREE` before long work;
5. route only through `ACTIVE/OWNED`, `ACTIVE/OBSERVER`, `WAITING`, `NEXT`, or `REPO_MISMATCH` as defined there;
6. after ownership is resolved, delegate engineering lifecycle work to OpenBand `openband-ask` / Spec Kit rather than inventing a parallel state machine.

Never use this adapter's location as evidence that the current conversation is actually operating on OpenBand. The canonical skill must verify `az1nn/openband` from Git/GitHub state first.

The session law remains:

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

A foreign-owned ACTIVE/WAITING task is occupied. Routine `siga` never authorizes takeover or mutation and must continue canonical `NEXT` discovery for independent work. `ACTIVE/OBSERVER` is used only when the user explicitly asks for read-only inspection. Ownership requires matching current-chat `SESSION_KEY` proof.
