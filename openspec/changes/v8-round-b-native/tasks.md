# Tasks: V8 Round B — Native Artifact Pipelines & Native Audio Recording

## 1. Android & Electron Pipeline Verification (V8-04, V8-05)
- [ ] Verify gradle signing config fallback.
- [ ] Verify electron packaging scripts.

## 2. Native Audio Recording (V8-06)
- [ ] Implement native recording branch in `src/lib/universalAudio.ts` using `expo-audio` `AudioRecorder`.
- [ ] Implement recorded URI region commit to `TrackDef`.
- [ ] Add unit tests for native recording flow and re-entrancy guard.

## 3. Verification
- [ ] Run `npx tsc --noEmit`
- [ ] Run `cd backend && npx tsc --noEmit`
- [ ] Run `npx vitest run`
- [ ] Run `npm run test:legacy`
- [ ] Run `npm run graph:ci`
- [ ] Run `npm run build`
