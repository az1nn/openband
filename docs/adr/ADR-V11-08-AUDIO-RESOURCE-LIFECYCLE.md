# ADR-V11-08 — Preview Audio Resource Lifecycle
**Status:** Proposed

## Decision
Preview voice lifecycle deve representar explicitamente:
- created;
- playing;
- ended;
- stopped;
- failed;
- disposed.

Async `play()` rejection deve liberar resource.
Natural end deve disparar cleanup.
Close/unmount deixam zero owned preview resources.
