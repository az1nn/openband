# Graph Engineer V2 — Spec

## Context

V1 shipped the architecture graph toolchain (`graph/`) producing `.openband/graph.json`
(708 nodes / 4008 edges) with import/spec/test scanning, traversal queries, impact
analysis, and three validation rules (`OB-GRAPH-001/002/003`).

V1 is import-graph only. Several declared capabilities are unimplemented and the
toolchain lacks features needed for daily use and CI:

1. **`route` edge type is declared but never produced.** `core.mjs` defines
   `EDGE_TYPES` containing `"route"`, but no scanner emits it. Screen navigation
   (`router.push`, `Link`, `useRouter().push`, `navigate`) is invisible to the graph.
2. **No visualization.** Queries return raw id lists. Humans and CI can't see the
   shape of a blast radius without a renderer.
3. **No incremental caching.** Every `build` rescans all ~700 files (~700ms). A
   content-hash cache would make reruns sub-second and enable `--fresh` opt-out.
4. **Only 3 validation rules.** No dead-code (orphan) detection and no test-coverage
   gap detection — both high-value for a repo this size.
5. **No CI gate.** `validate` exits non-zero on errors but offers no warning
   threshold or JUnit/summary artifact for pipelines.

## Objectives

- Populate the `route` edge type via a navigation scanner.
- Add Mermaid + DOT rendering of arbitrary subgraphs (deps / dependents / impact / path).
- Add content-hash incremental caching to `build`.
- Add two new validation rules: `OB-GRAPH-004` (orphaned sources) and
  `OB-GRAPH-005` (test-coverage gap).
- Add a `ci` CLI command (error gate + optional warning threshold + machine summary).

## Out of scope

- React component prop-flow edges (requires type inference; deferred to V3).
- Web UI dashboard (deferred to V3).
- Live file-watch mode (deferred to V3).
- Semantic version migration of `graph.json` older than V1.

## Success criteria

- `node graph/cli.mjs build` produces `route` edges and honors a cache.
- `node graph/cli.mjs render <id> [--format mermaid|dot] [--depth N]` emits a valid
  graph for the target's N-hop neighborhood.
- `node graph/cli.mjs ci` exits non-zero on any `OB-GRAPH-001/002/004/005` error and
  on warnings exceeding `--max-warnings N`; prints a JSON summary when `--json`.
- `OB-GRAPH-004` reports sources with zero inbound edges (excluding entry points).
- `OB-GRAPH-005` reports source nodes with no `test` edge referencing them.
- All V2 modules covered by `tests/graph-engineer-v2.test.mjs` (node:test).
- No new npm dependencies; runtime uses only Node built-ins.
