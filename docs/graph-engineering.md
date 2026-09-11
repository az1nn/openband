# Architecture Graph

OpenBand maintains a zero-dependency Architecture Graph in `graph/`. It is engineering evidence for dependencies, routes, tests, normative specification citations, and architectural invariants. It is **not** a lifecycle/status engine and it does not replace semantic architecture review.

## Commands

```bash
npm run sdd:check
npm run graph:build
npm run graph:validate
npm run graph:impact -- <id>
npm run graph:context -- <id>
npm run graph:deps -- <id>
npm run graph:dependents -- <id>
npm run graph:path -- <from> <to>
npm run graph:render -- <id> --depth 2
npm run graph:ci
npm run graph:doc
npm run graph:report
```

Every Graph CLI command also accepts `--root <dir>`; query commands support `--json` where applicable.

## Authority scanned as `spec`

Only normative artifacts create `spec` nodes and `specifies` edges:

- `specs/*/spec.md`
- `docs/architecture.md`
- `docs/adr/**/*.md`
- `docs/contracts/**/*.md`

The scanner intentionally ignores:

- `.specify/**` managed templates/scripts/memory
- feature `plan.md` and `tasks.md`
- `openband.json`
- migration notes
- arbitrary Markdown documentation

This keeps the Graph aligned with behavioral/durable authority instead of operational artifacts.

## Schema

```ts
type NodeType = 'source' | 'route' | 'test' | 'spec' | 'external';
type EdgeType = 'import' | 'route' | 'test' | 'specifies' | 'dynamic-import' | 'require' | 'uses';
```

The serialized schema remains version `1.1.0`. Nodes are ordered by `id`; edges by `(source, target, type)`. Metadata is excluded from serialization so repeated builds are deterministic.

## Validation

| Code | Meaning | Default |
| --- | --- | --- |
| `OB-GRAPH-001` | Frontend directly imports desktop/native I/O instead of `@bridge` / `OpenBandNative`. | error |
| `OB-GRAPH-002` | Dependency cycle across import/require/dynamic-import edges. | error |
| `OB-GRAPH-003` | A normative artifact cites an unresolved repository path. | warning |
| `OB-GRAPH-004` | Source has no inbound dependency edge and may be orphaned. | warning |
| `OB-GRAPH-005` | Source has no associated test edge. | warning |

`graph:ci` fails on `001/002`; `--strict` can promote `004/005` and enforce warning limits.

## SDD policy check

`scripts/sdd-policy-check.mjs` validates objective repository invariants only:

- valid `openband.json` shape;
- no mutable status/approval fields in sidecars;
- T2+ has `spec.md`, `plan.md`, `tasks.md`;
- dependencies resolve to feature directories in the checkout;
- T3/T4 has an explicit `ADR: docs/adr/...` or `ADR: NOT REQUIRED` outcome;
- T4 plans include adversarial verification and rollback/recovery planning.

It deliberately does **not** decide whether an architectural choice is good, whether a tier should be lowered, or whether a human approval exists. Those are governed by `AGENTS.md`, Spec Kit workflow state, GitHub evidence, and human review.

## Impact assessment

For T2+ changes affecting existing modules, use the Graph before planning:

```text
semantic tier → graph impact → KEEP or ELEVATE tier
```

Graph evidence can reveal cross-boundary fan-out, shared-state or multi-runtime blast radius. A small graph never authorizes downgrading a semantic risk trigger.

## Generated artifacts

- `graph:build` → `.openband/graph.json`
- `graph:doc` → `docs/generated/ARCHITECTURE.md`
- `graph:report` → `.openband/graph-report.html`

These are derived evidence, not durable product authority.

## Extending

Keep `graph/core.mjs` as the single schema/serialization definition. Add scanner behavior in the relevant scanner, validation in `graph/validate.mjs`, and fixture coverage under `tests/`. Do not add npm dependencies to Graph/policy runtime code.
