import { resolveTarget, directDeps, directDependents } from "./traversal.mjs";

export function nodesByType(graph) {
  const map = new Map();
  for (const n of graph.nodes) {
    if (!map.has(n.type)) map.set(n.type, []);
    map.get(n.type).push(n.id);
  }
  return map;
}

export function getDirectRelations(graph, ref) {
  const node = resolveTarget(graph, ref);
  if (!node) return null;
  return {
    node: node.id,
    dependsOn: directDeps(graph, ref),
    dependedOnBy: directDependents(graph, ref),
  };
}

export function edgeStats(graph) {
  const byType = new Map();
  for (const e of graph.edges) {
    byType.set(e.type, (byType.get(e.type) || 0) + 1);
  }
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    byType: Object.fromEntries(byType),
  };
}

export function findIsolatedNodes(graph) {
  const connected = new Set();
  for (const e of graph.edges) {
    connected.add(e.source);
    connected.add(e.target);
  }
  return graph.nodes.filter((n) => !connected.has(n.id)).map((n) => n.id);
}

export function getSpecifiesFor(graph, ref) {
  const node = resolveTarget(graph, ref);
  if (!node) return [];
  return graph.edges
    .filter((e) => e.type === "specifies" && e.target === node.id)
    .map((e) => e.source);
}

export function getSpecifiesTargets(graph, ref) {
  const node = resolveTarget(graph, ref);
  if (!node) return [];
  return graph.edges
    .filter((e) => e.type === "specifies" && e.source === node.id)
    .map((e) => e.target);
}
