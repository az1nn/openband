---
name: openband-to-spec
description: Convert refined requirements into an OpenSpec SDD change proposal, design, and task list.
---

# OpenBand To Spec — OpenSpec SDD Authoring

Transforms feature requests and domain designs into an OpenSpec Specification-Driven Development (SDD) change directory under `openspec/changes/<change-name>/`.

## Required Directory Structure

Create three files in `openspec/changes/<change-name>/`:

1. **`proposal.md`**:
   - **Context**: Current behavior and problem statement.
   - **Goals**: High-level objectives and user impact.
   - **Non-Goals**: Explicit boundaries of what is out of scope.

2. **`design.md`**:
   - **API Signatures**: Function signatures, prop interfaces, route definitions.
   - **State Variables**: React state, CRDT schema additions, bus routing changes.
   - **Component Mapping**: Usage of existing `src/components/` and design tokens.
   - **Data Flow / Diagrams**: Step-by-step logic and runtime execution path.

3. **`tasks.md`**:
   - **Detailed Checklist**: Sequenced step-by-step implementation tasks.
   - **Verification Steps**: Specific test commands, linter checks, and manual validations.

## Rules & Approval Gate

- Commit the spec files (`git commit -m "spec: ..."` ) **BEFORE** writing any application source code.
- Wait for user approval on the spec before executing `tasks.md`.
