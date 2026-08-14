import { adjacency, resolveTarget } from "./traversal.mjs";

const RENDER_EDGE_TYPES = new Set([
  "import",
  "require",
  "dynamic-import",
  "test",
  "specifies",
  "route",
]);

function nodeLabel(node) {
  if (node.type === "external") return node.id.replace(/^external:/, "");
  const base = node.path.split("/").pop();
  return base || node.id;
}

function escapeLabel(label) {
  return String(label).replace(/"/g, "'").replace(/\r?\n/g, " ");
}

function mermaidShape(type) {
  switch (type) {
    case "route":
      return "rounded";
    case "external":
      return "cylindrical";
    default:
      return "box";
  }
}

function dotShape(type) {
  switch (type) {
    case "route":
      return "ellipse";
    case "test":
      return "note";
    case "spec":
      return "folder";
    case "external":
      return "cylinder";
    default:
      return "box";
  }
}

export function renderSubgraph(graph, ref, { depth = 1, format = "mermaid" } = {}) {
  const start = resolveTarget(graph, ref);
  if (!start) {
    return format === "dot" ? "digraph G {\n}\n" : "flowchart LR;\n";
  }

  const { fwd, bwd } = adjacency(graph, (e) => RENDER_EDGE_TYPES.has(e.type));
  const kept = new Set([start.id]);
  let frontier = [start.id];
  const hops = Number.isFinite(depth) && depth > 0 ? depth : 0;
  for (let d = 0; d < hops; d++) {
    const next = [];
    for (const node of frontier) {
      for (const n of fwd.get(node) || []) {
        if (!kept.has(n)) {
          kept.add(n);
          next.push(n);
        }
      }
      for (const n of bwd.get(node) || []) {
        if (!kept.has(n)) {
          kept.add(n);
          next.push(n);
        }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  const edges = graph.edges.filter(
    (e) => RENDER_EDGE_TYPES.has(e.type) && kept.has(e.source) && kept.has(e.target)
  );

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const idMap = new Map([...kept].map((id, i) => [id, "n" + i]));

  if (format === "dot") {
    const lines = ["digraph G {"];
    for (const id of kept) {
      const node = nodeById.get(id) || { id, type: "source", path: id };
      const label = escapeLabel(nodeLabel(node));
      lines.push(`  "${idMap.get(id)}" [label="${label}", shape=${dotShape(node.type)}];`);
    }
    for (const e of edges) {
      lines.push(`  "${idMap.get(e.source)}" -> "${idMap.get(e.target)}" [label="${e.type}"];`);
    }
    lines.push("}");
    return lines.join("\n") + "\n";
  }

  const lines = ["flowchart LR;"];
  for (const id of kept) {
    const node = nodeById.get(id) || { id, type: "source", path: id };
    const label = escapeLabel(nodeLabel(node));
    const sid = idMap.get(id);
    if (mermaidShape(node.type) === "rounded") {
      lines.push(`  ${sid}("${label}")`);
    } else if (mermaidShape(node.type) === "cylindrical") {
      lines.push(`  ${sid}[("${label}")]`);
    } else {
      lines.push(`  ${sid}["${label}"]`);
    }
  }
  for (const e of edges) {
    lines.push(`  ${idMap.get(e.source)} -->|${e.type}| ${idMap.get(e.target)}`);
  }
  return lines.join("\n") + "\n";
}
