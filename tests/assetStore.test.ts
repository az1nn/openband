import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveAsset,
  resolveAssetUrl,
  resolveAssetUrlSync,
  revokeAssetCache,
  deleteAssetUrl,
  ASSET_PREFIX,
} from "../src/lib/assetStore";
import { createFakeIndexedDb } from "./helpers/fakeIndexedDb";

let counter = 0;
let idb: ReturnType<typeof createFakeIndexedDb>;

function makeBlob(): Blob {
  return new Blob([new Uint8Array([1, 2, 3])], { type: "audio/wav" });
}

describe("assetStore", () => {
  beforeEach(() => {
    idb = createFakeIndexedDb();
    vi.stubGlobal("indexedDB", idb.indexedDB);
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:live-" + counter++,
      revokeObjectURL: vi.fn(),
    });
    revokeAssetCache();
    counter = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saveAsset returns asset:// pointer only after IndexedDB stores bytes", async () => {
    const pointer = await saveAsset(makeBlob());
    expect(pointer.startsWith(ASSET_PREFIX)).toBe(true);
    const id = pointer.slice(ASSET_PREFIX.length);
    expect(idb.stores.assets?.has(id)).toBe(true);
    const live = await resolveAssetUrl(pointer);
    expect(live.startsWith("blob:")).toBe(true);
  });

  it("rejects rather than claiming durability when IndexedDB write fails", async () => {
    idb.setFailWrites(true);
    await expect(saveAsset(makeBlob())).rejects.toThrow("QuotaExceededError");
  });

  it("rejects when IndexedDB is unavailable", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(saveAsset(makeBlob())).rejects.toThrow("IndexedDB is not available");
  });

  it("resolveAssetUrl passes through https url unchanged", async () => {
    await expect(resolveAssetUrl("https://x/y.wav")).resolves.toBe("https://x/y.wav");
  });

  it("resolveAssetUrl passes through blob url unchanged", async () => {
    await expect(resolveAssetUrl("blob:https://x/abc")).resolves.toBe("blob:https://x/abc");
  });

  it("resolveAssetUrl reuses cached url", async () => {
    const pointer = await saveAsset(makeBlob());
    const a = await resolveAssetUrl(pointer);
    const b = await resolveAssetUrl(pointer);
    expect(a).toBe(b);
  });

  it("revokeAssetCache clears URL cache without deleting persisted bytes", async () => {
    const pointer = await saveAsset(makeBlob());
    await resolveAssetUrl(pointer);
    expect(() => revokeAssetCache()).not.toThrow();
    expect(resolveAssetUrlSync(pointer)).toBe(pointer);
    expect(idb.stores.assets?.has(pointer.slice(ASSET_PREFIX.length))).toBe(true);
  });

  it("deleteAssetUrl removes cached pointer and persisted bytes", async () => {
    const pointer = await saveAsset(makeBlob());
    const live = await resolveAssetUrl(pointer);
    expect(live.startsWith("blob:")).toBe(true);
    deleteAssetUrl(pointer);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(resolveAssetUrlSync(pointer)).toBe(pointer);
    expect(idb.stores.assets?.has(pointer.slice(ASSET_PREFIX.length))).toBe(false);
  });
});
