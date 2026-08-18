## Status: SHIPPED

LOW-severity findings (L1–L3) implemented and verified green (tsc, vitest, legacy, build).

# Proposal: Code Review LOW-Severity Cleanup

> **Status: PENDING IMPLEMENTATION.** Not yet shipped. This change covers the
> LOW-severity findings from the full-repo code review that were intentionally
> deferred from the HIGH+MED `code-review-hardening` change. Scope is ONLY the
> safe, mechanical code-quality LOWs enumerated below (L1–L3). Source fixes are
> specified in `design.md` and `tasks.md`.

## Context

A full-repository code review produced HIGH, MED, and LOW findings. The HIGH+MED
set was handled by the separate `code-review-hardening` change. The LOW set
contains a handful of mechanical, low-risk hygiene fixes that were deliberately
deferred so they could be reviewed in isolation:

- A blob-URL leak guard in the audio clock worker teardown (`clockManager.ts`).
- A dead variable in the presence client (`presence.ts`).
- Pre-existing empty `catch {}` blocks in the backend that swallow errors with no
  binding (the repo rule requires binding `e` and logging).

None of these alter runtime behavior beyond the targeted fix; no APIs change and
no tests need to be rewritten. This change keeps the diff minimal and reviewable.

## Problem Description

### AUDIO (LOW)

**L1 — Orphaned worker blob URL on the terminate branch.** `src/lib/clockManager.ts`
(`~53-56`) has an `if (workerInstance)` terminate branch that nulls
`workerInstance` but does not revoke the previously-created `workerBlobUrl`. The
normal stop path already revokes, but this branch can leak a blob URL if the
worker was created and terminated without going through the normal stop path
(guards a refactor/edge case).

### STATE (LOW)

**L2 — Dead `reconnectOnLineRef`.** `src/lib/presence.ts` (`~116`, `~230`, `~235`)
declares and assigns `reconnectOnLineRef`, then nulls it, but the variable is
never read. It is dead code. The actual `online`/`offline` `window` event
listeners are wired separately and must be preserved.

### BACKEND (LOW)

**L3 — Empty `catch {}` blocks swallow errors.** The following backend blocks use
a bare `catch {}` with no binding, violating the repo rule that errors must be
captured (`e`) and logged:

- `backend/src/routes/collab.ts` (`~69`, `~185`)
- `backend/src/routes/presence.ts` (`~67`, `~181`)
- `backend/src/services/queue.ts` (`~118`)

Each must be changed to `catch (e) { console.error("...", e); }` (or
`console.warn`) to preserve observability. Behavior is otherwise identical.

## Deferred (out of scope for this change)

The following LOW items are explicitly deferred to their own dedicated passes and
are NOT addressed here:

- **crdt.ts non-add op drop (LWW) and add-ops-without-id dedup.** Risky convergence
  semantics; needs separate analysis before changing.
- **Pervasive comment removal and `any`-sprawl cleanup.** Large churn across many
  files; a separate dedicated pass is required.
- **Pure style/whitespace** (e.g. `mastering.ts` / `audioTelemetry.ts`
  indentation). No lint gate enforces these; skip.

## Objectives

1. Guard the `clockManager` worker teardown branch so a previously-created
   `workerBlobUrl` is revoked before the reference is dropped (L1).
2. Remove the dead `reconnectOnLineRef` variable and its assignments from
   `presence.ts`, leaving the real `online`/`offline` listeners intact (L2).
3. Bind and log errors in every empty backend `catch {}` block (L3), keeping
   behavior identical.

## Non-Goals

- No behavioral changes to the audio clock, presence protocol, or backend routes
  beyond error logging.
- No convergence-semantics changes to CRDT.
- No comment/`any`/whitespace cleanup.
- No new dependencies, no config changes, no API surface changes.

## Approach Summary

- **L1:** Add a defensive `if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }` inside the `if (workerInstance)` terminate branch.
- **L2:** Delete the `reconnectOnLineRef` declaration and the two assignment sites; keep `window.addEventListener("online"|"offline", ...)` registrations.
- **L3:** For each listed `catch {}`, introduce `(e)` and a `console.error`/`console.warn` with a short context string; prefer `console.error`.

## Risks

- Negligible. The changes are confined to teardown hygiene, dead-code removal, and
  error logging. The only observable difference is that backend errors are now
  logged instead of silently swallowed, and a leaked blob URL is now reclaimed.
