# Design: OpenCode-First Agentic Infra

## File map
```
openband/
├── opencode.json                         # OC1: permission baseline
├── .agents/skills/
│   ├── openband-architect/SKILL.md       # OC2: boundaries + spec alignment
│   ├── cross-platform-reviewer/SKILL.md  # OC2: Web/Android/iOS/Desktop
│   ├── audio-engine-reviewer/SKILL.md    # OC2: audio lifecycle/DSP/latency
│   ├── openband-security/SKILL.md        # OC2: auth/secrets/IPC/uploads
│   └── openband-test-gate/SKILL.md       # OC2: minimal validation matrix
└── .opencode/agents/
    ├── code-review.md                    # EXISTING (reviewer role)
    ├── architect.md                      # OC3: read-only architect
    ├── security.md                       # OC3: read-only security
    └── audio-reviewer.md                 # OC3: read-only audio reviewer
```

## Permission model (opencode.json)
- `default_agent: plan` (read/discovery by default, no edits).
- Global: `read/glob/grep/lsp/skill/task` allow; `edit` ask; `bash` ask (with `git status|diff|log` allow, `git commit` ask, `git push` deny).
- `external_directory: deny`.
- `build` agent: `edit` allow, `bash` ask (commit ask, push deny).
- `plan` agent: `edit` deny, `bash` deny (status/diff allow).

## Skill responsibilities
- **openband-architect**: analyze boundaries, cross-platform impact, domain ownership, spec alignment before implementation. Returns APPROVE / APPROVE WITH CHANGES / BLOCK + next step. Does not implement.
- **cross-platform-reviewer**: inspect a diff for Web/Android/iOS/Desktop divergence (RN web vs native, `Platform.OS` guards, Electron/Tauri bridge, Expo SDK API usage).
- **audio-engine-reviewer**: audio graph lifecycle, AudioContext open/close, latency/monitoring, DSP correctness, blob URL cleanup, no blocking on audio thread.
- **openband-security**: secrets/exposure, auth (Supabase), IPC/bridge boundaries, upload validation (path traversal, size), supply-chain (deps).
- **openband-test-gate**: given the changed area, determine and run the minimal matrix (tsc, vitest subsets, legacy node:test, backend tsc, graph:ci) before declaring done.

## Subagent roles (read-only)
- `architect`: invokes openband-architect + domain-modeling; no edits.
- `security`: invokes openband-security; no edits.
- `audio-reviewer`: invokes audio-engine-reviewer; no edits.
- `reviewer` (exists): code-review + cross-platform; no edits.

All use `mode: subagent` with `edit: deny`.

## Validation
- `opencode.json` must parse as valid JSON.
- Each SKILL.md has `name` matching its directory and a `description`.
- Each `.opencode/agents/*.md` has valid YAML frontmatter with `mode: subagent`.
- No code/test changes required (infra only).
