import { describe, it, expect } from "vitest";
import { mergeOperations, createOperation } from "../src/lib/crdt";

describe("crdt mergeOperations M7 same-user dedup", () => {
  it("collapses duplicate modify ops from the same user on the same path (LWW)", () => {
    const op1 = createOperation("u1", "track.update", "tracks.0", { vol: 1 });
    const op2 = createOperation("u1", "track.update", "tracks.0", { vol: 2 });
    const merged = mergeOperations([], [op1, op2]);
    expect(merged.length).toBe(1);
    expect(merged[0].value).toEqual({ vol: 2 });
  });

  it("collapses modify ops from different users on the same path (LWW)", () => {
    const op1 = createOperation("u1", "track.update", "tracks.0", { vol: 1 });
    const op2 = createOperation("u2", "track.update", "tracks.0", { vol: 2 });
    const merged = mergeOperations([], [op1, op2]);
    expect(merged.length).toBe(1);
    expect(merged[0].value).toEqual({ vol: 2 });
  });

  it("keeps modify ops on different paths", () => {
    const op1 = createOperation("u1", "track.update", "tracks.0", { vol: 1 });
    const op2 = createOperation("u1", "track.update", "tracks.1", { vol: 2 });
    const merged = mergeOperations([], [op1, op2]);
    expect(merged.length).toBe(2);
  });

  it("dedups add ops with the same value id from the same user", () => {
    const a1 = createOperation("u1", "track.add", "tracks", { id: "trk1" });
    const a2 = createOperation("u1", "track.add", "tracks", { id: "trk1" });
    const merged = mergeOperations([], [a1, a2]);
    expect(merged.length).toBe(1);
  });

  it("does not dedup add ops with different value ids", () => {
    const a1 = createOperation("u1", "track.add", "tracks", { id: "trk1" });
    const a2 = createOperation("u1", "track.add", "tracks", { id: "trk2" });
    const merged = mergeOperations([], [a1, a2]);
    expect(merged.length).toBe(2);
  });
});
