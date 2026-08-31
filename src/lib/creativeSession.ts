import type { LockRole } from "./lockPolicy";
import { applyLocks } from "./lockPolicy";
import {
  ProjectStarterResult,
  ProjectStarterConfig,
  setupProjectStarter,
  buildApprovedSnapshot,
} from "./projectStarter";
import {
  musicalContentHash,
  recipeFingerprint,
} from "./creativeIdentity";
import {
  createPromotionSession,
  type ApprovedStarterSnapshot,
  type PromotionOutcome,
  type Recipe,
} from "./snapshotPromotion";

export const SESSION_STORAGE_CAPACITY = 5;
export const SESSION_VISIBLE_DEFAULT = 3;

export type RoleLocks = Partial<Record<LockRole, boolean>>;

export type GenerationRecipe = {
  genreId: string;
  mood?: string;
  bpm: number;
  key: string;
  timeSignature: string;
  numBars: number;
  seed: string;
};

export type CreativeVariation = {
  variationId: string;
  recipeFingerprint: string;
  musicalContentHash: string;
  baseVariationId: string | null;
  variationSeed: string;
  generatorVersion: string;
  effectiveLocks: RoleLocks;
  result: ProjectStarterResult;
  preview?: { cacheKey: string; budgetBars: number };
};

export type ApprovedSnapshot = {
  approvalToken: string;
  approvedVariationId: string;
  approvedMusicalHash: string;
  approvedAt: number;
  result: ProjectStarterResult;
};

export type CreativeSessionState = {
  lifecycle: "open" | "closed";
  generation: "idle" | "running" | "failed";
  promotion: "idle" | "running" | "failed" | "succeeded";
  playback: "stopped" | "playing" | "failed";
  recipe: GenerationRecipe;
  locks: RoleLocks;
  selectedVariationId: string | null;
  variations: readonly CreativeVariation[];
};

export type GenerationOperation = {
  operationId: number;
  recipeSnapshot: GenerationRecipe;
  baseVariationId: string | null;
  lockSnapshot: RoleLocks;
  variationSeed: string;
  generatorVersion: string;
};

export interface CreativeSession {
  getState(): CreativeSessionState;
  configure(recipe: GenerationRecipe): void;
  setLocks(locks: RoleLocks): void;
  freezeGeneration(seed?: string): GenerationOperation;
  generate(op: GenerationOperation): CreativeVariation;
  regenerate(baseVariationId: string, op: GenerationOperation): CreativeVariation;
  selectVariation(id: string): void;
  approveSelected(): ApprovedSnapshot;
  promote(
    snapshot: ApprovedStarterSnapshot,
    opts: { persist: (projectId: string, recipe: Recipe, previewUri: string | null) => void | Promise<void> },
  ): Promise<PromotionOutcome>;
  getHistory(): readonly CreativeVariation[];
  visibleCount: number;
  resetPromotion(): void;
  close(): void;
}

function deepCopyRecipe(recipe: GenerationRecipe): GenerationRecipe {
  return {
    genreId: recipe.genreId,
    mood: recipe.mood,
    bpm: recipe.bpm,
    key: recipe.key,
    timeSignature: recipe.timeSignature,
    numBars: recipe.numBars,
    seed: recipe.seed,
  };
}

function newSeed(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `seed-${Date.now()}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `var-${Date.now()}`;
}

export function createCreativeSession(opts?: {
  storageCapacity?: number;
  visibleDefaultCount?: number;
  generatorVersion?: string;
}): CreativeSession {
  const storageCapacity = opts?.storageCapacity ?? SESSION_STORAGE_CAPACITY;
  const visibleDefaultCount = opts?.visibleDefaultCount ?? SESSION_VISIBLE_DEFAULT;
  const defaultGeneratorVersion = opts?.generatorVersion ?? "1";

  const state: CreativeSessionState = {
    lifecycle: "open",
    generation: "idle",
    promotion: "idle",
    playback: "stopped",
    recipe: {
      genreId: "pop",
      bpm: 120,
      numBars: 8,
      timeSignature: "4/4",
      key: "C",
      mood: undefined,
      seed: "",
    },
    locks: {},
    selectedVariationId: null,
    variations: [],
  };

  let promotion = createPromotionSession();
  let operationCounter = 0;

  function resetPromotion(): void {
    promotion = createPromotionSession();
  }

  function buildVariation(op: GenerationOperation): CreativeVariation {
    const base = setupProjectStarter({
      name: `variation-${op.variationSeed}`,
      genreId: op.recipeSnapshot.genreId,
      mood: op.recipeSnapshot.mood as ProjectStarterConfig["mood"],
      bpm: op.recipeSnapshot.bpm,
      numBars: op.recipeSnapshot.numBars,
      timeSignature: op.recipeSnapshot.timeSignature,
      key: op.recipeSnapshot.key,
    });

    let result: ProjectStarterResult = base;
    if (op.baseVariationId != null) {
      const baseVariation = state.variations.find((v) => v.variationId === op.baseVariationId);
      if (baseVariation) {
        result = applyLocks(baseVariation.result, base, op.lockSnapshot, op.recipeSnapshot.genreId);
      }
    }

    const fp = recipeFingerprint({
      genreId: op.recipeSnapshot.genreId,
      mood: op.recipeSnapshot.mood,
      bpm: op.recipeSnapshot.bpm,
      key: op.recipeSnapshot.key,
      timeSignature: op.recipeSnapshot.timeSignature,
      numBars: op.recipeSnapshot.numBars,
    });
    const mch = musicalContentHash(result);
    const variationId = newId();

    return {
      variationId,
      recipeFingerprint: fp,
      musicalContentHash: mch,
      baseVariationId: op.baseVariationId,
      variationSeed: op.variationSeed,
      generatorVersion: op.generatorVersion,
      effectiveLocks: { ...op.lockSnapshot },
      result,
    };
  }

  return {
    get visibleCount() {
      return visibleDefaultCount;
    },
    getState() {
      return state;
    },
    configure(recipe) {
      state.recipe = deepCopyRecipe(recipe);
      state.generation = "idle";
      state.promotion = "idle";
      state.selectedVariationId = null;
    },
    setLocks(locks) {
      state.locks = { ...locks };
    },
    freezeGeneration(seed?) {
      operationCounter += 1;
      const variationSeed = seed || state.recipe.seed || newSeed();
      const recipeSnapshot = deepCopyRecipe(state.recipe);
      const lockSnapshot: RoleLocks = { ...state.locks };
      Object.freeze(recipeSnapshot);
      Object.freeze(lockSnapshot);
      return {
        operationId: operationCounter,
        recipeSnapshot,
        baseVariationId: state.selectedVariationId,
        lockSnapshot,
        variationSeed,
        generatorVersion: defaultGeneratorVersion,
      };
    },
    generate(op) {
      state.generation = "running";
      try {
        const variation = buildVariation(op);
        state.variations = [...state.variations, variation];
        state.generation = "idle";
        return variation;
      } catch (err) {
        state.generation = "failed";
        throw err;
      }
    },
    regenerate(baseVariationId, op) {
      state.generation = "running";
      try {
        const variation = buildVariation({ ...op, baseVariationId });
        state.variations = [...state.variations, variation];
        state.generation = "idle";
        return variation;
      } catch (err) {
        state.generation = "failed";
        throw err;
      }
    },
    selectVariation(id) {
      state.selectedVariationId = id;
    },
    approveSelected() {
      if (state.selectedVariationId == null) throw new Error("no-selection");
      const variation = state.variations.find((v) => v.variationId === state.selectedVariationId);
      if (!variation) throw new Error("no-selection");
      const snap = buildApprovedSnapshot(variation.result);
      if (snap.approvedMusicalHash !== variation.musicalContentHash) {
        throw new Error("hash-mismatch");
      }
      return {
        approvalToken: snap.approvalToken,
        approvedVariationId: variation.variationId,
        approvedMusicalHash: snap.approvedMusicalHash,
        approvedAt: snap.approvedAt,
        result: variation.result,
      };
    },
    async promote(snapshot, opts) {
      const outcome = await promotion.promote(snapshot, opts);
      state.promotion = outcome.promoted ? "succeeded" : "failed";
      return outcome;
    },
    getHistory() {
      return state.variations.slice(-storageCapacity);
    },
    resetPromotion() {
      resetPromotion();
    },
    close() {
      state.lifecycle = "closed";
      state.variations = [];
      state.selectedVariationId = null;
    },
  };
}
