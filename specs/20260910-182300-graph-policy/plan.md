# Plan: Spec Kit Architecture Graph and Policy Checks

## Approach

Preserve the existing graph model and CLI. Replace only the legacy specification scanner inputs, then add a small zero-dependency SDD policy checker beside the graph toolchain.

## Changes

1. Update `graph/specs.mjs` to discover only normative Spec Kit/durable knowledge artifacts.
2. Update `graph/core.mjs` node-type detection and `graph/builder.mjs` cache tracking away from `openspec/`.
3. Generalize `OB-GRAPH-003` wording in `graph/validate.mjs`.
4. Add `scripts/sdd-policy-check.mjs` to validate feature sidecars/artifacts without owning lifecycle state.
5. Add `sdd:check` to `package.json` and run it in the CI graph job.
6. Add fixture-based tests for Spec Kit scanning, ignored managed/task artifacts, determinism, and policy failures.
7. Reconcile graph specialist/docs away from OpenSpec terminology.

## Impact

This changes engineering evidence generation, not product/runtime behavior. Graph schema, edge types, existing product scanners, and serialization stay unchanged.

## Verification

- `npm run sdd:check`
- graph-specific fixture tests
- `npm run graph:ci`
- `npx vitest run`
- repository CI after the stacked PR reaches `master`

## Architecture Decision

ADR: **NOT REQUIRED**. The Architecture Graph remains the same subsystem with the same schema and responsibility. This feature only migrates its normative inputs and adds objective policy validation already defined by the Constitution/`AGENTS.md`.
