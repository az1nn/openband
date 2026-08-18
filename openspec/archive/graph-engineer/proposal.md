## Status: SHIPPED

# Proposal: Graph Engineer V1

## Context
OpenBand requires a robust architectural dependency graph engine and validation harness to track static imports, Expo/Express routes, OpenSpec document cross-references, test relationships, and architectural invariants (such as desktop bridge isolation and cycle detection).

## Objectives
1. Implement schema, deterministic serialization, and core graph data structures (`graph/schema.ts`, `graph/core.mjs`).
2. Implement static source scanner (`graph/scan.mjs`) for ES imports, workspace aliases (`@/`, `@bridge`), dynamic imports, CJS require, and route discovery under `app/`, `backend/`, `api/`.
3. Implement OpenSpec & Test scanners (`graph/specs.mjs`) for markdown path extraction (`specifies` edges) and test dependency mapping.
4. Implement Graph Builder (`graph/builder.mjs`) assembling the graph into `.openband/graph.json`.
5. Implement Traversal, Impact Analysis & Queries (`graph/traversal.mjs`, `graph/impact.mjs`, `graph/relations.mjs`) supporting BFS paths, direct/transitive dependencies/dependents, risk scoring (`LOW`, `MEDIUM`, `HIGH`), and compact context bundling.
6. Implement Architecture Validation (`graph/validate.mjs`) enforcing `OB-GRAPH-001` (bridge isolation), `OB-GRAPH-002` (dependency cycle detection), and `OB-GRAPH-003` (unresolved spec path warnings).
7. Implement CLI (`graph/cli.mjs`) and npm scripts (`graph:*`), Graph Engineer agent definition (`agents/graph-engineer.md`), and documentation (`docs/graph-engineering.md`).
