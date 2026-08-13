import fs from "node:fs";
import path from "node:path";
import {
  createGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  detectNodeType,
  isNodeBuiltin,
  isDesktopBinding,
  posixRelative,
  SOURCE_EXTENSIONS,
  INDEX_SUFFIXES,
} from "./core.mjs";

const SCAN_ROOTS = ["app", "src", "backend", "api", "electron", "stories", "scripts"];
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

const IMPORT_RE = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

export function isFrontend(relPath) {
  if (relPath.startsWith("app/")) return true;
  if (relPath.startsWith("src/") && !relPath.startsWith("src/bridge/")) return true;
  return false;
}

function safeWalk(root, absDir, onFile) {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      const rel = posixRelative(root, abs);
      if (IGNORE_DIRS.has(rel) || IGNORE_DIRS.has(entry.name)) continue;
      safeWalk(root, abs, onFile);
    } else if (entry.isFile()) {
      onFile(abs);
    }
  }
}

export function collectSourceFiles(root) {
  const files = [];
  for (const r of SCAN_ROOTS) {
    const abs = path.join(root, r);
    if (fs.existsSync(abs)) safeWalk(root, abs, (absFile) => files.push(absFile));
  }
  return files;
}

export function classifyFile(root, absFile) {
  const rel = posixRelative(root, absFile);
  const ext = path.extname(absFile);
  if (!SOURCE_EXTENSIONS.includes(ext)) return null;
  if (rel.endsWith(".d.ts")) return null;
  return { rel, ext };
}

export function tryResolveFile(relCandidate, nodeSet) {
  if (nodeSet.has(relCandidate)) return relCandidate;
  for (const ext of SOURCE_EXTENSIONS) {
    if (nodeSet.has(relCandidate + ext)) return relCandidate + ext;
  }
  for (const idx of INDEX_SUFFIXES) {
    if (nodeSet.has(relCandidate + idx)) return relCandidate + idx;
  }
  return null;
}

export function resolveSpecifier(specifier, fromRel, root, nodeSet) {
  if (specifier.startsWith(".")) {
    const base = path.posix.dirname(fromRel);
    const joined = path.posix.normalize(path.posix.join(base, specifier));
    const resolved = tryResolveFile(joined, nodeSet);
    return resolved ? { kind: "internal", target: resolved } : null;
  }
  if (specifier.startsWith("@/")) {
    const joined = path.posix.normalize("src/" + specifier.slice(2));
    const resolved = tryResolveFile(joined, nodeSet);
    return resolved ? { kind: "internal", target: resolved } : null;
  }
  if (specifier === "@bridge") {
    const resolved = tryResolveFile("src/bridge", nodeSet);
    return resolved ? { kind: "internal", target: resolved } : null;
  }
  if (specifier.startsWith("@bridge/")) {
    const joined = path.posix.normalize("src/bridge/" + specifier.slice("@bridge/".length));
    const resolved = tryResolveFile(joined, nodeSet);
    return resolved ? { kind: "internal", target: resolved } : null;
  }
  if (specifier.startsWith("~/")) {
    const joined = path.posix.normalize(specifier.slice(2));
    const resolved = tryResolveFile(joined, nodeSet);
    return resolved ? { kind: "internal", target: resolved } : null;
  }
  if (isDesktopBinding(specifier) || isNodeBuiltin(specifier)) {
    return { kind: "desktop", target: specifier };
  }
  return { kind: "package", target: specifier };
}

function extractSpecifiers(content) {
  const result = { static: new Set(), dynamic: new Set(), require: new Set() };
  let m;
  const collect = (re, bucket) => {
    re.lastIndex = 0;
    while ((m = re.exec(content)) !== null) {
      if (m[1]) result[bucket].add(m[1]);
    }
  };
  collect(IMPORT_RE, "static");
  collect(DYNAMIC_IMPORT_RE, "dynamic");
  collect(REQUIRE_RE, "require");
  return {
    static: [...result.static],
    dynamic: [...result.dynamic],
    require: [...result.require],
  };
}

export function scanSources(root, options = {}) {
  const graph = options.graph || createGraph();
  const absFiles = collectSourceFiles(root);
  const nodeSet = new Set();
  const fileIndex = [];

  for (const abs of absFiles) {
    const info = classifyFile(root, abs);
    if (!info) continue;
    nodeSet.add(info.rel);
    fileIndex.push(info);
  }

  for (const info of fileIndex) {
    const type = detectNodeType(info.rel);
    addNode(graph, createNode(info.rel, type, info.rel));
  }

  for (const info of fileIndex) {
    let content;
    try {
      content = fs.readFileSync(path.join(root, info.rel), "utf8");
    } catch {
      continue;
    }
    const specs = extractSpecifiers(content);
    const categorized = [
      ...specs.static.map((s) => ({ spec: s, etype: "import" })),
      ...specs.dynamic.map((s) => ({ spec: s, etype: "dynamic-import" })),
      ...specs.require.map((s) => ({ spec: s, etype: "require" })),
    ];
    for (const { spec, etype } of categorized) {
      const resolved = resolveSpecifier(spec, info.rel, root, nodeSet);
      if (!resolved) continue;
      if (resolved.kind === "internal") {
        const targetType = detectNodeType(resolved.target);
        addNode(graph, createNode(resolved.target, targetType, resolved.target));
        addEdge(graph, createEdge(info.rel, resolved.target, etype));
      } else if (resolved.kind === "desktop") {
        const extId = "external:" + resolved.target;
        addNode(graph, createNode(extId, "external", resolved.target, { specifier: resolved.target }));
        addEdge(graph, createEdge(info.rel, extId, etype));
        if (isFrontend(info.rel) && (isDesktopBinding(resolved.target) || isNodeBuiltin(resolved.target))) {
          if (!graph.violations) graph.violations = [];
          graph.violations.push({
            code: "OB-GRAPH-001",
            file: info.rel,
            specifier: resolved.target,
          });
        }
      }
    }
  }

  return graph;
}

export { SCAN_ROOTS, IGNORE_DIRS };
