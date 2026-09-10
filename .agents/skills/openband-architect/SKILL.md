---
name: openband-architect
description: Review proposed OpenBand changes for architectural boundaries, cross-platform impact, domain ownership, and specification alignment before implementation.
---

# OpenBand Architect

Use this skill before implementation of changes that affect more than one runtime,
domain boundary, persistence model, external integration, or backend service.

## Read first
1. `AGENTS.md` and repository instructions.
2. The active Spec Kit feature (`spec.md`, `plan.md`, `tasks.md`, `openband.json`).
3. `docs/architecture.md`, applicable ADRs/contracts, and Architecture Graph impact.
4. The affected modules and their tests.

## Review
Evaluate:
- domain ownership and bounded responsibilities;
- UI/domain/infrastructure separation;
- Web, Android, iOS and Desktop impact;
- browser/Electron/native bridge boundaries;
- persistence and synchronization ownership;
- API/event contracts and backward compatibility;
- failure modes, retries, idempotency and offline behaviour;
- observability and security implications;
- whether a new service/module is justified or increases accidental complexity.

## Rules
- Constitution and `AGENTS.md` govern the review.
- `docs/architecture.md`, ADRs and stable contracts constrain implementation unless the approved feature intentionally changes them.
- The active Spec Kit `spec.md` owns intended behaviour; `plan.md` owns the approved implementation approach.
- Architecture Graph impact may elevate risk but never lower the semantic tier.
- Do not introduce a microservice only to create a technical layer.
- Prefer stable, narrow interfaces around volatile implementation details.
- Record an ADR only for consequential decisions that are difficult to reverse.
- Separate confirmed facts from recommendations.

## Output
Return:
1. Architecture summary.
2. Cross-platform impact matrix.
3. Risks and trade-offs.
4. Required ADRs, contract changes, or spec/plan corrections.
5. Recommendation: APPROVE, APPROVE WITH CHANGES, or BLOCK.
6. Concrete next step and the specialist/workflow that should run next.

## Stop condition
This skill is a reviewer, not a lifecycle owner. Do not implement code from this skill.
