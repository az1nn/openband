# Router Contract

The session router is project-local and repository-locked.

- Canonical repository: `az1nn/openband`
- Entry command: standalone `siga`
- Canonical skill: `.agents/skills/openband-session-router/SKILL.md`
- Compatibility adapter: `.qwen/skills/auto-skill-session-router/SKILL.md`
- Lifecycle authority after routing: `openband-ask` + GitHub Spec Kit
- Visible start-of-session output: `OPENBAND AGENT TREE`
- Ownership proof: matching current-chat `SESSION_KEY`
- Foreign-owned active/waiting task handling: mark occupied, do not mutate, continue `NEXT` discovery
- Foreign-task observer mode: `ACTIVE/OBSERVER` only for explicit user-requested read-only inspection
- Parallel selection: prefer independent already-planned work; otherwise safe independent planning/specification

Any repository mismatch is fail-closed and mutation-free.
