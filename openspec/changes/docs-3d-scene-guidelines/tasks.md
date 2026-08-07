# Tasks: 3D Virtual Studio Guidelines (docs-only change)

## Implementation

 - [ ] Create `docs/3d-scene-guidelines.md` with the section structure and
       truth-vs-target content described in `design.md`.
 - [ ] `AGENTS.md`:
       - component table: add `LightControls`, `Screen3DFallback` rows
       - app tree: add `virtual-studio.tsx` + `tabs/virtual-studio.tsx` entries
       - add `### 3D & WebGL (Three.js Virtual Studio)` section
       - add pre-flight bullet referencing `docs/3d-scene-guidelines.md`
 - [ ] `docs/features-implementation.md`: add Virtual Studio status block.
 - [ ] `docs/reverted-features.md` §2: mark 3D guidelines doc as restored.
 - [ ] `docs/unimplemented-specs.md` §6: link to guideline doc; frame as not-wired.
 - [ ] `openspec/specs/architecture.md`: add Three.js stack line + doc link.

## Verification

 - [ ] `npx tsc --noEmit` passes (unchanged behavior — docs only).
 - [ ] Grep `docs/*.md` + `AGENTS.md` for stale claims of post-processing / IBL /
       glTF / WebSocket avatars **as shipped** — none; all such claims must be
       explicitly marked `[TODO]`/target in the guideline doc.
 - [ ] Every file referenced in the guideline doc exists on disk.
 - [ ] `docs/reverted-features.md` no longer references a missing file.

## Docs / spec sync

 - [ ] Update `openspec/changes/docs-3d-scene-guidelines/*` to reflect the built
       reality after implementation.
 - [ ] Grep for other stale refs to `docs/3d-scene-guidelines.md` (expected only
       in reverted-features + new doc + AGENTS).