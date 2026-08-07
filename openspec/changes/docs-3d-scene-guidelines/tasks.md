# Tasks: 3D Virtual Studio Guidelines (docs-only change)

## Implementation

- [x] Create `docs/3d-scene-guidelines.md` with the section structure and
      truth-vs-target content described in `design.md`.
- [x] `AGENTS.md`:
      - component table: add `LightControls`, `Screen3DFallback` rows
      - app tree: add `virtual-studio.tsx` + `tabs/virtual-studio.tsx` entries
      - add `### 3D & WebGL (Three.js Virtual Studio)` section
      - add pre-flight bullet referencing `docs/3d-scene-guidelines.md`
- [x] `docs/features-implementation.md`: add Virtual Studio status block.
- [x] `docs/reverted-features.md` §2: mark 3D guidelines doc as restored.
- [x] `docs/unimplemented-specs.md` §6: link to guideline doc; frame as not-wired.
- [x] `openspec/specs/architecture.md`: add Three.js stack line + doc link.

## Verification

- [x] `npx tsc --noEmit` passes (root + backend) — docs only, unchanged behavior.
- [x] Grep `docs/*.md` + `AGENTS.md` for stale claims of post-processing / IBL /
      glTF / WebSocket avatars **as shipped** — none; all such claims are
      explicitly marked `[TODO]`/target in the guideline doc.
- [x] Every file referenced in the guideline doc exists on disk (verified).
- [x] `docs/reverted-features.md` no longer references a missing file (guideline
      doc marked restored).

## Docs / spec sync

- [x] Update `openspec/changes/docs-3d-scene-guidelines/*` to reflect the built
      reality after implementation.
- [x] Grep for other stale refs to `docs/3d-scene-guidelines.md` (only in
      reverted-features + new doc + AGENTS + features/implementation).