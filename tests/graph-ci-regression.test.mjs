import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGraph } from "../graph/builder.mjs";
import { validate } from "../graph/validate.mjs";

test("live repo graph has zero OB-GRAPH-001 (desktop-leak) errors", () => {
  const graph = buildGraph(process.cwd());
  const { errors } = validate(graph);
  const leaks = errors.filter((e) => e.code === "OB-GRAPH-001");
  assert.equal(
    leaks.length,
    0,
    `Expected no OB-GRAPH-001, found: ${JSON.stringify(leaks, null, 2)}`,
  );
});

test("live repo graph has zero OB-GRAPH-002 (import-cycle) errors", () => {
  const graph = buildGraph(process.cwd());
  const { errors } = validate(graph);
  const cycles = errors.filter((e) => e.code === "OB-GRAPH-002");
  assert.equal(
    cycles.length,
    0,
    `Expected no OB-GRAPH-002, found: ${JSON.stringify(cycles, null, 2)}`,
  );
});
