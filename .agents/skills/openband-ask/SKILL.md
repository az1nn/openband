---
name: openband-ask
description: Route incoming user requests or tasks to the optimal OpenBand skill and workflow pipeline.
---

# OpenBand Ask — Pipeline Router

Routes incoming user requests to the optimal OpenBand specialized skill and workflow pipeline according to Playbook V6 §5.

## Routing Decision Matrix

Analyze the user's intent and select the appropriate skill pipeline:

| Phase | Task Intent | Target Skill |
| :--- | :--- | :--- |
| **Discovery** | Clarifying ambiguous requirements, reading repo docs, ADRs | `openband-grill-with-docs` |
| **Domain** | Defining DAW core domain entities, types, boundaries | `openband-domain-modeling` |
| **Spec** | Writing OpenSpec SDD proposals (`proposal.md`, `design.md`, `tasks.md`) | `openband-to-spec` |
| **Decomposition** | Slicing OpenSpec tasks into vertical tracer-bullet tickets | `openband-to-tickets` |
| **Implementation** | Feature implementation, refactoring, bug fixes | `openband-implement` |
| **TDD** | Test-first development for audio math, CRDTs, DSP | `openband-tdd` |
| **Validation** | Verifying tests, linter, graph invariants, build gates | `openband-test-gate` |
| **Architecture** | Graph analysis (`graph:*`), cycle removal, deep modules | `openband-improve-architecture` |
| **Review** | Code review, cross-platform check, audio DSP review | `code-review` / `openband-security` |
| **Debugging** | Cross-runtime bug diagnosis, root-cause isolation | `openband-diagnosing-bugs` |
| **Meta** | Creating or updating agent skills | `openband-writing-skills` |

## Pipeline Execution Flow

1. **Classify Request**: Identify primary phase and outcome expected by the user.
2. **Invoke Target Skill**: Delegate execution to the specific skill instructions.
3. **Chain Next Steps**: Once a phase finishes, route seamlessly to the downstream skill (e.g., Spec → Tickets → Implement → Test Gate → Review).
