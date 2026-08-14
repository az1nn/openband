import { resolveTarget } from "./traversal.mjs";

const CYCLE_EDGE_TYPES = ["import", "require", "dynamic-import"];

export function detectCycles(graph) {
  const adj = new Map();
  for (const e of graph.edges) {
    if (!CYCLE_EDGE_TYPES.includes(e.type)) continue;
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source).push(e.target);
  }
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const cycles = [];
  const stack = [];

  const dfs = (node) => {
    color.set(node, GRAY);
    stack.push(node);
    for (const next of adj.get(node) || []) {
      const c = color.get(next) || WHITE;
      if (c === GRAY) {
        const idx = stack.indexOf(next);
        if (idx >= 0) cycles.push([...stack.slice(idx), next]);
      } else if (c === WHITE) {
        dfs(next);
      }
    }
    stack.pop();
    color.set(node, BLACK);
  };

  const nodes = new Set([...adj.keys(), ...graph.nodes.map((n) => n.id)]);
  for (const n of nodes) {
    if ((color.get(n) || WHITE) === WHITE) dfs(n);
  }
  return cycles;
}

export function validate(graph) {
  const errors = [];
  const warnings = [];

  for (const v of graph.violations || []) {
    if (v.code === "OB-GRAPH-001") {
      errors.push({
        code: "OB-GRAPH-001",
        message: `Frontend module '${v.file}' imports desktop I/O binding '${v.specifier}' directly. Use @bridge / OpenBandNative instead.`,
        file: v.file,
        specifier: v.specifier,
      });
    }
  }

  const cycles = detectCycles(graph);
  for (const cyc of cycles) {
    errors.push({
      code: "OB-GRAPH-002",
      message: `Dependency cycle detected: ${cyc.join(" -> ")}`,
      cycle: cyc,
    });
  }

  for (const u of graph.unresolved || []) {
    if (u.code === "OB-GRAPH-003") {
      warnings.push({
        code: "OB-GRAPH-003",
        message: `OpenSpec '${u.spec}' references unresolved repository path '${u.path}'.`,
        spec: u.spec,
        path: u.path,
      });
    }
  }

  const INBOUND_TYPES = ["import", "require", "dynamic-import"];
  const isEntryPoint = (id) =>
    id === "app/_layout.tsx" ||
    /^app\/.*\/_layout\.tsx$/.test(id) ||
    id === "src/components/index.ts" ||
    id === "src/bridge/index.ts" ||
    id.endsWith(".stories.tsx") ||
    id.startsWith("stories/");

  for (const node of graph.nodes) {
    if (node.type !== "source") continue;
    const inbound = graph.edges.filter(
      (e) => e.target === node.id && INBOUND_TYPES.includes(e.type)
    );
    if (inbound.length === 0 && !isEntryPoint(node.id)) {
      warnings.push({
        code: "OB-GRAPH-004",
        message: `Source '${node.id}' has no inbound import edges (orphaned / dead code).`,
        file: node.id,
      });
    }
  }

  for (const node of graph.nodes) {
    if (node.type !== "source") continue;
    const hasTest = graph.edges.some((e) => e.type === "test" && e.target === node.id);
    if (hasTest) continue;
    if (node.id.endsWith(".stories.tsx")) continue;
    if (node.id.startsWith("app/")) continue;
    if (node.id.startsWith("src/bridge/") && /electron|tauri/.test(node.id)) continue;
    warnings.push({
      code: "OB-GRAPH-005",
      message: `Source '${node.id}' has no associated test (test-coverage gap).`,
      file: node.id,
    });
  }

  return { errors, warnings };
}

export function summarize(validation) {
  const { errors, warnings } = validation;
  return {
    errors: errors.length,
    warnings: warnings.length,
    valid: errors.length === 0,
  };
}
