import { describe, it, expect } from "vitest";
import {
  createCreativeSession,
  type GenerationRecipe,
  type RoleLocks,
} from "../src/lib/creativeSession";
import {
  applyLocks,
  detectCardinalityMismatch,
  type LockRole,
} from "../src/lib/lockPolicy";
import { setupProjectStarter, buildApprovedSnapshot, type ProjectStarterResult } from "../src/lib/projectStarter";
import { GENRES } from "../src/lib/projectTemplates";
import { roleForTrackType } from "../src/lib/lockPolicy";

function roleAt(genreId: string, index: number): LockRole {
  const genre = GENRES.find((g) => g.id === genreId);
  const tt = genre?.suggestedTracks?.[index]?.trackType;
  return roleForTrackType(tt);
}

function recipe(over: Partial<GenerationRecipe> = {}): GenerationRecipe {
  return {
    genreId: "rock",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
    mood: undefined,
    seed: "",
    ...over,
  };
}

describe("CreativeSession", () => {
  it("freezeGeneration returns deep-copied immutable snapshot", () => {
    const s = createCreativeSession();
    s.configure(recipe({ bpm: 100 }));
    const op = s.freezeGeneration("seed-a");
    const before = s.getState().recipe.bpm;
    try {
      (op.recipeSnapshot as { bpm: number }).bpm = 999;
    } catch {
    }
    expect(s.getState().recipe.bpm).toBe(before);
  });

  it("generate appends variation with recipeFingerprint + musicalContentHash", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    const op = s.freezeGeneration("seed-b");
    const v = s.generate(op);
    expect(typeof v.recipeFingerprint).toBe("string");
    expect(typeof v.musicalContentHash).toBe("string");
    expect(v.recipeFingerprint.length).toBeGreaterThan(0);
    expect(v.musicalContentHash.length).toBeGreaterThan(0);
    expect(s.getState().variations.length).toBe(1);
    expect(s.getState().generation).toBe("idle");
  });

  it("regenerate from base applies locks (locked role tracks preserved)", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    const op1 = s.freezeGeneration("seed-c");
    const base = s.generate(op1);

    s.configure(recipe({ bpm: 130 }));
    const locks: RoleLocks = { rhythm: true };
    s.setLocks(locks);
    const op2 = s.freezeGeneration("seed-d");
    const v = s.regenerate(base.variationId, op2);
    expect(v.baseVariationId).toBe(base.variationId);

    v.result.tracks.forEach((track, i) => {
      const role = roleAt("rock", i);
      if (locks[role]) {
        expect(track.midiNotes).toEqual(base.result.tracks[i].midiNotes);
        expect(track.name).toBe(base.result.tracks[i].name);
      } else {
        expect(track.midiNotes).not.toEqual(base.result.tracks[i].midiNotes);
      }
    });
  });

  it("selectVariation selects an older variation independently", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    const v1 = s.generate(s.freezeGeneration("seed-e"));
    const v2 = s.generate(s.freezeGeneration("seed-f"));
    s.selectVariation(v1.variationId);
    expect(s.getState().selectedVariationId).toBe(v1.variationId);
    expect(s.getState().variations[s.getState().variations.length - 1].variationId).toBe(v2.variationId);
  });

  it("approveSelected throws when none selected", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    s.generate(s.freezeGeneration("seed-g"));
    expect(() => s.approveSelected()).toThrow("no-selection");
  });

  it("approveSelected returns snapshot whose approvedMusicalHash equals variation musicalContentHash", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    const v = s.generate(s.freezeGeneration("seed-h"));
    s.selectVariation(v.variationId);
    const snap = s.approveSelected();
    expect(snap.approvedMusicalHash).toBe(v.musicalContentHash);
    expect(snap.approvedVariationId).toBe(v.variationId);
  });

  it("promote dedupes same approvalToken twice", async () => {
    const s = createCreativeSession();
    s.configure(recipe());
    const v = s.generate(s.freezeGeneration("seed-i"));
    s.selectVariation(v.variationId);

    const starter = buildApprovedSnapshot(v.result);
    const persist = (() => {
      const calls: string[] = [];
      return {
        calls,
        fn: (projectId: string) => {
          calls.push(projectId);
        },
      };
    })();

    const out1 = await s.promote(starter, { persist: persist.fn });
    expect(out1.promoted).toBe(true);
    const out2 = await s.promote(starter, { persist: persist.fn });
    expect(out2.promoted).toBe(false);
    if (!out2.promoted) expect(out2.reason).toBe("duplicate");
    expect(persist.calls.length).toBe(1);
  });

  it("history cap at storageCapacity", () => {
    const s = createCreativeSession({ storageCapacity: 5 });
    for (let i = 0; i < 7; i++) {
      s.configure(recipe({ bpm: 100 + i }));
      s.generate(s.freezeGeneration(`seed-${i}`));
    }
    const hist = s.getHistory();
    expect(hist.length).toBe(5);
    const all = s.getState().variations;
    expect(hist[hist.length - 1].variationId).toBe(all[all.length - 1].variationId);
  });

  it("close clears variations", () => {
    const s = createCreativeSession();
    s.configure(recipe());
    s.generate(s.freezeGeneration("seed-j"));
    s.close();
    expect(s.getState().lifecycle).toBe("closed");
    expect(s.getState().variations.length).toBe(0);
  });
});

describe("CardinalityPolicy", () => {
  it("detectCardinalityMismatch detects locked role absent in prev", () => {
    const prev = setupProjectStarter({ name: "p", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C", startFromScratch: true });
    const next = setupProjectStarter({ name: "n", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C" });
    const locks: RoleLocks = { rhythm: true };
    const mismatch = detectCardinalityMismatch(prev, next, locks, "rock");
    expect(mismatch).toContain("rhythm");
  });

  it("applyLocks drop removes locked track with no prev", () => {
    const prev = setupProjectStarter({ name: "p", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C", startFromScratch: true });
    const next = setupProjectStarter({ name: "n", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C" });
    const dropped = applyLocks(prev, next, { rhythm: true }, "rock", "drop");
    expect(dropped.tracks.length).toBe(next.tracks.length - 1);
  });

  it("applyLocks strict throws on locked role with no prev", () => {
    const prev: ProjectStarterResult = setupProjectStarter({ name: "p", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C", startFromScratch: true });
    const next = setupProjectStarter({ name: "n", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C" });
    expect(() => applyLocks(prev, next, { rhythm: true }, "rock", "strict")).toThrow(/cardinality-mismatch/);
  });
});
