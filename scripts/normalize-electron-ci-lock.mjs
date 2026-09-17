#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const POSTJECT_PATH = "node_modules/postject";
const COMMANDER_PATH = "node_modules/postject/node_modules/commander";
const WINDOWS_SIGN_PATH = "node_modules/@electron/windows-sign";

const POSTJECT = {
  version: "1.0.0-alpha.6",
  resolved: "https://registry.npmjs.org/postject/-/postject-1.0.0-alpha.6.tgz",
  integrity:
    "sha512-b9Eb8h2eVqNE8edvKdwqkrY6O7kAwmI8kcnBv1NScolYJbo59XUF0noFq+lxbC1yN20bmC0WBEbDC5H/7ASb0A==",
  dev: true,
  license: "MIT",
  optional: true,
  peer: true,
  dependencies: {
    commander: "^9.4.0",
  },
  bin: {
    postject: "dist/cli.js",
  },
  engines: {
    node: ">=14.0.0",
  },
};

const COMMANDER = {
  version: "9.5.0",
  resolved: "https://registry.npmjs.org/commander/-/commander-9.5.0.tgz",
  integrity:
    "sha512-KRs7WVDKg86PWiuAqhDrAQnTXZKraVcCc6vFdL14qrZ/DcWwuRo7VoiYXalXO7S5GKpqYiVEwCbgFDfxNHKJBQ==",
  dev: true,
  license: "MIT",
  optional: true,
  peer: true,
  engines: {
    node: "^12.20.0 || >=14",
  },
};

function canonicalJson(value) {
  return JSON.stringify(value);
}

function assertKnownWindowsSign(packages) {
  const windowsSign = packages?.[WINDOWS_SIGN_PATH];
  if (!windowsSign) {
    throw new Error(
      `Cannot normalize Electron lock: ${WINDOWS_SIGN_PATH} is missing`,
    );
  }

  if (windowsSign.version !== "1.2.2") {
    throw new Error(
      `Cannot normalize Electron lock: unexpected @electron/windows-sign version ${windowsSign.version ?? "<missing>"}`,
    );
  }

  if (windowsSign.dependencies?.postject !== "^1.0.0-alpha.6") {
    throw new Error(
      "Cannot normalize Electron lock: unexpected @electron/windows-sign -> postject contract",
    );
  }
}

function assertCompatibleExisting(entry, expected, path) {
  if (!entry?.version) {
    return;
  }

  if (canonicalJson(entry) !== canonicalJson(expected)) {
    throw new Error(
      `Cannot normalize Electron lock: ${path} already exists with unexpected metadata`,
    );
  }
}

export function normalizeElectronLock(lock) {
  if (lock?.lockfileVersion !== 3 || !lock?.packages) {
    throw new Error(
      "Cannot normalize Electron lock: expected npm lockfileVersion 3 packages map",
    );
  }

  const packages = lock.packages;
  assertKnownWindowsSign(packages);

  const existingPostject = packages[POSTJECT_PATH];
  if (!existingPostject) {
    throw new Error(
      `Cannot normalize Electron lock: expected ${POSTJECT_PATH} placeholder is missing`,
    );
  }

  const acceptedStub =
    !existingPostject.version &&
    existingPostject.dev === true &&
    existingPostject.optional === true &&
    existingPostject.peer === true;

  if (!existingPostject.version && !acceptedStub) {
    throw new Error(
      `Cannot normalize Electron lock: ${POSTJECT_PATH} placeholder has unexpected shape`,
    );
  }

  assertCompatibleExisting(existingPostject, POSTJECT, POSTJECT_PATH);
  assertCompatibleExisting(packages[COMMANDER_PATH], COMMANDER, COMMANDER_PATH);

  const changed =
    canonicalJson(existingPostject) !== canonicalJson(POSTJECT) ||
    canonicalJson(packages[COMMANDER_PATH]) !== canonicalJson(COMMANDER);

  packages[POSTJECT_PATH] = { ...POSTJECT };
  packages[COMMANDER_PATH] = { ...COMMANDER };

  return { lock, changed };
}

export function normalizeElectronLockFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Electron lockfile does not exist: ${filePath}`);
  }

  const source = JSON.parse(readFileSync(filePath, "utf8"));
  const { lock, changed } = normalizeElectronLock(source);

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  }

  return { changed };
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const filePath = process.argv[2] ?? "electron/package-lock.json";
  try {
    const { changed } = normalizeElectronLockFile(filePath);
    console.log(
      changed
        ? `Electron lock normalized deterministically: ${filePath}`
        : `Electron lock already normalized: ${filePath}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  }
}
