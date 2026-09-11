# OpenSpec Reconciliation Manifest

> Archaeological index only. OpenSpec is legacy evidence, not current SDD authority.

## Checkpoint

- Historical checkpoint tag: `openspec-final`.
- The tag is created only after this manifest and all live-reference reconciliation are complete, while `openspec/` still exists.
- Git history plus this tag preserve the full legacy bytes; the active tree does not keep an OpenSpec archive after cutover.

## Disposition semantics

`MIGRATE_*` means semantics were distilled into the named current artifact, never directory-copied. `COMPLETED_HISTORY` preserves historical evidence only. `SUPERSEDED` means a newer authority replaces it. `FUTURE_RESPEC` records unresolved demand that must start as a new Spec Kit feature.

Coverage: **50 specs + 14 changes + 129 archive units = 193 top-level legacy units**.

## `openspec/specs/*`

| Legacy unit | Disposition | Current handling |
| --- | --- | --- |
| `accessibility` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `account-profile` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `ai-automix` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `ai-voice-cleaner` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `architecture.md` | `MIGRATE_ARCHITECTURE` | Distilled into docs/architecture.md; stale SDK/version prose was not copied. |
| `arrangement` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `audio-dsp` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `audio-plugins` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `audio-system.md` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `audio-transport.md` | `MIGRATE_CONTRACT` | Durable transport invariants distilled into docs/contracts/audio-transport.md. |
| `auth` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `automation-routing` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `backend-api` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `chord-track` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `cloud-sync` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `collaboration-crdt` | `MIGRATE_CONTRACT` | Durable concurrency invariants distilled into docs/contracts/collaboration-crdt.md. |
| `command-palette` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `dawproject-interop` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `hardware-io` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `history-undo-redo` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `i18n` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `immersive-studio` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `instruments` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `looper` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `mastering-plugins` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `midi-learn-mcu` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `midi-learn-mcu.md` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `midi-pipeline` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `mixer-console` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `modulation-matrix` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `native-builds` | `FUTURE_RESPEC` | Verification remains incomplete/weak; tracked by GitHub Issue #43. |
| `pedalboard` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `piano-roll` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `project-branching` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `project-starter` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `project-storage` | `MIGRATE_CONTRACT` | Durable persistence/integrity invariants distilled into docs/contracts/project-persistence.md. |
| `project-templates` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `recording` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `routing-navigation.md` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `sample-browser` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `settings` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `social-feed` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `startup-lazy-loading` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `studio-daw` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `studio-resilience` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `tuner` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `vercel-performance` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `video-export` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `wasm-plugins` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |
| `waveform-rendering` | `COMPLETED_HISTORY` | Historical behavioral/domain reference; implementation/tests are current evidence and future behavior changes create a new Spec Kit feature. |

## `openspec/changes/*`

| Legacy unit | Disposition | Current handling |
| --- | --- | --- |
| `project-starter-approved-snapshot-promotion` | `SUPERSEDED` | Behavior is covered by the implemented Project Starter/V10 state; do not copy the proposal. |
| `project-starter-arrangement-preview` | `SUPERSEDED` | Behavior is covered by the implemented Project Starter/V10 state; do not copy the proposal. |
| `project-starter-seeded-variations` | `SUPERSEDED` | Behavior is covered by the implemented Project Starter/V10 state; do not copy the proposal. |
| `v10-b-seed-determinism` | `COMPLETED_HISTORY` | Implementation/tests are the evidence; legacy task checkbox state is stale. |
| `v10-c-locks` | `COMPLETED_HISTORY` | V10 implementation history; future changes require a new Spec Kit feature. |
| `v10-creative-iteration` | `COMPLETED_HISTORY` | Completed V10 umbrella history; all material work is represented by implementation/tests. |
| `v10-d-variation-history` | `COMPLETED_HISTORY` | V10 implementation history; future changes require a new Spec Kit feature. |
| `v10-e-arrangement-preview` | `COMPLETED_HISTORY` | V10 implementation history; future changes require a new Spec Kit feature. |
| `v10-f-concurrency` | `COMPLETED_HISTORY` | V10 implementation history; concurrency changes must be re-specified at T4. |
| `v10-g-audio-safety` | `COMPLETED_HISTORY` | V10 implementation history; future audio-safety changes require a new feature. |
| `v10-h-persistence` | `COMPLETED_HISTORY` | V10 implementation history; durable persistence invariants are carried by current contracts/code. |
| `v10-i-regression` | `COMPLETED_HISTORY` | Regression work is represented by current tests/CI, not the legacy checklist. |
| `v8-round-a-governance` | `SUPERSEDED` | Superseded by the Spec Kit Constitution, AGENTS.md, workflows and policy-as-code. |
| `v8-round-b-native` | `FUTURE_RESPEC` | Native runtime work is partially complete; verification hardening is tracked by GitHub Issue #43. |

## `openspec/archive/*`

| Legacy unit | Disposition | Current handling |
| --- | --- | --- |
| `accessibility-pass` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `add-recent-fixes-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `add-tests-round2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `add-tests-round3` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `add-tests-round4` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `add-tests-round5` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `advanced-midi` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `agentic-infra-opencode` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ai-cover-generation` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `all-plugins-comprehensive-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `app-entry-defer-deps` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `app-load-perf` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `app-responsivity` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `audio-playback-fixes` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `audio-recording` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `audio-recording-fixes` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `audio-region-editing` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `audio-transport` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `autotune-tool-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `build-social-feed-backend` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `chatgpt-handoff` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `chatgpt-handoff-howto` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ci-pipeline` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ci-vitest-worker-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ci-workflow-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `clock-interval-update` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `code-review-hardening` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `code-review-low-cleanup` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `code-review-round2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `collabs-no-full-decode` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `comprehensive-test-suite` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `dawproject` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `desktop-build` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `device-bridges-audio-docs` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `docs-3d-scene-guidelines` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `docs-accuracy-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `docs-agents-update` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `docs-reconciliation` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `docs-update-round2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `document-plugin-specs` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `env-build-and-types-fixes` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `first-run-onboarding` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `future-roadmap-implementation` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `graph-engineer` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `graph-engineer-v2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `graph-engineer-v3` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `graph-validation-missing-source` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `hardware-io-native` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `i18n-completeness` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `i18n-pt-en-es` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `live-modulation-apply` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mastering-chain-validation` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mastering-correctness` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mastering-export` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mastering-preset-fixes` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mastering-suite-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `midi-learn-mcu` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mixer-console-vu-groups` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mixer-functions` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mixing-mastering-auto-bounce` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `modulation-unipolar-symmetric` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mount-patchbay` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mount-patchbay-hw-routing-matrix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `mp3-export-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `native-audio-decode-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `native-builds` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `native-stereo-mixdown-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-product-design` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-stepA-ai-mastering` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-stepB-webrtc-chat` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-stepC-dawproject-export` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-stepD-mcu-midi` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `next-stepE-cloud-vault` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `offline-mixdown-buses-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `openband-matt-skills` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `playback-v2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `polish-core-specs` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `prioritized-roadmap-3-5-2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `project-creation-tools-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `project-starter-fixes` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `project-starter-wiring` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `real-lufs-meter` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `real-plugin-dsp` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `real-time-pitch-correction` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `recorded-url-persistence` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `regression-tests-round2` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `remove-dead-yjscrdt` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `repo-hardening` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `resolve-orphaned-screens` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `richer-midi-patterns` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-ai-assistant-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-autotune-plugin` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-genre-templates` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-mpc-pad-grid` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-step1-ai-assistant` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-step2-crdt-sync` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-step3-wasm-plugins` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-step4-native-ci` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `roadmap-v3` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `s3-project-storage` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ship-wasm-binary` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `startup-lazy-loading` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `stem-queue-and-visibility` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-add-clip` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-audio-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-edit-freeze-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-responsiveness-polish` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-tools-comprehensive-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `studio-tools-playback-tests` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `surface-auth-tier-ui` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `transport-replay-reset` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `tsc-error-cleanup` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ui-cards-responsivity` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `ui-cards-sizing` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `unify-branching-crdt` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `unknown-plugin-type-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `vercel-performance` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `video-export` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `vitest-failure-cleanup` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `voice-cleaner` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `voice-cleaner-metrics` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `web-audio-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `web-playback-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `web-player-studio-audio` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `web-studio-recording` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `wire-collab-presence` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `wire-modulation-matrix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `wire-studio-telemetry` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |
| `zero-length-export-fix` | `COMPLETED_HISTORY` | Preserved by Git/tag history only; no current lifecycle or status authority. |

## Residual demand

- Native Android/Electron build verification hardening: GitHub Issue #43. It is intentionally **not** converted into an active Spec Kit feature during this migration.

## Cutover rule

After the `openspec-final` checkpoint is pushed, `openspec/` is deleted from the active tree in one commit. Any future change to a historical behavior starts from current code/tests/architecture/contracts and a new Spec Kit feature; historical OpenSpec artifacts are consulted only as archaeology.
