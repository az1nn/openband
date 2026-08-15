# Proposal: OpenCode-First Agentic Infra (Playbook V6, OC1–OC4)

## Context
The OpenBand Agentic Development Playbook V6 establishes an OpenCode-first execution model: OpenCode is the runtime; OpenSpec + AGENTS.md are source of truth; Paperclip is a future control plane. The in-repo, actionable portion (roadmap items OC1–OC4) is not yet materialized. This change introduces it so the repository matches the playbook and agents gain reusable architecture/test-gate/review capabilities.

## Objectives (OC1–OC4)
1. **OC1**: Add a safe `opencode.json` baseline (permission policy: read/analysis open, edit/bash ask, git push deny) and validate AGENTS.md references it.
2. **OC2**: Add the five OpenBand V1 Skills under `.agents/skills/`:
   - `openband-architect` (boundary/cross-platform/spec-alignment review — fully specified in playbook §8)
   - `cross-platform-reviewer` (Web/Android/iOS/Desktop divergence)
   - `audio-engine-reviewer` (audio lifecycle, DSP, latency, cleanup)
   - `openband-security` (auth, secrets, IPC, uploads, supply chain)
   - `openband-test-gate` (minimal validation matrix per changed area)
3. **OC3**: Add subagent definitions in `.opencode/agents/` for `architect`, `security`, and `audio-reviewer` (read-only review agents), mirroring the existing `code-review.md` style. (`reviewer` already exists as `code-review.md`.)
4. **OC4** (pilot): no specific feature; this infra enables the plan → OpenSpec → build → review flow.

Out of scope (OC5–OC8): Paperclip control plane, opencode GitHub Action, metrics — require external services.

## Conventions
- Follow existing `.opencode/agents/code-review.md` frontmatter style (`mode: subagent`, `permission` block).
- Skills use the `name`/`description` frontmatter matching their directory name.
- No speculative external integrations.
