import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { buildGraph } from "../graph/builder.mjs";
import { generateArchitectureDoc } from "../graph/doc.mjs";
import { generateHtmlReport } from "../graph/report.mjs";
import { validate } from "../graph/validate.mjs";
import { EDGE_TYPES } from "../graph/core.mjs";
import { DEP_EDGE_TYPES } from "../graph/traversal.mjs";

const tempDirs = [];
function makeTemp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ob-graph-v3-"));
  tempDirs.push(dir);
  return dir;
}
after(() => {
  for (const dir of tempDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
});

function write(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

test("uses edge: app screen rendering a component", () => {
  const root = makeTemp();
  write(root, "src/components/Button.tsx", "export function Button(p) { return null; }\n");
  write(
    root,
    "app/tabs/foo.tsx",
    'import { Button } from "@/components/Button";\nexport default function Foo() { return <Button label="x" />; }\n'
  );
  const graph = buildGraph(root);
  const edge = graph.edges.find(
    (e) => e.source === "app/tabs/foo.tsx" && e.target === "src/components/Button.tsx" && e.type === "uses"
  );
  assert.ok(edge, "expected a uses edge from app/tabs/foo.tsx to src/components/Button.tsx");
});

test("doc: markdown contains header, route, and validation status", () => {
  const root = makeTemp();
  write(
    root,
    "app/tabs/index.tsx",
    'import { Button } from "@/components/Button";\nexport default function X() { return <Button />; }\n'
  );
  write(root, "src/components/Button.tsx", "export function Button() { return null; }\n");
  const graph = buildGraph(root);
  const validation = validate(graph);
  const md = generateArchitectureDoc(graph, validation, root);
  assert.ok(md.includes("# OpenBand Architecture"), "expected title header");
  assert.ok(md.includes("app/tabs/index.tsx"), "expected route id in doc");
  assert.ok(/PASS|FAIL/.test(md), "expected validation status line");
});

test("report: html contains doctype, graph-data, and mermaid", () => {
  const root = makeTemp();
  write(root, "src/components/Button.tsx", "export function Button() { return null; }\n");
  write(root, "app/_layout.tsx", "export default function L() { return null; }\n");
  const graph = buildGraph(root);
  const validation = validate(graph);
  const html = generateHtmlReport(graph, validation, { root });
  const lower = html.toLowerCase();
  assert.ok(lower.includes("<!doctype html"), "expected doctype");
  assert.ok(lower.includes("graph-data"), "expected embedded graph data");
  assert.ok(lower.includes("mermaid"), "expected mermaid");
});

test("specs alias: api/health resolves to backend route", () => {
  const root = makeTemp();
  write(root, "backend/src/routes/health.ts", "export const handler = {};\n");
  write(
    root,
    "openspec/specs/foo.md",
    "The health endpoint lives at `api/health` and is used by monitoring.\n"
  );
  const graph = buildGraph(root);
  const edges = graph.edges.filter(
    (e) => e.type === "specifies" && e.target === "backend/src/routes/health.ts"
  );
  assert.ok(edges.length >= 1, "expected a specifies edge to backend/src/routes/health.ts");
  const unresolved = graph.unresolved.filter((u) => u.code === "OB-GRAPH-003" && u.path === "api/health");
  assert.equal(unresolved.length, 0, "api/health should not be an unresolved OB-GRAPH-003");
});

test("edge types include uses", () => {
  assert.ok(EDGE_TYPES.includes("uses"), "EDGE_TYPES must include uses");
  assert.ok(DEP_EDGE_TYPES.includes("uses"), "DEP_EDGE_TYPES must include uses");
});
