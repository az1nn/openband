import { describe, it, expect } from "vitest";
import { setupProjectStarter, regionDurationFor } from "../src/lib/projectStarter";
import { GENRES, TIME_SIGNATURES } from "../src/lib/projectTemplates";

describe("Advanced Project Creation Tools Tests", () => {
  it("covers all registered genres in GENRES", () => {
    expect(GENRES.length).toBeGreaterThan(0);
    for (const genre of GENRES) {
      const res = setupProjectStarter({
        name: `Project ${genre.name}`,
        genreId: genre.id,
        bpm: genre.defaultBpm,
        numBars: 16,
        timeSignature: "4/4",
        key: "C",
      });
      expect(res.genreId).toBe(genre.id);
      expect(res.bpm).toBe(genre.defaultBpm);
      expect(res.tracks.length).toBe(genre.suggestedTracks.length);
    }
  });

  it("covers all time signatures", () => {
    for (const ts of TIME_SIGNATURES) {
      const [beats] = ts.split("/").map(Number);
      const dur = regionDurationFor(4, beats, 120);
      expect(dur).toBe((4 * beats * 60) / 120);
    }
  });

  it("handles various musical keys correctly", () => {
    const keys = ["C", "Cm", "F#", "A#", "Am"];
    for (const key of keys) {
      const res = setupProjectStarter({
        name: `Key ${key}`,
        genreId: GENRES[0].id,
        key,
      });
      expect(res.key).toBe(key);
    }
  });
});
