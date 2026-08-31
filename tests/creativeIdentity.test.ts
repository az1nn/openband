import { describe, it, expect } from "vitest";
import { setupProjectStarter, type ProjectStarterResult } from "../src/lib/projectStarter";
import {
  recipeFingerprint,
  musicalContentHash,
  persistenceIntegrityHash,
  previewCacheKey,
  type PreviewRenderSettings,
} from "../src/lib/creativeIdentity";
import { applyLocks } from "../src/lib/lockPolicy";

function baseRock(): ProjectStarterResult {
  return setupProjectStarter({
    name: "T",
    genreId: "rock",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
  });
}

const settings: PreviewRenderSettings = {
  previewAlgorithmVersion: "v1",
  previewBudgetBars: 16,
  renderSettings: { quality: "low" },
};

describe("creativeIdentity", () => {
  it("ID01 same recipe intent -> same recipeFingerprint", () => {
    const a = recipeFingerprint({
      genreId: "rock",
      bpm: 120,
      key: "C",
      timeSignature: "4/4",
      numBars: 8,
    });
    const b = recipeFingerprint({
      genreId: "rock",
      bpm: 120,
      key: "C",
      timeSignature: "4/4",
      numBars: 8,
    });
    expect(a).toBe(b);
  });

  it("ID02 recipeFingerprint is deterministic and ignores non-intent fields", () => {
    const intent = {
      genreId: "rock",
      bpm: 120,
      key: "C",
      timeSignature: "4/4",
      numBars: 8,
    };
    expect(recipeFingerprint(intent)).toBe(recipeFingerprint(intent));
    expect(recipeFingerprint({ ...intent, mood: "calm" })).not.toBe(
      recipeFingerprint(intent),
    );
    expect(recipeFingerprint({ ...intent, bpm: 121 })).not.toBe(
      recipeFingerprint(intent),
    );
  });

  it("ID03 altered generated MIDI -> different musicalContentHash", () => {
    const r = baseRock();
    const h1 = musicalContentHash(r);
    const mutated: ProjectStarterResult = {
      ...r,
      tracks: r.tracks.map((t, i) =>
        i === 0 && t.midiNotes && t.midiNotes.length > 0
          ? {
              ...t,
              midiNotes: [
                { pitch: 60, start: 0, duration: 0.5, velocity: 100 },
              ],
            }
          : t,
      ),
    };
    expect(musicalContentHash(mutated)).not.toBe(h1);
  });

  it("ID04 random track IDs do not alter musicalContentHash", () => {
    const r = baseRock();
    const h1 = musicalContentHash(r);
    const reId: ProjectStarterResult = {
      ...r,
      tracks: r.tracks.map((t, i) => ({
        ...t,
        id: `rand-${i}-${Math.random().toString(36)}`,
      })),
    };
    expect(musicalContentHash(reId)).toBe(h1);
  });

  it("ID06 variationId is not used as musical equality", () => {
    const r = baseRock();
    const h1 = musicalContentHash(r);
    const other: ProjectStarterResult = { ...r, id: "different-variation-id" };
    expect(musicalContentHash(other)).toBe(h1);
  });

  it("ID05 persistenceIntegrityHash changes on durable payload mutation", () => {
    const base = {
      projectId: "p1",
      musicalContentHash: "h1",
      approvalToken: "tok",
      sourceRecipe: {
        genreId: "rock",
        bpm: 120,
        key: "C",
        timeSignature: "4/4",
        numBars: 8,
      },
    };
    const h1 = persistenceIntegrityHash(base);
    expect(
      persistenceIntegrityHash({ ...base, musicalContentHash: "h2" }),
    ).not.toBe(h1);
    expect(persistenceIntegrityHash({ ...base, projectId: "p2" })).not.toBe(h1);
    expect(
      persistenceIntegrityHash({ ...base, approvalToken: "tok2" }),
    ).not.toBe(h1);
  });

  it("ID07 previewCacheKey changes when musical hash changes", () => {
    const k1 = previewCacheKey("hashA", settings);
    const k2 = previewCacheKey("hashB", settings);
    expect(k1).not.toBe(k2);
  });

  it("PV05 changed content changes cache key", () => {
    const r1 = baseRock();
    const r2 = setupProjectStarter({
      name: "T2",
      genreId: "rock",
      bpm: 140,
      numBars: 8,
      timeSignature: "4/4",
      key: "C",
    });
    const k1 = previewCacheKey(musicalContentHash(r1), settings);
    const k2 = previewCacheKey(musicalContentHash(r2), settings);
    expect(k1).not.toBe(k2);
  });

  it("PV06 changed locks change musical content thus cache key", () => {
    const r1 = baseRock();
    const next = setupProjectStarter({
      name: "Tnext",
      genreId: "rock",
      bpm: 120,
      numBars: 16,
      timeSignature: "4/4",
      key: "C",
    });
    const locked = applyLocks(r1, next, { rhythm: true }, "rock");
    const k1 = previewCacheKey(musicalContentHash(r1), settings);
    const k2 = previewCacheKey(musicalContentHash(locked), settings);
    expect(k1).not.toBe(k2);
  });

  it("PV07 unrelated UI state preserves cache key", () => {
    const k1 = previewCacheKey("h", settings);
    const k2 = previewCacheKey("h", { ...settings });
    expect(k1).toBe(k2);
  });
});
