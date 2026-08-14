import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export function hashFile(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function loadCache(file) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCache(file, map) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(map, null, 2) + "\n", "utf8");
}

export function computeDirty(root, relFiles, prevCache) {
  const dirty = new Set();
  const removed = new Set();
  const curSet = new Set(relFiles);
  for (const rel of relFiles) {
    const abs = path.join(root, rel);
    let hash;
    try {
      hash = hashFile(abs);
    } catch {
      continue;
    }
    if (prevCache[rel] !== hash) dirty.add(rel);
  }
  for (const rel of Object.keys(prevCache)) {
    if (!curSet.has(rel)) removed.add(rel);
  }
  return { dirty, removed };
}
