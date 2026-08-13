import fs from "node:fs";
import path from "node:path";
import {
  createGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  detectNodeType,
  posixRelative,
  SOURCE_EXTENSIONS,
} from "./core.mjs";
import { resolveSpecifier } from "./scan.mjs";

const SPEC_DIRS = ["openspec/specs", "openspec/changes", "openspec/archive"];
const PATH_RE = /(app|src|backend|api|tests)(?:\/[A-Za-z0-9_.\-]+)+/g;

function mdFilesUnder(root, dir) {
  const abs = path.join(root, dir);
  const out = [];
  if (!fs.existsSync(abs)) return out;
  const walk = (absDir) => {
    let entries;
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const a = path.join(absDir, e.name);
      if (e.isDirectory()) walk(a);
      else if (e.isFile() && e.name.endsWith(".md")) out.push(a);
    }
  };
  walk(abs);
  return out;
}

function extractRepoPaths(content) {
  const found = new Set();
  let m;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(content)) !== null) {
    found.add(m[0]);
  }
  return [...found];
}

function resolveTargetNodes(candidate, nodeSet) {
  if (nodeSet.has(candidate)) return [candidate];
  const exts = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs"];
  for (const e of exts) {
    if (nodeSet.has(candidate + e)) return [candidate + e];
  }
  const targets = [];
  for (const id of nodeSet) {
    if (id.startsWith(candidate + "/")) targets.push(id);
  }
  return targets;
}

export function scanSpecs(root, options = {}) {
  const graph = options.graph || createGraph();
  const nodeSet = new Set(graph.nodes.map((n) => n.id));

  for (const dir of SPEC_DIRS) {
    const files = mdFilesUnder(root, dir);
    for (const abs of files) {
      const rel = posixRelative(root, abs);
      addNode(graph, createNode(rel, "spec", rel));
      nodeSet.add(rel);
      let content;
      try {
        content = fs.readFileSync(abs, "utf8");
      } catch {
        continue;
      }
      const candidates = extractRepoPaths(content);
      for (const cand of candidates) {
        const targets = resolveTargetNodes(cand, nodeSet);
        if (targets.length > 0) {
          for (const t of targets) addEdge(graph, createEdge(rel, t, "specifies", rel));
        } else {
          graph.unresolved.push({ code: "OB-GRAPH-003", spec: rel, path: cand });
        }
      }
    }
  }
  return graph;
}

const TEST_RE = /\.test\.(js|ts|jsx|tsx|mjs)$/;

function testFilesUnder(root, dir) {
  const abs = path.join(root, dir);
  const out = [];
  if (!fs.existsSync(abs)) return out;
  const walk = (absDir) => {
    let entries;
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === ".openband") continue;
      const a = path.join(absDir, e.name);
      if (e.isDirectory()) walk(a);
      else if (e.isFile() && TEST_RE.test(e.name)) out.push(a);
    }
  };
  walk(abs);
  return out;
}

function extractTestSpecifiers(content) {
  const specs = new Set();
  const importRe = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  const reqRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  for (const re of [importRe, dynRe, reqRe]) {
    re.lastIndex = 0;
    while ((m = re.exec(content)) !== null) {
      if (m[1]) specs.add(m[1]);
    }
  }
  return [...specs];
}

export function scanTests(root, options = {}) {
  const graph = options.graph || createGraph();
  const nodeSet = new Set(graph.nodes.map((n) => n.id));
  const files = testFilesUnder(root, "tests");

  for (const abs of files) {
    const rel = posixRelative(root, abs);
    addNode(graph, createNode(rel, "test", rel));
    nodeSet.add(rel);
    let content;
    try {
      content = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const specs = extractTestSpecifiers(content);
    for (const spec of specs) {
      const resolved = resolveSpecifier(spec, rel, root, nodeSet);
      if (!resolved || resolved.kind !== "internal") continue;
      addNode(graph, createNode(resolved.target, detectNodeType(resolved.target), resolved.target));
      nodeSet.add(resolved.target);
      addEdge(graph, createEdge(rel, resolved.target, "test"));
    }
  }
  return graph;
}

export { SPEC_DIRS, TEST_RE };
