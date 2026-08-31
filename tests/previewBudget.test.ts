import { describe, it, expect } from "vitest";
import {
  PREVIEW_ALGORITHM_VERSION,
  previewBudgetBars,
  zeroBasedBarWindow,
  isWithinPreview,
  previewSettingsFor,
  previewCacheKeyFor,
  invalidatedBySource,
} from "../src/lib/previewBudget";
import type { ProjectStarterResult } from "../src/lib/projectStarter";

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

describe("PreviewBudget", () => {
  it("  ✔ zeroBasedBarWindow is half-open and startBar 0", () => {
    const w = zeroBasedBarWindow(8, 4);
    expect(w.startBar).toBe(0);
    expect(w.endBarExclusive).toBe(4);
    expect(w.endBarExclusive).toBeGreaterThan(w.startBar);
    for (let i = w.startBar; i < w.endBarExclusive; i++) {
      expect(i).toBeGreaterThanOrEqual(w.startBar);
      expect(i).toBeLessThan(w.endBarExclusive);
    }
  });

  it("  ✔ previewBudgetBars within [1,4] and never exceeds numBars", () => {
    for (const n of [0, 1, 2, 3, 4, 5, 8, 64]) {
      const b = previewBudgetBars(makeResult(n));
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(4);
      expect(b).toBeLessThanOrEqual(n || 1);
      expect(Number.isInteger(b)).toBe(true);
    }
    expect(previewBudgetBars(makeResult(0))).toBe(1);
    expect(PREVIEW_ALGORITHM_VERSION).toBe("v1");
  });

  it("  ✔ isWithinPreview boundaries", () => {
    expect(isWithinPreview(0, 4)).toBe(true);
    expect(isWithinPreview(3, 4)).toBe(true);
    expect(isWithinPreview(4, 4)).toBe(false);
    expect(isWithinPreview(-1, 4)).toBe(false);
  });

  it("  ✔ previewCacheKeyFor changes when musicalHash differs", () => {
    const r = makeResult(8);
    const a = previewCacheKeyFor("hashA", r);
    const b = previewCacheKeyFor("hashB", r);
    expect(a).not.toBe(b);
    expect(previewCacheKeyFor("hashA", r)).toBe(a);
  });

  it("  ✔ invalidatedBySource true when null or hash/settings differ", () => {
    const settings = previewSettingsFor(makeResult(8));
    const cur = { hash: "h1", settings };
    const same = { hash: "h1", settings };
    const diffHash = { hash: "h2", settings };
    const diffSettings = {
      hash: "h1",
      settings: { ...settings, renderSettings: { quality: "high" } },
    };
    expect(invalidatedBySource(null, cur)).toBe(true);
    expect(invalidatedBySource(cur, same)).toBe(false);
    expect(invalidatedBySource(cur, diffHash)).toBe(true);
    expect(invalidatedBySource(cur, diffSettings)).toBe(true);
  });
});
