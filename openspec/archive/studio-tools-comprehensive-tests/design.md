# Comprehensive Studio Tools Test Suite — Design

## 1. Test Suite Structure (`tests/studioToolsComprehensive.test.tsx`)

Using React Testing Library / Vitest:
- **Synth / Sampler / Looper / CodeSampler / PromptSampler**: Test visibility props (`visible={true}`), close handlers, and render/commit actions.
- **Patchbay / Tuner / MidiLearnPanel**: Test routing configuration, tuning frequency input, and MIDI learn mapping handlers.
- **MasteringSuite / MixManager**: Test preset changes, EQ/compression parameter adjustments, and A/B mix snapshot saves/loads.
- **AutomationLane / BranchManager / CommitModal / VersionHistory**: Test automation curve points, CRDT branch switching/merging, commit messages, and version revert actions.

## 2. Implementation Steps
1. Create `tests/studioToolsComprehensive.test.tsx`.
2. Run graph validation.
3. Archive spec and commit.
