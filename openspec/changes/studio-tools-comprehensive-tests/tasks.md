# Comprehensive Studio Tools Test Suite — Tasks

## Spec (this phase — commit before code)
- [x] `openspec/changes/studio-tools-comprehensive-tests/proposal.md`
- [x] `openspec/changes/studio-tools-comprehensive-tests/design.md`
- [x] `openspec/changes/studio-tools-comprehensive-tests/tasks.md`
- [ ] Commit spec (`git add openspec/changes/studio-tools-comprehensive-tests && git commit -m "spec: comprehensive studio tools test suite"`)

## Implementation & Testing
- [ ] Create `tests/studioToolsComprehensive.test.tsx` covering rendering and interaction for Synth, Sampler, Looper, CodeSampler, PromptSampler, Patchbay, Tuner, MidiLearnPanel, MasteringSuite, MixManager, AutomationLane, BranchManager, CommitModal, VersionHistory.
- [ ] Run graph CI verification (`npm run graph:ci`).
- [ ] Run code review via `code-review` agent.

## Archive & Final Commit
- [ ] Archive spec to `openspec/archive/studio-tools-comprehensive-tests/`.
- [ ] Final commit & push.
