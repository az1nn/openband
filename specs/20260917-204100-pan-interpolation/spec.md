# Pan Automation Interpolation Modes

Issue #99 · Tier T3

## Goal

Make pan automation interpolation selectable and truthful across the full signed pan domain (`-100..100`) while preserving existing volume-automation behavior and project compatibility.

## Requirements

- **FR-001** The pan automation lane exposes the existing curve toggle for eligible interior points. New points remain `linear` by default.
- **FR-002** Linear pan interpolation preserves the current behavior exactly.
- **FR-003** Pan `exponential` interpolation is defined for positive, negative, zero-touching and center-crossing segments. It MUST NOT silently fall back to linear merely because a pan endpoint is `<= 0`.
- **FR-004** Pan exponential interpolation uses signed-domain exponential time easing. For normalized segment progress `f ∈ [0,1]`, `ease(f) = expm1(f) / expm1(1)`, and `value(f) = p0 + (p1 - p0) * ease(f)`. Endpoints remain exact and monotonic between `p0` and `p1`.
- **FR-005** The Studio curve visualization and the audible pan automation scheduler derive values from the same pan-specific interpolation contract.
- **FR-006** Volume automation keeps its existing positive-domain geometric exponential semantics. This feature MUST NOT change generic volume interpolation results.
- **FR-007** The persisted `AutomationPoint` shape and `curve: "linear" | "exponential"` enum remain compatible; no migration or new project schema is introduced. Existing default/linear pan automation remains audibly unchanged.
- **FR-008** Pan automation values remain bounded to the existing `-100..100` project domain / `-1..1` Web Audio domain.
- **FR-009** Signed pan automation MUST NOT use Web Audio `exponentialRampToValueAtTime`, whose positive-value constraint is incompatible with the pan domain.
- **FR-010** Deterministic tests cover linear behavior, positive-to-positive, negative-to-negative, zero-touching and center-crossing exponential segments, plus visualization/scheduler agreement and volume regression.

## Acceptance

1. A user can toggle a pan automation segment between linear and exponential behavior using the existing AutomationLane interaction model.
2. A negative-only exponential segment is observably non-linear and remains within `-100..100`.
3. A center-crossing exponential segment is continuous, monotonic and reaches both exact endpoints without exceptions or implicit linear fallback.
4. Pan visualization and rendered playback agree at representative timestamps within the scheduler's documented sampling tolerance.
5. Volume interpolation regression fixtures remain behaviorally unchanged at the helper level.
6. Existing projects with linear/default pan automation load without migration and retain the same audible result.
7. Exact-HEAD risk-derived evidence is satisfied before evidence-driven merge eligibility.

## Affected surface

- `src/lib/automationEngine.ts` — additive pan-specific interpolation/scheduling helpers only.
- `src/components/AutomationLane.tsx` — opt-in pan interpolation rendering mode; default behavior unchanged.
- `app/studio/[id].tsx` — enable the curve toggle and pan mode on the existing pan lane.
- `src/lib/midiSynth.ts` — route `renderTrackStem()` pan automation through the signed-safe scheduler.
- focused automation/component/audio-render tests.

## Risk boundary

This work starts as a bounded product capability but is conservatively **T3** because it crosses the Studio visualization/audio-render agreement and touches `src/lib/midiSynth.ts`, a historically HIGH-impact shared renderer surface (recent graph evidence recorded 6 direct / 71 transitive dependents, later 9 / 76 during #49 verification).

The current connector-only tool host cannot execute the repository-local `graph:impact` CLI. Exact design-HEAD SDD/Graph/security policy evidence is mandatory before automated design validation is considered green, and implementation must rerun impact analysis in a capable checkout. Any evidence of persistence/cross-runtime contract changes, export-path expansion, deterministic DSP redesign beyond the bounded pan interpolation rule, or broader blast radius invalidates this baseline and requires re-analysis.

## Non-goals

- Redesigning volume automation or the generic `AutomationPoint` schema.
- Adding Bézier/custom curve editors or additional curve types.
- Changing pan law, stereo panner range, track pan storage, persistence architecture or bridge boundaries.
- Expanding #99 into export correctness; the existing export lifecycle remains separately governed.
- Moving automation calculation into animation/render loops.
- Broad Studio UI redesign.

## Architecture decision

ADR: NOT REQUIRED. The feature stays within the existing automation, Studio and offline stem-render boundaries; it adds a target-specific behavioral contract without introducing a new architecture boundary.
