# Plan: Pan Automation Interpolation Modes

## Approach

Keep the persisted curve enum unchanged and make interpolation target-aware only where the numeric domain requires it.

Volume continues to use the existing generic `applyAutomationToParam()` / `interpolateAutomationValue()` semantics. Pan receives additive helpers in `automationEngine.ts` that understand the signed domain and are consumed by both visualization and `renderTrackStem()`.

## Pan interpolation contract

For a segment from `p0` to `p1`:

- `linear`: `p0 + (p1 - p0) * f`.
- `exponential`: `p0 + (p1 - p0) * (expm1(f) / expm1(1))`.
- clamp `f` to `[0,1]`;
- preserve exact endpoint values;
- clamp project/UI output to `-100..100` and Web Audio output to `-1..1`.

The curve type remains associated with the destination automation point, matching the current AutomationLane/automationEngine convention.

## Implementation shape

1. Add a pure pan-specific interpolation helper that can evaluate a signed pan schedule at any time without changing the existing generic helper.
2. Add a pan-specific AudioParam scheduler for `OfflineAudioContext`. It derives signed-safe intermediate values from the same helper and schedules bounded linear ramps/samples; it MUST NOT call `exponentialRampToValueAtTime` for pan.
3. Keep scheduler sampling deterministic and outside UI animation loops. Verification must bound the maximum deviation from the pure helper at representative timestamps.
4. Extend `AutomationLane` with an opt-in pan interpolation mode/strategy. Default callers continue using the existing volume-compatible visualization path.
5. In `app/studio/[id].tsx`, enable `showCurveToggle` and the pan-specific interpolation mode only for the pan lane.
6. In `renderTrackStem()`, keep volume on `applyAutomationToParam()`; route only `key === "pan"` through the new signed-safe scheduler.
7. Do not modify `renderTracksToWavBlob()`, persistence schema, bridge/runtime boundaries or unrelated automation targets in this feature.

## Compatibility

- No migration.
- Existing points keep the same `AutomationPoint` representation.
- New pan points remain linear.
- Existing linear pan projects are behaviorally unchanged.
- Explicit persisted pan points already marked `exponential` adopt the now-defined signed-pan behavior; this is the intentional correction for that mode.
- Volume `exponential` remains the existing geometric positive-domain ramp.

## Architecture / impact

Recent repository-owned Graph evidence classifies `src/lib/midiSynth.ts` as HIGH impact. The exact `graph:impact` command cannot be executed from the current connector-only host, so this plan does not claim a fresh numeric result. T3 is deliberately conservative; implementation in a capable checkout must rerun impact analysis before final verification.

The feature remains within the existing audio-render architecture. If implementation requires changing project persistence, export rendering, PlaybackEngine ownership, cross-runtime bridges or generic automation semantics, stop and re-plan.

## Specialist review

Because audible automation changes cross Studio playback/rendering, implementation verification includes the audio-reviewer checklist:

- no automation math added to rAF/UI loops;
- no AudioContext lifecycle regression;
- signed AudioParam scheduling is valid;
- rendered automation remains deterministic for the same inputs;
- no unrelated playback/export behavior changes.

## Verification strategy

The schemaVersion 2 evidence contract requires:

- `graph-check` (including `sdd:check`, Graph Spec Kit tests and `graph:ci`);
- `security-policy`;
- `frontend-typecheck`;
- `backend-typecheck`;
- `vitest`;
- `legacy-tests`;
- `web-build`;
- `web-launch-e2e`;
- `merge-gate`.

Before implementation, those producers must be healthy on the exact design HEAD and automated design/policy validation must be green. The privileged evidence-merge workflow is not a substitute for missing design evidence and must fail closed on stale or incomplete evidence.

After implementation:
- pure helper tests for linear and signed exponential semantics;
- scheduler tests with a mocked AudioParam proving no pan exponential ramp API is used;
- AutomationLane tests proving pan toggle + visual interpolation;
- renderTrackStem regression proving signed pan automation schedules without failure;
- existing volume exponential fixtures unchanged;
- full required evidence contract on the exact implementation HEAD;
- audio-reviewer/read-only specialist evidence;
- implementation-time Architecture Graph impact recheck.

## Merge model

After automated design validation is green and implementation/convergence is complete, the exact merge-candidate HEAD is evaluated by the repository's evidence-driven Merge Gate. No separate human design or merge ceremony is required when the complete current contract is satisfied.

## Architecture decision

ADR: NOT REQUIRED.
