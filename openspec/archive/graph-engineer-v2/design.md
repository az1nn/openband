# Graph Engineer V2 — Design

## New modules

### `graph/routes.mjs` — Navigation edge scanner

Detects intra-app screen transitions and emits `route` edges (source = current
module, target = resolved screen module under `app/`).

Detection (regex over file content):
- `router.push("<literal>")` / `router.replace("<literal>")` — `expo-router` style.
- `Link` `href="<literal>"` / `href={'<literal>'}` JSX attribute.
- `navigation.navigate("<literal>")` / `useNavigation().navigate("<literal>")`.
- `navigate("<literal>")` generic.

Resolution of a literal target:
- Strip leading `/`. `tabs/foo` → `app/tabs/foo.tsx` (try extensions + `/index`).
- `foo` (no slash) under an `app/(group)/` or `app/` → resolve via `tryResolveFile`.
- Only internal `app/**` targets become `route` edges; external/URL targets ignored.
- Skip if target node is not a `route` type (don't fabricate non-route edges).

Wire into `builder.mjs` between `scanSources` and `scanTests`.

### `graph/render.mjs` — Subgraph rendering

`renderSubgraph(graph, ref, { depth = 1, format = "mermaid" })`:
1. Collect target + all nodes within `depth` hops along import/spec/test/route edges
   (both directions) via BFS over `adjacency` (reuse `traversal.mjs`).
2. Filter edges where both endpoints are in the kept set.
3. Emit:
   - **mermaid** — `flowchart LR;` with `nodeId["label"]` nodes (type→shape/color map)
     and `-->|type|` edges. Escape `"` and newlines in labels.
   - **dot** — `digraph G { ... }` with `node [shape=...]` per type and `->` edges
     labeled with edge type.

Node label = last path segment (filename); shape/color by type:
`source`=box, `route`=ellipse (accent), `test`=note, `spec`=folder, `external`=cylinder.

### `graph/cache.mjs` — Incremental content-hash cache

- `hashFile(absPath)` → sha256 of file contents (Node `crypto`).
- `loadCache(file)` / `saveCache(file, map)` — JSON map `{ [relPath]: hash }` at
  `.openband/graph.cache.json`.
- `computeDirty(root, relFiles, prevCache)` → set of rel paths whose hash changed or
  are new; plus removed files.
- `buildGraphIncremental(root, { fresh })`:
  - If `fresh` or no cache: full scan (current behavior).
  - Else: full scan is still cheap to parse, but **skip re-writing only when nothing
    dirty** — for V2 we keep full parse but short-circuit `writeGraph` when the
    serialized graph is byte-identical to the cached one (avoid touching mtime).
  - Persist new hash map each run.

`builder.mjs` `writeGraph` accepts `{ fresh }` and uses `cache.mjs`. `cli.mjs build`
gains `--fresh` and prints `(cached)` vs `(rebuilt)` to stdout.

## Validation rules (extend `graph/validate.mjs`)

### `OB-GRAPH-004` — Orphaned source (warning, configurable error)
A `source` node with **zero inbound** edges of type `import`/`require`/`dynamic-import`
AND not in the entry-point allowlist.
Entry-point allowlist (never flagged):
- `app/_layout.tsx`, any `app/**/_layout.tsx`
- `app/tabs/_layout.tsx`
- `src/components/index.ts`, `src/bridge/index.ts`
- files referenced by `OB-GRAPH-001` external nodes (they're used).
Severity: warning by default; becomes error when `--strict` is passed to `ci`.

### `OB-GRAPH-005` — Test-coverage gap (warning)
A `source` node (excluding `external`, `spec`, pure type/`*.d.ts` already excluded)
with **no `test` edge** whose target is that node. Surfaces untested modules.
Severity: warning. Allowlist exclusion: `*.stories.tsx`, `app/**` route screens
(routes are integration-tested via feed/library), `src/bridge/*electron*`/`*tauri*`
(platform stubs).
Becomes error under `--strict`.

## CLI additions (`graph/cli.mjs`)

- `render <id> [--format mermaid|dot] [--depth N] [--json]` — print subgraph.
- `ci [--max-warnings N] [--strict] [--json]` — run validate; exit non-zero on any
  error (001/002/004/005 when strict, else 001/002 only) OR warnings > `max-warnings`
  (default 0). Prints summary line + optional JSON.
- `build [--fresh]` — incremental cache support (described above).

## Package.json scripts (extend, do not modify existing)

- `graph:render`: `node graph/cli.mjs render`
- `graph:ci`: `node graph/cli.mjs ci`
- `graph:build`: add `--fresh` is optional; default cached.

## Serialization / core (`graph/core.mjs`)

- Bump `GRAPH_VERSION` `1.0.0` → `1.1.0` (new edge type usage + cache sidecar).
- `serialize` unchanged (metadata still excluded). New `route` edges serialize like
  others; no schema break (type already in `EDGE_TYPES`).
- `createGraphFrom` tolerant of missing `unresolved`.

## Docs (`docs/graph-engineering.md`)

Add: render command, cache semantics (`--fresh`), new `OB-GRAPH-004/005` rows in the
rule table, `route` edge description, `graph:render`/`graph:ci` to quick start, and
the V1→V2 `GRAPH_VERSION` note. `agents/graph-engineer.md` updated with V2 commands.

## Tests (`tests/graph-engineer-v2.test.mjs`, node:test)

- routes scanner extracts `router.push`/`Link href`/`navigate` → `route` edges to
  existing `app/**` targets; ignores external URLs.
- render: mermaid output contains `flowchart` and all expected node ids; dot contains
  `digraph`; depth pruning excludes far nodes.
- cache: identical content → no rewrite (byte-equal short-circuit); changed file → dirty.
- OB-GRAPH-004: fixture with an orphaned source (flagged) and an allowed entry point
  (not flagged).
- OB-GRAPH-005: fixture source with no test edge flagged; `.stories.tsx` excluded.
- ci: error exits non-zero; `--max-warnings 0` fails on a warning; `--json` emits summary.

All fixtures built in a temp dir (`fs.mkdtemp`), no repo pollution.
