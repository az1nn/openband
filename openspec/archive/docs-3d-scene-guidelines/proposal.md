# Proposal: 3D Virtual Studio — Canonical Guidelines & Knowledge Doc

> **Status: SHIPPED.** Full implementation landed: `docs/3d-scene-guidelines.md`
> created, `AGENTS.md` wired (component rows, app tree, `### 3D & WebGL` section,
> pre-flight bullet), `docs/features-implementation.md` gained a 3D studio phase,
> `docs/reverted-features.md` §2 marks the guideline doc as restored,
> `docs/unimplemented-specs.md` §6 links the T1–T10 playbook, and
> `openspec/specs/architecture.md` lists the Three.js stack line.

## Context

The repo ships a web-only 3D "Virtual Studio" (Habbo-style) built with
Three.js: a hub screen `app/virtual-studio.tsx` plus 12 sibling tool screens
(beatmaker, dj-stage, vocal-booth, mixing-console, lofi-tape, synth-lab, etc.),
all backed by a shared CDN loader `src/lib/loadThree.ts` and procedural lighting
rigs `src/lib/sceneLighting.ts`.

The knowledge needed to understand — and improve — these scenes is scattered:
- `AGENTS.md` has **no** section on the 3D studio / WebGL architecture, and its
  component table omits `LightControls` / `Screen3DFallback`.
- `docs/features-implementation.md` has **no** 3D / Virtual Studio entry.
- `docs/reverted-features.md` §2 references a `docs/3d-scene-guidelines.md` that
  was reverted and is **no longer on disk**.
- `openspec/specs/architecture.md` does not list Three.js.
- The canonical live spec is `openspec/specs/immersive-studio/spec.md`.

A planning review of the current code revealed a **gap between an aspirational
design (managers, SSAO/bloom/AgX, IBL, gltf-transform, WebSocket avatars) and
what is actually implemented** (inline procedural scenes, no post-processing, no
external model assets, single local avatar). Documentation must reflect reality.

## Problem Description

1. An engineer or agent told to "improve the studio 3D scenes" has no single
   source of truth describing: which files form the 3D layer, how the render
   loop is decoupled from audio, what the platform isolation rules are, what
   quality/performance levers exist today, and what is intentionally **not**
   implemented yet.
2. Misleading/reverted doc references (a missing `3d-scene-guidelines.md`) and
   missing AGENTS wiring slow down every future change to the studio.
3. Past documentation invented aspirational features (post-processing, HDRI) as
   if shipped, which would mislead improvement work.

## Objectives

1. Create `docs/3d-scene-guidelines.md` — a canonical, **status-truthful**
   reference covering:
   - Current architecture: files, screen inventory, render loop, lifecycle.
   - The rendering-vs-audio decoupling contract.
   - Existing performance levers (devicePixelRatio caps, animation loop
     management) and what is **not** implemented (post-processing, IBL, glTF
     assets, adaptive resolution, WebSocket avatars).
   - A clearly marked "improvement / target-technique playbook" (CS Brasil
     aligned: IBL-procedural, half-res SSAO, focused bloom, AgX, offline asset
     optimize, headless invariants).
2. Wire it into agent docs:
   - `AGENTS.md`: new `### 3D & WebGL (Three.js Virtual Studio)` section under
     Project Architecture Quick Reference; add `LightControls` and
     `Screen3DFallback` to the component table; add `app/tabs/virtual-studio.tsx`
     + `app/virtual-studio.tsx` to the app tree; add a pre-flight bullet to read
     the guideline doc when touching 3D screens.
   - `docs/features-implementation.md`: add a `Phase 3D: Virtual Studio` entry
     with shipped scope.
   - `docs/reverted-features.md`: mark §2 guideline as **restored**.
   - `openspec/specs/architecture.md`: list Three.js stack line.
3. No production code changes; no new dependencies; no config changes.

## Non-Goals

- Implementing post-processing, SSAO, bloom, AgX, glTF import pipeline, IBL, or
  WebSocket avatars now — these are documented as targets, not built here.
- Touching the 12 scene screens or `src/lib` electron web code.
- Does not reference any stale claim of features as shipped.