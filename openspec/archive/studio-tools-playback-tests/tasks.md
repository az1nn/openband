# Studio Tools and Device Playback Bridge Tests — Tasks

## Spec (this phase — commit before code)
- [x] `openspec/changes/studio-tools-playback-tests/proposal.md`
- [x] `openspec/changes/studio-tools-playback-tests/design.md`
- [x] `openspec/changes/studio-tools-playback-tests/tasks.md`
- [ ] Commit spec (`git add openspec/changes/studio-tools-playback-tests && git commit -m "spec: studio tools and device playback bridge tests"`)

## Implementation & Testing
- [ ] Create `tests/studioToolsPlaybackDevice.test.ts` covering Tauri bridge, Electron bridge, browser fallback, and studio tool device playback routing.
- [ ] Run Vitest (`npx vitest run tests/studioToolsPlaybackDevice.test.ts`).
- [ ] Run graph validation (`npm run graph:ci`).
- [ ] Run code review via `code-review` agent.

## Archive & Final Commit
- [ ] Archive spec to `openspec/archive/studio-tools-playback-tests/`.
- [ ] Final commit & push.
