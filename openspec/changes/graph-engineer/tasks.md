# Tasks: Graph Engineer V1

- [ ] Create Graph Engineer spec files and commit spec.
- [ ] Implement `graph/schema.ts` and `graph/core.mjs` for versioned graph types, normalization, and deterministic serialization.
- [ ] Implement `graph/scan.mjs` for static ES imports, aliases (`@/`, `@bridge`), dynamic imports, CJS require, and route discovery (`app/`, `backend/`, `api/`).
- [ ] Implement `graph/specs.mjs` for OpenSpec markdown path extraction and test relationship scanning.
- [ ] Implement `graph/builder.mjs` to orchestrate scanners and build `.openband/graph.json`.
- [ ] Implement `graph/traversal.mjs`, `graph/impact.mjs`, and `graph/relations.mjs` for BFS paths, dependency/dependent queries, impact risk scoring, and context bundling.
- [ ] Implement `graph/validate.mjs` for `OB-GRAPH-001` (bridge isolation), `OB-GRAPH-002` (cycle detection), and `OB-GRAPH-003` (unresolved spec paths).
- [ ] Implement `graph/cli.mjs` supporting build, validate, deps, dependents, path, impact, context commands with `--json`.
- [ ] Add `graph:*` scripts to `package.json`, update `.gitignore` for `.openband/graph.json`.
- [ ] Create `agents/graph-engineer.md` and `docs/graph-engineering.md`.
- [ ] Write and run comprehensive unit tests (`tests/graph-engineer.test.mjs`), verify CLI execution.
