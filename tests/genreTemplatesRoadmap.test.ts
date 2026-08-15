import { describe, it, expect } from "vitest";
import { GENRES, GENRE_PLUGINS, getDrumPattern, generateTracksForGenre } from "../src/lib/projectTemplates";

describe("Roadmap Genre Templates (Trap, House, Dancehall)", () => {
  it("adds trap, house, and dancehall genres with correct bpmRange", () => {
    const trap = GENRES.find((g) => g.id === "trap");
    const house = GENRES.find((g) => g.id === "house");
    const dancehall = GENRES.find((g) => g.id === "dancehall");

    expect(trap).toBeDefined();
    expect(trap?.bpmRange).toEqual([130, 150]);
    expect(trap?.defaultBpm).toBe(145);

    expect(house).toBeDefined();
    expect(house?.bpmRange).toEqual([120, 130]);
    expect(house?.defaultBpm).toBe(124);

    expect(dancehall).toBeDefined();
    expect(dancehall?.bpmRange).toEqual([90, 110]);
    expect(dancehall?.defaultBpm).toBe(100);
  });

  it("attaches expected plugin chains via GENRE_PLUGINS", () => {
    expect(GENRE_PLUGINS.trap.map((p) => p.type)).toEqual(
      expect.arrayContaining(["distortion", "compressor"]),
    );
    expect(GENRE_PLUGINS.house.map((p) => p.type)).toEqual(
      expect.arrayContaining(["compressor", "reverb"]),
    );
    expect(GENRE_PLUGINS.dancehall.map((p) => p.type)).toEqual(
      expect.arrayContaining(["reverb", "delay"]),
    );
  });

  it("trap drum pattern has extended 808 kick on every beat and snare on 2 & 4", () => {
    const notes = getDrumPattern("trap", 0.5, 1);
    expect(notes.length).toBeGreaterThan(0);
    const kicks = notes.filter((n) => n.pitch === 36);
    const snares = notes.filter((n) => n.pitch === 38);
    expect(kicks.length).toBe(4);
    expect(kicks.every((n) => n.duration > 0.5 * 0.5)).toBe(true);
    expect(snares).toEqual([
      expect.objectContaining({ start: 0.5 }),
      expect.objectContaining({ start: 1.5 }),
    ]);
  });

  it("house drum pattern has four-on-the-floor kick and claps on 2 & 4", () => {
    const notes = getDrumPattern("house", 0.5, 1);
    expect(notes.length).toBeGreaterThan(0);
    const kicks = notes.filter((n) => n.pitch === 36);
    expect(kicks.map((n) => n.start)).toEqual([0, 0.5, 1.0, 1.5]);
    const claps = notes.filter((n) => n.pitch === 38);
    expect(claps).toEqual([
      expect.objectContaining({ start: 0.5 }),
      expect.objectContaining({ start: 1.5 }),
    ]);
  });

  it("dancehall drum pattern has dembow snare placement", () => {
    const notes = getDrumPattern("dancehall", 0.5, 1);
    expect(notes.length).toBeGreaterThan(0);
    const snares = notes.filter((n) => n.pitch === 38);
    expect(snares).toEqual([
      expect.objectContaining({ start: 0.5 }),
      expect.objectContaining({ start: 1.5 }),
    ]);
    const kicks = notes.filter((n) => n.pitch === 36);
    expect(kicks.map((n) => n.start)).toEqual([0, 1.0]);
  });

  it("generateTracksForGenre('house') returns the 4 suggested tracks", () => {
    const tracks = generateTracksForGenre("house", 124, "Am", undefined, 8, "4/4");
    expect(tracks.length).toBe(4);
    expect(tracks.map((t) => t.name)).toEqual([
      "Kick Bass",
      "Drums",
      "Synth Bass",
      "Vocal Chops",
    ]);
  });
});
