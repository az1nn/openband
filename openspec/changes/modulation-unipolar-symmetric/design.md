# Design: Symmetric Unipolar Modulation

## Architectural Changes
- Modify `computeModulation` in `src/lib/modulationMatrix.ts`.
- For routes where `route.bipolar` is `false` (non-bipolar / unipolar):
  - Normalize/clamp source signal to `[0, 1]`.
  - Map `[0, 1]` to `[-1, 1]` centered via `(sourceValue * 2 - 1) * route.amount`.
  - Results in a contribution range of `[-amount, +amount]`, allowing parameters to decrease below base value as well as increase above it.
- For routes where `route.bipolar` is `true` (bipolar):
  - Retain existing behavior (`sourceValue * route.amount`).
- Ensure output total is clamped to `[-1, 1]` and final `applyModulation` output is clamped to `[min, max]`.
- Keep `getModSources()` and `getModTargets()` returning exactly 11 items each.
- Do not modify live rAF engine LFO-rate-target wiring.
