# Design: Graph Engineer V1

## Architecture & Modules

### 1. `graph/schema.ts` / `graph/core.mjs`
- **Data Structures**:
  - `GraphNode`: `{ id: string, path: string, type: 'source' | 'route' | 'test' | 'spec' | 'external', metadata?: Record<string, any> }`
  - `GraphEdge`: `{ source: string, target: string, type: 'import' | 'route' | 'test' | 'specifies' | 'dynamic-import' | 'require', spec?: string }`
  - `ArchitectureGraph`: `{ version: string, nodes: GraphNode[], edges: GraphEdge[] }`
- **Normalization**: POSIX path separators (`/`), relative to project root.
- **Deterministic Serialization**: Nodes sorted alphabetically by `id`. Edges sorted by `source`, then `target`, then `type`. Metadata excluded or serialized deterministically into `.openband/graph.json`.

### 2. `graph/scan.mjs` (Source & Route Scanner)
- Scans source files (`.ts`, `.tsx`, `.js`, `.jsx`).
- Parses imports/requires via regex / AST parsing:
  - Static `import ... from '...'`
  - Workspace aliases `@/` -> `src/`, `@bridge` -> `src/bridge/index.ts` (or `src/bridge`)
  - Dynamic `import('...')`
  - CJS `require('...')`
- Discovers Expo file-based routes in `app/` and API routes in `backend/src/` or `api/`.

### 3. `graph/specs.mjs` (OpenSpec & Test Scanner)
- Scans `openspec/specs/`, `openspec/changes/`, `openspec/archive/` markdown files for explicit repository-relative paths (`app/`, `src/`, `backend/`, `api/`, `tests/`).
- Adds `specifies` edges between specification nodes and code/test nodes.
- Discovers test files (`tests/**/*.test.*`) and maps test dependencies.

### 4. `graph/builder.mjs`
- Coordinates source, route, spec, and test scanners.
- Computes final deterministic `ArchitectureGraph` and writes to `.openband/graph.json`.

### 5. `graph/traversal.mjs`, `graph/impact.mjs`, `graph/relations.mjs`
- Resolves nodes by ID or path.
- Computes direct and transitive dependencies and dependents.
- Finds shortest path using BFS.
- Performs impact analysis with risk scoring (`LOW`, `MEDIUM`, `HIGH`).
- Generates compact context bundle for LLM / agents.

### 6. `graph/validate.mjs`
- **`OB-GRAPH-001`**: Frontend code outside `src/bridge/` importing node builtins (`fs`, `path`, `child_process`, `electron`) or direct desktop bindings without using `@bridge` / `OpenBandNative`.
- **`OB-GRAPH-002`**: Dependency cycle detection using DFS back-edge identification.
- **`OB-GRAPH-003`**: Unresolved explicit OpenSpec file path warnings.

### 7. `graph/cli.mjs`
- CLI commands supporting JSON output (`--json`):
  - `build`
  - `validate`
  - `deps <target>`
  - `dependents <target>`
  - `path <from> <to>`
  - `impact <target>`
  - `context <target>`
