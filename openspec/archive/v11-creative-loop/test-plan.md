# Test Plan — V11 Creative Loop

## Identity
- ID01 same recipe -> same recipeFingerprint
- ID02 timestamps do not alter recipeFingerprint
- ID03 altered generated MIDI -> different musicalContentHash
- ID04 random track IDs do not alter musicalContentHash
- ID05 persistenceIntegrityHash changes on durable payload mutation
- ID06 variationId is not used as musical equality
- ID07 previewCacheKey changes when musical hash changes

## Roles / locks
- LK01 unknown role explicit, not harmony
- LK02 track reorder does not change role identity
- LK03 genre template order change does not reclassify role
- LK04 locked role content preserved
- LK05 cardinality mismatch surfaced
- LK06 genre incompatibility surfaced
- LK07 BPM incompatibility surfaced
- LK08 key incompatibility surfaced
- LK09 multiple locks compose

## Generation snapshot
- GN01 selected=A then regenerate then select=C -> running op still based on A
- GN02 lock changes after start do not mutate running op
- GN03 recipe changes stale old op
- GN04 latest valid wins
- GN05 close discards result

## Preview
- PV01 0->4 = 4 bars
- PV02 no off-by-one
- PV03 sum windows <= budget
- PV04 oversized first section truncated
- PV05 changed seed/content changes cache key
- PV06 changed locks/content changes cache key
- PV07 unrelated UI state preserves cache
- PV08 selected variation hash matches preview source hash
- PV09 async play rejection releases resource
- PV10 natural ended releases resource
- PV11 close leaves zero owned preview resources

## History
- VH01 storage capacity bounded
- VH02 visible default count = 3
- VH03 selected variation protected per policy
- VH04 entries externally immutable
- VH05 eviction triggers cleanup
- VH06 A->B->A no regeneration

## Promotion
- PR01 Create does not invoke generator
- PR02 ApprovedSnapshot only after explicit action
- PR03 selected != latest promotes selected
- PR04 promoted musical hash == approved musical hash
- PR05 same approvalToken same process -> same project
- PR06 same approvalToken after remount -> same project
- PR07 same approvalToken simulated restart -> same project
- PR08 persistence failure mints no phantom project
- PR09 retry after recovery succeeds

## Persistence
- PS01 session history not durable
- PS02 session locks not durable
- PS03 session meta not durable
- PS04 project follows durable policy
- PS05 blob URL excluded
- PS06 nested secrets redacted
- PS07 Authorization/accessToken/refreshToken/cookie redacted case-insensitively

## State
- ST01 closed terminal
- ST02 playback failure preserves selected variation
- ST03 promotion failure leaves session retryable
- ST04 generation failure preserves history
- ST05 playback/promotion policy explicit

## Telemetry
- TM01 payload allowlist enforced
- TM02 whole recipe not emitted
- TM03 secrets absent
- TM04 raw paths absent
- TM05 raw audio absent

## Regression
- RG01-RG08 V10 pillars green
- RG09 V11 functional green
- RG10 full build matrix green
