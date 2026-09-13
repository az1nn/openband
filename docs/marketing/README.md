# OpenBand Marketing Foundation

> Status: strategic marketing baseline for the pre-launch Web MVP. `OpenBand` is the repository/product working name until brand-name clearance is complete.

## Purpose

This directory is the marketing source of truth for OpenBand. It translates product truth into a traceable system of **research → decisions → positioning → execution → measurement → learning**.

It is intentionally narrower than the full technical feature inventory. Marketing must sell what a new user can trust today, not everything the repository can theoretically do.

## Launch truth

The current launch contract is defined by GitHub Issue #46 and its launch slices (#47–#51):

- public Web MVP first; Android follows after native hardening;
- a visitor can start a local project without mandatory signup;
- core creation remains free;
- local-first ownership is central to the value proposition;
- first sound target: under 60 seconds;
- blank project → valid exported song target: under 10 minutes;
- save/reopen and export must be trustworthy before broad launch;
- social feed, CRDT collaboration, stems, AI cover generation, advanced AutoMix, video export, MCU, DAWproject, and advanced mastering are not launch blockers.

Marketing copy must not imply that every implemented feature is launch-grade until its user journey is proven.

## Strategic thesis

OpenBand should not try to win by having the longest DAW feature checklist. That is a losing comparison against mature incumbents.

The wedge is:

> **A local-first, open-source music studio that lets a musician start creating immediately, keep control of the project, and export a real song without account lock-in.**

The product experience has to prove that claim in minutes.

## Marketing principles

1. **Creation before registration.** The first CTA is to make sound, not create an account.
2. **Ownership before cloud dependency.** Local-first is a product benefit, not an anti-cloud ideology.
3. **Proof before parity.** Demonstrate reliable workflows; do not market inventory as equivalent to mature competitors.
4. **Musician language before engineering language.** CRDT, WebAudio, Supabase, Spec Kit, and architecture graphs are credibility content for technical audiences, not the hero message.
5. **Open source as trust and agency.** Inspectability, portability, contribution, and long-term resilience are stronger than "free code" alone.
6. **No competitor distortion.** Never imply another DAW is universally paid, closed in every workflow, or incapable of features it demonstrably supports.
7. **No AI slop positioning.** AI is an optional accelerator. The brand is music creation and ownership, not "AI music".
8. **Privacy claims must match implementation.** Do not claim "nothing leaves your device" if a user invokes cloud collaboration, stem separation, hosted services, or external AI providers.

## P0 risks before public brand investment

### 1. Name collision

As of 2026-09-11, an unrelated product named **OpenBand** is already listed in Google Play and Apple's App Store in the same music/collaboration category. It markets collaborative recording, mixing, stem separation, AI tools, social features, and publishing.

This creates severe search, app-store, social-handle, word-of-mouth, and potential legal-confusion risk.

**Rule:** treat `OpenBand` as a working name until a naming clearance gate evaluates app stores, domains, social handles, GitHub, trademarks, and category confusion. Do not commission expensive identity work or buy media against the name before that gate.

### 2. License presentation

The repository `LICENSE` currently carries the Expo/650 Industries copyright text. Before using "open source" as a flagship trust claim, review project ownership/attribution and third-party notices so the repository communicates licensing accurately. Do not blindly remove third-party notices.

### 3. Feature-claim mismatch

The README exposes a very broad feature inventory while the launch issues explicitly narrow the public MVP to the core creative loop. Public-facing copy should use launch-gated proof points and move the full inventory to a technical/features reference.

## Knowledge architecture

The marketing system has five layers. Each layer answers a different question and should not silently take ownership of another layer's job.

| Layer | Question | Canonical artifacts |
| --- | --- | --- |
| Product truth | What can the product honestly promise now? | `../product.md`, feature status, launch issues/specs |
| Evidence | What do we know, observe, assume, or still need to test? | [`research-register.md`](./research-register.md), [`competitive-landscape.md`](./competitive-landscape.md) |
| Decisions | What durable choices constrain marketing? | [`decision-log.md`](./decision-log.md) |
| Strategy & execution | Who, why, what message, which channels, what launch motion? | positioning, audiences, messaging, brand, GTM, launch kit/assets |
| Learning | Did the strategy create creator value and what changes next? | [`measurement.md`](./measurement.md), [`experiments.md`](./experiments.md) |

```mermaid
flowchart LR
  PT[Product truth] --> R[Research / evidence]
  PT --> D[Decisions]
  R --> D
  D --> S[Positioning / audiences / brand]
  S --> M[Messaging / GTM / launch execution]
  M --> X[Measurement / experiments]
  X --> R
  X --> D
```

## Marketing operating model

```mermaid
flowchart LR
  A[Research & naming gate] --> B[Positioning]
  B --> C[Message system]
  C --> D[Landing + README + social assets]
  D --> E[Alpha creator recruitment]
  E --> F[Activation proof]
  F --> G[Public Web beta]
  G --> H[Community + content loop]
  H --> I[Retention + contribution + referral]
  I --> A
```

## Canonical files

### Evidence and decisions

- [`research-register.md`](./research-register.md) — hypotheses, observations, evidence state, freshness and next validation.
- [`decision-log.md`](./decision-log.md) — durable strategic decisions, rationale, authority and supersession history.
- [`competitive-landscape.md`](./competitive-landscape.md) — strategic competitor map and dated external-source notes.

### Strategy

- [`positioning.md`](./positioning.md) — category, JTBD, differentiation and competitive frame.
- [`audiences.md`](./audiences.md) — IUP/ICP model, persona fit, anti-segments, messaging matrix and future B2B hypotheses.
- [`brand.md`](./brand.md) — brand idea, visual territory, naming gate and identity rules.
- [`messaging.md`](./messaging.md) — message house, copy bank, voice, claims and landing architecture.

### Go-to-market and execution

- [`go-to-market.md`](./go-to-market.md) — launch phases, channels, content engine, community, SEO and growth progression.
- [`launch-checklist.md`](./launch-checklist.md) — marketing/release gates mapped to product launch truth.
- [`launch-kit.md`](./launch-kit.md) — localized, channel-ready copy templates governed by launch gates.
- [`launch-assets.md`](./launch-assets.md) — current visual evidence audit, production brief and rights record.

### Measurement and learning

- [`measurement.md`](./measurement.md) — activation funnel, north-star model, event taxonomy and privacy rules.
- [`experiments.md`](./experiments.md) — experiment backlog, hypotheses, metrics, guardrails, results and knowledge-base feedback loop.

## Knowledge governance

### Evidence labels

Research uses explicit states:

`VERIFIED | OBSERVED | HYPOTHESIS | UNKNOWN | STALE`

Do not convert a hypothesis into a fact by repeating it across documents.

### Decision labels

Durable choices use:

`ACTIVE | PROVISIONAL | SUPERSEDED | RETIRED`

Material strategy changes must update the decision log rather than silently rewriting the old rationale.

### Freshness

Re-check time-sensitive evidence before it is used externally. This includes:

- competitor positioning/features;
- pricing;
- app-store availability;
- platform support;
- search demand;
- naming/domain/social/trademark availability;
- legal or policy-sensitive claims.

Product behavior must be checked against the actual promoted release, not remembered implementation state.

### Traceability rule

A material campaign claim should be traceable backward:

```text
campaign claim
→ messaging / launch artifact
→ positioning / audience / decision
→ research or product truth
→ current evidence
```

If that path breaks, qualify the claim or do not publish it.

### Learning rule

A completed experiment must not die in a dashboard. It should update:

1. the relevant `R-*` research entry;
2. the relevant `MD-*` decision if the evidence changes strategy;
3. downstream positioning/messaging/GTM only after the knowledge layer is reconciled.

## Decision hierarchy

When marketing artifacts disagree, use this order:

1. verified current product behavior;
2. approved Spec Kit feature/launch contract and GitHub issue acceptance criteria;
3. active decisions in [`decision-log.md`](./decision-log.md);
4. current research/evidence state;
5. positioning, audience, brand and messaging strategy;
6. campaign copy and channel-specific assets.

A campaign may simplify language, but it must not widen the product promise.
