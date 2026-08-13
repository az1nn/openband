import path from "node:path";
import { builtinModules } from "node:module";

export const GRAPH_VERSION = "1.0.0";

export const NODE_TYPES = ["source", "route", "test", "spec", "external"];
export const EDGE_TYPES = ["import", "route", "test", "specifies", "dynamic-import", "require"];

export const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
export const INDEX_SUFFIXES = ["/index.ts", "/index.tsx", "/index.js", "/index.jsx", "/index.mjs"];

const NODE_BUILTINS = new Set(builtinModules);
const DESKTOP_BINDING_RE = /^(electron|@electron\/|tauri|@tauri-apps|@tauri\/)/;

export function isNodeBuiltin(specifier) {
  const clean = specifier.replace(/^node:/, "");
  return NODE_BUILTINS.has(clean);
}

export function isDesktopBinding(specifier) {
  return DESKTOP_BINDING_RE.test(specifier);
}

export function posixRelative(root, absPath) {
  return path.relative(root, absPath).split(path.sep).join("/");
}

export function createNode(id, type, nodePath, metadata) {
  const node = { id, path: nodePath ?? id, type };
  if (metadata && Object.keys(metadata).length > 0) node.metadata = metadata;
  return node;
}

export function createEdge(source, target, type, spec) {
  const edge = { source, target, type };
  if (spec) edge.spec = spec;
  return edge;
}

export function createGraph(version = GRAPH_VERSION) {
  return { version, nodes: [], edges: [], unresolved: [] };
}

export function addNode(graph, node) {
  if (!node || !node.id) return graph;
  if (!graph.nodes.find((n) => n.id === node.id)) graph.nodes.push(node);
  return graph;
}

export function addEdge(graph, edge) {
  if (!edge || !edge.source || !edge.target || !edge.type) return graph;
  const exists = graph.edges.find(
    (e) =>
      e.source === edge.source &&
      e.target === edge.target &&
      e.type === edge.type &&
      (e.spec ?? null) === (edge.spec ?? null)
  );
  if (!exists) graph.edges.push(edge);
  return graph;
}

export function sortGraph(graph) {
  const nodes = [...graph.nodes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const edges = [...graph.edges].sort((a, b) => {
    if (a.source !== b.source) return a.source < b.source ? -1 : 1;
    if (a.target !== b.target) return a.target < b.target ? -1 : 1;
    if (a.type !== b.type) return a.type < b.type ? -1 : 1;
    return 0;
  });
  return { version: graph.version, nodes, edges };
}

export function toSerializable(graph) {
  const sorted = sortGraph(graph);
  return {
    version: sorted.version,
    nodes: sorted.nodes.map(({ id, path, type }) => ({ id, path, type })),
    edges: sorted.edges.map((e) => {
      const out = { source: e.source, target: e.target, type: e.type };
      if (e.spec) out.spec = e.spec;
      return out;
    }),
  };
}

export function serialize(graph) {
  return JSON.stringify(toSerializable(graph), null, 2) + "\n";
}

export function createGraphFrom(parsed) {
  const graph = createGraph(parsed.version || GRAPH_VERSION);
  graph.nodes = (parsed.nodes || []).map((n) => ({ ...n }));
  graph.edges = (parsed.edges || []).map((e) => ({ ...e }));
  graph.unresolved = parsed.unresolved || [];
  return graph;
}

export function detectNodeType(relPath) {
  if (relPath.startsWith("openspec/")) return "spec";
  if (relPath.startsWith("tests/")) return "test";
  if (relPath.startsWith("app/")) return "route";
  if (relPath.startsWith("backend/src/routes/") || relPath.startsWith("api/")) return "route";
  return "source";
}



