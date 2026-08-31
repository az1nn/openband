# OpenBand V11 Handoff — Creative Loop

**Status:** IMPLEMENTED — all open fixes closed (see docs/v11-open-fixes.md) / READY FOR REVIEW  
**Target:** V11 Creative Loop  
**Baseline:** V10 Creative Iteration

## Goal
```text
Configure → Generate → Preview → Adjust → Lock → Regenerate → Compare → Select → Approve → Create
```

## Corrected contract chain
```text
GenerationRecipe
  ├─ recipeFingerprint
  ▼
CreativeVariation
  ├─ variationId
  ├─ musicalContentHash
  ├─ baseVariationId
  ├─ generatorVersion
  └─ effectiveLocks
  ▼
PreviewArtifact
  ├─ sourceMusicalHash
  ├─ previewAlgorithmVersion
  └─ previewCacheKey
  ▼
ApprovedSnapshot
  ├─ approvalToken
  └─ approvedMusicalHash
  ▼
DurableProject
  ├─ projectId
  ├─ sourceApprovalToken
  ├─ musicalContentHash
  └─ persistenceIntegrityHash
```

## Identity taxonomy
- `recipeFingerprint`: intenção estruturada normalizada.
- `musicalContentHash`: conteúdo musical efetivo canônico.
- `persistenceIntegrityHash`: integridade do payload durável.
- `previewCacheKey`: identidade do artefato de preview.
- `variationId`: identidade operacional da variação.
- `projectId`: identidade persistente.

## Creative Session
`CreativeSession != Project`.

CreativeSession é ephemeral. Project só nasce após promoção explícita.

## State dimensions
Preferir estados ortogonais:
```ts
interface CreativeSessionState {
  lifecycle: "open" | "closed";
  generation: "idle" | "running" | "failed";
  promotion: "idle" | "running" | "failed" | "succeeded";
  playback: "stopped" | "playing" | "failed";
}
```

## Generation operation snapshot
Cada geração congela:
```ts
interface GenerationOperation {
  operationId: number;
  recipeSnapshot: GenerationRecipe;
  baseVariationId: string | null;
  lockSnapshot: RoleLocks;
  variationSeed: string;
  generatorVersion: string;
}
```

## Stable musical roles
```text
rhythm
bass
harmony
melody
fx
```
Role deve ser metadata estável de domínio. Track desconhecida não cai silenciosamente em `harmony`.

## Lock cardinality
Diferença de cardinalidade entre role anterior e nova é conflito explícito: `transform`, `reject` ou `require-unlock`.

## Preview identity
```text
previewCacheKey =
hash(musicalContentHash, previewAlgorithmVersion, previewBudgetBars, renderSettings)
```

## Bar convention
```text
zero-based, half-open [startBar,endBar)
0 → 4 = 4 bars
```

## Preview budget
Sempre:
```text
sum(window.bars) <= previewBudgetBars
```

## History
Separar:
```text
storageCapacity = 5
visibleDefaultCount = 3
```
Coleção pública readonly/copy.

## Concurrency
```text
GenerationCoordinator != PromotionGate
```
- geração: latest valid wins;
- promoção: selected approved snapshot pinned.

## Durable idempotency
```text
same approvalToken → same durable project
```
inclusive após remount/restart.

## Persistence scope
```ts
type PersistenceScope = "creative-session" | "project";
```
Tudo em `creative-session` é ephemeral.

## Audio lifecycle
Cobrir explicitamente async rejection e natural end. Close/unmount deixa zero preview resources owned.

## Telemetry
Payloads tipados e allowlisted. Nunca enviar recipe inteira, áudio bruto, caminhos privados ou secrets.

## Release invariants
1. Create não chama generator.
2. promoted musical hash = approved musical hash.
3. Preview source hash = selected variation hash.
4. Close zera resources owned.
5. Stale generation não substitui estado válido.
6. Mesmo approvalToken não cria dois projects.
7. Lock conflict nunca é silently dropped.
8. Preview budget é bounded.
9. Session não persiste como project.
10. V10 + V11 regressions verdes.

## Implementation status (PR #37)
Core domain modules implemented and verified (full matrix green: tsc, backend tsc, vitest 1817, legacy 24, graph:ci, build):

- `src/lib/creativeSession.ts` — session state machine (lifecycle/generation/promotion/playback, freezeGeneration deep-copy, generate/regenerate, selectVariation, approveSelected, async promote w/ durable approvalToken dedupe, capped readonly history).
- `src/lib/previewBudget.ts` — zero-based half-open bars, hard preview budget (>=1 first window), previewCacheKeyFor, invalidatedBySource.
- `src/lib/previewLifecycle.ts` + `src/hooks/usePreviewPlayer.ts` — PreviewPlayback ownership (busy rejection + natural-end release), expo-audio hook with web autoplay ensureContext.
- `src/lib/telemetry.ts` — typed allowlisted event union + recursive secret redaction.
- `src/lib/creativePersistence.ts` — PersistenceScope, ephemeral session store, redactForDurable, recursiveSecretRedaction, persistProjectDurable (redacts before save).
- `src/lib/lockPolicy.ts` — CardinalityPolicy (preserve/drop/strict) + detectCardinalityMismatch.
- UI: CreativeRecipeControls, CreativeRoleLocks, CreativeVariationSwitcher, CreativePreviewPlayer (exported via `src/components/index.ts`), wired into `NewProject` creative-loop section with a working generate action.

Known remaining gaps for full UI loop: preview audio has no production source yet (empty-uri play is a safe no-op); these need a real mixdown/preview source and long-session/remount stress suites.
