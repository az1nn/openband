import { resolveTarget, directDeps, directDependents, transitiveDependents } from "./traversal.mjs";

function riskForCount(count) {
  if (count > 20) return "HIGH";
  if (count >= 5) return "MEDIUM";
  return "LOW";
}

export function impactAnalysis(graph, ref) {
  const node = resolveTarget(graph, ref);
  if (!node) {
    return { error: `Target not found: ${ref}` };
  }
  const direct = directDependents(graph, ref);
  const transitiv = transitiveDependents(graph, ref);
  const transitivDeps = transitiveDependents(graph, ref, ["import", "require", "dynamic-import"]);

  const typeBoost = node.type === "route" || node.type === "spec";
  let risk = riskForCount(transitiv.length);

  const hasRouteOrSpecDependent = transitiv.some((id) => {
    const n = graph.nodes.find((x) => x.id === id);
    return n && (n.type === "route" || n.type === "spec");
  });
  if (typeBoost && risk === "LOW") risk = "MEDIUM";
  if (hasRouteOrSpecDependent && risk !== "HIGH") risk = risk === "LOW" ? "MEDIUM" : "HIGH";

  return {
    target: node.id,
    targetType: node.type,
    directDependents: direct,
    transitiveDependents: transitiv,
    blastRadius: transitiv.length,
    risk,
    summary: `${node.id} (${node.type}) has ${direct.length} direct and ${transitiv.length} transitive dependents; impact risk = ${risk}.`,
  };
}

export function buildContextBundle(graph, ref) {
  const node = resolveTarget(graph, ref);
  if (!node) return { error: `Target not found: ${ref}` };
  const deps = directDeps(graph, ref);
  const dependents = directDependents(graph, ref);
  const specifies = graph.edges
    .filter((e) => e.type === "specifies" && e.source === node.id)
    .map((e) => e.target);
  const specifiedBy = graph.edges
    .filter((e) => e.type === "specifies" && e.target === node.id)
    .map((e) => e.source);

  const describe = (id) => {
    const n = graph.nodes.find((x) => x.id === id);
    return n ? { id: n.id, type: n.type } : { id, type: "unknown" };
  };

  return {
    target: { id: node.id, type: node.type },
    dependsOn: deps.map(describe),
    dependedOnBy: dependents.map(describe),
    specifies: specifies.map(describe),
    specifiedBy: specifiedBy.map(describe),
    stats: { directDeps: deps.length, directDependents: dependents.length },
  };
}
