# Design — V11 Creative Loop

## Domain types
```ts
interface GenerationRecipe {
  genreId: string;
  mood?: string;
  bpm: number;
  key: string;
  timeSignature: string;
  numBars: number;
  seed: string;
}

type TrackRole = "rhythm" | "bass" | "harmony" | "melody" | "fx";

interface CreativeVariation {
  variationId: string;
  recipeFingerprint: string;
  musicalContentHash: string;
  baseVariationId: string | null;
  variationSeed: string;
  generatorVersion: string;
  effectiveLocks: RoleLocks;
  result: ProjectStarterResult;
  preview?: PreviewArtifact;
}

interface ApprovedSnapshot {
  approvalToken: string;
  approvedVariationId: string;
  approvedMusicalHash: string;
  approvedAt: number;
  result: ProjectStarterResult;
}
```

## Identity functions
```ts
recipeFingerprint(recipe)
musicalContentHash(result)
persistenceIntegrityHash(project)
previewCacheKey(sourceHash, algorithmVersion, settings)
```

## Stable roles
Track role é explicit metadata ou canonical sidecar. Unknown role nunca cai silenciosamente em harmony.

## Generation request
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

## Lock application
Locks são aplicados a partir do `baseVariationId` congelado. Cardinality mismatch exige policy explícita.

## Preview
- barras zero-based half-open;
- preview budget é hard bound;
- cache identity deriva do source musical hash.

## History
```text
storageCapacity = 5
visibleDefaultCount = 3
```
Coleção exposta como readonly/copy.

## Session state
```ts
interface CreativeSessionState {
  lifecycle: "open" | "closed";
  generation: "idle" | "running" | "failed";
  promotion: "idle" | "running" | "failed" | "succeeded";
  playback: "stopped" | "playing" | "failed";
  recipe: GenerationRecipe;
  locks: RoleLocks;
  selectedVariationId: string | null;
  variations: readonly CreativeVariation[];
}
```

## Promotion
Promotion usa ApprovedSnapshot congelado. Generator não é dependência de promoção. Persistência deve deduplicar por approvalToken.

## Persistence
```ts
type PersistenceScope = "creative-session" | "project";
```
Creative-session é sempre ephemeral.

## Telemetry
Typed event schema only. Sem whole recipe payload.

## Audio
Async failures e natural-ended state devem liberar ownership.

## UI
Esperado:
- `NewProject`
- `CreativeRecipeControls`
- `CreativePreviewPlayer`
- `CreativeRoleLocks`
- `CreativeVariationSwitcher`

Domain logic fora de React.
