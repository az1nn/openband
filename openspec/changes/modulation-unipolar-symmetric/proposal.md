# Proposal: Symmetric Unipolar Modulation in Modulation Matrix

## Context
In OpenBand's modulation matrix (`src/lib/modulationMatrix.ts`), modulation routes can be configured as bipolar (`bipolar: true`) or non-bipolar/unipolar (`bipolar: false`). Previously, non-bipolar modulation multiplied the source signal by `amount` (effectively mapping `[0, 1]` to `[0, amount]`), preventing unipolar sources (like unipolar LFOs, envelopes, or macros) from driving parameters below their base values.

## Objective
Update non-bipolar (unipolar) modulation math in `computeModulation` to map source signals from `[0, 1]` to `[-1, 1]` centered (`[-amount, +amount]`). This allows unipolar modulation to symmetrically decrease and increase parameters around their base values, while keeping bipolar behavior and source/target counts unchanged.
