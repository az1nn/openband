# Design: Log and Validate Unknown Plugin Types in Audio Chains

## Changes
1. **`src/lib/pluginChain.ts` (`applySinglePlugin`)**:
   - In the `switch (plugin.type)` default case, add `console.warn` logging the unknown plugin type (`[OpenBand] Unknown plugin type: "${plugin.type}". Passing audio through.`) before connecting source to destination.
2. **`src/lib/mastering.ts` (`applyMasteringPlugin`)**:
   - In the `switch (plugin.type)` default case, add `console.warn` logging the unknown mastering plugin type (`[OpenBand] Unknown mastering plugin type: "${plugin.type}". Passing audio through.`) before returning buffer.
3. **`src/lib/pedalboardDsp.ts` (`pedalFactoryForType`)**:
   - In the `default` case, add `console.warn` logging the unknown pedal type (`[OpenBand] Unknown pedal type: "${type}". Bypassing.`) before returning `null`.
