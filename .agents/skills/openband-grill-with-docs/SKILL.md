---
name: openband-grill-with-docs
description: Refine features and investigate repository documentation and context before making irreversible decisions.
---

# OpenBand Grill With Docs — Systematic Discovery

Investigates repository context, documentation, and existing conventions before committing to architectural decisions or code edits.

## Discovery Workflow

1. **Read Core Context**:
   - `AGENTS.md` & `CLAUDE.md`: System directives, desktop bridge rules, styling rules.
   - `docs/`: Relevant domain documentation (e.g., `docs/supabase.md`, `docs/3d-scene-guidelines.md`, `docs/features-implementation.md`).
   - `openspec/`: Existing active or archived specs.

2. **Inspect Code Dependencies**:
   - Check `package.json` for approved packages.
   - Trace existing imports, component usage in `src/components/`, and state flow.

3. **Identify Unknowns & Trade-offs**:
   - Uncover hidden assumptions or cross-runtime impacts (Web, Electron, Tauri, iOS, Android).
   - Evaluate performance implications (Audio Context thread, 60fps rendering, memory usage).

4. **Record Architecture Decision Records (ADR)**:
   - For significant trade-offs, record decisions in `docs/adr/YYYY-MM-DD-<title>.md`.
   - Format: Context, Decision, Consequences, Alternatives Considered.
