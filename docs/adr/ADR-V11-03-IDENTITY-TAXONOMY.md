# ADR-V11-03 — Identity Taxonomy
**Status:** Proposed

## Decision
Separar:
```text
recipeFingerprint
variationId
musicalContentHash
approvalToken
projectId
persistenceIntegrityHash
previewCacheKey
```

Nenhuma identidade pode ser reutilizada semanticamente como outra.

## musicalContentHash
Calculado sobre conteúdo musical canônico efetivo.

## persistenceIntegrityHash
Calculado sobre payload persistido relevante.

## previewCacheKey
Derivado de musical content + preview algorithm/settings.
