# Design: Unit Test Suite for Recent Fixes

## Test Specifications & File Mappings

### 1. Mastering True-Peak / FIR Oversampling (`tests/lufs.test.ts`)
- Add test case verifying inter-sample peaks on signals crafted to produce inter-sample peaks (e.g. high-frequency tones or modulated windowed tones).
- Assert `truePeak` correctly identifies peaks exceeding sample peaks due to 4x oversampling reconstruction filter.

### 2. Clock Manager Interval Update (`tests/lib3.test.ts`)
- Test `startClock` lifecycle management in `src/lib/clockManager.ts`.
- Verify calling `startClock(50)` while running (or restarting with a new interval) terminates the previous worker instance and maintains correct running state without leaks.

### 3. Graph Validation Missing Source (`tests/lib3.test.ts`)
- Test `wouldCreateCycle(graph, "non-existent-node", "master")`.
- Assert result returns `{ valid: false, errorMessage: ... }` indicating the source node is not in the graph.

### 4. Modulation Unipolar Symmetric (`tests/modulationMatrix.test.ts`)
- Test `computeModulation` with `bipolar: false` for macro/source values:
  - Source value `0` → maps to `-amount`
  - Source value `0.5` → maps to `0`
  - Source value `1.0` → maps to `+amount`
