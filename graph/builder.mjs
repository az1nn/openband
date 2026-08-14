import fs from "node:fs";
import path from "node:path";
import { createGraph, serialize, posixRelative } from "./core.mjs";
import { scanSources } from "./scan.mjs";
import { scanRoutes } from "./routes.mjs";
import { scanSpecs, scanTests } from "./specs.mjs";
import { scanComponents } from "./components.mjs";
import { hashFile, loadCache, saveCache, computeDirty } from "./cache.mjs";

const TRACKED_ROOTS = [
  "app",
  "src",
  "backend",
  "api",
  "electron",
  "stories",
  "scripts",
  "tests",
  "openspec",
];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".expo",
  "dist",
  "build",
  ".openband",
  "uploads",
  "stems",
  ".vercel",
  "coverage",
  "ios",
  "android",
  ".storybook",
  ".opencode",
  "graph",
  "backend/.venv",
  "backend/node_modules",
  "electron/node_modules",
  "electron/out",
]);

function isTrackedFile(root, rel) {
  if (root === "openspec") return rel.endsWith(".md");
  if (root === "tests") return /\.test\.(js|ts|jsx|tsx|mjs)$/.test(rel);
  return /\.(ts|tsx|js|jsx|mjs)$/.test(rel) && !rel.endsWith(".d.ts");
}

export function gatherTrackedFiles(root) {
  const out = [];
  for (const r of TRACKED_ROOTS) {
    const abs = path.join(root, r);
    if (!fs.existsSync(abs)) continue;
    const walk = (dir) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const a = path.join(dir, e.name);
        if (e.isDirectory()) {
          const rel = posixRelative(root, a);
          if (IGNORE_DIRS.has(rel) || IGNORE_DIRS.has(e.name)) continue;
          walk(a);
        } else if (e.isFile()) {
          const rel = posixRelative(root, a);
          if (isTrackedFile(r, rel)) out.push(a);
        }
      }
    };
    walk(abs);
  }
  return out;
}

export function buildGraph(root = process.cwd()) {
  const graph = createGraph();
  scanSources(root, { graph });
  scanRoutes(root, { graph });
  scanComponents(root, { graph });
  scanTests(root, { graph });
  scanSpecs(root, { graph });
  return graph;
}

export function writeGraph(root = process.cwd(), outPath, { fresh } = {}) {
  const graph = buildGraph(root);
  const target = outPath || path.join(root, ".openband", "graph.json");
  const cacheFile = path.join(root, ".openband", "graph.cache.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const relFiles = gatherTrackedFiles(root).map((a) => posixRelative(root, a));

  let rebuilt = true;
  if (!fresh && fs.existsSync(cacheFile) && fs.existsSync(target)) {
    const prevCache = loadCache(cacheFile);
    const { dirty, removed } = computeDirty(root, relFiles, prevCache);
    if (dirty.size === 0 && removed.size === 0) {
      const existing = fs.readFileSync(target, "utf8");
      if (existing === serialize(graph)) rebuilt = false;
    }
  }

  if (rebuilt) {
    fs.writeFileSync(target, serialize(graph), "utf8");
    const newCache = {};
    for (const rel of relFiles) {
      try {
        newCache[rel] = hashFile(path.join(root, rel));
      } catch {
        continue;
      }
    }
    saveCache(cacheFile, newCache);
  }

  return { graph, target, rebuilt };
}
