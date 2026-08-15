---
name: openband-to-tickets
description: Decompose OpenSpec designs into tracer-bullet vertical slices with explicit dependencies.
---

# OpenBand To Tickets — Vertical Decomposition

Decomposes `tasks.md` from an OpenSpec proposal into end-to-end testable "tracer bullet" vertical slices rather than horizontal layer-by-layer silos.

## Vertical Slice Slicing Rules

Each decomposed ticket must span across all required layers for a specific capability:

```
[ UI Component ] ➔ [ State / CRDT ] ➔ [ DSP / Audio Engine ] ➔ [ Native Bridge / API ]
```

- **Avoid Horizontal Silos**: Do NOT create tickets like "Implement all UI screens first" or "Build entire database schema first".
- **Independent Testability**: Every ticket must be independently reviewable and include automated tests verifying the end-to-end behavior of that single feature slice.
- **Tracer-Bullet Strategy**: Build the thinnest possible functional slice first to validate data flow early.

## Ticket Format

Each ticket must detail:
- **Scope**: Target feature slice and affected files.
- **Layer Impact**: Exact files across UI, State, DSP, and Bridge.
- **Acceptance Criteria**: Concrete functional outcomes.
- **Test Gate**: Vitest / node:test suite commands that validate the slice.
