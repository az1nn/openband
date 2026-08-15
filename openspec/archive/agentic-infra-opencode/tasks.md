# Tasks: OpenCode-First Agentic Infra

- [ ] Create `opencode.json` at repo root with the OC1 permission baseline (default_agent plan; read/analysis allow; edit/bash ask; git push deny; external_directory deny; build agent edit allow; plan agent edit deny).
- [ ] Create `.agents/skills/openband-architect/SKILL.md` using the playbook §8 content (name: openband-architect; analyze boundaries/cross-platform/spec alignment; output APPROVE/CHANGES/BLOCK; do not implement).
- [ ] Create `.agents/skills/cross-platform-reviewer/SKILL.md` (name matches dir; inspect diffs for Web/Android/iOS/Desktop divergence; check `Platform.OS` guards, Electron/Tauri bridge, Expo SDK API usage; read-only).
- [ ] Create `.agents/skills/audio-engine-reviewer/SKILL.md` (name matches dir; review audio graph lifecycle, AudioContext open/close, latency/monitoring, DSP correctness, blob URL cleanup, audio-thread safety; read-only).
- [ ] Create `.agents/skills/openband-security/SKILL.md` (name matches dir; review secrets/exposure, auth, IPC/bridge, upload validation, supply chain; read-only).
- [ ] Create `.agents/skills/openband-test-gate/SKILL.md` (name matches dir; map changed area → minimal validation matrix: tsc, vitest subsets, legacy node:test, backend tsc, graph:ci; run and report gate result).
- [ ] Create `.opencode/agents/architect.md` (mode: subagent, edit: deny; invokes openband-architect; returns APPROVE/CHANGES/BLOCK + next step).
- [ ] Create `.opencode/agents/security.md` (mode: subagent, edit: deny; invokes openband-security).
- [ ] Create `.opencode/agents/audio-reviewer.md` (mode: subagent, edit: deny; invokes audio-engine-reviewer).
- [ ] Validate `opencode.json` parses as JSON (`node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))"`).
- [ ] Verify each SKILL.md frontmatter `name` matches its directory name.
- [ ] Archive this spec to `openspec/archive/agentic-infra-opencode/`.
- [ ] Commit and push.
