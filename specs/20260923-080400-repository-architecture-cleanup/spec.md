# Feature: Repository Architecture and Folder Cleanup

**Tier:** T3 — repository architecture and destructive cleanup
**Issue:** #110

## Goal

Reduce the active repository to the surfaces that are actually part of OpenBand product delivery, verification, or supported engineering workflows, without changing creator-visible behavior.

## Requirements

- **FR-001** The canonical backend remains the TypeScript service under `backend/`, including the existing serverless adapter and backend CI.
- **FR-002** Remove the unreferenced legacy Python microservice prototype tree that duplicates the canonical backend boundary.
- **FR-003** Remove root-level scratch/export artifacts that have no repository references and are not build, runtime, documentation, or verification inputs.
- **FR-004** Preserve active engineering surfaces required by Spec Kit, Architecture Graph, session routing, CI, Storybook, marketing knowledge validation, native builds, Web export, WASM tests, and release assets.
- **FR-005** Do not change product runtime semantics, persistence formats, native signing policy, CI trust policy, dependency ranges, or public APIs.
- **FR-006** Repository reference search after cleanup must not expose a live dependency on any removed surface.
- **FR-007** The existing exact-HEAD CI evidence contract must remain green after cleanup.

## Acceptance

1. The duplicate legacy backend prototype and unreferenced root scratch artifacts are absent from the candidate tree.
2. The canonical TypeScript backend, Web app, native projects, assets, product tests, marketing validation, Spec Kit, and Architecture Graph remain present.
3. No surviving source, config, workflow, normative documentation, or test requires a deleted file.
4. SDD/Graph policy, typechecks, Vitest, legacy tests, Web build, launch E2E, security policy, and Merge Gate pass on the exact PR HEAD.
