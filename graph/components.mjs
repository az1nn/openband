import fs from "node:fs";
import path from "node:path";
import {
  createEdge,
  addEdge,
  detectNodeType,
  posixRelative,
} from "./core.mjs";
import { resolveSpecifier, tryResolveFile } from "./scan.mjs";

const COMPONENT_SCAN_EXT = new Set([".tsx", ".ts", ".jsx", ".js"]);
const IMPORT_STMT_RE = /import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/g;
const JSX_TAG_RE = /<([A-Z][A-Za-z0-9_]*)/g;

function localNamesFromClause(clause) {
  const names = new Set();
  const trimmed = clause.trim();
  const starMatch = trimmed.match(/\*\s+as\s+([A-Za-z0-9_$]+)/);
  if (starMatch) names.add(starMatch[1]);
  const defaultPart = trimmed.split(",")[0].trim();
  if (defaultPart && !defaultPart.startsWith("*") && !defaultPart.startsWith("{")) {
    const def = defaultPart.match(/^([A-Za-z0-9_$]+)/);
    if (def) names.add(def[1]);
  }
  const braceMatch = trimmed.match(/\{([^}]*)\}/);
  if (braceMatch) {
    for (const part of braceMatch[1].split(",")) {
      const p = part.trim();
      if (!p) continue;
      const asMatch = p.match(/(?:^|\sas\s+)([A-Za-z0-9_$]+)\s*$/);
      const name = asMatch ? asMatch[1] : p.match(/^([A-Za-z0-9_$]+)/);
      if (name) names.add(asMatch ? asMatch[1] : name[1]);
    }
  }
  return names;
}

export function scanComponents(root, options = {}) {
  const graph = options.graph || { version: "1.1.0", nodes: [], edges: [], unresolved: [] };
  const nodeSet = new Set(graph.nodes.map((n) => n.id));
  const typeOf = new Map(graph.nodes.map((n) => [n.id, n.type]));

  const candidates = graph.nodes.filter(
    (n) => (n.type === "source" || n.type === "route") && COMPONENT_SCAN_EXT.has(path.extname(n.id))
  );

  for (const node of candidates) {
    const abs = path.join(root, node.id);
    let content;
    try {
      content = fs.readFileSync(abs, "utf8");
    } catch (err) {
      continue;
    }

    const importMap = new Map();
    let m;
    IMPORT_STMT_RE.lastIndex = 0;
    while ((m = IMPORT_STMT_RE.exec(content)) !== null) {
      const clause = m[1];
      const spec = m[2];
      const resolved = resolveSpecifier(spec, node.id, root, nodeSet);
      if (!resolved || resolved.kind !== "internal") continue;
      const targetType = typeOf.get(resolved.target) || detectNodeType(resolved.target);
      if (targetType !== "source" && targetType !== "route") continue;
      for (const name of localNamesFromClause(clause)) {
        importMap.set(name, resolved.target);
      }
    }

    if (importMap.size === 0) continue;

    JSX_TAG_RE.lastIndex = 0;
    const seen = new Set();
    while ((m = JSX_TAG_RE.exec(content)) !== null) {
      const tag = m[1];
      const target = importMap.get(tag);
      if (!target || seen.has(target)) continue;
      seen.add(target);
      addEdge(graph, createEdge(node.id, target, "uses"));
    }
  }

  return graph;
}

export { COMPONENT_SCAN_EXT };
