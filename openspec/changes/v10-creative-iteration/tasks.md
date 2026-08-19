# Tasks: V10 Creative Iteration

## A. Exact promotion (implementation target)

- [x] A1. Approved snapshot music hash equals promoted project music hash — `src/lib/snapshotPromotion.ts` `contentHash` + `tests/projectStarterPromotion.test.ts`.
- [x] A2. Persistent ID re-key does not alter notes/timing/plugins/pan/volume/arrangement — `src/lib/snapshotPromotion.ts` `normalizedRecipe` + `tests/projectStarterPromotion.test.ts`.
- [ ] A3. Promotion does not invoke generation again — wire `src/components/NewProject.tsx` + `src/lib/projectStarter.ts` to call the gate and reuse the approved snapshot.
- [x] A4. Stale unapproved render cannot replace approved snapshot — `src/lib/snapshotPromotion.ts` `computeStale` + `tests/projectStarterPromotion.test.ts`.
- [x] A5. UI parameter edits after approval do not silently mutate approved content — `src/lib/snapshotPromotion.ts` `normalizedRecipe`/`computeStale` + `tests/projectStarterPromotion.test.ts`.
- [ ] A6. Double tap Create creates one project — route Create through a stable per-session `createPromotionGate`.
- [ ] A7. Re-render of NewProject does not create duplicate project — stabilize gate instance across renders.
- [ ] A8. Closing wizard creates no project — only explicit Create invokes promotion.
- [ ] A9. Failed persistence leaves approval state recoverable/retriable without duplicate project — gate minting deferred until persistence success.
- [ ] A10. Preview blob URLs are not stored as durable project assets unless explicitly promoted — session-scoped preview isolation in promotion path.

## B. Seed determinism (planned phase)
- [ ] B11. Same recipe+seed+generator version => same normalized content hash.
- [ ] B12. Different seeds => at least one unlocked musical dimension differs.
- [ ] B13. Seed serialization round-trip preserves output.
- [ ] B14. Invalid/missing seed is normalized deterministically.
- [ ] B15. Generation does not read global Math.random in tested variation path.
- [ ] B16. Web/native normalized musical content matches for same recipe.

## C. Locks (planned phase)
- [ ] C17. Rhythm lock preserves drum event hash.
- [ ] C18. Bass lock preserves bass role hash.
- [ ] C19. Harmony lock preserves chord/harmonic event hash.
- [ ] C20. Melody lock preserves melody role hash.
- [ ] C21. FX lock preserves plugin/preset normalized hash.
- [ ] C22. Multiple locks compose.
- [ ] C23. All locks + regenerate yields equivalent musical snapshot.
- [ ] C24. Changing BPM with locked content follows documented transform/reject policy.
- [ ] C25. Changing key with locked harmony follows documented transform/reject policy.
- [ ] C26. Changing genre detects incompatible locks.
- [ ] C27. Incompatible lock is never silently discarded.

## D. Variation history (planned phase)
- [ ] D28. Default history keeps 3 snapshots.
- [ ] D29. Hard max keeps at most 5.
- [ ] D30. Selected snapshot is not evicted.
- [ ] D31. Eviction revokes unused preview resource.
- [ ] D32. Switching A/B does not regenerate content.
- [ ] D33. Promoting B promotes B, not latest generated C.
- [ ] D34. Session reset clears history safely.

## E. Arrangement preview (planned phase)
- [ ] E35. Known subgenre returns arrangement sections — `src/lib/arrangementGenerator.ts` `generateArrangement`.
- [ ] E36. Representative selector chooses <= configured max windows.
- [ ] E37. Selected windows stay within preview budget.
- [ ] E38. At least one high-energy section is selected when available.
- [ ] E39. Low/medium contrast is selected when available.
- [ ] E40. No-arrangement genre falls back to short-loop preview.
- [ ] E41. Manual section selection plays requested section.
- [ ] E42. BPM/key change invalidates render cache but not unrelated session state.
- [ ] E43. Full 48–112 bar arrangement is not rendered on each tweak.
- [ ] E44. Preview window boundaries do not exceed generated content duration.

## F. Concurrency / race safety (planned phase)
- [ ] F45. Latest generation wins.
- [ ] F46. Old render completion cannot replace newer snapshot.
- [ ] F47. Approval during in-flight newer render keeps explicitly approved revision.
- [ ] F48. Rapid 50 regenerate clicks remain bounded.
- [ ] F49. Rapid lock toggles do not corrupt selected snapshot.
- [ ] F50. Close during render discards result and disposes it.
- [ ] F51. Background/unmount stops playback.
- [ ] F52. Two simultaneous Create events are idempotent.

## G. Audio / resource safety (planned phase)
- [ ] G53. Preview output volume remains within normalized safe range.
- [ ] G54. No direct 0–100 track volume is applied as raw GainNode multiplier.
- [ ] G55. Blob URL registry returns to baseline after session disposal.
- [ ] G56. OfflineAudioContext/resource count stays bounded over repeated variations.
- [ ] G57. Playback stops before old resource is revoked.
- [ ] G58. No orphan timer/debounce survives unmount.
- [ ] G59. Failed render does not leak previous/new URL.
- [ ] G60. Autoplay policies still require user gesture where platform requires it.

## H. Persistence / privacy / security (planned phase)
- [ ] H61. No unapproved snapshot is written to ProjectStore.
- [ ] H62. No unapproved snapshot is uploaded to Supabase/cloud.
- [ ] H63. Telemetry excludes MIDI/audio/title/raw user content.
- [ ] H64. Approval token cannot promote a snapshot from another preview session.
- [ ] H65. Content hash is not used as an authorization token.
- [ ] H66. Malformed imported recipe is validated before generation.
- [ ] H67. Recipe schema version mismatch fails safely or migrates explicitly.

## I. Regression (planned phase)
- [ ] I68. Existing Start From Scratch path still works.
- [ ] I69. Existing genre/mood/details flow still works.
- [ ] I70. Existing onboarding create flow still routes to Studio.
- [ ] I71. Existing projectStarter tests stay green.
- [ ] I72. Existing audio preview/feed tests stay green.

## Verification
- [ ] Run `npx tsc --noEmit`
- [ ] Run `cd backend && npx tsc --noEmit`
- [ ] Run `npx vitest run`
- [ ] Run `npm run test:legacy`
- [ ] Run `npm run graph:ci`
- [ ] Run `npm run build`
