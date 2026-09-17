import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normalizeElectronLock } from "../scripts/normalize-electron-ci-lock.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(repoRoot, "electron", "package-lock.json");

function loadLock() {
  return JSON.parse(readFileSync(lockPath, "utf8"));
}

describe("Electron CI lock normalization", () => {
  it("repairs the known optional-peer postject stub deterministically", () => {
    const source = loadLock();
    const first = normalizeElectronLock(structuredClone(source));

    expect(first.changed).toBe(true);
    expect(first.lock.packages["node_modules/postject"]).toMatchObject({
      version: "1.0.0-alpha.6",
      resolved: "https://registry.npmjs.org/postject/-/postject-1.0.0-alpha.6.tgz",
      integrity:
        "sha512-b9Eb8h2eVqNE8edvKdwqkrY6O7kAwmI8kcnBv1NScolYJbo59XUF0noFq+lxbC1yN20bmC0WBEbDC5H/7ASb0A==",
      optional: true,
      peer: true,
      dependencies: { commander: "^9.4.0" },
      bin: { postject: "dist/cli.js" },
    });
    expect(
      first.lock.packages["node_modules/postject/node_modules/commander"],
    ).toMatchObject({
      version: "9.5.0",
      resolved: "https://registry.npmjs.org/commander/-/commander-9.5.0.tgz",
      integrity:
        "sha512-KRs7WVDKg86PWiuAqhDrAQnTXZKraVcCc6vFdL14qrZ/DcWwuRo7VoiYXalXO7S5GKpqYiVEwCbgFDfxNHKJBQ==",
      optional: true,
      peer: true,
    });
  });

  it("is idempotent after normalization", () => {
    const first = normalizeElectronLock(structuredClone(loadLock()));
    const second = normalizeElectronLock(structuredClone(first.lock));

    expect(second.changed).toBe(false);
  });

  it("fails closed when the upstream windows-sign contract changes", () => {
    const lock = loadLock();
    lock.packages["node_modules/@electron/windows-sign"].version = "9.9.9";

    expect(() => normalizeElectronLock(lock)).toThrow(
      /unexpected @electron\/windows-sign version/,
    );
  });

  it("fails closed when an already-versioned postject entry differs", () => {
    const lock = loadLock();
    lock.packages["node_modules/postject"] = {
      version: "1.0.0-alpha.5",
      dev: true,
      optional: true,
      peer: true,
    };

    expect(() => normalizeElectronLock(lock)).toThrow(
      /postject already exists with unexpected metadata/,
    );
  });
});
