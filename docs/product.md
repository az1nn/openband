# OpenBand Product Direction

> Durable product decisions for the launch path. [`docs/marketing/`](./marketing/README.md) owns positioning, copy, distribution and measurement; [`features-implementation.md`](./features-implementation.md) records implementation status.

## Product goal

OpenBand helps an independent musician move from a blank project to an audible, saved and exported track in the browser while keeping control of the project.

The product is successful when the creator can complete that loop quickly, understand what is local or hosted, and return to continue the work.

## Web MVP contract

The launch contract is tracked by [Issue #46](https://github.com/az1nn/openband/issues/46) and its implementation slices.

- Web MVP first; Android follows native hardening.
- A visitor can start a local project without mandatory signup.
- Core creation remains free.
- Local-first project ownership is a product boundary, not only a message.
- First-sound target: under 60 seconds for a new user.
- Blank-project-to-valid-export target: under 10 minutes.
- Save/reopen and export trust must be proven before broad launch.
- Cloud and AI transitions must be visible and specific to the workflow.

Targets become marketing claims only after measurement on the promoted release.

## Audience priority

1. **Primary:** independent musicians and producers who want a low-friction path from idea to export without mandatory account lock-in.
2. **Workflow entries:** guitarists, vocalists and beatmakers using the same core creative loop.
3. **Advocates:** open-source audio developers who want to inspect, extend or self-host the system.

Education is a later validation segment. Classroom administration, accessibility, content policy and device constraints must be proven before institutional marketing.

## Experience order

The first session follows one sequence:

1. Enter as a visitor and start or load a project.
2. Produce first sound.
3. Make and hear a meaningful edit.
4. Save, reload and recover the same project.
5. Export and play a valid audio file.

The DAW is the backbone. Stems, mastering, collaboration, social surfaces, AI helpers and 3D rooms can deepen a workflow, but they do not replace proof of the core loop.

## Launch scope

### Required proof

- public Web entry and visitor path;
- recording/import or another obvious path to sound;
- launch-scope arrangement, transport and mixer controls;
- durable project state and audio assets across reload;
- valid, audible export;
- visible, non-destructive failure states;
- supported-browser, privacy, support and limitation documentation.

### Expansion, not launch parity

Social feed, CRDT collaboration, stem separation, AI cover generation, advanced AutoMix, video export, MCU, DAWproject, advanced mastering and native-platform parity are not broad-launch claims until their complete user journeys have release evidence.

## Business-model boundary

Core creation stays free under the current product contract. Donations, sponsorship, optional hosted sync/collaboration and paid compute are possible later models, not launched offers.

The existing `FREE`, `LIVE` and `STUDIO` tier scaffolding is not a public pricing commitment. Product policy, code gates, hosted-service economics and public copy must agree before pricing or subscription claims are published. Opening or exporting a locally owned core project must not become a paid dependency without an explicit product-strategy change.

## Success model

- **Activation:** a new visitor makes or loads a project, produces sound, makes a meaningful change and hears it.
- **Completion:** the creator saves/reopens and exports a valid result.
- **Retention:** the creator returns within seven days to continue a project.
- **Trust:** the creator can explain what stays local and when a hosted service is involved.

The event and privacy contract lives in [`marketing/measurement.md`](./marketing/measurement.md). Public language must follow [`marketing/messaging.md`](./marketing/messaging.md#claim-guardrails), and go/no-go decisions use [`marketing/launch-checklist.md`](./marketing/launch-checklist.md).
