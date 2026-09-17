# OpenBand Constitution

## I. Single SDD Authority

GitHub Spec Kit is the sole SDD lifecycle framework. OpenSpec is legacy evidence during migration and MUST NOT receive new changes. Feature history is flow-forward; merged feature specs are not rewritten to describe later behavior.

## II. Human-Friendly Documentation

Documentation MUST be concise, precise, useful to a human reader, and free of duplicated status. GitHub owns operational status; Git owns history. Durable knowledge belongs only in architecture, ADRs, contracts, and approved feature artifacts when justified.

## III. PR-First Governance

Production changes MUST flow through branches and pull requests. Agents MUST NOT push directly to `master`.

T2+ changes require a human Design Gate over an exact Design Baseline SHA before implementation. Merge authorization is evidence-driven for every tier: the exact candidate HEAD may merge automatically only when its complete risk-derived verification contract is current and satisfied. A separate human merge approval is not required.

Changed HEAD, materially stale base, missing required evidence, or any required `FAIL`, `BLOCKED`, or `FLAKY` state invalidates merge eligibility until the affected evidence is refreshed.

## IV. Architecture Boundaries

Frontend code in `app/` and `src/` MUST NOT directly depend on Node filesystem, Electron, or Tauri APIs. Runtime-specific I/O crosses the OpenBand bridge (`@bridge` / `OpenBandNative`). Cross-runtime or persistence boundary changes are architectural work and require explicit design review.

## V. Evidence Over Claims

A change is complete only when material behavior is backed by relevant tests, checks, reviews, and documentation reconciliation. Required failures MUST NOT be masked, ignored, skipped into success, or reclassified as success. Security, data integrity, concurrency, and deterministic DSP changes require stronger verification proportional to risk.

If a regression class matters to correctness, safety, compatibility, or creator-visible behavior, the repository MUST encode evidence capable of detecting it before automatic merge is trusted for that class. Missing required proof is `BLOCKED`, not implicit `PASS`.

## VI. Least Privilege

Agents and automation receive only the permissions needed for their phase. Design agents cannot edit product source before the Design Gate. Implementation and merge automation cannot bypass required evidence, CI, policy checks, or `master` protections. Secrets MUST NOT appear in specs, logs, commits, handoffs, or generated documentation.

Merge authorization does not authorize destructive runtime actions. Rollback, redeploy, credential rotation, access-control changes, data repair/deletion, or comparable production mutations follow their own explicit authorization policy.

Privileged post-CI merge automation MUST execute trusted default-branch policy only, MUST NOT execute candidate PR code or candidate artifacts, and MUST fail closed for untrusted head repositories, stale HEAD/base identity, or missing approved evidence.

## Governance

`AGENTS.md` defines operational agent policy; this Constitution defines durable invariants. A conflict is resolved in favor of this Constitution. Material amendments require a dedicated governance PR with rationale, impact analysis, verification, and human Design Gate approval.

**Version**: 1.1.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-17
