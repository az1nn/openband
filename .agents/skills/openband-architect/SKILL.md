---
name: openband-architect
description: Review proposed OpenBand changes for architectural boundaries, cross-platform impact, domain ownership, and specification alignment before implementation.
---

# OpenBand Architect

Use this skill before implementation of changes that affect more than one runtime,
domain boundary, persistence model, external integration, or backend service.

## Read first
1. AGENTS.md and repository instructions.
2. Relevant OpenSpec proposal/spec/design/tasks.
3. CONTEXT.md and applicable ADRs.
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
- Existing repository standards override generic preferences.
- Do not introduce a microservice only to create a technical layer.
- Prefer stable, narrow interfaces around volatile implementation details.
- Treat OpenSpec as the requirements source of truth for the change.
- Record an ADR only for consequential decisions that are difficult to reverse.
- Separate confirmed facts from recommendations.

## Output
Return:
1. Architecture summary.
2. Cross-platform impact matrix.
3. Risks and trade-offs.
4. Required ADRs or spec corrections.
5. Recommendation: APPROVE, APPROVE WITH CHANGES, or BLOCK.
6. Concrete next step and the Skill/workflow that should run next.

## Stop condition
Do not implement code unless the user explicitly asks for implementation.
