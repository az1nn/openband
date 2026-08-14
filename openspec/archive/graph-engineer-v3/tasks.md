# Graph Engineer V3 — Tasks

## Spec (this phase — commit before code)
- [x] `openspec/changes/graph-engineer-v3/proposal.md`
- [x] `openspec/changes/graph-engineer-v3/design.md`
- [x] `openspec/changes/graph-engineer-v3/tasks.md`
- [ ] Commit spec (`git add openspec/changes/graph-engineer-v3 && git commit -m "spec: graph-engineer V3"`)

## Implementation
### Component-usage edges
- [ ] `graph/components.mjs`: `scanComponents` — import map + JSX `<Name` scan → `uses` edges.
- [ ] `graph/core.mjs`: add `"uses"` to `EDGE_TYPES`.
- [ ] `graph/traversal.mjs`: add `"uses"` to `DEP_EDGE_TYPES`.
- [ ] `graph/render.mjs`: add `"uses"` to `RENDER_EDGE_TYPES`.
- [ ] `graph/builder.mjs`: call `scanComponents` in `buildGraph` (after `scanRoutes`).

### Auto architecture doc
- [ ] `graph/doc.mjs`: `generateArchitectureDoc(graph, validation, root)` → Markdown (summary, entry points, routes, top components by `uses`, validation table, regenerate note).
- [ ] `graph/cli.mjs`: `doc [--out <path>]` default `docs/generated/ARCHITECTURE.md`.

### Interactive HTML report
- [ ] `graph/report.mjs`: `generateHtmlReport(graph, validation, {root})` — self-contained HTML (inline style, CDN Mermaid, search table, node detail, validation table, embedded JSON).
- [ ] `graph/cli.mjs`: `report [--out <path>]` default `.openband/graph-report.html`.

### OB-GRAPH-003 alias
- [ ] `graph/specs.mjs`: `api/*` → `backend/src/routes/*` resolution in `resolveTargetNodes`.

### CLI / scripts / gitignore
- [ ] `graph/cli.mjs`: add `doc` + `report` commands (usage line updated).
- [ ] `package.json`: add `graph:doc`, `graph:report` scripts (preserve others).
- [ ] `.gitignore`: add `docs/generated/` and `.openband/graph-report.html`.

### Docs
- [ ] `docs/graph-engineer-devguide.md` (NEW): run commands, read edges, rules, extend, CI.
- [ ] `docs/graph-engineering.md`: quick start + `uses` edge + rule table update + new scripts.

### Tests
- [ ] `tests/graph-engineer-v3.test.mjs` (node:test) with temp-dir fixtures: `uses` edge, doc content, report content, api alias, EDGE_TYPES membership.

## Verification (before commit)
- [ ] `node graph/cli.mjs build` then `node graph/cli.mjs validate` (report OB-GRAPH-003 count before/after alias).
- [ ] `node graph/cli.mjs doc` writes `docs/generated/ARCHITECTURE.md`; open-check it contains routes + validation.
- [ ] `node graph/cli.mjs report` writes `.openband/graph-report.html`; grep for `<html`, validation table, `graph-data`.
- [ ] `node --test tests/graph-engineer-v3.test.mjs` → all pass.
- [ ] Code review via `code-review` subagent.
- [ ] Commit implementation; archive spec to `openspec/archive/graph-engineer-v3/`.
