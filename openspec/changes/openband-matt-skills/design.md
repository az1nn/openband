# Design: OpenBand Adaptations of Matt Pocock Skills

## Directory Structure
```
.agents/skills/
├── openband-ask/SKILL.md
├── openband-grill-with-docs/SKILL.md
├── openband-domain-modeling/SKILL.md
├── openband-to-spec/SKILL.md
├── openband-to-tickets/SKILL.md
├── openband-implement/SKILL.md
├── openband-tdd/SKILL.md
├── openband-diagnosing-bugs/SKILL.md
├── openband-improve-architecture/SKILL.md
└── openband-writing-skills/SKILL.md
```

## Skill Specifications

### 1. `openband-ask`
- Frontmatter `name: openband-ask`
- Intent: Routes incoming requests to the optimal OpenBand skill or workflow pipeline based on Playbook V6 §5.

### 2. `openband-grill-with-docs`
- Frontmatter `name: openband-grill-with-docs`
- Intent: Interrogates existing repo context (`AGENTS.md`, `docs/`, `openspec/`, source code) before proposing changes. Records decisions in ADR format under `docs/adr/` if consequential.

### 3. `openband-domain-modeling`
- Frontmatter `name: openband-domain-modeling`
- Intent: Establishes OpenBand domain terms (`ProjectDef`, `TrackDef`, `BusDef`, `Stem`, `Plugin`, `Pedal`, `CRDT Operation`, `AudioRegion`, `AssetPointer`).

### 4. `openband-to-spec`
- Frontmatter `name: openband-to-spec`
- Intent: Enforces OpenSpec SDD loop by materializing `openspec/changes/<change-name>/` with `proposal.md`, `design.md`, and `tasks.md`.

### 5. `openband-to-tickets`
- Frontmatter `name: openband-to-tickets`
- Intent: Breaks down OpenSpec `tasks.md` into vertical, end-to-end testable tracer bullets.

### 6. `openband-implement`
- Frontmatter `name: openband-implement`
- Intent: Guides single-ticket implementation, enforcing scope boundaries, `no-comments`, `@bridge` usage, and `openband-test-gate` execution.

### 7. `openband-tdd`
- Frontmatter `name: openband-tdd`
- Intent: Red-green-refactor workflow for audio math, CRDT operations, React Native components, and Express routes.

### 8. `openband-diagnosing-bugs`
- Frontmatter `name: openband-diagnosing-bugs`
- Intent: Systematic bug isolation across Web, Android, iOS, and Desktop runtimes.

### 9. `openband-improve-architecture`
- Frontmatter `name: openband-improve-architecture`
- Intent: Analyzes module coupling, `graph:validate` issues, zero-dependency graph toolchain findings, and deep module opportunities.

### 10. `openband-writing-skills`
- Frontmatter `name: openband-writing-skills`
- Intent: Quality checklist and guidelines for writing portable, high-value OpenBand `SKILL.md` files.

## Validation
- Each directory name must match `name:` in `SKILL.md` frontmatter.
- Valid YAML frontmatter parsing.
- Zero extra dependencies.
