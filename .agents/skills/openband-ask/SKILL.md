---
name: openband-ask
description: Classify OpenBand work, gather bounded context, and start or resume the correct Spec Kit workflow.
---

# OpenBand Ask

`AGENTS.md` owns policy; Spec Kit owns lifecycle state. This skill only routes.

## Route

1. Read the Constitution and `AGENTS.md`.
2. Identify the request/Issue and classify T0–T4 with concrete risk triggers.
3. Use `graph:impact` plus semantic impact to keep or elevate the tier.
4. Build progressive context: governance → impacted architecture/contracts/ADRs → relevant code/tests.
5. For T0/T1, use the lightweight path defined in `AGENTS.md`.
6. For T2+, verify branch/worktree/feature identity, then start or resume `sdd/openband-design.yml` with OpenCode `speckit`.
7. Stop at the human Design Gate. After approval, start/resume `sdd/openband-build.yml` with OpenCode `build`.
8. Load domain specialists only when impact requires them.
9. After clean convergence and required verification, prepare the PR for the human Merge Gate.

Do not create a parallel backlog, lifecycle state machine, approval flag, or status document.
