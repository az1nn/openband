import { describe, it, expect } from "vitest";
import {
  encryptProject,
  decryptProject,
  encryptProjectToJson,
  decryptProjectFromJson,
  generateProjectKey,
} from "../src/lib/projectEncryption";
import * as timeStretch from "../src/lib/timeStretchVocoded";
import { THREE_CDNS } from "../src/lib/loadThree";

describe("projectEncryption round-trip and tamper resistance", () => {
  const payload = {
    id: "proj-123",
    name: "My Track",
    tracks: [{ name: "vox", gain: 0.8 }],
    nested: { a: { b: [1, 2, 3] } },
  };

  it("encrypt -> decrypt reproduces the original object exactly", async () => {
    const enc = await encryptProject(payload, "s3cret");
    const dec = (await decryptProject(enc, "s3cret")) as typeof payload;
    expect(dec).toEqual(payload);
  });

  it("JSON envelope round-trip reproduces the original", async () => {
    const json = await encryptProjectToJson(payload, "s3cret");
    const dec = (await decryptProjectFromJson(json, "s3cret")) as typeof payload;
    expect(dec).toEqual(payload);
  });

  it("fails to decrypt with the wrong password", async () => {
    const enc = await encryptProject(payload, "s3cret");
    await expect(decryptProject(enc, "wrong-pass")).rejects.toBeTruthy();
  });

  it("fails to decrypt tampered ciphertext", async () => {
    const enc = await encryptProject(payload, "s3cret");
    const bytes = new Uint8Array(enc.ciphertext);
    bytes[bytes.length - 1] ^= 0xff;
    const tampered = { ...enc, ciphertext: bytes.buffer };
    await expect(decryptProject(tampered, "s3cret")).rejects.toBeTruthy();
  });

  it("generateProjectKey returns a non-empty key", () => {
    const key = generateProjectKey();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(0);
  });
});

describe("timeStretchVocoded loads and exposes callables", () => {
  it("exports its main functions without throwing on import", () => {
    expect(typeof timeStretch.phaseVocoderStretch).toBe("function");
    expect(typeof timeStretch.wsolaTimeStretch).toBe("function");
    expect(typeof timeStretch.createTimeStretchNode).toBe("function");
  });

  it("main export is callable on a tiny buffer when AudioBuffer is available", async () => {
    if (typeof (globalThis as any).AudioBuffer === "undefined") {
      expect(true).toBe(true);
      return;
    }
    const sr = 8000;
    const len = 1024;
    const buf = new (globalThis as any).AudioBuffer({ numberOfChannels: 1, length: len, sampleRate: sr });
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.sin(i / 10);
    const out = await timeStretch.wsolaTimeStretch(buf, 1.0);
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("loadThree fallback chain is exported and non-empty", () => {
  it("THREE_CDNS is a non-empty array of https URLs", () => {
    expect(Array.isArray(THREE_CDNS)).toBe(true);
    expect(THREE_CDNS.length).toBeGreaterThanOrEqual(3);
    for (const url of THREE_CDNS) {
      expect(typeof url).toBe("string");
      expect(url.startsWith("https://")).toBe(true);
    }
  });
});
