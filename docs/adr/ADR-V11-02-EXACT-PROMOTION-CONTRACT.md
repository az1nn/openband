# ADR-V11-02 — Exact Promotion Contract
**Status:** Proposed

## Decision
`Create` nunca regenera.

```text
SelectedVariation → ApprovedSnapshot → PromotionGate → DurableProject
```

## Invariant
```text
musicalContentHash(promotedProject)
==
approvedSnapshot.approvedMusicalHash
```

## Idempotency
`approvalToken` deve ser durável:
```text
same approvalToken → same project
```
