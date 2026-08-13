# Design: Modulation Unipolar Symmetric Range

> **Status: PROPOSED.**

## Fix Location

`src/lib/modulationMatrix.ts`, function `computeModulation`, lines 326-330:

```ts
if (route.bipolar) {
  total += sourceValue * route.amount;
} else {
  total += (sourceValue * 0.5 + 0.5) * route.amount;  // BUG: maps [-1,1] to [0,amount]
}
```

## Change

Replace the unipolar `else` branch so the source contribution is centered
(+/-amount) rather than offset to [0, amount]:

```ts
if (route.bipolar) {
  total += sourceValue * route.amount;
} else {
  total += sourceValue * route.amount;  // symmetric [-amount, +amount]
}
```

After the fix both branches are mathematically identical (`sourceValue *
route.amount`). The if/else structure is retained so the `bipolar` flag
remains available for future differentiation and the public API is unchanged.

## Downstream Behavior

`applyModulation` (line 450) already clamps the final value to [min, max]:

```ts
const offset = computeModulation(target, context) * range;
return Math.max(min, Math.min(max, baseValue + offset));
```

Because `computeModulation` is clamped to [-1, 1] at line 333, and
`applyModulation` clamps `baseValue + offset` to [min, max], the symmetric
unipolar offset will correctly push the parameter in both directions and is
clamped to the legal range.

## State / API Surface (unchanged)

| Item | Value |
|---|---|
| MOD_SOURCES | 11 entries (lfo1, lfo2, env1, env2, macro1-4, velocity, noteNumber, random) |
| MOD_TARGETS | 11 entries (filter.cutoff, filter.resonance, amp.gain, osc1/2.detune, osc1/2.pitch, lfo1/2.rate, pan.position, volume) |
| ModRoute interface | unchanged (id, source, target, amount, bipolar, enabled) |
| bipolar flag | kept for API/UI compatibility |

## Test Impact (pre-existing tests)

- tests/modulation.test.tsx -- "is deterministic" test sets macro1=1, amount=0.5:
  old=(1*0.5+0.5)*0.5=0.5, new=1*0.5=0.5 - same.
  "offsets a base param value" sets macro1=1, amount=0.5:
  old=0.5, new=0.5 - same.
- tests/modulationMatrix.test.ts -- "offsets a base value into [min, max]" at
  line 57 sets macro1 to default (0), amount=1, unipolar, expects 24:
  old=(0*0.5+0.5)*1=0.5 -> offset=24 -> result=24;
  new=0*1=0 -> offset=0 -> result=0.
  This test encodes the buggy behavior and must be updated to set
  setMacroValue(0, 1) so it remains a meaningful "offsets" assertion.
- tests/modulationMatrixRender.test.ts -- LFO-based tests, unaffected by math
  change (still produce non-zero offsets).

## Files to Change

1. src/lib/modulationMatrix.ts -- line 329: else branch math fix.
2. tests/modulationMatrix.test.ts -- line 57: add setMacroValue(0, 1) + import.
