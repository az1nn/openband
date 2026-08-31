# Tasks — V11 Creative Loop

## Spec correction gate
- [ ] Confirm identity taxonomy.
- [ ] Confirm stable role model.
- [ ] Confirm preview bar convention.
- [ ] Confirm generation/promotion separation.
- [ ] Confirm persistence scope model.
- [ ] Confirm durable approval-token idempotency.
- [ ] Confirm audio async lifecycle.

## Domain
- [ ] implement/reuse recipeFingerprint.
- [ ] implement musicalContentHash.
- [ ] implement persistenceIntegrityHash separately.
- [ ] implement previewCacheKey from musical hash.
- [ ] introduce stable track role metadata/sidecar.
- [ ] remove unknown->harmony silent fallback.
- [ ] define cardinality mismatch policy.

## Session
- [ ] implement orthogonal lifecycle/generation/promotion/playback states.
- [ ] freeze generation operation inputs.
- [ ] selected variation independent from latest.
- [ ] history readonly externally.
- [ ] storage capacity and visible count explicit.

## Preview
- [ ] standardize zero-based half-open bars.
- [ ] fix off-by-one behavior.
- [ ] enforce hard preview budget including first window.
- [ ] invalidate by musical source hash/settings.
- [ ] async play rejection cleanup.
- [ ] natural-end cleanup.

## Promotion
- [ ] ApprovedSnapshot only after explicit approval.
- [ ] no generator call on Create.
- [ ] durable approvalToken dedupe.
- [ ] retry returns same project.
- [ ] selected musical hash equality verified.

## Persistence
- [ ] creative-session scope always ephemeral.
- [ ] project scope durable by policy.
- [ ] no preview handles persisted.
- [ ] recursive secret redaction.

## Telemetry
- [ ] typed event union.
- [ ] allowlisted payloads.
- [ ] no whole recipe.
- [ ] no raw audio/path/token/secrets.

## Verification
- [ ] frontend tsc.
- [ ] backend tsc.
- [ ] full vitest.
- [ ] legacy.
- [ ] graph:ci.
- [ ] build.
- [ ] V10 regression.
- [ ] V11 regression.
