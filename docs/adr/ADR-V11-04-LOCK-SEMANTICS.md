# ADR-V11-04 — Stable Musical Role Lock Semantics
**Status:** Proposed

## Decision
Roles canônicos:
```text
rhythm
bass
harmony
melody
fx
```

Role deve ser stable domain metadata.

## Forbidden
Inferir permanentemente por index, track order ou fallback desconhecido para harmony.

## Conflict policy
Sempre explícita:
- transform;
- reject;
- require-unlock.

Cardinality mismatch também é conflito de domínio.
