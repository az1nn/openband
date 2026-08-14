import { describe, it, expect } from "vitest";
import { GENRES, MOODS, generateTracksForGenre } from "../src/lib/projectTemplates";

describe("Advanced Project Templates & MIDI Patterns Suite", () => {
  it("generates valid MIDI notes for every genre and mood combination", () => {
    for (const genre of GENRES) {
      for (const mood of [undefined, MOODS[0], MOODS[4]]) {
        const tracks = generateTracksForGenre(genre.id, genre.defaultBpm, genre.defaultKey, mood?.id, 8, "4/4");
        expect(tracks.length).toBeGreaterThan(0);
        for (const track of tracks) {
          if (track.midiNotes) {
            expect(track.midiNotes.length).toBeGreaterThan(0);
            for (const note of track.midiNotes) {
              expect(note.pitch).toBeGreaterThanOrEqual(0);
              expect(note.pitch).toBeLessThanOrEqual(127);
              expect(note.duration).toBeGreaterThan(0);
              expect(note.velocity).toBeGreaterThanOrEqual(1);
              expect(note.velocity).toBeLessThanOrEqual(127);
            }
          }
        }
      }
    }
  });

  it("handles fallback tracks when genre is unknown", () => {
    const tracks = generateTracksForGenre("unknown-genre-id", 120, "C", undefined, 8, "4/4");
    expect(tracks.length).toBeGreaterThan(0);
  });
});
