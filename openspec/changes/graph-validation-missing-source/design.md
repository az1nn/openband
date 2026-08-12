# Design: wouldCreateCycle error on missing fromId

## Current return shape
```ts
export interface GraphValidationResult {
  valid: boolean;
  cyclePath?: string[];
  errorMessage?: string;
}
```

## Existing branches
1. `fromId === toId` → `{ valid: false, cyclePath: [fromId, toId], errorMessage: "Cannot route a node to itself" }`.
2. Normal case → edge added to clone, `validateGraph` runs.

## Proposed change
After the self-route check, add an early-return for a missing source:

```ts
if (!testGraph.nodes.has(fromId)) {
  return {
    valid: false,
    cyclePath: [fromId, toId],
    errorMessage: `Cannot create route: source node "${fromId}" is not in the graph`,
  };
}
```

This runs **before** the clone / edge-mutation block, so the unchanged-graph
`validateGraph` call is never reached for the error case. The normal case
path (fromNode present) is untouched.

## Resulting branches
1. `fromId === toId` → self-route error (unchanged).
2. `fromId` not in graph → missing-source error (NEW).
3. `fromId` present → add edge, `validateGraph` (unchanged).

## No new dependencies / no signature changes
