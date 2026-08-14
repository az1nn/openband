import test, { after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildGraph, writeGraph, gatherTrackedFiles } from "../graph/builder.mjs";
import { renderSubgraph } from "../graph/render.mjs";
import { validate } from "../graph/validate.mjs";
import { evaluateCi } from "../graph/cli.mjs";

const tmpDirs = [];

function makeTmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ob-graph-v2-"));
  tmpDirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

function writeFile(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

test("routes: router.push to app target creates route edge; external URL ignored", () => {
  const root = makeTmp();
  writeFile(root, "app/tabs/foo.tsx", "export default function Foo() {}\n");
  writeFile(
    root,
    "src/lib/bar.ts",
    "const x = 1;\nrouter.push('/tabs/foo');\nrouter.push('https://example.com');\n"
  );
  const graph = buildGraph(root);
  const routeEdges = graph.edges.filter((e) => e.type === "route");
  assert.equal(routeEdges.length, 1);
  assert.equal(routeEdges[0].source, "src/lib/bar.ts");
  assert.equal(routeEdges[0].target, "app/tabs/foo.tsx");
});

test("routes: Link href and generic navigate produce route edges", () => {
  const root = makeTmp();
  writeFile(root, "app/login.tsx", "export default function Login() {}\n");
  writeFile(root, "app/tabs/home.tsx", "export default function Home() {}\n");
  writeFile(
    root,
    "src/lib/nav.ts",
    [
      "const a = <Link href='/login' />;",
      "const b = <Link href={'/tabs/home'} />;",
      "navigation.navigate('/login');",
      "useNavigation().navigate('/tabs/home');",
      "navigate('/login');",
    ].join("\n")
  );
  const graph = buildGraph(root);
  const routeEdges = graph.edges.filter((e) => e.type === "route");
  const targets = new Set(routeEdges.map((e) => e.target));
  assert.ok(targets.has("app/login.tsx"));
  assert.ok(targets.has("app/tabs/home.tsx"));
});

test("render: mermaid contains flowchart and node ids; dot contains digraph", () => {
  const root = makeTmp();
  writeFile(root, "src/a.ts", "import './b';\n");
  writeFile(root, "src/b.ts", "import './c';\n");
  writeFile(root, "src/c.ts", "const z = 1;\n");
  const graph = buildGraph(root);
  const mermaid = renderSubgraph(graph, "src/a.ts", { depth: 1, format: "mermaid" });
  assert.ok(mermaid.includes("flowchart"));
  assert.ok(mermaid.includes("a.ts"));
  assert.ok(mermaid.includes("b.ts"));
  const dot = renderSubgraph(graph, "src/a.ts", { depth: 1, format: "dot" });
  assert.ok(dot.includes("digraph"));
  assert.ok(dot.includes("a.ts"));
  assert.ok(dot.includes("b.ts"));
});

test("render: depth=1 excludes a 2-hop node", () => {
  const root = makeTmp();
  writeFile(root, "src/a.ts", "import './b';\n");
  writeFile(root, "src/b.ts", "import './c';\n");
  writeFile(root, "src/c.ts", "const z = 1;\n");
  const graph = buildGraph(root);
  const mermaid = renderSubgraph(graph, "src/a.ts", { depth: 1, format: "mermaid" });
  assert.ok(!mermaid.includes("c.ts"));
  const dot = renderSubgraph(graph, "src/a.ts", { depth: 1, format: "dot" });
  assert.ok(!dot.includes('"src/c.ts"'));
  const mermaid2 = renderSubgraph(graph, "src/a.ts", { depth: 2, format: "mermaid" });
  assert.ok(mermaid2.includes("c.ts"));
});

test("cache: identical content second build is cached (no rewrite)", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/foo.ts", "const a = 1;\n");
  const out = path.join(root, ".openband", "graph.json");
  const first = writeGraph(root, out);
  assert.equal(first.rebuilt, true);
  const mtime1 = fs.statSync(out).mtimeMs;
  const content1 = fs.readFileSync(out, "utf8");
  const second = writeGraph(root, out);
  assert.equal(second.rebuilt, false);
  const mtime2 = fs.statSync(out).mtimeMs;
  const content2 = fs.readFileSync(out, "utf8");
  assert.equal(mtime1, mtime2);
  assert.equal(content1, content2);
});

test("cache: changed file triggers dirty + rebuild", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/foo.ts", "const a = 1;\n");
  const out = path.join(root, ".openband", "graph.json");
  const first = writeGraph(root, out);
  assert.equal(first.rebuilt, true);
  writeFile(root, "src/lib/foo.ts", "const a = 2;\n");
  const second = writeGraph(root, out);
  assert.equal(second.rebuilt, true);
  assert.ok(gatherTrackedFiles(root).length >= 1);
});

test("OB-GRAPH-004: orphan flagged, entry point not flagged", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/orphan.ts", "const a = 1;\n");
  writeFile(root, "app/_layout.tsx", "export default function Layout() {}\n");
  const graph = buildGraph(root);
  const result = validate(graph);
  const codes = result.warnings.map((w) => w.code + ":" + w.file);
  assert.ok(codes.includes("OB-GRAPH-004:src/lib/orphan.ts"));
  assert.ok(!codes.includes("OB-GRAPH-004:app/_layout.tsx"));
});

test("OB-GRAPH-005: untested source flagged, stories excluded", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/untested.ts", "const a = 1;\n");
  writeFile(root, "src/foo.stories.tsx", "export const A = 1;\n");
  const graph = buildGraph(root);
  const result = validate(graph);
  const codes = result.warnings.map((w) => w.code + ":" + w.file);
  assert.ok(codes.includes("OB-GRAPH-005:src/lib/untested.ts"));
  assert.ok(!codes.includes("OB-GRAPH-005:src/foo.stories.tsx"));
});

test("ci: warning fails with --max-warnings 0, passes with 5", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/untested.ts", "const a = 1;\n");
  const graph = buildGraph(root);
  const result = validate(graph);
  const fail0 = evaluateCi(result, { maxWarnings: 0 });
  assert.equal(fail0.failed, true);
  const pass5 = evaluateCi(result, { maxWarnings: 5 });
  assert.equal(pass5.failed, false);
});

test("ci: strict promotes OB-GRAPH-005 to failure", () => {
  const root = makeTmp();
  writeFile(root, "src/lib/untested.ts", "const a = 1;\n");
  const graph = buildGraph(root);
  const result = validate(graph);
  const strict = evaluateCi(result, { maxWarnings: 100, strict: true });
  assert.equal(strict.failed, true);
});
