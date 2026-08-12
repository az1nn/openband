# Tasks: wouldCreateCycle error on missing fromId

## Files
- `src/lib/audioGraphValidation.ts`

## Checklist
1. `read src/lib/audioGraphValidation.ts` — confirm `wouldCreateCycle` body.
2. After the `fromId === toId` self-route block, add an early-return:
   ```ts
   if (!testGraph.nodes.has(fromId)) {
     return {
       valid: false,
       cyclePath: [fromId, toId],
       errorMessage: `Cannot create route: source node "${fromId}" is not in the graph`,
     };
   }
   ```
3. Confirm the existing `fromNode` lookup / edge-mutation block remains
   intact and is now only reachable when `fromId` exists.
4. Confirm `validateGraph` import / call path is unchanged for the normal
   case.
5. Run `npx tsc --noEmit` — fix any errors in touched file only.
6. Run `npx vitest run tests/specs-group4.test.ts tests/lib3.test.ts` —
   confirm pass.

## Verification expectations
- `wouldCreateCycle(graph, "missing", "master")` →
  `{ valid: false, cyclePath: ["missing", "master"], errorMessage: ... }`.
- `wouldCreateCycle` with a present `fromId` still returns the original
  cycle-detection result.

## Tests
- No test asserts the old buggy `{ valid: true }` for a missing source; no
  test updates expected.
