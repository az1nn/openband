# Graph Engineer — Developer Guide

`graph/` is a dependency-free (Node built-ins only) architecture-graph toolchain
for OpenBand. It walks the source tree, builds a node/edge graph, validates
architectural invariants, and emits browsable artifacts. This guide explains how
to run it, how to read its output, and how to extend it.

All commands run from the repo root. Every command accepts `--root <dir>` to
point at a different checkout and `--json` for machine-readable output.

## Install

There is nothing to install. The toolchain uses only Node built-ins and ships
inside the repo, so it runs against any `node >= 22`:

```bash
node graph/cli.mjs <command>
# or via the npm scripts:
npm run graph:build
npm run graph:validate
npm run graph:deps <id>
npm run graph:dependents <id>
npm run graph:path <from> <to>
npm run graph:impact <id>
npm run graph:context <id>
npm run graph:render <id>
npm run graph:ci
npm run graph:doc
npm run graph:report
```

If you must run the test suite for V3 in isolation:

```bash
node --test tests/graph-engineer-v3.test.mjs
```

## Commands

### `build`

`node graph/cli.mjs build [--out <path>] [--fresh]`

Walks `app/`, `src/`, `backend/`, `api/`, `electron/`, `stories/`, `scripts/`
(sources), `tests/` (tests), and `openspec/` (specs), then writes
`.openband/graph.json`. An incremental cache (`.openband/graph.cache.json`)
content-hashes every tracked file and short-circuits the write when nothing is
dirty, keeping the artifact mtime stable. `--fresh` forces a full rewrite.

### `validate`

`node graph/cli.mjs validate`

Builds the graph and runs `validate.mjs`, printing `OB-GRAPH-*` errors and
warnings. Exits non-zero when any error-severity rule fires.

### `deps` / `dependents`

```bash
node graph/cli.mjs deps <id> [--transitive]
node graph/cli.mjs dependents <id> [--transitive]
```

Lists direct (or `--transitive`) dependencies / dependents along
`DEP_EDGE_TYPES` edges (`import`, `require`, `dynamic-import`, `test`,
`specifies`, `route`, `uses`).

### `path`

`node graph/cli.mjs path <from> <to>`

BFS shortest dependency path between two nodes.

### `impact`

`node graph/cli.mjs impact <id>`

Computes direct + transitive dependents and assigns a risk score (`LOW` /
`MEDIUM` / `HIGH`) based on blast radius. Useful before refactoring a shared
module.

### `context`

`node graph/cli.mjs context <id>`

Emits a compact bundle (target + direct deps + direct dependents + `specifies`
edges) meant for feeding an LLM or agent.

### `render`

`node graph/cli.mjs render <id> [--format mermaid|dot] [--depth N]`

Renders the target node plus everything within `N` hops along
`RENDER_EDGE_TYPES` (same set as `DEP_EDGE_TYPES`) in both directions. Default
format is `mermaid`, default depth `1`.

### `ci`

`node graph/cli.mjs ci [--max-warnings N] [--strict] [--json]`

The CI gate. Fails (exit `1`) when any `OB-GRAPH-001/002` error is present.
Under `--strict`, `OB-GRAPH-004/005` are promoted to failures and the warning
threshold defaults to `0`. Without `--strict`, warnings never fail the gate
unless `--max-warnings N` is explicitly set and exceeded.

```bash
# Hard gate: any error fails; ignore warnings.
npm run graph:ci

# Strict gate: any finding fails.
npm run graph:ci -- --strict

# Allow at most 50 warnings, else fail.
npm run graph:ci -- --max-warnings 50
```

### `doc`

`node graph/cli.mjs doc [--out <path>] [--json]`

Generates `docs/generated/ARCHITECTURE.md`: an auto-generated, human-readable
architecture document with a summary, entry points, the route list, the
top-reused components, and the validation findings table. `--json` prints the
Markdown to stdout instead of writing the file.

### `report`

`node graph/cli.mjs report [--out <path>] [--json]`

Generates `.openband/graph-report.html`: a self-contained interactive HTML
report with a search/filter table of every node, a click-to-inspect node detail
panel (direct deps/dependents computed in-browser), an embedded Mermaid diagram
of the `app/_layout.tsx` neighborhood, and the validation table. Only external
dependency is the Mermaid CDN script; everything else is inline. `--json` prints
the HTML to stdout.

## Edge types

| Type | Meaning |
| ---- | ------- |
| `import` | Static `import`/`export ... from` of an internal module (relative, `@/`, `@bridge`, `~/`). |
| `require` | CommonJS `require('...')` of an internal module. |
| `dynamic-import` | `import('...')` of an internal module. |
| `route` | Intra-app navigation (`router.push`, `<Link href>`, `navigate`) resolving to an `app/**` screen. |
| `test` | A `tests/**/*.test.*` file imports the target internal module. |
| `specifies` | OpenSpec markdown references the target repository path. |
| `uses` | A source/route file renders a JSX component it imported (file → rendered component). |

`uses` edges are included in `DEP_EDGE_TYPES` (so `deps`/`dependents`/`impact`/
`context` reflect component usage) and `RENDER_EDGE_TYPES` (so subgraphs show
usage), but they are **excluded** from `CYCLE_EDGE_TYPES` (cycle detection only
considers `import`/`require`/`dynamic-import`) and from the `OB-GRAPH-004`
orphan filter (which counts only `import`/`require`/`dynamic-import` inbound), so
`uses` never fabricates false cycles or masks real orphans.

## Validation rules

| Code | Rule | Severity | How to fix |
| ---- | ---- | -------- | ---------- |
| `OB-GRAPH-001` | A frontend module (`app/`, `src/` non-bridge) imports a desktop I/O binding (`fs`, `path`, `child_process`, `electron`, `tauri`, …) directly. | error | Move the I/O behind `src/bridge/` and use `OpenBandNative` from `@bridge`. |
| `OB-GRAPH-002` | Dependency cycle across `import`/`require`/`dynamic-import` edges (DFS back-edge). | error | Break the cycle — extract the shared logic into a third module or invert the dependency. |
| `OB-GRAPH-003` | OpenSpec markdown references a repository path with no matching node. | warning | Fix the path in the markdown, create the referenced file, or add an alias in `resolveTargetNodes` (e.g. `api/*` → `backend/src/routes/*`). |
| `OB-GRAPH-004` | A `source` node has zero inbound `import`/`require`/`dynamic-import` edges (orphaned / dead code), excluding the entry-point allowlist. | warning (error under `--strict`) | Delete the dead file, wire it into an entry point, or add it to the allowlist if it is a genuine entry. |
| `OB-GRAPH-005` | A `source` node has no `test` edge referencing it (test-coverage gap); excludes `*.stories.tsx`, `app/**`, and `src/bridge/*electron*`/`*tauri*` stubs. | warning (error under `--strict`) | Add a `tests/**/*.test.*` that imports the module. |

To suppress a legitimate warning without changing code, tighten the rule in
`validate.mjs` (extend the allowlist) rather than deleting the finding.

## Extending

### New scanner

1. Add a `scanX(root, { graph })` function (see `scan.mjs`, `routes.mjs`,
   `specs.mjs`, `components.mjs`). Use `tryResolveFile` / `resolveSpecifier`
   from `scan.mjs` and `createEdge` / `addEdge` from `core.mjs`.
2. Call it from `buildGraph` in `builder.mjs` in the correct phase order.
3. If it introduces a new edge type, register it in `EDGE_TYPES` (`core.mjs`),
   and decide whether it belongs in `DEP_EDGE_TYPES` (`traversal.mjs`) and
   `RENDER_EDGE_TYPES` (`render.mjs`).

### New rule

1. Add detection in `validate.mjs` `validate()`, pushing into `errors`
   (error-severity) or `warnings` (warning). Use a new `OB-GRAPH-00X` code.
2. If the rule consumes a `graph.violations` or `graph.unresolved` entry, emit
   it from the relevant scanner.
3. Add a unit test under `tests/graph-engineer*.test.mjs` (node:test) using a
   `fs.mkdtempSync` fixture so the repo is never polluted.

### New render format

1. Add a branch in `renderSubgraph` (`render.mjs`) for the new `format` value,
   reusing `adjacency` + `RENDER_EDGE_TYPES`.
2. Wire the format through `cli.mjs` `render` (already passes `--format`).

Keep `graph/core.mjs` the only place that defines node/edge types and
serialization order. No new npm dependencies — runtime is Node built-ins only.

## CI gate

Wire `npm run graph:ci` into CI:

```yaml
- run: npm run graph:ci -- --strict --max-warnings 0
```

This fails the pipeline on any `OB-GRAPH-001/002/004/005` finding (strict) and
on any warning at all. For a softer gate use `--max-warnings N` without
`--strict`.
