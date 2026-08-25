import { describe, it, expect } from "vitest";
import { mergeOperations, type CrdtOperation } from "../src/lib/crdt";
import * as branching from "../src/lib/projectBranching";

function emptyState() {
  return {
    tracks: [] as any[],
    buses: [] as any[],
    masterPlugins: [] as any[],
    crdtOperations: [] as CrdtOperation[],
    metadata: {} as Record<string, unknown>,
  };
}

function track(id: string, name: string, volume = 75) {
  return { id, name, volume };
}

let clock = 0;
function op(
  id: string,
  type: CrdtOperation["type"],
  path: string,
  value: unknown,
  deps?: string[],
): CrdtOperation {
  clock++;
  return {
    id,
    userId: "local",
    timestamp: clock,
    type,
    path,
    value,
    clientId: "client-test",
    deps,
  };
}

describe("crdt mergeOperations causal-predecessor hold (M9)", () => {
  it("drops an op whose explicit deps are never met", () => {
    const b = op("b", "track.add", "tracks", { id: "t2" }, ["missing"]);
    const merged = mergeOperations([], [b]);
    expect(merged).toHaveLength(0);
  });

  it("applies an op once its deps become present", () => {
    const a = op("a", "track.add", "tracks", { id: "t1" });
    const b = op("b", "track.update", "tracks", { id: "t1", volume: 5 }, ["a"]);
    const merged = mergeOperations([], [b, a]);
    expect(merged.map((m) => m.id).sort()).toEqual(["a", "b"]);
  });

  it("is unaffected when no deps are declared", () => {
    const a = op("a", "track.add", "tracks", { id: "t1" });
    const b = op("b", "track.add", "tracks", { id: "t2" });
    const merged = mergeOperations([], [b, a]);
    expect(merged).toHaveLength(2);
  });
});

describe("projectBranching mergeBranch single source of truth (M9)", () => {
  it("applies a branch update via op-log replay", () => {
    branching.initBranching({ ...emptyState(), tracks: [track("t1", "Vocal", 10)] });
    const branch = branching.createBranch("feature")!;
    branching.applyOperationToBranch(branch.id, {
      userId: "local",
      type: "track.update",
      path: "tracks",
      value: { id: "t1", volume: 20 },
    });
    const merged = branching.mergeBranch(branch.id)!;
    expect(merged.tracks[0].volume).toBe(20);
  });

  it("is idempotent — re-merge does not double-apply", () => {
    branching.initBranching({ ...emptyState(), tracks: [track("t1", "Vocal", 10)] });
    const branch = branching.createBranch("feature")!;
    branching.applyOperationToBranch(branch.id, {
      userId: "local",
      type: "track.update",
      path: "tracks",
      value: { id: "t1", volume: 20 },
    });
    branching.mergeBranch(branch.id);
    const first = branching.getMainState()!.tracks[0].volume;
    branching.mergeBranch(branch.id);
    const second = branching.getMainState()!.tracks[0].volume;
    expect(first).toBe(20);
    expect(second).toBe(20);
  });

  it("merges an added track via op-log (no field-diff)", () => {
    branching.initBranching(emptyState());
    const branch = branching.createBranch("feature")!;
    branching.applyOperationToBranch(branch.id, {
      userId: "local",
      type: "track.add",
      path: "tracks",
      value: track("t2", "Drums"),
    });
    const merged = branching.mergeBranch(branch.id)!;
    expect(merged.tracks.find((t: any) => t.id === "t2")).toBeDefined();
  });

  it("selective acceptChanges still excludes unlisted added tracks", () => {
    branching.initBranching(emptyState());
    const branch = branching.createBranch("feature")!;
    branching.applyOperationToBranch(branch.id, {
      userId: "local",
      type: "track.add",
      path: "tracks",
      value: track("t2", "Drums"),
    });
    branching.applyOperationToBranch(branch.id, {
      userId: "local",
      type: "track.add",
      path: "tracks",
      value: track("t3", "Bass"),
    });
    const merged = branching.mergeBranch(branch.id, ["track:t2"])!;
    expect(merged.tracks.find((t: any) => t.id === "t2")).toBeDefined();
    expect(merged.tracks.find((t: any) => t.id === "t3")).toBeUndefined();
  });
});
