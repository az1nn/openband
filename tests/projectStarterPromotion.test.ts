import { describe, it, expect } from "vitest";
import {
  contentHash,
  computeStale,
  createPromotionGate,
  normalizedRecipe,
} from "../src/lib/snapshotPromotion";
import type {
  ApprovedStarterSnapshot,
  GeneratedStarterSnapshot,
  Recipe,
} from "../src/lib/snapshotPromotion";

const baseRecipe = {
  genreId: "pop",
  mood: "cheerful",
  bpm: 120,
  key: "C",
  timeSignature: "4/4",
  numBars: 8,
  seed: "s1",
} as const;

function snapshot(overrides: Partial<GeneratedStarterSnapshot> = {}): GeneratedStarterSnapshot {
  return {
    revision: 8,
    recipe: { ...baseRecipe, id: "persistent-id" } as Recipe,
    seed: "s1",
    version: "1",
    uri: "blob:preview-url",
    approved: true,
    ...overrides,
  };
}

describe("normalizedRecipe", () => {
  it("excludes transient id/uri/name so non-musical re-keying is invisible", () => {
    const a = { ...baseRecipe, id: "old-id", name: "Project A" } as Recipe;
    const b = { ...baseRecipe, id: "re-keyed-id", name: "Project B" } as Recipe;
    expect(normalizedRecipe(a)).toEqual(normalizedRecipe(b));
    expect(normalizedRecipe(a)).not.toHaveProperty("id");
    expect(normalizedRecipe(a)).not.toHaveProperty("name");
  });
});

describe("contentHash", () => {
  it("re-keying persistent IDs does not change the hash (R3 / acceptance 3)", () => {
    const a = snapshot();
    const b = snapshot({ recipe: { ...a.recipe, id: "re-keyed-id" } });
    expect(contentHash(a)).toBe(contentHash(b));
  });

  it("a musical change changes the hash", () => {
    const a = snapshot();
    const b = snapshot({ recipe: { ...a.recipe, bpm: 140 } });
    const c = snapshot({ recipe: { ...a.recipe, key: "G" } });
    expect(contentHash(a)).not.toBe(contentHash(b));
    expect(contentHash(a)).not.toBe(contentHash(c));
  });

  it("changing the version changes the hash", () => {
    const a = snapshot();
    const b = snapshot({ version: "2" });
    expect(contentHash(a)).not.toBe(contentHash(b));
  });
});

describe("computeStale (R4)", () => {
  const approved: ApprovedStarterSnapshot = {
    ...snapshot(),
    approvalToken: "token-8",
    approvedAt: 1000,
  };

  it("returns false when the active config is unchanged", () => {
    expect(computeStale({ ...baseRecipe }, approved)).toBe(false);
  });

  it("returns true when a musical param changed", () => {
    expect(computeStale({ ...baseRecipe, bpm: 140 }, approved)).toBe(true);
    expect(computeStale({ ...baseRecipe, key: "G" }, approved)).toBe(true);
  });

  it("does not flag non-musical changes (name/id) as stale", () => {
    const s = snapshot({ recipe: { ...baseRecipe, id: "x" } }) as ApprovedStarterSnapshot;
    const active = { ...baseRecipe, id: "y", name: "Renamed" } as Recipe;
    expect(computeStale(active, s)).toBe(false);
  });
});

describe("createPromotionGate (R5 / acceptance 2)", () => {
  const approved: ApprovedStarterSnapshot = {
    ...snapshot(),
    approvalToken: "token-8",
    approvedAt: 1000,
  };

  it("promotes once per approvalToken; duplicates are deduplicated", () => {
    const gate = createPromotionGate();
    const first = gate.promote(approved);
    expect(first.promoted).toBe(true);
    expect(first.projectId).toBeDefined();

    const second = gate.promote(approved);
    expect(second.promoted).toBe(false);
    expect(second.projectId).toBeUndefined();
  });

  it("does not promote for a stale snapshot", () => {
    const gate = createPromotionGate();
    const stale = { ...approved, approved: false, approvalToken: "token-8" };
    const result = gate.promote(stale as ApprovedStarterSnapshot);
    expect(result.promoted).toBe(false);
  });

  it("promotes independent approvalTokens independently", () => {
    const gate = createPromotionGate();
    const a = { ...approved, approvalToken: "tA" };
    const b = { ...approved, approvalToken: "tB" };
    expect(gate.promote(a).promoted).toBe(true);
    expect(gate.promote(b).promoted).toBe(true);
    expect(gate.promote(a).promoted).toBe(false);
  });
});
