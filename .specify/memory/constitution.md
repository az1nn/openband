# OpenBand Constitution

## I. Single SDD Authority

GitHub Spec Kit is the sole SDD lifecycle framework. OpenSpec is legacy evidence during migration and MUST NOT receive new changes. Feature history is flow-forward; merged feature specs are not rewritten to describe later behavior.

## II. Human-Friendly Documentation

Documentation MUST be concise, precise, useful to a human reader, and free of duplicated status. GitHub owns operational status; Git owns history. Durable knowledge belongs only in architecture, ADRs, contracts, and approved feature artifacts when justified.

## III. PR-First Governance

Production changes MUST flow through branches and pull requests. Agents MUST NOT push directly to `master`. T2+ changes require a human Design Gate before implementation and a human Merge Gate over the verified PR head.

## IV. Architecture Boundaries

Frontend code in `app/` and `src/` MUST NOT directly depend on Node filesystem, Electron, or Tauri APIs. Runtime-specific I/O crosses the OpenBand bridge (`@bridge` / `OpenBandNative`). Cross-runtime or persistence boundary changes are architectural work and require explicit design review.

## V. Evidence Over Claims

A change is complete only when material behavior is backed by relevant tests, checks, reviews, and documentation reconciliation. Required failures MUST NOT be masked, ignored, or reclassified as success. Security, data integrity, concurrency, and deterministic DSP changes require stronger verification proportional to risk.

## VI. Least Privilege

Agents and automation receive only the permissions needed for their phase. Design agents cannot edit product source. Implementation agents cannot bypass gates, CI, or `master` protections. Secrets MUST NOT appear in specs, logs, commits, handoffs, or generated documentation.

## Governance

`AGENTS.md` defines operational agent policy; this Constitution defines durable invariants. A conflict is resolved in favor of this Constitution. Material amendments require a dedicated governance PR with rationale, impact analysis, verification, and human approval.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
