# Graph Engineer V2 — Tasks

## Spec (this phase — commit before code)
- [x] `openspec/changes/graph-engineer-v2/proposal.md`
- [x] `openspec/changes/graph-engineer-v2/design.md`
- [x] `openspec/changes/graph-engineer-v2/tasks.md`
- [ ] Commit spec files (`git add openspec/changes/graph-engineer-v2 && git commit -m "spec: graph-engineer V2"`)

## Implementation
### Navigation scanner
- [ ] `graph/routes.mjs`: detect `router.push`/`replace`, `Link href`, `navigate`,
      `navigation.navigate`; resolve to `app/**` modules; emit `route` edges.
- [ ] Wire `scanRoutes` into `graph/builder.mjs` between `scanSources` and `scanTests`.

### Rendering
- [ ] `graph/render.mjs`: `renderSubgraph(graph, ref, {depth, format})` → mermaid + dot.
- [ ] `graph/cli.mjs`: add `render <id> [--format mermaid|dot] [--depth N] [--json]`.

### Incremental cache
- [ ] `graph/cache.mjs`: `hashFile`, `loadCache`/`saveCache`, `computeDirty`.
- [ ] `graph/builder.mjs`: `writeGraph(root, outPath, { fresh })` short-circuits when
      serialized graph unchanged; persists hash map to `.openband/graph.cache.json`.
- [ ] `graph/cli.mjs build`: add `--fresh`; print `(cached)`/`(rebuilt)`.

### Validation rules
- [ ] `graph/validate.mjs`: `OB-GRAPH-004` orphaned sources (entry-point allowlist).
- [ ] `graph/validate.mjs`: `OB-GRAPH-005` test-coverage gap (allowlist exclusions).
- [ ] `ci` command in `graph/cli.mjs`: error gate + `--max-warnings` + `--strict` + `--json`.

### Core / docs / scripts
- [ ] Bump `GRAPH_VERSION` to `1.1.0` in `graph/core.mjs`.
- [ ] `package.json`: add `graph:render`, `graph:ci` scripts (preserve existing).
- [ ] `.gitignore`: ensure `.openband/graph.cache.json` ignored.
- [ ] Update `docs/graph-engineering.md` and `agents/graph-engineer.md` for V2.

### Tests
- [ ] `tests/graph-engineer-v2.test.mjs` (node:test) covering all above with temp-dir
      fixtures; run `node --test tests/graph-engineer-v2.test.mjs`.

## Verification (before commit)
- [ ] `node graph/cli.mjs build` then `node graph/cli.mjs validate` (note any real
      OB-GRAPH-004/005 findings in repo — expected, not blockers).
- [ ] `node graph/cli.mjs render app/index.tsx --format mermaid --depth 2` emits graph.
- [ ] `node graph/cli.mjs ci --max-warnings 0 --json` exits per policy.
- [ ] `node --test tests/graph-engineer-v2.test.mjs` → all pass.
- [ ] Code review via `code-review` subagent.
- [ ] Commit implementation (`feat: graph-engineer V2 ...`), archive spec to
      `openspec/archive/graph-engineer-v2/`.
