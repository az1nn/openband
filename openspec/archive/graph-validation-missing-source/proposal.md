# Proposal: audioGraphValidation wouldCreateCycle no-ops on missing fromId

## Context
`src/lib/audioGraphValidation.ts` provides `wouldCreateCycle(graph, fromId,
toId)` which callers use to preview whether adding an edge would introduce a
feedback loop before mutating state.

## Problem
Lines 148-154:

```ts
const fromNode = testGraph.nodes.get(fromId);
if (fromNode) {
  testGraph.nodes.set(fromId, {
    ...fromNode,
    outputs: [...fromNode.outputs, toId],
  });
}

return validateGraph(testGraph);
```

When `fromId` is **not present** in `graph.nodes`, `fromNode` is `undefined`,
the `if` block is skipped, and `validateGraph` is called on the **unchanged**
graph. This returns `{ valid: true }` — incorrectly signalling that the route
is safe. A route whose source track does not exist in the graph is a data
error and should be rejected, not silently accepted.

## Objective
When `fromId` is absent from the graph, return
`{ valid: false, cyclePath: [fromId, toId], errorMessage: ... }`. Preserve
the existing cycle-detection path for the normal case.
