# Tasks: Offline Mixdown Bus and Send Integration

- [ ] 1. Update `buildBusRouteGraph` in `src/lib/busRouter.ts` to wire `track.sends` into bus input gains.
- [ ] 2. Update `renderMixdownWeb` in `src/lib/universalAudio.ts` to use `buildBusRouteGraph`, master gain, and bus routing.
- [ ] 3. Run `npx tsc --noEmit` and `npx vitest run`.
