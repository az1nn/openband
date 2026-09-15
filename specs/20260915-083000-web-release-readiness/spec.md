# Feature: Web Release Readiness

**Tier:** T2 — bounded public Web release surface and verification  
**Issue:** #51  
**Parent:** #46

## Goal

Prepare the first public OpenBand Web release around the already-proven creative loop without widening the product contract. The release must provide a clear public entry, honest launch copy, explicit browser/data limitations, reproducible deployment evidence, and a rollback path tied to an exact revision.

## Release journey

A new visitor lands on a concise Web entry page, understands the product promise and alpha status, can start creating without mandatory signup, reaches the existing first-run flow, and can inspect the source. The promoted release explains what is local, what may use hosted services, which browsers were actually verified, and how the deployed revision can be rolled back if launch-critical behavior regresses.

## Requirements

- **WR-001 — Public Web entry.** On Web, `/` MUST present a concise product entry instead of immediately redirecting to `/tabs`. Non-Web runtimes MUST retain their existing navigation behavior unless separately approved.
- **WR-002 — Creation-first CTA.** The primary Web CTA MUST be **Start creating** (or the active locale equivalent) and route into the existing auth/visitor → first-run journey. It MUST NOT introduce another project-creation or authentication path.
- **WR-003 — Source CTA.** A secondary **View source** action MUST link to the canonical public repository.
- **WR-004 — Evidence-backed positioning.** Public copy MUST center on the current contract: local-first project ownership, free core creation, no mandatory signup for the local launch path, and open source. It MUST NOT claim mature-DAW parity, universal offline behavior, universal privacy, unlimited service capacity, or that BandLab Studio is universally paid.
- **WR-005 — Alpha status.** The entry and README MUST make release maturity visible. Unproven or configuration-dependent capabilities MUST be separated from the launch-grade core loop rather than presented as equivalent evidence.
- **WR-006 — Browser support matrix.** Release documentation MUST distinguish verified/supported, experimental, and unverified browser/runtime combinations. A browser MUST NOT be labeled supported without release-specific evidence. The matrix MUST cover microphone permission, local persistence/storage, playback, reload/reopen, and WAV export at the level needed to explain launch limitations.
- **WR-007 — Microphone/storage limitations.** Public docs MUST briefly explain permission denial, browser storage/quota/private-mode caveats, and the recommendation to keep an independent backup while the product remains alpha. Failure language MUST be concrete and non-alarmist.
- **WR-008 — Data ownership language.** Privacy/data copy MUST match the actual workflow boundaries established by the persistence work: the local project path is local-first, while account sync, collaboration, stem processing, AI providers, or other hosted capabilities may cross that boundary. The product MUST NOT summarize all OpenBand data flows as "everything stays local".
- **WR-009 — Stable deployment identity.** Release evidence MUST record the canonical public URL and the exact Git commit deployed. A smoke result without an identifiable deployed revision is insufficient.
- **WR-010 — Production release smoke.** The exact deployed revision MUST pass a public-Web smoke covering landing → visitor/no-account start → launch-critical creation path → persistence/reload → WAV export. Real microphone behavior remains human evidence; deterministic import/export remains automated evidence.
- **WR-011 — Rollback path.** A concise release runbook MUST define how to identify the previous known-good Web revision/deployment, restore it, and verify the restored creative loop. Rollback MUST NOT depend on editing production code under incident pressure.
- **WR-012 — CI continuity.** The existing required SDD/Graph, typecheck, test, Web build, and `web-launch-e2e` jobs MUST remain green on the exact candidate HEAD. Required checks MUST NOT be weakened, masked, or converted to allowed failures for release convenience.
- **WR-013 — README/product convergence.** README and product-facing docs MUST describe only launch-grade evidence as current public capability and MUST keep expanding/experimental surfaces clearly labeled. Existing marketing guardrails remain authoritative.
- **WR-014 — Metadata and link integrity.** The public Web entry MUST have a release-appropriate title/description and working creation/source links. Canonical/social metadata MAY be added only where the existing Expo/Web export path supports it without creating a new deployment architecture.
- **WR-015 — No hidden infrastructure expansion.** This feature MUST reuse the existing Vercel/Web export topology. If implementation requires new hosting architecture, security-sensitive deployment credentials, persistence topology, backend routing contracts, or another cross-runtime boundary, stop and elevate to T3 or T4 as required.
- **WR-016 — Release evidence is reproducible.** Verification notes MUST record commands/checks, deployed URL, tested browser/version where human evidence is used, candidate commit, and PASS/FAIL/BLOCKED state. Marketing placeholders are not release evidence.

## Non-goals

- Rebranding or resolving the separate product-name clearance decision.
- Adding pricing, subscriptions, or public commitments for optional hosted services.
- Expanding social feed, collaboration, AI, stems, mastering, video, mobile, Electron, or native-platform parity.
- Replacing the #47–#50 creative-loop, persistence, export, or first-run implementations.
- Creating a new backend hosting topology or deployment provider.
- Claiming support for browsers or workflows that have not been tested on the promoted revision.
- Running a broad paid launch campaign or satisfying every long-term marketing checklist item.

## Acceptance

1. Web `/` presents a concise launch page with a creation-first primary CTA and source secondary CTA; non-Web entry behavior is preserved.
2. The creation CTA enters the existing no-account/first-run flow rather than creating a parallel flow.
3. Launch copy, README, and product documentation state the current alpha scope without parity or blanket privacy claims.
4. Browser/microphone/storage limitations are documented from release-specific evidence.
5. The canonical deployment URL and exact deployed commit are recorded.
6. CI, including `web-launch-e2e`, is green on the exact candidate HEAD.
7. A production smoke proves the launch-critical path on the deployed revision, including real-microphone human evidence and a valid WAV export.
8. A rollback runbook names a previous known-good revision/deployment and includes a post-rollback smoke procedure.
9. No implementation change crosses an auth, persistence, export/DSP, backend, security, or cross-runtime architectural boundary without reclassification and a fresh Design Gate.

## Risk boundary

This feature starts at **T2** because it adds a bounded Web release surface and release verification around already-approved product contracts.

Escalate to **T3 + fresh Human Design Gate** if implementation changes deployment topology, durable runtime contracts, auth/session semantics, project/persistence ownership, cross-runtime bridges, or backend routing architecture.

Escalate to **T4** if the change introduces security-sensitive credential handling, credible data-loss risk, destructive migration/recovery behavior, or another T4 trigger defined by `AGENTS.md`.
