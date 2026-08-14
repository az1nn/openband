import { describe, it, expect } from "vitest";
import { compactOperations, createOperation, mergeOperations } from "../src/lib/crdt";

describe("Prioritized Roadmap Enhancements Suite (Focus 3, 5, 2)", () => {
  it("compacts CRDT operation history correctly (Focus 2)", () => {
    const ops = [];
    for (let i = 0; i < 1200; i++) {
      ops.push(createOperation("client-1", "note.add", `notes[${i}]`, { pitch: 60 }));
    }
    expect(ops.length).toBe(1200);
    const compacted = compactOperations(ops, 500);
    expect(compacted.length).toBe(500);
    expect(compacted[compacted.length - 1].path).toBe("notes[1199]");
  });

  it("handles CRDT merge operations with compacted history", () => {
    const op1 = createOperation("client-a", "track.update", "tempo", 120);
    const op2 = createOperation("client-b", "track.update", "tempo", 140);
    const merged = mergeOperations([op1], [op2]);
    const compacted = compactOperations(merged, 1);
    expect(compacted.length).toBe(1);
    expect(compacted[0].value).toBe(140);
  });
});
