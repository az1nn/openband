import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { webcrypto } from "node:crypto";
import { btoa, atob } from "node:buffer";

const mockPlatform = { OS: "web" as string };
vi.mock("react-native", () => ({
  Platform: { get OS() { return mockPlatform.OS; } },
}));

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "xx" }],
}));

import { useKeyboardShortcuts } from "../src/lib/keyboard";
import { generateTracksForGenre } from "../src/lib/projectTemplates";
import {
  createOpenBandArchive,
  parseOpenBandArchive,
  projectToOpenBand,
} from "../src/lib/openbandFormat";
import {
  encryptProjectToJson,
  decryptProjectFromJson,
} from "../src/lib/projectEncryption";

function pressKey(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

describe("keyboard shortcuts lowercased keys", () => {
  beforeEach(() => {
    mockPlatform.OS = "web";
  });

  it("Delete key fires delete", () => {
    const onDelete = vi.fn();
    renderHook(() => useKeyboardShortcuts({ delete: onDelete }));
    pressKey("Delete");
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("Escape key fires escape", () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardShortcuts({ escape: onEscape }));
    pressKey("Escape");
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("Backspace key fires delete", () => {
    const onDelete = vi.fn();
    renderHook(() => useKeyboardShortcuts({ delete: onDelete }));
    pressKey("Backspace");
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("uppercase DELETE still fires delete (lowercased comparison)", () => {
    const onDelete = vi.fn();
    renderHook(() => useKeyboardShortcuts({ delete: onDelete }));
    pressKey("DELETE");
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

describe("projectTemplates unique plugin ids", () => {
  it("generateTracksForGenre produces unique plugin ids across all tracks", () => {
    const tracks = generateTracksForGenre("edm", 128, "F#m", undefined, 4);
    const ids: string[] = [];
    for (const t of tracks) {
      for (const p of t.plugins) ids.push(p.id);
    }
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("plugin ids include track index (no cross-track collision)", () => {
    const tracks = generateTracksForGenre("pop", 120, "C", undefined, 4);
    const seen = new Set<string>();
    for (const t of tracks) {
      for (const p of t.plugins) {
        expect(seen.has(p.id)).toBe(false);
        seen.add(p.id);
      }
    }
  });
});

function readU32(d: Uint8Array, o: number): number {
  return ((d[o] << 24) | (d[o + 1] << 16) | (d[o + 2] << 8) | d[o + 3]) >>> 0;
}

function locateEntry(
  data: Uint8Array,
  name: string,
): { start: number; len: number } | null {
  let o = 0;
  o += "OPENBAND".length;
  const vlen = readU32(data, o);
  o += 4 + vlen;
  const count = readU32(data, o);
  o += 4;
  for (let i = 0; i < count; i++) {
    const nlen = readU32(data, o);
    o += 4;
    const nm = new TextDecoder().decode(data.slice(o, o + nlen));
    o += nlen;
    const dlen = readU32(data, o);
    o += 4;
    o += 4;
    if (nm === name) return { start: o, len: dlen };
    o += dlen;
  }
  return null;
}

describe("openbandFormat CRC + round-trip", () => {
  function buildProject() {
    const tracks = generateTracksForGenre("pop", 120, "C", undefined, 2);
    return projectToOpenBand(
      tracks,
      [],
      [],
      [],
      [],
      [],
      {},
      {},
      { name: "RT Project", bpm: 120 },
    );
  }

  it("parseOpenBandArchive detects corruption (CRC32 mismatch -> null)", () => {
    const archive = createOpenBandArchive(buildProject());
    const loc = locateEntry(archive, "project.json");
    expect(loc).not.toBeNull();
    archive[loc!.start + 10] ^= 0xff;
    expect(parseOpenBandArchive(archive)).toBeNull();
  });

  it("createOpenBandArchive / parseOpenBandArchive round-trips a project", () => {
    const tracks = generateTracksForGenre("pop", 120, "C", undefined, 2);
    const project = projectToOpenBand(
      tracks,
      [],
      [],
      [],
      [],
      [],
      {},
      {},
      { name: "RT Project", bpm: 120 },
    );
    const parsed = parseOpenBandArchive(createOpenBandArchive(project));
    expect(parsed).not.toBeNull();
    expect(parsed!.metadata.name).toBe("RT Project");
    expect(parsed!.tracks).toEqual(tracks);
  });
});

describe("projectEncryption large payload round-trip", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", webcrypto);
    vi.stubGlobal("btoa", btoa);
    vi.stubGlobal("atob", atob);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encrypts and decrypts a 200000-byte payload without RangeError", async () => {
    const big = { data: "x".repeat(200000), nested: [1, 2, 3] };
    const json = await encryptProjectToJson(big, "s3cret");
    const out = (await decryptProjectFromJson(json, "s3cret")) as {
      data: string;
    };
    expect(out.data).toBe(big.data);
  });
});

describe("i18n initialLanguage fallback", () => {
  it("defaults to en when device language is not in resources", async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    const mod = await import("../src/lib/i18n");
    const instance = mod.default as {
      language: string;
      isInitialized: boolean;
    };
    for (let i = 0; i < 50; i++) {
      if (instance.isInitialized) break;
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(instance.language).toBe("en");
  });
});
