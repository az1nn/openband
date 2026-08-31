# Tasks — V11 Creative Loop

## Spec correction gate
- [x] Confirm identity taxonomy (ADRs V11-02/03).
- [x] Confirm stable role model (ADR V11-03 + creativeIdentity.resolveStableRole).
- [x] Confirm preview bar convention (ADR V11-05 + previewBudget).
- [x] Confirm generation/promotion separation (ADR V11-01).
- [x] Confirm persistence scope model (ADR V11-06 + creativePersistence).
- [x] Confirm durable approval-token idempotency (ADR V11-02 + snapshotPromotion).
- [x] Confirm audio async lifecycle (ADR V11-08 + previewLifecycle).

## Domain
- [x] implement/reuse recipeFingerprint.
- [x] implement musicalContentHash.
- [x] implement persistenceIntegrityHash separately.
- [x] implement previewCacheKey from musical hash.
- [x] introduce stable track role metadata/sidecar.
- [x] remove unknown->harmony silent fallback.
- [x] define cardinality mismatch policy.

## Session
- [x] implement orthogonal lifecycle/generation/promotion/playback states.
- [x] freeze generation operation inputs.
- [x] selected variation independent from latest.
- [x] history readonly externally.
- [x] storage capacity and visible count explicit.

## Preview
- [x] standardize zero-based half-open bars.
- [x] fix off-by-one behavior.
- [x] enforce hard preview budget including first window.
- [x] invalidate by musical source hash/settings.
- [x] async play rejection cleanup.
- [x] natural-end cleanup.

## Promotion
- [x] ApprovedSnapshot only after explicit approval.
- [x] no generator call on Create.
- [x] durable approvalToken dedupe.
- [x] retry returns same project.
- [x] selected musical hash equality verified.

## Persistence
- [x] creative-session scope always ephemeral.
- [x] project scope durable by policy.
- [x] no preview handles persisted.
- [x] recursive secret redaction.

## Telemetry
- [x] typed event union.
- [x] allowlisted payloads.
- [x] no whole recipe.
- [x] no raw audio/path/token/secrets.

## Verification
- [x] frontend tsc.
- [x] backend tsc.
- [x] full vitest.
- [x] legacy.
- [x] graph:ci.
- [x] build.
- [x] V10 regression.
- [x] V11 regression.
