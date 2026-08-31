# ADR-V11-01 — Creative Session as Ephemeral Aggregate
**Status:** Proposed

## Decision
`CreativeSession != Project`.

CreativeSession mantém experimentação temporária; Project nasce apenas após promoção explícita.

## Invariants
- no durable project before successful promotion;
- no preview resource in durable payload;
- close/dispose releases session-owned resources;
- abandoned session creates no phantom project;
- persistence policy considers scope, not only record kind.
