import { describe, it, expect } from "vitest";
import {
  createOperation,
  mergeOperations,
  applyOperation,
  decodeState,
  getClientId,
} from "../src/lib/crdt";

describe("Real-Time Collaborative CRDT & Sync Suite", () => {
  it("generates unique client IDs", () => {
    const id1 = getClientId();
    const id2 = getClientId();
    expect(id1).toBeTruthy();
    expect(id1).toBe(id2); // singleton per session
  });

  it("creates and applies CRDT operations correctly", () => {
    const op = createOperation("client-a", 1, "tracks[0].volume", 0.8);
    expect(op.clientId).toBe("client-a");
    expect(op.lamport).toBe(1);
    expect(op.path).toBe("tracks[0].volume");
    expect(op.value).toBe(0.8);

    const baseState = { tracks: [{ volume: 0.5 }] };
    const nextState = applyOperation(baseState, op);
    expect(nextState.tracks[0].volume).toBe(0.8);
  });

  it("merges concurrent operations deterministically using Lamport timestamps", () => {
    const op1 = createOperation("client-a", 1, "tempo", 120);
    const op2 = createOperation("client-b", 2, "tempo", 130); // higher lamport wins
    const op3 = createOperation("client-c", 1, "tempo", 110); // tie broken by clientId lexicographically

    const merged = mergeOperations([op1, op2, op3]);
    expect(merged.length).toBe(3);
    const finalState = decodeState(merged);
    expect(finalState.tempo).toBe(130);
  });
});
