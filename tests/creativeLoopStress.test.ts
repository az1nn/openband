import { describe, it, expect } from "vitest";
import {
  createCreativeSession,
  type GenerationRecipe,
  SESSION_STORAGE_CAPACITY,
} from "../src/lib/creativeSession";
import { createPromotionGate } from "../src/lib/snapshotPromotion";
import { PreviewPlayback } from "../src/lib/previewLifecycle";
import { previewCacheKeyFor } from "../src/lib/previewBudget";
import {
  buildApprovedSnapshot,
  type ProjectStarterResult,
} from "../src/lib/projectStarter";

function makeResult(numBars: number): ProjectStarterResult {
  return {
    id: "p1",
    name: "Test",
    bpm: 120,
    numBars,
    timeSignature: "4/4",
    key: "C",
    genreId: "pop",
    tracks: [],
  };
}

function popRecipe(seed: string): GenerationRecipe {
  return {
    genreId: "pop",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
    seed,
  };
}

describe("Creative loop long-session stress", () => {
  it("runs 120 generations with unique ids and capacity-capped history", () => {
    const s = createCreativeSession();
    const ids = new Set<string>();
    for (let i = 0; i < 120; i++) {
      s.configure(popRecipe(`s${i}`));
      const op = s.freezeGeneration(`seed-${i}`);
      const v = s.generate(op);
      ids.add(v.variationId);
      expect(v.musicalContentHash.length).toBeGreaterThan(0);
    }
    expect(ids.size).toBe(120);
    const hist = s.getHistory();
    expect(hist.length).toBe(SESSION_STORAGE_CAPACITY);
    expect(hist.length).toBe(5);
    const all = s.getState().variations;
    expect(hist[hist.length - 1].variationId).toBe(all[all.length - 1].variationId);
    expect(hist[0].variationId).toBe(all[all.length - 5].variationId);
    expect(s.getState().generation).toBe("idle");
  });
});

describe("Creative loop remount idempotency", () => {
  it("regenerates a deterministic musicalContentHash across remounts", () => {
    const run = (): string => {
      const s = createCreativeSession();
      s.configure(popRecipe("fixed-seed"));
      const op = s.freezeGeneration("fixed-seed");
      return s.generate(op).musicalContentHash;
    };
    const hashA = run();
    const hashB = run();
    expect(hashA).toBe(hashB);
    expect(hashA.length).toBeGreaterThan(0);
  });

  it("promotion dedupes replay of the same approved snapshot", async () => {
    const s = createCreativeSession();
    s.configure(popRecipe("promo-seed"));
    const v = s.generate(s.freezeGeneration("promo-seed"));
    const starter = buildApprovedSnapshot(v.result);

    const persistCalls: string[] = [];
    const out1 = await s.promote(starter, {
      persist: (projectId: string) => {
        persistCalls.push(projectId);
      },
    });
    expect(out1.promoted).toBe(true);
    const out2 = await s.promote(starter, {
      persist: (projectId: string) => {
        persistCalls.push(projectId);
      },
    });
    expect(out2.promoted).toBe(false);
    if (!out2.promoted) expect(out2.reason).toBe("duplicate");
    expect(persistCalls.length).toBe(1);
  });

  it("createPromotionGate mints once and rejects the same token twice", () => {
    const gate = createPromotionGate();
    const snapshot = buildApprovedSnapshot(makeResult(8));
    const first = gate.promote(snapshot);
    expect(first.promoted).toBe(true);
    const second = gate.promote(snapshot);
    expect(second.promoted).toBe(false);
  });

  it("createPromotionGate survives replay simulate restart via explicit mint then promote", () => {
    const gate = createPromotionGate();
    const snapshot = buildApprovedSnapshot(makeResult(4));
    gate.mint(snapshot.approvalToken);
    const result = gate.promote(snapshot);
    expect(result.promoted).toBe(false);
  });

  it("session promote persist runs once across replay", async () => {
    let calls = 0;
    const s = createCreativeSession();
    s.configure(popRecipe("replay-seed"));
    const v = s.generate(s.freezeGeneration("replay-seed"));
    const starter = buildApprovedSnapshot(v.result);
    const persist = () => {
      calls += 1;
    };
    const first = await s.promote(starter, { persist });
    expect(first.promoted).toBe(true);
    const second = await s.promote(starter, { persist });
    expect(second.promoted).toBe(false);
    if (!second.promoted) expect(second.reason).toBe("duplicate");
    expect(calls).toBe(1);
  });

  it("resetPromotion mints a fresh gate: same-recipe re-create is not a duplicate", async () => {
    const s = createCreativeSession();
    s.configure(popRecipe("same-recipe"));
    const v1 = s.generate(s.freezeGeneration("same-recipe"));
    const snap1 = buildApprovedSnapshot(v1.result);
    const out1 = await s.promote(snap1, { persist: () => {} });
    expect(out1.promoted).toBe(true);

    expect(snap1.approvalToken).toBe(buildApprovedSnapshot(v1.result).approvalToken);

    const repeat = await s.promote(snap1, { persist: () => {} });
    expect(repeat.promoted).toBe(false);

    s.resetPromotion();
    const out2 = await s.promote(snap1, { persist: () => {} });
    expect(out2.promoted).toBe(true);
  });
});

describe("Creative loop restart-like idempotency + preview ownership release", () => {
  it("alternating play/end releases ownership back to stopped", () => {
    const p = new PreviewPlayback();
    for (let i = 0; i < 50; i++) {
      const r = p.play();
      expect(r.accepted).toBe(true);
      expect(p.status).toBe("playing");
      p.end();
      expect(p.status).toBe("stopped");
    }
    expect(p.status).toBe("stopped");
    expect(p.currentToken).toBeNull();
  });

  it("second concurrent play returns busy without disturbing owner", () => {
    const p = new PreviewPlayback();
    const first = p.play();
    expect(first.accepted).toBe(true);
    const second = p.play();
    expect(second.accepted).toBe(false);
    expect(second.reason).toBe("busy");
    expect(p.status).toBe("playing");
  });

  it("previewCacheKeyFor is name-stable and varies with musicalHash", () => {
    const r = makeResult(8);
    const a1 = previewCacheKeyFor("hashA", r);
    const a2 = previewCacheKeyFor("hashA", r);
    const b = previewCacheKeyFor("hashB", r);
    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
  });
});
