# ADR-V11-06 — Generation and Promotion Concurrency
**Status:** Proposed

## Decision
```text
GenerationCoordinator != PromotionGate
```

### Generation
latest valid wins.

### Promotion
selected approval is pinned and idempotent.

Cada generation operation congela recipe, baseVariationId, locks, seed e generatorVersion.
