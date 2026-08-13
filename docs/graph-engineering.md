# Graph Engineering

OpenBand maintains a living **architecture dependency graph** produced by the
Graph Engineer toolchain in `graph/`. It is the single source of truth for
"what imports what", route discovery, OpenSpec cross-references, and the
architectural invariants enforced by `OB-GRAPH-*` validation rules.

## Quick start

```bash
npm run graph:build       # writes .openband/graph.json
npm run graph:validate    # runs OB-GRAPH-001/002/003
npm run graph:deps <id>          # direct dependencies
npm run graph:dependents <id>    # direct dependents
npm run graph:path <from> <to>   # shortest dependency path (BFS)
npm run graph:impact <id>        # impact analysis + risk score
npm run graph:context <id>       # compact context bundle for agents/LLMs
```

Every command accepts `--json` for machine-readable output and `--root <dir>`
to target a different repository root.

## Schema

```ts
type NodeType = 'source' | 'route' | 'test' | 'spec' | 'external';
type EdgeType = 'import' | 'route' | 'test' | 'specifies' | 'dynamic-import' | 'require';

interface GraphNode { id: string; path: string; type: NodeType; metadata?: Record<string, any>; }
interface GraphEdge { source: string; target: string; type: EdgeType; spec?: string; }
interface ArchitectureGraph { version: string; nodes: GraphNode[]; edges: GraphEdge[]; }
```

- `id` and `path` are POSIX, repository-relative.
- `version` is the graph schema version (`graph/core.mjs` → `GRAPH_VERSION`).
- Serialization (`graph/core.mjs` → `serialize`) sorts nodes by `id` and edges by
  `(source, target, type)`, and **excludes `metadata`** for deterministic diffs.

## Scanners

### Source scanner (`graph/scan.mjs`)
Walks `app/`, `src/`, `backend/`, `api/`, `electron/`, `stories/`, `scripts/`,
parses static `import`/`export ... from`, dynamic `import('...')`, and CJS
`require('...')` via regex, and resolves:

- relative specifiers (`./`, `../`) to existing source files,
- `@/` → `src/`,
- `@bridge` / `@bridge/...` → `src/bridge/...`,
- node builtins and `electron`/`tauri` bindings → `external:` nodes (used by `OB-GRAPH-001`).

Files under `app/` and `backend/src/routes/` (or `api/`) are tagged `route`.

### OpenSpec & test scanner (`graph/specs.mjs`)
- Walks `openspec/specs/`, `openspec/changes/`, `openspec/archive/` markdown.
- Extracts explicit repository-relative paths (`app/`, `src/`, `backend/`, `api/`, `tests/`)
  and connects `specifies` edges to the matching nodes (with extension + directory fallbacks).
- Unmatched paths are recorded as `OB-GRAPH-003` unresolved warnings.
- Discovers `tests/**/*.test.*` files and connects `test` edges to their imported internal modules.

## Validation rules

| Code | Rule | Severity |
| ---- | ---- | -------- |
| `OB-GRAPH-001` | Frontend (`app/`, `src/` non-bridge) imports desktop I/O (`fs`, `path`, `child_process`, `electron`, `tauri`, ...) directly instead of `@bridge`/`OpenBandNative`. | **error** |
| `OB-GRAPH-002` | Dependency cycle in `import`/`require`/`dynamic-import` edges (DFS back-edge). | **error** |
| `OB-GRAPH-003` | OpenSpec markdown references a repository path with no matching node. | warning |

`npm run graph:validate` exits non-zero when any `OB-GRAPH-001/002` error is present.

## Impact analysis

`graph/impact.mjs` computes direct + transitive dependents of a target and assigns
a risk score:

- `LOW` — fewer than 5 transitive dependents,
- `MEDIUM` — 5–20 transitive dependents, or the target is a `route`/`spec`,
- `HIGH` — more than 20 transitive dependents, or a `route`/`spec` node sits in the blast radius.

`context` emits a compact bundle (target + direct deps + direct dependents + `specifies`
edges) suitable for feeding an LLM or agent.

## Extending

- New scanner: add a function in `scan.mjs`/`specs.mjs`, call it from `builder.mjs`.
- New rule: add detection in `validate.mjs` and a unit test in `tests/graph-engineer.test.mjs`.
- Keep `graph/core.mjs` the only place that defines types and serialization order.
- No new npm dependencies — runtime is Node built-ins only.
