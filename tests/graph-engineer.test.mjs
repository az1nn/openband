import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import {
  createGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  serialize,
  toSerializable,
  detectNodeType,
  GRAPH_VERSION,
} from "../graph/core.mjs";
import { scanSources, isFrontend, resolveSpecifier } from "../graph/scan.mjs";
import { scanSpecs, scanTests } from "../graph/specs.mjs";
import { buildGraph } from "../graph/builder.mjs";
import {
  resolveTarget,
  directDeps,
  directDependents,
  transitiveDeps,
  transitiveDependents,
  shortestPath,
} from "../graph/traversal.mjs";
import { validate } from "../graph/validate.mjs";
import { impactAnalysis, buildContextBundle } from "../graph/impact.mjs";
import { edgeStats } from "../graph/relations.mjs";

function tmpRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ob-graph-"));
  const write = (rel, content) => {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  };
  return { root, write };
}

describe("core determinism & serialization", () => {
  it("sorts nodes by id and edges by source/target/type", () => {
    const g = createGraph();
    addNode(g, createNode("src/z.ts", "source"));
    addNode(g, createNode("src/a.ts", "source"));
    addEdge(g, createEdge("src/z.ts", "src/a.ts", "import"));
    addEdge(g, createEdge("src/a.ts", "src/z.ts", "import"));
    const json = serialize(g);
    assert.ok(json.indexOf('"src/a.ts"') < json.indexOf('"src/z.ts"'));
    const parsed = JSON.parse(json);
    assert.equal(parsed.nodes[0].id, "src/a.ts");
    assert.equal(parsed.nodes[1].id, "src/z.ts");
    assert.equal(parsed.edges[0].source, "src/a.ts");
    assert.equal(parsed.edges[1].source, "src/z.ts");
  });

  it("excludes node metadata on serialize", () => {
    const g = createGraph();
    addNode(g, createNode("a.ts", "source", "a.ts", { secret: 1 }));
    const s = toSerializable(g);
    assert.equal(s.nodes[0].metadata, undefined);
  });

  it("produces identical output regardless of insertion order", () => {
    const make = () => {
      const g = createGraph();
      addNode(g, createNode("b.ts", "source"));
      addNode(g, createNode("a.ts", "source"));
      addEdge(g, createEdge("a.ts", "b.ts", "import"));
      return serialize(g);
    };
    assert.equal(make(), make());
  });

  it("detectNodeType classifies routes", () => {
    assert.equal(detectNodeType("app/index.tsx"), "route");
    assert.equal(detectNodeType("backend/src/routes/extract.ts"), "route");
    assert.equal(detectNodeType("src/lib/x.ts"), "source");
  });

  it("exposes a version", () => {
    assert.equal(typeof GRAPH_VERSION, "string");
  });
});

describe("source scanner", () => {
  it("flags frontend desktop I/O imports (OB-GRAPH-001)", () => {
    const { root, write } = tmpRepo();
    write("src/bridge/index.ts", `import electron from 'electron';`);
    write("src/lib/util.ts", `export const x = 1;`);
    write("app/screen.tsx", `import fs from 'fs';\nimport { x } from '@/lib/util';`);
    const g = scanSources(root, { graph: createGraph() });
    assert.ok(g.violations && g.violations.length === 1);
    assert.equal(g.violations[0].code, "OB-GRAPH-001");
    assert.equal(g.violations[0].file, "app/screen.tsx");
  });

  it("does not flag bridge desktop imports", () => {
    const { root, write } = tmpRepo();
    write("src/bridge/electron.ts", `import electron from 'electron';`);
    const g = scanSources(root, { graph: createGraph() });
    assert.equal((g.violations || []).length, 0);
  });

  it("resolves @/ and relative specifiers to internal nodes", () => {
    const { root, write } = tmpRepo();
    write("src/lib/util.ts", `export const x = 1;`);
    write("app/screen.tsx", `import { x } from '@/lib/util';\nimport './helper';`);
    write("app/helper.ts", `export const y = 2;`);
    const g = scanSources(root, { graph: createGraph() });
    const targets = g.edges.filter((e) => e.source === "app/screen.tsx").map((e) => e.target);
    assert.ok(targets.includes("src/lib/util.ts"));
    assert.ok(targets.includes("app/helper.ts"));
  });

  it("isFrontend treats app/ and src/ (non-bridge) as frontend", () => {
    assert.equal(isFrontend("app/x.tsx"), true);
    assert.equal(isFrontend("src/lib/x.ts"), true);
    assert.equal(isFrontend("src/bridge/x.ts"), false);
    assert.equal(isFrontend("backend/src/x.ts"), false);
  });

  it("resolveSpecifier maps @bridge alias", () => {
    const { root, write } = tmpRepo();
    write("src/bridge/index.ts", ``);
    write("src/bridge/foo.ts", ``);
    const nodeSet = new Set(["src/bridge/index.ts", "src/bridge/foo.ts"]);
    assert.equal(resolveSpecifier("@bridge", "app/x.ts", root, nodeSet).target, "src/bridge/index.ts");
    assert.equal(resolveSpecifier("@bridge/foo", "app/x.ts", root, nodeSet).target, "src/bridge/foo.ts");
  });
});

describe("specs scanner", () => {
  it("connects specifies edges and records unresolved paths", () => {
    const { root, write } = tmpRepo();
    write("src/lib/util.ts", `export const x = 1;`);
    write("openspec/specs/demo/spec.md", `See src/lib/util.ts and src/missing.ts for details.`);
    const g = createGraph();
    scanSources(root, { graph: g });
    scanSpecs(root, { graph: g });
    const specEdge = g.edges.find((e) => e.type === "specifies" && e.target === "src/lib/util.ts");
    assert.ok(specEdge, "expected a specifies edge to src/lib/util.ts");
    const unresolved = g.unresolved.find((u) => u.path === "src/missing.ts");
    assert.ok(unresolved, "expected unresolved OB-GRAPH-003 entry");
    assert.equal(unresolved.code, "OB-GRAPH-003");
  });

  it("connects test dependency edges", () => {
    const { root, write } = tmpRepo();
    write("src/lib/util.ts", `export const x = 1;`);
    write("tests/util.test.ts", `import { x } from '../src/lib/util';`);
    const g = createGraph();
    scanSources(root, { graph: g });
    scanTests(root, { graph: g });
    const testEdge = g.edges.find((e) => e.type === "test" && e.source === "tests/util.test.ts");
    assert.ok(testEdge, "expected a test edge");
    assert.equal(testEdge.target, "src/lib/util.ts");
  });
});

describe("traversal & queries", () => {
  function chain() {
    const g = createGraph();
    for (const id of ["a", "b", "c"]) addNode(g, createNode(id, "source"));
    addEdge(g, createEdge("a", "b", "import"));
    addEdge(g, createEdge("b", "c", "import"));
    return g;
  }

  it("resolves target by id or path", () => {
    const g = chain();
    assert.equal(resolveTarget(g, "a").id, "a");
    assert.equal(resolveTarget(g, "b").id, "b");
    assert.equal(resolveTarget(g, "nope"), null);
  });

  it("computes direct and transitive deps/dependents", () => {
    const g = chain();
    assert.deepEqual(directDeps(g, "a"), ["b"]);
    assert.deepEqual(transitiveDeps(g, "a").sort(), ["b", "c"]);
    assert.deepEqual(directDependents(g, "c"), ["b"]);
    assert.deepEqual(transitiveDependents(g, "c").sort(), ["a", "b"]);
  });

  it("finds shortest dependency path via BFS", () => {
    const g = chain();
    assert.deepEqual(shortestPath(g, "a", "c"), ["a", "b", "c"]);
    assert.equal(shortestPath(g, "c", "a"), null);
  });
});

describe("impact analysis", () => {
  it("scores a route in the blast radius as at least MEDIUM", () => {
    const g = createGraph();
    addNode(g, createNode("a", "source"));
    addNode(g, createNode("b", "source"));
    addNode(g, createNode("c", "route"));
    addEdge(g, createEdge("a", "b", "import"));
    addEdge(g, createEdge("b", "c", "import"));
    const r = impactAnalysis(g, "c");
    assert.equal(r.risk, "MEDIUM");
    assert.equal(r.transitiveDependents.length, 2);
  });

  it("scores many dependents as HIGH", () => {
    const g = createGraph();
    addNode(g, createNode("core", "source"));
    for (let i = 0; i < 25; i++) {
      addNode(g, createNode("d" + i, "source"));
      addEdge(g, createEdge("d" + i, "core", "import"));
    }
    const r = impactAnalysis(g, "core");
    assert.equal(r.risk, "HIGH");
  });

  it("builds a context bundle", () => {
    const g = createGraph();
    addNode(g, createNode("a", "source"));
    addNode(g, createNode("b", "source"));
    addEdge(g, createEdge("a", "b", "import"));
    const bundle = buildContextBundle(g, "b");
    assert.equal(bundle.target.id, "b");
    assert.equal(bundle.dependedOnBy.length, 1);
    assert.equal(bundle.dependedOnBy[0].id, "a");
  });
});

describe("validation rules", () => {
  it("detects dependency cycles (OB-GRAPH-002)", () => {
    const { root, write } = tmpRepo();
    write("src/lib/midiLearn.ts", `import { x } from './mcu';`);
    write("src/lib/mcu.ts", `import { y } from './midiLearn';`);
    const g = buildGraph(root);
    const result = validate(g);
    assert.ok(result.errors.some((e) => e.code === "OB-GRAPH-002"));
  });

  it("passes a clean graph", () => {
    const g = createGraph();
    addNode(g, createNode("a", "source"));
    addNode(g, createNode("b", "source"));
    addEdge(g, createEdge("a", "b", "import"));
    const result = validate(g);
    assert.equal(result.errors.length, 0);
  });
});

describe("builder integration (real repo)", () => {
  it("builds a non-trivial graph deterministically", () => {
    const g = buildGraph(process.cwd());
    assert.ok(g.nodes.length > 100, "expected many nodes");
    assert.ok(g.edges.length > 100, "expected many edges");
    const stats = edgeStats(g);
    assert.ok(stats.byType.import > 0);
    assert.ok(stats.byType.specifies > 0);
    assert.equal(serialize(g), serialize(g));
  });
});

describe("cli", () => {
  it("build + validate against a fixture repo", () => {
    const { root, write } = tmpRepo();
    write("src/bridge/index.ts", `import electron from 'electron';`);
    write("src/lib/util.ts", `export const x = 1;`);
    write("app/screen.tsx", `import fs from 'fs';\nimport { x } from '@/lib/util';`);
    write("openspec/specs/demo/spec.md", `See src/lib/util.ts and src/missing.ts.`);
    const out = path.join(root, ".openband", "graph.json");

    execFileSync("node", ["graph/cli.mjs", "build", "--root", root, "--out", out]);
    assert.ok(fs.existsSync(out));

    let failed = false;
    try {
      execFileSync("node", ["graph/cli.mjs", "validate", "--root", root], { stdio: "pipe" });
    } catch (e) {
      failed = e.status !== 0;
    }
    assert.equal(failed, true, "validate should exit non-zero on OB-GRAPH-001");

    const jsonOut = execFileSync("node", [
      "graph/cli.mjs",
      "deps",
      "app/screen.tsx",
      "--root",
      root,
      "--json",
    ]).toString();
    const deps = JSON.parse(jsonOut);
    assert.ok(deps.includes("src/lib/util.ts"));
  });
});
