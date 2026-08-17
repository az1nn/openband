import { describe, it, expect } from "vitest";
import {
  createOperation,
  mergeOperations,
  applyOperation,
  encodeState,
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
    const op = createOperation("user-a", "track.add", "tracks", { id: "t1", volume: 0.5 });
    expect(op.userId).toBe("user-a");
    expect(op.path).toBe("tracks");
    expect(op.value).toEqual({ id: "t1", volume: 0.5 });
    expect(typeof op.timestamp).toBe("number");
    expect(op.clientId).toBe(getClientId());

    const baseState = { tracks: [] as Record<string, unknown>[] };
    const nextState = applyOperation(baseState, op) as {
      tracks: Record<string, unknown>[];
    };
    expect(nextState.tracks.length).toBe(1);
    expect(nextState.tracks[0].id).toBe("t1");
  });

  it("merges concurrent operations deterministically using timestamps", () => {
    const op1 = createOperation("client-a", "mix.update", "tempo", 120);
    const op2 = createOperation("client-b", "mix.update", "tempo", 130);
    const op3 = createOperation("client-c", "mix.update", "tempo", 110);

    const merged = mergeOperations([], [op1, op2, op3]);
    expect(merged.length).toBe(1);
    expect(merged[0].value).toBe(110);
    expect(merged[0].userId).toBe("client-c");
  });

  it("encodes and decodes state round-trip", () => {
    const op1 = createOperation("client-a", "mix.update", "tempo", 120);
    const op2 = createOperation("client-b", "mix.update", "tempo", 130);
    const encoded = encodeState([op1, op2]);
    const decoded = decodeState(encoded);
    expect(decoded.clientId).toBe(getClientId());
    expect(decoded.operations.length).toBe(2);
    expect(decoded.operations[1].value).toBe(130);
  });
});
