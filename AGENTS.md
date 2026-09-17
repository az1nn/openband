# OpenBand Agent Policy

OpenBand uses GitHub Spec Kit as its SDD lifecycle. This file defines operational agent rules; `.specify/memory/constitution.md` defines durable invariants.

## Laws

- Documentation must be concise, precise, human-friendly, and non-duplicative.
- Work through branches and PRs. Never push directly to `master`.
- Stop on decisions, not routine plumbing.
- Direct `/speckit.*` commands may bypass `openband-ask`, never this policy.
- Evidence beats claims: masked, blocked, stale, or flaky required checks are not PASS.

## Risk tiers

| Tier | Typical change | Required assurance |
|---|---|---|
| T0 | typo / isolated rename | focused check |
| T1 | localized bug with known behavior | diagnosis + regression proof |
| T2 | bounded new capability | Spec Kit + Design Gate + human Merge Gate |
| T3 | architecture, persistence, cross-runtime contract | T2 + architecture assessment + specialist review |
| T4 | security, corruption/loss, CRDT/concurrency, critical deterministic DSP | T3 + adversarial review + recovery + expanded verification |

Minimum T3: persistence model, architecture boundary, or cross-runtime contract change. Minimum T4: security-sensitive work, possible data corruption, CRDT/concurrency correctness, or critical deterministic DSP. Architecture Graph may elevate a tier; it may not lower one.

## Entry and context

`openband-ask` is the preferred entrypoint. It classifies risk, gathers bounded context, and starts or resumes the appropriate lifecycle. It does not own a parallel state machine.

Context is progressive:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Retrieve before assuming. Do not load the whole repository by default.

### Conversation context handoff

Continuously monitor whether the current chat remains a trustworthy bounded implementation context. Use `docs/ai/context-handoff.md` as policy.

Task-lifecycle ownership is explicit:

- `.qwen/skills/auto-skill-continue-work/SKILL.md` owns finishing all safe work in the active task before closeout;
- `.qwen/skills/auto-skill-caveman-handoff/SKILL.md` owns closeout audit, durable persistence, and compact Caveman emission only after a genuine task closeout boundary;
- `.qwen/skills/auto-skill-verified-context-handoff/SKILL.md` is a compatibility router between those two skills;
- `docs/ai/session-handoff-template.md` owns the compact handoff shape;
- `docs/ai/durable-context.md` owns persistence and promotion rules.

For ChatGPT Projects, `docs/ai/chatgpt-project-instructions.md` is the repository-owned source for the Project Instructions that mirror this policy into ChatGPT.

- GREEN: continue normally; conversation length alone is irrelevant.
- YELLOW: a semantic boundary is approaching; finish the current safe work and drive the active task toward closeout.
- RED: refresh canonical state aggressively; continue only trustworthy work derived from canonical evidence. RED alone does not authorize an early handoff.

A Caveman handoff is eligible only when the active task is complete or no safe autonomous work remains because of a genuine human gate/external blocker. If safe work remains, run `continue-work` instead.

When the user asks `gere handoff`, `generate handoff`, `handoff`, a continuity prompt, or a new-chat prompt while the active task is still live, do **not** stop merely to emit a handoff. Run `continue-work`, complete and verify all safe current-task work, give the user a concise lifecycle notice of what was completed or what genuine blocker remains, then run `caveman-handoff`.

At the genuine end of every material task, run `caveman-handoff` even when context is GREEN. A feature slice, verification cycle, or PR freeze counts only when it is the current task's actual closeout boundary; a routine intermediate checkpoint does not.

Caveman Mode compresses transferred context only. It must preserve exact base/HEAD identity, work identifiers, closeout state, current-cycle delta, evidence freshness, blockers/human gates, critical invariants, one exact next action, and the verify-first contract. It must not reduce reasoning, tool checks, verification depth, or required evidence.

Prefer a marked PR/issue handoff comment for operational state because it survives chat loss without mutating a verified HEAD. Do not create a post-freeze Git commit merely to store a handoff when a non-HEAD-mutating durable sink is available. Model/account memory is optional bootstrap context and is never canonical project state.

A handoff is derived bootstrap context only. It must never override Git, Spec Kit, architecture/contracts/ADRs, tests, Graph evidence, risk tier, Design Gate, verification state, or Merge Gate. A new chat reconstructs bounded L0 → L1 → L2 context and verifies branch/worktree/HEAD, feature state and gate freshness before acting.

## T2+ lifecycle

```text
preflight
→ specify
→ clarify? 
→ plan
→ checklist?
→ tasks
→ analyze
→ HUMAN DESIGN GATE
→ implement
→ converge
→ verify
→ HUMAN MERGE GATE
→ cleanup
```

Use the Spec Kit Workflow Engine for sequence, gates, pause/resume, conditions, and run state.

### Preflight

Before mutation, confirm:

- Issue/request identity;
- branch `agent/<issue>-<slug>`;
- isolated worktree;
- active Spec Kit feature;
- tier and risk triggers;
- dependencies;
- semantic/Graph impact;
- expected working-tree state.

One active Spec Kit feature per worktree.

### Design Gate

T2+ implementation starts only after human approval of a Design Baseline SHA covering:

- `spec.md` — WHAT;
- `plan.md` / applicable ADR — HOW;
- `tasks.md` — WORK;
- verification strategy — PROOF.

Material changes to scope, acceptance criteria, architecture/contract, tier, structural dependencies, or verification strategy invalidate the gate and require re-analysis + approval. Internal implementation details within the approved envelope do not.

### Implementation and convergence

`/speckit.implement` owns implementation. Specialists provide domain policy/review; they do not run competing lifecycles.

`/speckit.converge` is append-only. It may append remediation tasks to `tasks.md`; it does not edit product code. When tasks are appended:

```text
implement → converge → implement → converge
```

If gaps persist, blast radius grows, or design assumptions change, stop patching and reopen plan/analyze. Never weaken a requirement or test merely to obtain green status.

### Verification and Merge Gate

Verification is risk- and impact-derived. Required evidence can include acceptance tests, typecheck, build, `graph:ci`, specialist review, dependency validation, and normative documentation reconciliation.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

`FAIL`, `BLOCKED`, `FLAKY`, or `STALE` blocks a required gate.

For T2+, the human merges the verified PR HEAD. If HEAD changes after verification, rerun affected checks. Agents do not merge T2+.

## Architecture and knowledge

Authority while designing:

```text
Constitution
> current architecture / ADR / durable contract
> approved feature spec
> plan
> tasks
```

Feature specs are flow-forward history after merge. Current topology lives in `docs/architecture.md`; durable cross-feature contracts live in `docs/contracts/`; ADRs live in `docs/adr/` and are append-only/superseded explicitly.

Frontend code under `app/` and `src/` must not call Node filesystem, Electron, or Tauri APIs directly. Runtime-specific I/O goes through `@bridge` / `OpenBandNative`.

## Git and dependencies

- Issue = demand/tracking.
- Spec Kit feature = coherent engineering change.
- PR = review/integration evidence.
- Git = history.
- Presence under `specs/` never implies active, pending, or shipped status.
- Feature dependencies must be explicit and acyclic.
- Stacked work is allowed only for explicit dependencies and must be revalidated when its base changes.

## Emergency and degraded operation

Urgency can compress sequencing, never assurance. T2+ still requires material intent, Design Gate, regression proof, convergence, critical verification, normative knowledge reconciliation, and human merge.

If Spec Kit tooling fails, use degraded SDD only as a temporary tooling fallback: preserve tiers, artifacts, gates and evidence; record the tooling failure and fix it separately. Never reactivate OpenSpec.

## Specialists

Load specialists only when impact requires them. Useful project skills include domain modeling, architecture/Graph, TDD, audio/DSP, security, cross-platform review, debugging, and code review.

Detailed product/runtime knowledge belongs in architecture/docs/skills, not in this policy file.
