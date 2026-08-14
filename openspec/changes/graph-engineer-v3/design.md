# Graph Engineer V3 — Design

## 1. Component-usage scanner (`graph/components.mjs`)

Reuse `tryResolveFile` + `detectNodeType` from `scan.mjs`/`core.mjs`.

For each `source` node that is a `.tsx`/`.ts`/`.jsx`/`.js` file (skip `external`,
`spec`, `test` already handled):
1. Extract its static imports and build a map `localName → resolvedModuleId`
   (only keep entries whose resolved module is a `source`/`route` node — i.e. a
   real component/module, not external).
2. Scan JSX for opening tags of capitalized identifiers: `/<([A-Z][A-Za-z0-9_]*)/g`.
   For each `Name` present in the import map, emit a `uses` edge
   `createEdge(fileId, resolvedModuleId, "uses")`.
3. Dedupe edges (same source/target/type).

Wire `scanComponents(root, { graph })` into `builder.mjs` `buildGraph` after
`scanRoutes` (before `scanTests`/`scanSpecs` is fine).

Edge typing:
- Add `"uses"` to `EDGE_TYPES` in `graph/core.mjs`.
- Add `"uses"` to `DEP_EDGE_TYPES` in `graph/traversal.mjs` so `deps`/`dependents`/
  `impact`/`context` reflect component usage (richer for devs). Keep
  `CYCLE_EDGE_TYPES` (validate.mjs) = `import`/`require`/`dynamic-import` only, so
  `uses` never creates false cycles. Keep `OB-GRAPH-004` inbound filter on
  import/require/dynamic-import only, so `uses` does not mask orphans.
- Add `"uses"` to `RENDER_EDGE_TYPES` in `graph/render.mjs` so subgraphs show usage.

## 2. Auto architecture doc (`graph/doc.mjs`)

`generateArchitectureDoc(graph, validation, root)` returns a Markdown string:

- `# OpenBand Architecture (auto-generated)` + timestamp + `GRAPH_VERSION`.
- **Summary**: node/edge counts, by-type edge table, validation status line.
- **Entry points**: list `app/_layout.tsx`, `app/tabs/_layout.tsx`, `src/components/index.ts`, `src/bridge/index.ts`, `backend/src/index.ts` if present (link as repo paths).
- **Routes**: every `route` node, grouped (app vs backend), with dependency count.
- **Components**: count of `source` nodes under `src/components/`, top N by inbound `uses` count (most-reused components).
- **Validation findings**: table of `OB-GRAPH-*` errors/warnings (codes + counts + first few examples).
- **How to regenerate**: the `graph:doc` / `graph:report` commands.
- A note that the file is generated — do not edit by hand.

`cli.mjs doc [--out <path>]` defaults out to `docs/generated/ARCHITECTURE.md`
(creating `docs/generated/`). Print the written path.

## 3. Interactive HTML report (`graph/report.mjs`)

`generateHtmlReport(graph, validation, { root })` returns a complete HTML doc:

- Inline `<style>` (dark theme), no external CSS.
- Mermaid via `<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">`
  + `mermaid.initialize({startOnLoad:true})`. The report embeds a **default
  Mermaid diagram** of the top-level entry-point neighborhoods (reuse
  `renderSubgraph` for a few key nodes) inside a `<pre class="mermaid">`.
- A **search box** (vanilla JS) filtering a `<table>` of all nodes (id, type,
  inbound/outbound degree). Filtering is client-side, no build step.
- A **node detail** view: clicking a row shows its direct deps/dependents
  (rendered from `adjacency`/`directDeps`/`directDependents`).
- A **validation table**: each `OB-GRAPH-*` finding (code, severity, message),
  color-coded.
- Embedded JSON (`<script id="graph-data" type="application/json">…</script>`) so
  the page is fully self-contained and interactive without a server.

Keep it dependency-free (CDN Mermaid only, which degrades gracefully if offline —
the tables still work). `cli.mjs report [--out <path>]` defaults to
`.openband/graph-report.html`.

## 4. OB-GRAPH-003 alias resolution (`graph/specs.mjs`)

In `resolveTargetNodes`, after the existing fallbacks, add: if a candidate starts
with `api/` and did not resolve, try `backend/src/routes/<rest>.ts` (and `.tsx`),
and `backend/src/routes/<rest>/index.ts`. This converts the many `api/auth/login`
style citations into real `specifies` edges instead of `OB-GRAPH-003` warnings.
Keep it scoped to the `api/` prefix only (low false-positive risk).

## 5. CLI additions (`graph/cli.mjs`)

- `doc [--out <path>] [--json]` — write architecture Markdown.
- `report [--out <path>] [--json]` — write HTML report.

## 6. Package.json + docs

- `package.json`: add `graph:doc` and `graph:report` scripts (preserve existing).
- `.gitignore`: add `docs/generated/` and `.openband/graph-report.html` (generated
  artifacts; keep `graph.json` ignored already).
- `docs/graph-engineer-devguide.md` (NEW, hand-written): how to run every command,
  how to read `uses`/`route`/`specifies` edges, how each `OB-GRAPH-*` rule works,
  how to extend (new scanner / new rule / new render format), and the CI gate.
- Update `docs/graph-engineering.md` quick start + rule table + `uses` edge desc.

## 7. Tests (`tests/graph-engineer-v3.test.mjs`, node:test)

Temp-dir fixtures (no repo pollution):
- components: a `src/components/Button.tsx` + `app/tabs/foo.tsx` that renders
  `<Button/>`; assert a `uses` edge `app/tabs/foo.tsx -> src/components/Button.tsx`.
- doc: build fixture graph, assert `generateArchitectureDoc` output contains the
  route list and validation status and the "auto-generated" marker.
- report: assert `generateHtmlReport` output contains `<html`, the validation
  table, and the embedded `graph-data` JSON; (Mermaid CDN script tag present).
- specs alias: a spec md referencing `api/health` resolves to
  `backend/src/routes/health.ts` when that file exists (no OB-GRAPH-003).
- Also assert `uses` is in `EDGE_TYPES` and `DEP_EDGE_TYPES`.

All fixtures in `fs.mkdtempSync` temp dirs, cleaned in `after()`.
