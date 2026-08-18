import { describe, it, expect } from "vitest";
import {
  calculateEffectivePreviewBars,
  normalizeVolumeGain,
  computePreviewFingerprint,
  generatePreviewTracks,
  MAX_PREVIEW_BARS,
  DEFAULT_PREVIEW_VOLUME,
} from "../src/lib/projectPreview";

describe("projectPreview unit tests", () => {
  it("constants have expected defaults", () => {
    expect(MAX_PREVIEW_BARS).toBe(4);
    expect(DEFAULT_PREVIEW_VOLUME).toBe(0.7);
  });

  describe("calculateEffectivePreviewBars", () => {
    it("clamps bars to maximum of 4", () => {
      expect(calculateEffectivePreviewBars(8)).toBe(4);
      expect(calculateEffectivePreviewBars(16)).toBe(4);
      expect(calculateEffectivePreviewBars(32)).toBe(4);
    });

    it("preserves bars less than 4", () => {
      expect(calculateEffectivePreviewBars(2)).toBe(2);
      expect(calculateEffectivePreviewBars(1)).toBe(1);
    });

    it("clamps invalid or negative values to 1", () => {
      expect(calculateEffectivePreviewBars(0)).toBe(1);
      expect(calculateEffectivePreviewBars(-5)).toBe(1);
      expect(calculateEffectivePreviewBars(NaN)).toBe(4);
    });
  });

  describe("normalizeVolumeGain", () => {
    it("handles undefined/null/NaN safely as 1.0", () => {
      expect(normalizeVolumeGain(undefined)).toBe(1.0);
      expect(normalizeVolumeGain(null as any)).toBe(1.0);
      expect(normalizeVolumeGain(NaN)).toBe(1.0);
    });

    it("scales percentage volumes (0..100) down to 0..1", () => {
      expect(normalizeVolumeGain(80)).toBe(0.8);
      expect(normalizeVolumeGain(100)).toBe(1.0);
      expect(normalizeVolumeGain(50)).toBe(0.5);
      expect(normalizeVolumeGain(0)).toBe(0.0);
    });

    it("preserves already normalized gain in 0..1 range", () => {
      expect(normalizeVolumeGain(0.7)).toBe(0.7);
      expect(normalizeVolumeGain(0.25)).toBe(0.25);
    });

    it("clamps out-of-range negative values", () => {
      expect(normalizeVolumeGain(-10)).toBe(0);
    });
  });

  describe("computePreviewFingerprint", () => {
    const baseConfig = {
      genreId: "rock",
      mood: "dark" as const,
      bpm: 120,
      key: "Am",
      timeSignature: "4/4",
      numBars: 8,
      name: "My Song",
    };

    it("generates stable fingerprint", () => {
      const fp1 = computePreviewFingerprint(baseConfig);
      const fp2 = computePreviewFingerprint(baseConfig);
      expect(fp1).toBe(fp2);
    });

    it("ignores name changes in fingerprint", () => {
      const fp1 = computePreviewFingerprint(baseConfig);
      const fp2 = computePreviewFingerprint({ ...baseConfig, name: "Different Name" });
      expect(fp1).toBe(fp2);
    });

    it("changes fingerprint when musical parameters change", () => {
      const fpBase = computePreviewFingerprint(baseConfig);
      expect(computePreviewFingerprint({ ...baseConfig, bpm: 130 })).not.toBe(fpBase);
      expect(computePreviewFingerprint({ ...baseConfig, key: "C" })).not.toBe(fpBase);
      expect(computePreviewFingerprint({ ...baseConfig, genreId: "lofi" })).not.toBe(fpBase);
      expect(computePreviewFingerprint({ ...baseConfig, mood: "chill" as const })).not.toBe(fpBase);
      expect(computePreviewFingerprint({ ...baseConfig, timeSignature: "3/4" })).not.toBe(fpBase);
    });

    it("does not change fingerprint when numBars changes between values >= 4 (same preview duration)", () => {
      const fp8 = computePreviewFingerprint({ ...baseConfig, numBars: 8 });
      const fp16 = computePreviewFingerprint({ ...baseConfig, numBars: 16 });
      expect(fp8).toBe(fp16);
    });

    it("changes fingerprint when numBars changes below 4", () => {
      const fp8 = computePreviewFingerprint({ ...baseConfig, numBars: 8 });
      const fp2 = computePreviewFingerprint({ ...baseConfig, numBars: 2 });
      expect(fp8).not.toBe(fp2);
    });
  });

  describe("generatePreviewTracks", () => {
    it("generates tracks with valid TrackDef structures", () => {
      const tracks = generatePreviewTracks({
        genreId: "electronic",
        bpm: 128,
        key: "Fm",
        timeSignature: "4/4",
        numBars: 8,
      });

      expect(tracks.length).toBeGreaterThan(0);
      for (const t of tracks) {
        expect(t.id).toBeDefined();
        expect(t.name).toBeDefined();
        expect(t.color).toBeDefined();
        expect(t.regions).toBeDefined();
        expect(t.regions.length).toBeGreaterThan(0);
      }
    });
  });
});
