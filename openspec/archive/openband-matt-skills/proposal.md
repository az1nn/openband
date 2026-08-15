# Proposal: OpenBand Versions of Matt Pocock Engineering Skills

## Context
Playbook V6 §4 identifies Matt Pocock's engineering skills as high-value cognitive workflows (`grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`, `implement`, `tdd`, `diagnosing-bugs`, `improve-codebase-architecture`, `writing-great-skills`, `ask-matt`). Creating dedicated OpenBand versions of these skills in `.agents/skills/` gives our agents domain-aware engineering workflows tailored to OpenBand's architecture (Web Audio API, Expo React Native, Express backend, `@bridge` desktop native layer, OpenSpec SDD loop, CRDT state sync, and Three.js 3D Virtual Studio).

## Objectives
Create 10 OpenBand-customized Agent Skills under `.agents/skills/`:
1. `openband-ask` — Router for choosing the correct OpenBand agent/skill workflow.
2. `openband-grill-with-docs` — Discovery & requirement interrogation against `AGENTS.md`, `CLAUDE.md`, `docs/`, and `openspec/`.
3. `openband-domain-modeling` — Ubiquitous language & domain boundaries (project, track, stem, bus, plugin, pedal, CRDT, region, asset).
4. `openband-to-spec` — Convert closed context/requirements into OpenSpec SDD artifacts (`proposal.md`, `design.md`, `tasks.md`).
5. `openband-to-tickets` — Decompose OpenSpec designs into tracer-bullet vertical slices.
6. `openband-implement` — Execute vertical slices with test gates, typecheck, and scope guards.
7. `openband-tdd` — Red-green-refactor loop for Web Audio, React Native components, and backend endpoints.
8. `openband-diagnosing-bugs` — Structured cross-platform bug diagnosis (Web, Android, iOS, Desktop Electron/Tauri).
9. `openband-improve-architecture` — Identify deep modules, abstraction leaks, and refactoring opportunities.
10. `openband-writing-skills` — Meta-skill for authoring and refining portable OpenBand `SKILL.md` files.

## Non-Goals
- Modifying core application code or build configurations.
- Overwriting existing OpenBand V1 skills (`openband-architect`, `cross-platform-reviewer`, `audio-engine-reviewer`, `openband-security`, `openband-test-gate`).
