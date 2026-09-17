# Community Operations

> Purpose: define how OpenBand builds a useful creator/developer community without confusing community activity with product-market fit.

## Community contract

OpenBand community exists to help people:

- make music;
- understand the product;
- report useful evidence;
- contribute code/docs/assets/testing;
- teach one another repeatable workflows.

It does not exist to manufacture engagement metrics.

## Community principles

1. **Utility before activity.** A quiet answerable support/discussion space is better than a noisy empty-social-feed imitation.
2. **Creators before channels.** Open a new community surface only when there is a clear user job and moderation capacity.
3. **Public by default, private when necessary.** Reusable knowledge should become public documentation; sensitive project/security/account material should not.
4. **Close the loop.** If community evidence changes the product, connect the report → change → release note.
5. **No roadmap theater.** Interest, reactions, or loudness do not automatically determine priority.
6. **Healthy disagreement is allowed.** Moderation protects people and useful discussion, not agreement with maintainers.
7. **Community contribution is broader than code.** Testing, presets, docs, translations, examples and research feedback can all compound value.

## Surface strategy

### GitHub Issues

Use for:
- reproducible bugs;
- scoped feature proposals;
- implementation work;
- technical regressions;
- evidence that needs durable tracking.

Do not use for:
- casual chat;
- generic support without reproducible context;
- private security disclosures;
- private project files/audio.

### GitHub Discussions

Recommended when enabled for:
- creator help;
- workflow questions;
- show-and-tell;
- ideas before issue conversion;
- community guides;
- contributor Q&A.

Suggested categories:
- `Help & workflows`
- `Ideas`
- `Show & tell`
- `Development`
- `Announcements`

Move a discussion into an issue only when the problem is actionable enough to track.

### Synchronous chat

Discord/Matrix/other chat is optional, not a default requirement.

Open only when:
- enough recurring participants exist;
- maintainers can moderate/respond;
- important knowledge is routinely promoted back into durable docs/issues;
- the chat solves a real job not handled well by Discussions.

Avoid creating a chat server merely because most projects have one.

## Community roles

### Creator
Uses OpenBand and provides product/workflow evidence.

### Advocate
Voluntarily teaches, shares workflows, or helps another creator.

### Reporter
Produces reproducible issue/feedback evidence.

### Contributor
Improves source, docs, tests, design, localization, presets/assets, or research tooling.

### Maintainer
Protects product direction, review quality, governance and community safety.

### Community steward
Optional future role for trusted members who help triage, answer, welcome, or moderate without receiving architecture/product authority automatically.

## First-response operating model

Prioritize by risk and user impact, not by emotional volume.

### P0
- security disclosure;
- credible data loss/corruption;
- severe privacy problem;
- broad project-opening/save/export failure.

Route to appropriate private/security process where necessary.

### P1
- reproducible activation blocker;
- major browser/audio incompatibility;
- high-frequency save/export failure;
- critical accessibility blocker.

### P2
- bounded bug/workflow friction;
- documentation gap;
- confusing feature behavior.

### P3
- feature idea;
- preference/design discussion;
- future integration suggestion.

This is community triage guidance, not the engineering risk-tier authority in `AGENTS.md`.

## Response quality

A useful maintainer/community response should do one or more of:
- clarify the observed behavior;
- ask for the minimum reproducible evidence;
- link canonical documentation;
- state a limitation honestly;
- convert evidence into an issue;
- point to an existing decision/spec;
- close the loop when shipped.

Avoid:
- generic “thanks for feedback” with no direction;
- promising delivery dates casually;
- debating every preference into exhaustion;
- asking users for private creative content when metadata/reproduction steps are sufficient.

## Creator feedback pipeline

```text
question / friction / idea
→ classify
→ support answer OR research evidence OR issue
→ product/marketing decision if warranted
→ change ships
→ release note / community closure
→ knowledge base update
```

Destinations:
- `creator-research.md` for sanitized qualitative evidence;
- `research-register.md` for durable marketing hypotheses/evidence;
- GitHub Issues for actionable product work;
- docs for reusable explanations;
- `decision-log.md` when strategy materially changes.

## Community contribution ladder

Make contribution progressive:

```text
use product
→ report evidence
→ improve docs/example
→ test a fix
→ small PR
→ repeat contribution
→ specialist/stewardship responsibility
```

Do not require every participant to become a code contributor.

### Good first contribution characteristics

- real work, not artificial chores;
- bounded context;
- clear acceptance criteria;
- known verification path;
- maintainer available to review;
- useful if merged.

## Creator asset governance

Potential community assets:
- project templates;
- presets;
- pedal/amp recipes;
- samples;
- tutorials;
- translations;
- demo projects.

Before accepting/distributing assets define:
- license/rights;
- attribution;
- file/source provenance;
- content/safety rules;
- compatibility/version metadata;
- removal/update process.

Do not ingest ambiguous copyrighted samples merely because they are community-submitted.

## Community health metrics

Measure service quality and compounding value.

### Support health
- unanswered actionable questions;
- median time to first useful response;
- percentage resolved by canonical docs;
- repeated confusion themes;
- support burden per active creator cohort.

### Creator community
- returning creators who participate voluntarily;
- creator-created guides/assets that are actually reused;
- useful feedback reporters who return;
- workflow discussions that produce documentation/product learning.

### Contributor health
- first meaningful contribution completion;
- review turnaround;
- repeat contributors;
- contributor drop-off reasons;
- maintainer review load.

### Safety/moderation
- moderation incidents;
- unresolved harassment/spam;
- private-data exposure incidents;
- time spent on moderation relative to community value.

Avoid using message count, member count, emoji reactions, or Discord online count as primary health evidence.

## Community growth gates

### Before 100 Successful Creators

Use minimal surfaces:
- Issues;
- existing repo docs;
- direct alpha feedback/research;
- Discussions only if there is enough participation to answer reliably.

Goal: learn, not appear large.

### 100–250

Add structured discussion categories if recurring questions justify them.

Goal:
- identify repeat workflow questions;
- convert answers into docs;
- establish first creator advocates/reporters.

### 250–500

Test community assets/challenges only if product reliability is strong.

Goal:
- see whether community output improves activation/retention;
- establish contribution/support routines.

### 500–1,000

Formalize stewardship only if maintainers are becoming the bottleneck.

Potential additions:
- trusted community responders;
- recurring creator challenge;
- contributor office hours;
- asset review process;
- localized community support where demand exists.

Do not open more channels than the team can maintain.

## Moderation baseline

Require and enforce a Code of Conduct before actively scaling community participation.

Moderation should distinguish:
- criticism of product/decisions — allowed;
- repetitive low-quality promotion/spam — actionable;
- harassment/hate/threats — actionable;
- doxxing/private-data exposure — urgent;
- copyright/asset disputes — remove/quarantine while reviewed;
- security reports — route privately.

Document escalation and appeal paths before delegating moderator permissions.

## Release/community loop

Every meaningful release should answer:

1. What creator problem changed?
2. Which issue/research evidence motivated it?
3. What can users try now?
4. What remains limited?
5. Is there a creator/community action worth inviting?

This turns changelogs into trust/re-engagement rather than feature inventory.

## Advocacy

Advocacy is voluntary behavior after value.

Useful advocacy actions:
- share a real workflow;
- create a tutorial;
- recommend OpenBand to a relevant creator;
- report a reproducible bug;
- improve documentation;
- contribute a preset/template with clear rights;
- contribute code/tests.

Do not:
- pay for undisclosed positive reviews;
- reward spam/referral dumping;
- pressure alpha testers for testimonials;
- selectively quote feedback in misleading ways.

## Community incident checklist

For a material incident:

1. preserve evidence;
2. protect affected users/private data;
3. apply the documented policy;
4. restrict access only as necessary;
5. escalate security/legal issues to the proper owner;
6. record a sanitized internal/public outcome when appropriate;
7. update policy/docs if the incident exposed a gap.

## Success definition

The community is working when it makes the product and creator experience better without consuming disproportionate maintainer capacity.

The desired flywheel is:

```text
creator value
→ useful participation
→ reusable knowledge / evidence / contribution
→ better product and onboarding
→ more creator value
```
