import fs from "node:fs";
import path from "node:path";
import { createGraph, createEdge, addEdge, detectNodeType } from "./core.mjs";
import { tryResolveFile } from "./scan.mjs";

const NAV_RES = [
  /router\.(?:push|replace)\(\s*['"]([^'"]+)['"]\s*\)/g,
  /<Link\b[^>]*?\bhref\s*=\s*['"]([^'"]+)['"]/g,
  /<Link\b[^>]*?\bhref\s*=\s*\{\s*['"]([^'"]+)['"]\s*\}/g,
  /(?:useNavigation\(\)\.|navigation\.)?navigate\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function resolveRouteTarget(literal, nodeSet) {
  let lit = literal.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(lit)) return null;
  if (lit.startsWith("/")) lit = lit.slice(1);
  lit = lit.replace(/\/+$/, "");
  if (lit.length === 0) return null;
  const candidate = "app/" + lit;
  return tryResolveFile(candidate, nodeSet);
}

export function scanRoutes(root, options = {}) {
  const graph = options.graph || createGraph();
  const nodeSet = new Set(graph.nodes.map((n) => n.id));

  for (const node of graph.nodes) {
    if (node.type === "external") continue;
    const abs = path.join(root, node.id);
    let content;
    try {
      content = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const literals = new Set();
    for (const re of NAV_RES) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        if (m[1]) literals.add(m[1]);
      }
    }
    for (const lit of literals) {
      const resolved = resolveRouteTarget(lit, nodeSet);
      if (!resolved) continue;
      if (detectNodeType(resolved) !== "route") continue;
      addEdge(graph, createEdge(node.id, resolved, "route"));
    }
  }

  return graph;
}
