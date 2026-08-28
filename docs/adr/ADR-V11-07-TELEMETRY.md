# ADR-V11-07 — Typed Creative Loop Telemetry
**Status:** Proposed

## Decision
Telemetry events possuem payload allowlisted e tipado. Nunca enviar recipe inteira por conveniência.

## Security
Redaction:
- recursive;
- case-insensitive;
- cobre auth/token/password/secret/apiKey/cookie variants.

## Purpose
Gerar evidence para escolha pós-V11.
