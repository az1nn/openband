# Tasks: Log and Validate Unknown Plugin Types in Audio Chains

- [ ] Add warning log in `src/lib/pluginChain.ts` `applySinglePlugin` default case
- [ ] Add warning log in `src/lib/mastering.ts` `applyMasteringPlugin` default case
- [ ] Add warning log in `src/lib/pedalboardDsp.ts` `pedalFactoryForType` default case
- [ ] Verify with `npx tsc --noEmit` and `npx vitest run`
