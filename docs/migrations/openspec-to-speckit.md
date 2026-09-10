# OpenSpec → GitHub Spec Kit

OpenBand now uses GitHub Spec Kit as its sole specification-driven development lifecycle. The migration intentionally reconciles **semantics and authority**, not directory shapes.

## Current authority

`Constitution → docs/architecture.md / ADRs / stable contracts → specs/*/spec.md → plan.md → tasks.md → implementation → tests/CI/Architecture Graph`

GitHub Issues track demand and ownership; PRs carry design/review/integration evidence; Git history is definitive history. `AGENTS.md` is the operational agent policy. Spec Kit owns feature lifecycle/order/state.

## Legacy handling

Every top-level legacy unit is dispositioned in `docs/migrations/openspec-manifest.md`. The full pre-deletion corpus is preserved by the annotated Git tag `openspec-final`; no `openspec/archive` is copied into the new tree.

Three durable cross-feature contracts were distilled rather than copied: audio transport, project persistence, and collaboration/CRDT. Native build verification remains explicit future demand in Issue #43.

## New work

Use `openband-ask` for the canonical risk-proportional path or direct `/speckit.*` commands for advanced control. Direct commands remain subject to `AGENTS.md`, OpenCode permissions, policy checks, human gates and CI.
