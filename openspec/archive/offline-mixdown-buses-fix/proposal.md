# Proposal: Integrate Bus Router and Aux Sends into Offline Mixdown

## Problem
In `src/lib/universalAudio.ts` (`renderMixdownWeb`), offline mixdown applies per-track gain and pan directly to `ctx.destination`. It ignores sub-mix bus routing (`track.outputId`) and auxiliary sends (`track.sends`), causing exported audio bouncers/mixdowns to omit bus processing and aux effects.

## Objectives
1. Update `buildBusRouteGraph` in `src/lib/busRouter.ts` to support auxiliary sends (`track.sends`).
2. Integrate `buildBusRouteGraph` into `renderMixdownWeb` in `src/lib/universalAudio.ts` so exported mixdowns route audio through sub-mix buses and aux sends correctly.
3. Verify with TypeScript type-checking and Vitest test suite.
