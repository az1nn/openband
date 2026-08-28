# ADR-V11-05 — Preview Fidelity and Cache Identity
**Status:** Proposed

## Decision
```text
Preview != authoritative full render
Preview == faithful representation of selected variation
```

## Cache
```text
previewCacheKey =
hash(sourceMusicalHash, previewAlgorithmVersion, previewBudgetBars, renderSettings)
```

## Bars
Usar `[startBar,endBar)` zero-based. Budget sempre respeitado.
