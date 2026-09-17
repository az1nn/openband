# Growth Operating System

> Purpose: turn OpenBand growth into a controlled learning loop around successful creation, retention, and creator advocacy. Growth is not more traffic; growth is more creators repeatedly receiving product value.

## Growth contract

OpenBand grows only when the product can absorb additional creators without degrading trust.

The operating sequence is:

```text
qualified discovery
→ first sound
→ meaningful creation
→ save/reopen/export
→ return
→ share/help/contribute
→ new qualified creator
```

The unit of growth is not a signup, impression, download, or repository star. The working value unit is the **Successful Creator** defined in `go-to-market.md` and `measurement.md`.

## Growth principles

1. **Activation before acquisition scale.** Do not pour traffic into a broken first session.
2. **Retention before monetization optimization.** Repeated creative value is stronger evidence than stated willingness to pay.
3. **Proof before referral.** Ask creators to share outcomes only after the product has created something worth sharing.
4. **Local-first means lifecycle restraint.** No mandatory account means no lifecycle strategy may depend on harvesting email addresses.
5. **Community must reduce creator friction.** A community that only discusses the project is weaker than one that helps creators make music.
6. **Every loop has a guardrail.** A faster acquisition loop that lowers activation, trust, or support quality is not growth.
7. **Scale only repeatable cohorts.** One viral post is evidence of reach, not a repeatable growth motion.

## Core lifecycle states

| State | Behavioral definition | Primary job | Growth objective |
| --- | --- | --- | --- |
| Visitor | discovered OpenBand but has not opened the Studio | decide whether this is relevant | qualified Studio open |
| Starter | opened Studio but has not produced first sound | get immediate value | first sound |
| Creator | produced sound / made a meaningful edit | build something real | save or export |
| Successful Creator | created meaningful output and preserved/exported it | trust the workflow | return |
| Returning Creator | came back for same/new project | continue creative work | repeated successful sessions |
| Advocate | voluntarily shares, recommends, reports useful feedback, or teaches | help others discover/use it | qualified referral |
| Contributor | improves code/docs/assets/testing/community | strengthen the system | repeat contribution |

These states should be inferred from coarse behavior when possible. Do not create an identity graph of users merely because growth software makes it easy.

## Growth loops

### Loop A — Creative completion

```text
idea
→ first sound
→ meaningful edit
→ save/export
→ confidence
→ return to continue/create again
```

This is the primary loop. If it is weak, optimize product and onboarding before adding referral mechanics.

Inputs:
- first-run clarity;
- audio reliability;
- persistence trust;
- export trust;
- useful templates/presets when available.

Metrics:
- first-sound success;
- save/reopen success;
- export success;
- D1/D7 return;
- successful sessions per creator.

### Loop B — Output → discovery

```text
creator makes something
→ voluntarily shares output/workflow
→ another creator sees proof
→ opens Studio
→ creates
```

This is stronger than generic social sharing because the content is evidence of product value.

Potential surfaces:
- exported audio/video proof when supported;
- workflow recordings;
- project templates;
- presets/pedal/amp recipes;
- remix/challenge artifacts.

Guardrail: never make project sharing a hidden dependency for saving/exporting local work.

### Loop C — Community asset compounding

```text
creator learns workflow
→ publishes reusable knowledge/asset
→ next creator activates faster
→ more useful assets appear
```

Examples:
- presets;
- templates;
- sample packs with clear rights;
- workflow guides;
- troubleshooting recipes;
- translations.

Metric: whether community assets improve downstream activation or task success, not asset count alone.

### Loop D — Feedback → product improvement → reactivation

```text
creator hits friction
→ reports actionable evidence
→ fix ships
→ release note closes the loop
→ creator returns
```

This loop makes open development part of retention.

Guardrails:
- do not promise individual roadmap priority;
- close the loop transparently when a report materially shaped a release;
- do not expose private project material in public issues.

### Loop E — Contributor compounding

```text
technical user discovers source
→ understands architecture / issue
→ first useful contribution
→ good review/merge experience
→ repeat contributor
→ project quality improves
```

Metric: meaningful first contribution and repeat contribution, not contributor count in isolation.

## Activation operating model

### Activation definition

Use `measurement.md` as metric authority. Growth operations should treat activation as delivered creative value, not registration.

Working activation path:

```text
Studio open
→ first sound
→ meaningful edit
→ save/reopen
→ valid export
```

### Activation review

Review by cohort:
- acquisition channel;
- creator workflow wedge;
- runtime/browser family;
- release version;
- new vs returning;
- geography only at coarse, privacy-safe level when justified.

Do not optimize a segment based on fewer failures if it also produces weaker return behavior.

## Retention model

### Retention is creative return

The useful question is not “did the user open OpenBand again?” but:

> Did the creator return and continue or create meaningful work?

Track at minimum:
- D1 creator return;
- D7 creator return;
- D30 when sample size supports it;
- same-project continuation;
- new-project creation;
- repeated save/export success.

### Retention reasons to research

Positive:
- faster than existing workflow;
- project trust;
- useful instrument/workflow fit;
- enjoyable creative experience;
- community asset or template;
- visible product improvement.

Negative:
- no reason to return after one sketch;
- reliability failure;
- missing workflow depth;
- confusing storage model;
- browser/audio limitations;
- output quality mismatch;
- creator already prefers another tool for the job.

Capture reasons through `creator-research.md`; do not infer motivation from analytics alone.

## Referral model

Referral must be value-triggered.

Good triggers:
- successful export;
- finished sketch;
- creator-generated template/preset;
- useful bug fix/release closure;
- challenge/remix participation.

Bad triggers:
- first page load;
- before first sound;
- forced share to unlock core creation;
- repeated popups unrelated to creator intent.

Working referral quality chain:

```text
share/referral
→ qualified landing
→ Studio open
→ first sound
→ successful creator
→ return
```

Do not call a referral system successful because link clicks increased.

## Milestone operating plan

### 0 → 100 Successful Creators

Objective: prove the core experience works for real people.

Priority:
- first-session reliability;
- qualitative observation;
- creator-language capture;
- top failure categories;
- trust in save/reopen/export.

Required evidence:
- successful sessions across more than one workflow entry;
- clear list of dominant activation failures;
- first retention baseline;
- no major unresolved trust issue hidden by averages.

Do not optimize:
- paid acquisition;
- complex referral mechanics;
- monetization conversion.

### 100 → 250 Successful Creators

Objective: compare acquisition wedges and early retention cohorts.

Priority:
- guitar vs beatmaking vs songwriting/general creator cohorts;
- content/channel attribution;
- D7 return;
- qualitative reasons for return/abandonment;
- support workload.

Decision gate:
- at least one wedge shows both activation quality and return behavior worth another cycle.

### 250 → 500 Successful Creators

Objective: identify a repeatable creator-value motion.

Priority:
- repeatable proof content;
- template/preset/community asset tests;
- lifecycle/release-note reactivation;
- referral quality;
- contributor/community health.

Decision gate:
- one or more loops produce successful creators repeatedly across multiple publishing cycles/releases.

### 500 → 1,000 Successful Creators

Objective: prove the system can compound without degrading experience.

Priority:
- scale the strongest wedge/channel;
- strengthen retention loop;
- community operating cadence;
- creator advocacy;
- identify hosted/team/compute demand without selling it prematurely.

Decision gate at 1,000:
- activation/retention cohorts are stable enough to diagnose the next bottleneck;
- support/moderation load is understood;
- leading acquisition loop is behaviorally supported;
- monetization research can begin around observed jobs if retention is credible.

## Weekly growth review

Use one compact review:

1. Successful Creators this week.
2. New vs returning Successful Creators.
3. First-sound, save/reopen, export success.
4. D7 return by acquisition wedge/channel.
5. Top three product failure categories.
6. Top three qualitative creator themes.
7. Referral/advocacy-generated successful creators.
8. Community/support health.
9. One growth decision for the next cycle.

If the meeting cannot produce a decision, reduce the dashboard.

## Growth experiment gates

Before running an experiment:
- identify linked `R-*` hypothesis;
- identify expected lifecycle stage movement;
- choose one primary metric;
- choose downstream guardrail;
- define what changes if the result wins/loses.

After completion:
- update `experiments.md`;
- update research evidence;
- update a durable `MD-*` only if strategy changes;
- preserve negative/inconclusive results.

## Paid growth gate

Paid acquisition is not prohibited; it is gated.

Do not scale paid traffic until:
- first-sound and export reliability are credible;
- attribution to successful creator is possible without invasive tracking;
- at least one organic/community cohort demonstrates repeat usage;
- support capacity can absorb growth;
- a paid cohort can be evaluated by activation/retention, not only CPC/CTR.

## Monetization handoff

Growth does not own pricing strategy.

Only hand a monetization hypothesis to product/business-model work when:
- a repeated job is observed;
- the job has a credible paid beneficiary;
- core local creation remains protected by the active product contract;
- willingness-to-pay research is separated from generic satisfaction.

See `pricing-landscape.md` and `market-intelligence.md`.

## Anti-patterns

Do not:
- celebrate signup growth when successful creation is flat;
- push notifications/emails before consent and value;
- create artificial scarcity around core local projects;
- gamify contribution with meaningless counts;
- manufacture community activity;
- reward low-quality referrals;
- scale a channel because impressions are cheap;
- confuse GitHub stars with creator retention.
