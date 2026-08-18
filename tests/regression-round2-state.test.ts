import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { mergeOperations, createOperation } from "../src/lib/crdt";
import { mergeSnapshotIntoState } from "../src/lib/snapshotManager";
import {
  initBranching,
  createBranch,
  applyOperationToBranch,
  mergeBranch,
} from "../src/lib/projectBranching";
import {
  setOnProjectSaved,
  saveProject,
} from "../src/lib/projectStore";
import { useCollaboration } from "../src/lib/collaboration";
import {
  registerDefaultCommands,
  getCommand,
} from "../src/lib/commandRegistry";

// ---------------------------------------------------------------------------
// In-memory IndexedDB mock (jsdom has no IDB). Exposes the underlying store
// map so tests can assert queued entries survived a failed flush.
// ---------------------------------------------------------------------------
function createFakeIdb() {
  const stores: Record<string, Map<string, unknown>> = {};
  const getStore = (name: string) => {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  };

  class Req {
    result: unknown = undefined;
    onsuccess: ((e: unknown) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    onupgradeneeded: ((e: unknown) => void) | null = null;
    constructor(result?: unknown) {
      this.result = result;
    }
    succeed() {
      if (this.onsuccess) this.onsuccess({ target: this });
    }
  }

  class FakeTx {
    storeName: string;
    oncomplete: (() => void) | null = null;
    onerror: ((e?: unknown) => void) | null = null;
    onabort: (() => void) | null = null;
    constructor(storeName: string) {
      this.storeName = storeName;
    }
    objectStore(name: string) {
      return new FakeObjectStore(name, this);
    }
    complete() {
      if (this.oncomplete) this.oncomplete();
    }
  }

  class FakeObjectStore {
    name: string;
    tx: FakeTx;
    constructor(name: string, tx: FakeTx) {
      this.name = name;
      this.tx = tx;
    }
    put(record: { id: string }) {
      getStore(this.name).set(record.id, record);
      const r = new Req();
      Promise.resolve().then(() => {
        r.succeed();
        this.tx.complete();
      });
      return r;
    }
    delete(id: string) {
      getStore(this.name).delete(id);
      const r = new Req();
      Promise.resolve().then(() => {
        r.succeed();
        this.tx.complete();
      });
      return r;
    }
    openCursor() {
      const data = getStore(this.name);
      const entries = Array.from(data.values());
      const r = new Req();
      Promise.resolve().then(() => {
        let i = 0;
        const step = () => {
          if (i < entries.length) {
            r.result = {
              value: entries[i],
              continue: () => {
                i++;
                step();
              },
            };
            if (r.onsuccess) r.onsuccess({ target: r });
          } else {
            r.result = null;
            if (r.onsuccess) r.onsuccess({ target: r });
            // Source `readQueuedOperations` only resolves on tx.onerror; drive it
            // once the cursor is exhausted so the (fake) read completes.
            if (this.tx.onerror) (this.tx.onerror as any)({ target: this.tx });
          }
        };
        step();
      });
      return r;
    }
  }

  class FakeDB {
    objectStoreNames = {
      contains: (n: string) => !!stores[n],
    };
    createObjectStore(name: string) {
      getStore(name);
      return new FakeObjectStore(name, new FakeTx(name));
    }
    transaction(name: string) {
      return new FakeTx(name);
    }
  }

  const fake = {
    open(_name: string, _version: number) {
      const db = new FakeDB();
      const r = new Req(db);
      Promise.resolve().then(() => {
        if (r.onupgradeneeded) r.onupgradeneeded({ target: r });
        if (r.onsuccess) r.onsuccess({ target: r });
      });
      return r;
    },
  };

  return { fake, stores };
}

// Controllable EventSource that lets the test manually fire `onopen` so the
// internal `flushQueue` runs against the mocked fetch.
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((e: unknown) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }
  close() {}
}

describe("STATE regression: crdt mergeOperations scale", () => {
  it("merges >100k ops without RangeError and advances logical clock", () => {
    // 150k ops (>100k input) cycling through 1000 distinct value ids so the
    // merge's dedup `findIndex` short-circuits — keeps the test fast while still
    // exercising the no-spread merge path.
    const DISTINCT = 250;
    const ops: any[] = [];
    for (let i = 1; i <= 150000; i++) {
      ops.push({
        id: `op-${i}`,
        userId: "u",
        timestamp: i,
        type: "track.add",
        path: "tracks",
        value: { id: `t${i % DISTINCT}` },
        clientId: "c",
      });
    }

    let result: any[] = [];
    expect(() => {
      result = mergeOperations([], ops);
    }).not.toThrow();

    // Idempotent re-merge yields the same materialized op set.
    const reMerged = mergeOperations(result, []);
    expect(reMerged.length).toBe(result.length);
    expect(
      JSON.stringify(reMerged.map((o) => o.id)),
    ).toBe(JSON.stringify(result.map((o) => o.id)));

    // Logical clock now reflects the injected max timestamp (probe > 150000).
    const probe = createOperation("u", "track.add", "tracks", { id: "probe" });
    expect(probe.timestamp).toBeGreaterThan(150000);
  });
});

describe("STATE regression: collaboration preserves queued ops on flush failure", () => {
  let idb: ReturnType<typeof createFakeIdb>;

  beforeEach(() => {
    idb = createFakeIdb();
    FakeEventSource.instances = [];
    vi.stubGlobal("indexedDB", idb.fake);
    vi.stubGlobal("EventSource", FakeEventSource as any);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps offline operations in the queue after a failed flush", async () => {
    const render: any = renderHook(() =>
      useCollaboration({
        projectId: "proj-1",
        userId: "u1",
      }),
    );
    const result = render.result;

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Fire the first (empty) flush via the fake EventSource onopen.
    const es = FakeEventSource.instances[0];
    if (es && es.onopen) {
      act(() => {
        es.onopen!();
      });
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Send an op while online: fetch rejects -> op enqueued offline.
    act(() => {
      result.current.sendOperation("track.add", "tracks", { id: "q1" });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    // Trigger a failed flush.
    if (es && es.onopen) {
      act(() => {
        es.onopen!();
      });
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    const store = idb.stores["pending-operations"];
    expect(store).toBeDefined();
    const keys = [...(store?.keys() ?? [])];
    expect(keys.some((k) => String(k).startsWith("proj-1:queue:"))).toBe(true);
  });
});

describe("STATE regression: projectStore setOnProjectSaved unsubscribe", () => {
  it("removes only the listener whose unsubscribe was called", () => {
    const aCalls: string[] = [];
    const bCalls: string[] = [];

    const unsubA = setOnProjectSaved((id) => aCalls.push(id));
    const unsubB = setOnProjectSaved((id) => bCalls.push(id));

    unsubA();

    const ok = saveProject("p1", {
      title: "Test",
      genre: "lofi",
      key: "C",
      bpm: 90,
      tracks: [],
      groups: [],
      buses: [],
      trackAssignments: {},
      masterPlugins: [],
      masteringChain: [],
      sendBuses: [],
      trackAmpChains: {},
      mixSnapshots: [],
      activeMixId: undefined,
      metronome: {
        bpm: 120,
        timeSig: [4, 4],
        accentInterval: 4,
        volume: 0.5,
        enabled: false,
        countIn: false,
        countInBars: 2,
      },
      recordSettings: {
        armed: false,
        inputSource: "mic",
        quality: "high",
        sampleRate: 44100,
        mono: false,
        preRoll: 0,
      },
    } as any);

    expect(ok).toBe(true);
    expect(aCalls.length).toBe(0);
    expect(bCalls.length).toBe(1);
    expect(bCalls[0]).toBe("p1");

    unsubB();
  });
});

describe("STATE regression: snapshotManager bus replay", () => {
  it("applies bus.add, bus.update and bus.remove on replay", () => {
    const base = { buses: [] as any[] };

    const addOp = createOperation("u", "bus.add", "buses", {
      id: "b1",
      name: "Bus1",
    });
    const updOp = createOperation("u", "bus.update", "buses", {
      id: "b1",
      name: "Bus1Updated",
    });
    const remOp = createOperation("u", "bus.remove", "buses", { id: "b1" });

    const afterAdd = mergeSnapshotIntoState(
      JSON.parse(JSON.stringify(base)),
      [addOp],
    );
    expect((afterAdd.buses as any[]).length).toBe(1);
    expect((afterAdd.buses as any[])[0].name).toBe("Bus1");

    const afterUpdate = mergeSnapshotIntoState(
      JSON.parse(JSON.stringify(base)),
      [addOp, updOp],
    );
    expect((afterUpdate.buses as any[])[0].name).toBe("Bus1Updated");

    const afterRemove = mergeSnapshotIntoState(
      JSON.parse(JSON.stringify(base)),
      [addOp, updOp, remOp],
    );
    expect((afterRemove.buses as any[]).length).toBe(0);
  });
});

describe("STATE regression: projectBranching accept/reject filtering", () => {
  it("merges accepted added + modified track but drops unaccepted added track", () => {
    const mainState: any = {
      tracks: [{ id: "t1", name: "Main" }],
      buses: [],
      masterPlugins: [],
      crdtOperations: [],
      metadata: {},
    };
    initBranching(mainState);

    const branch = createBranch("feat")!;
    applyOperationToBranch(branch.id, {
      userId: "u",
      type: "track.add",
      path: "tracks",
      value: { id: "tA", name: "AddedA" },
    } as any);
    applyOperationToBranch(branch.id, {
      userId: "u",
      type: "track.add",
      path: "tracks",
      value: { id: "tB", name: "AddedB" },
    } as any);
    applyOperationToBranch(branch.id, {
      userId: "u",
      type: "track.update",
      path: "tracks",
      value: { id: "t1", name: "Updated" },
    } as any);

    const merged = mergeBranch(branch.id, ["track:tA", "track:t1"])!;
    expect(merged).not.toBeNull();

    const ids = merged.tracks.map((t: any) => t.id);
    expect(ids).toContain("tA");
    expect(ids).not.toContain("tB");

    const t1 = merged.tracks.find((t: any) => t.id === "t1")!;
    expect(t1.name).toBe("Updated");

    // No divergence: rejected track's op must not appear in crdtOperations.
    const hasRejected = merged.crdtOperations.some(
      (o: any) => o.type === "track.add" && (o.value as any)?.id === "tB",
    );
    expect(hasRejected).toBe(false);
  });
});

describe("STATE regression: commandRegistry distinct transport bindings", () => {
  it("transport.play and transport.stop resolve to different bindings", () => {
    registerDefaultCommands({});
    const play = getCommand("transport.play");
    const stop = getCommand("transport.stop");

    expect(play?.shortcut).toBe("Space");
    expect(stop?.shortcut).toBe("Shift+Space");
    expect(play?.shortcut).not.toBe(stop?.shortcut);
  });
});
