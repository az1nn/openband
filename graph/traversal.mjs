import { createEdge } from "./core.mjs";

export const DEP_EDGE_TYPES = ["import", "require", "dynamic-import", "test", "specifies", "route", "uses"];

export function adjacency(graph, edgeFilter) {
  const fwd = new Map();
  const bwd = new Map();
  const add = (map, key, val) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(val);
  };
  for (const e of graph.edges) {
    if (edgeFilter && !edgeFilter(e)) continue;
    add(fwd, e.source, e.target);
    add(bwd, e.target, e.source);
  }
  return { fwd, bwd };
}

export function resolveTarget(graph, ref) {
  if (!ref) return null;
  let node = graph.nodes.find((n) => n.id === ref);
  if (node) return node;
  node = graph.nodes.find((n) => n.path === ref);
  if (node) return node;
  if (!ref.includes("/")) {
    node = graph.nodes.find((n) => n.id === "external:" + ref);
    if (node) return node;
  }
  return null;
}

export function directDeps(graph, ref, edgeTypes) {
  const node = resolveTarget(graph, ref);
  if (!node) return [];
  const types = edgeTypes || DEP_EDGE_TYPES;
  return graph.edges
    .filter((e) => e.source === node.id && types.includes(e.type))
    .map((e) => e.target);
}

export function directDependents(graph, ref, edgeTypes) {
  const node = resolveTarget(graph, ref);
  if (!node) return [];
  const types = edgeTypes || DEP_EDGE_TYPES;
  return graph.edges
    .filter((e) => e.target === node.id && types.includes(e.type))
    .map((e) => e.source);
}

export function transitiveDeps(graph, ref, edgeTypes) {
  const start = resolveTarget(graph, ref);
  if (!start) return [];
  const { fwd } = adjacency(graph, (e) => !edgeTypes || edgeTypes.includes(e.type));
  const seen = new Set();
  const queue = [start.id];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of fwd.get(cur) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  seen.delete(start.id);
  return [...seen];
}

export function transitiveDependents(graph, ref, edgeTypes) {
  const start = resolveTarget(graph, ref);
  if (!start) return [];
  const { bwd } = adjacency(graph, (e) => !edgeTypes || edgeTypes.includes(e.type));
  const seen = new Set();
  const queue = [start.id];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of bwd.get(cur) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  seen.delete(start.id);
  return [...seen];
}

export function shortestPath(graph, fromRef, toRef, edgeTypes) {
  const from = resolveTarget(graph, fromRef);
  const to = resolveTarget(graph, toRef);
  if (!from || !to) return null;
  if (from.id === to.id) return [from.id];
  const { fwd } = adjacency(graph, (e) => !edgeTypes || edgeTypes.includes(e.type));
  const prev = new Map();
  const visited = new Set([from.id]);
  const queue = [from.id];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to.id) break;
    for (const next of fwd.get(cur) || []) {
      if (!visited.has(next)) {
        visited.add(next);
        prev.set(next, cur);
        queue.push(next);
      }
    }
  }
  if (!prev.has(to.id) && from.id !== to.id) return null;
  const path = [];
  let cur = to.id;
  while (cur !== undefined) {
    path.unshift(cur);
    if (cur === from.id) break;
    cur = prev.get(cur);
  }
  return path[0] === from.id ? path : null;
}
