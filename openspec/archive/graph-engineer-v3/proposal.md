# Graph Engineer V3 — Spec

## Context

V1 built the import/route/spec/test graph (708→712 nodes, 4009→4029 edges) with
traversal, rendering (Mermaid/DOT), caching, two validation rules, and a CI gate.
V2 added navigation `route` edges, Mermaid/DOT `render`, incremental cache, and
`OB-GRAPH-004/005`.

The graph is still **import-only**. For a developer trying to understand the
codebase, two things are missing:

1. **Component usage edges.** Knowing that `app/tabs/index.tsx` *imports* `Button`
   is less useful than knowing it *renders* `<Button/>`. A `uses` edge (file →
   component it renders) makes the graph genuinely navigable for humans.
2. **A doc devs can actually read.** The CLI prints raw id lists and Mermaid
   snippets, but there is no browsable artifact. V3 emits:
   - an **auto-generated architecture Markdown** (`docs/generated/ARCHITECTURE.md`)
     — a "doc for devs to read" produced *by* the tool, always in sync with code;
   - an **interactive self-contained HTML report** (`graph-report.html`) with
     search/filter, per-node panels, embedded Mermaid, and the validation table;
   - a **written developer guide** (`docs/graph-engineer-devguide.md`) explaining
     how to run, read, and extend the tool and how it plugs into CI.

V3 also tightens `OB-GRAPH-003` resolution: doc citations like `api/foo` should
resolve to `backend/src/routes/foo.ts` instead of warning.

## Objectives

- Add a **component-usage scanner** producing `uses` edges (file → rendered component).
- Add **`graph:doc`** → `docs/generated/ARCHITECTURE.md` (auto architecture doc).
- Add **`graph:report`** → self-contained interactive `graph-report.html`.
- Add **`docs/graph-engineer-devguide.md`** (hand-written guide).
- Improve `OB-GRAPH-003` resolution with an `api/*` → `backend/src/routes/*` alias.
- Cover all of the above with `tests/graph-engineer-v3.test.mjs` (node:test).

## Out of scope

- Web UI dashboard server / live file-watch mode (deferred to V4).
- Type-inference prop-flow (beyond JSX tag matching).
- Semantic migration of `graph.json` older than V1.

## Success criteria

- `node graph/cli.mjs build` produces `uses` edges; `render`/`impact` optionally
  include them.
- `node graph/cli.mjs doc` writes `docs/generated/ARCHITECTURE.md` containing the
  module summary, entry points, route list, component count, and validation status.
- `node graph/cli.mjs report` writes a `graph-report.html` that opens standalone
  (CDN Mermaid script, inline data) and includes the validation findings table.
- `OB-GRAPH-003` count drops further after the `api/*` alias resolution.
- `tests/graph-engineer-v3.test.mjs` → all pass.
- No new npm dependencies; Node built-ins only.
