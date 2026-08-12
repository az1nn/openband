# Design: Offline Mixdown Bus and Send Integration

## Architecture Changes
1. **`src/lib/busRouter.ts` (`buildBusRouteGraph`)**:
   - Iterate over `track.sends`. For each send entry `[busId, sendAmount]` where `sendAmount > 0` and `busNodes.has(busId)`, create a `GainNode` with `gain.value = sendAmount`, connect `trackGain` -> `sendGain` -> `busNodes.get(busId)!.inputGain`.
   - Ensure clean disconnection in `cleanup()`.

2. **`src/lib/universalAudio.ts` (`renderMixdownWeb`)**:
   - Accept optional `buses?: BusRouteDef[]` parameter (defaulting to `createDefaultBuses()`).
   - Create `masterGain = ctx.createGain(); masterGain.gain.value = 1; masterGain.connect(ctx.destination);`.
   - Call `buildBusRouteGraph(ctx, audibleTracks, buses ?? createDefaultBuses(), masterGain)`.
   - Connect each processed region source (`src`) to `trackOutputs.get(track.id)`.
   - Call graph `cleanup()` after rendering.
