# Marketing Experiment Ledger

> Purpose: turn the marketing knowledge base into a learning system. Experiments must update research evidence and, when warranted, strategy decisions. This file tracks deliberate tests; routine publishing belongs in channel/content operations.

## Experiment states

- `BACKLOG` — defined but not started.
- `RUNNING` — collecting evidence.
- `DECIDED` — enough evidence to make the stated decision.
- `INCONCLUSIVE` — stopped without enough evidence.
- `CANCELLED` — no longer worth running.

## Standard

Every experiment must specify:

```md
ID:
Status:
Research link:
Hypothesis:
Audience:
Single variable:
Primary metric:
Guardrail metric:
Minimum evidence:
Stop condition:
Result:
Decision:
Knowledge-base updates:
```

Do not run message or channel tests that cannot change a decision.

## Priority backlog

### EXP-001 — Ownership-led vs speed-led hero

**Status:** BACKLOG  
**Research:** R-002  
**Hypothesis:** Ownership-led copy increases qualified Studio starts among local-first/open-source visitors without reducing creator activation relative to speed-led copy.  
**Audience:** Qualified landing visitors.  
**Single variable:** Hero value proposition.  
**Variant A:** speed / idea-to-track.  
**Variant B:** project ownership / local-first.  
**Primary metric:** landing → Studio open.  
**Guardrail:** Studio open → first sound.  
**Minimum evidence:** Enough qualified sessions per variant to avoid reacting to a handful of users; report counts and uncertainty rather than a false precision threshold.  
**Decision:** Determine whether ownership belongs in the hero, supporting proof, or only technical messaging.

### EXP-002 — Uncut creative-loop demo vs feature montage

**Status:** BACKLOG  
**Research:** R-001, R-011  
**Hypothesis:** A real uncut workflow creates more activated creators than a montage of advanced capabilities because it proves the core promise.  
**Audience:** New creator traffic.  
**Single variable:** Demo format.  
**Primary metric:** demo viewer → first sound.  
**Guardrail:** export success / blank→export time.  
**Decision:** Select the default launch-demo format.

### EXP-003 — Guitar acquisition wedge

**Status:** BACKLOG  
**Research:** R-004  
**Hypothesis:** Riff → tone → record → track content produces a higher activated-creator rate than general DAW content.  
**Audience:** Guitar/home-recording communities.  
**Single variable:** Workflow-specific acquisition story.  
**Primary metric:** channel visit → Activated Creator.  
**Guardrail:** D7 return.  
**Decision:** Increase, hold, or reduce guitar-focused content allocation.

### EXP-004 — Beatmaker acquisition wedge

**Status:** BACKLOG  
**Research:** R-005  
**Hypothesis:** Sample → beat → export content produces efficient qualified acquisition on short-form channels.  
**Audience:** Beatmakers / bedroom producers.  
**Single variable:** Beatmaking transformation story.  
**Primary metric:** channel visit → Activated Creator.  
**Guardrail:** first-session export and D7 return.  
**Decision:** Determine whether beatmaking should be a P0 acquisition wedge.

### EXP-005 — Voice memo → song

**Status:** BACKLOG  
**Research:** R-006  
**Hypothesis:** “Capture the idea before it disappears” resonates strongly with singer-songwriters and converts to real first sessions.  
**Audience:** Vocalists / songwriters.  
**Single variable:** Voice-first narrative.  
**Primary metric:** qualified visit → first sound.  
**Guardrail:** save/reopen success and reuse intent.  
**Decision:** Validate or demote the singer-songwriter persona message.

### EXP-006 — Open-source build-in-public acquisition

**Status:** BACKLOG  
**Research:** R-007  
**Hypothesis:** Technical build logs and architecture walkthroughs generate a smaller but more valuable advocate/contributor cohort than generic repository promotion.  
**Audience:** Developer-musicians / WebAudio / open-source audio communities.  
**Single variable:** Technical proof content vs generic project announcement.  
**Primary metric:** qualified repository visitor → meaningful action (reproducible issue, discussion, first PR).  
**Guardrail:** contributor quality / maintainer support cost.  
**Decision:** Set the engineering-content share of the early community engine.

### EXP-007 — Local-first comprehension

**Status:** BACKLOG  
**Research:** R-002, R-003  
**Hypothesis:** Showing where a project is stored and when cloud services are invoked creates more trust than explaining “local-first” abstractly.  
**Audience:** Alpha/beta creators.  
**Single variable:** Behavioral demonstration vs terminology-led explanation.  
**Primary metric:** unaided correct explanation of project ownership after the task.  
**Guardrail:** onboarding completion time.  
**Decision:** Choose how ownership is taught in onboarding/landing content.

### EXP-008 — First-sound as retention predictor

**Status:** BACKLOG  
**Research:** R-011, R-012  
**Hypothesis:** Faster successful first sound and successful save/export correlate with higher D7 return.  
**Audience:** Beta cohorts.  
**Single variable:** Observational cohort segmentation; this is an analysis experiment, not an A/B manipulation.  
**Primary metric:** D7 return by activation-quality cohort.  
**Guardrail:** distinguish correlation from causation.  
**Decision:** Confirm or revise the activation model and north-star candidate.

### EXP-009 — Proof-rich workflow page vs generic explainer

**Status:** BACKLOG  
**Research:** R-019, R-021, R-025  
**Hypothesis:** A workflow page containing real screenshots/video, exact steps, limitations and a direct product path produces higher creator activation than a generic text-only category explainer for comparable qualified intent.  
**Audience:** Search/owned visitors with a concrete workflow job.  
**Single variable:** Evidence depth / first-hand proof in the content experience.  
**Primary metric:** page visit → first sound.  
**Guardrail:** bounce/return-to-search signals where measurable; successful creator rate.  
**Minimum evidence:** Comparable qualified traffic and clear query/landing attribution; do not overclaim from a few organic visits.  
**Decision:** Set the minimum evidence standard for organic workflow pages.

### EXP-010 — YouTube transformation packaging

**Status:** BACKLOG  
**Research:** R-022, R-025  
**Hypothesis:** Packaging videos around a concrete creator transformation produces more qualified product use than packaging around release/features.  
**Audience:** Musicians/producers on YouTube.  
**Single variable:** Title/thumbnail narrative.  
**Variant A:** creator transformation (`one riff → finished sketch`).  
**Variant B:** feature/release framing (`OpenBand vX guitar features`).  
**Primary metric:** viewer → Studio open → first sound.  
**Guardrail:** audience retention and D7 return of acquired creators.  
**Decision:** Set the default YouTube packaging doctrine.

### EXP-011 — Organic-query cohort quality

**Status:** BACKLOG  
**Research:** R-020  
**Hypothesis:** Workflow/problem queries that closely match a launch-grade path produce fewer visits but higher successful-creator and return rates than broad category queries.  
**Audience:** Organic search visitors.  
**Single variable:** Observational segmentation by query-intent cluster; not an A/B manipulation.  
**Primary metric:** successful creator rate by query cluster.  
**Guardrail:** D7 return and product-support burden.  
**Decision:** Decide which demand clusters earn more content/technical SEO investment.

### EXP-012 — GitHub discovery surface quality

**Status:** BACKLOG  
**Research:** R-007, R-023  
**Hypothesis:** A repository surface optimized around product value, launch truth, topics, social preview and clear contribution paths increases meaningful creator/contributor actions more than a feature-heavy engineering-only presentation.  
**Audience:** GitHub visitors.  
**Single variable:** Repository presentation baseline over a defined before/after period.  
**Primary metric:** meaningful action rate: demo open, reproducible issue, discussion or first PR.  
**Guardrail:** maintainer support cost and issue quality.  
**Decision:** Determine which repository-discovery investments deserve ongoing maintenance.

### EXP-013 — Post-export referral invitation

**Status:** BACKLOG  
**Research:** R-027  
**Hypothesis:** A single optional referral/share invitation shown after successful export produces higher-quality referred creators without harming completion trust.  
**Audience:** Creators who have successfully exported.  
**Single variable:** Optional post-export invitation vs no referral prompt.  
**Primary metric:** referred visitor → Successful Creator.  
**Guardrail:** export completion satisfaction, dismissal rate, D7 return of referrer.  
**Decision:** Determine whether referral belongs in the default post-success experience.

### EXP-014 — Release-note reactivation

**Status:** BACKLOG  
**Research:** R-028  
**Hypothesis:** Concrete creator-job release notes generate more return-to-successful-creation than generic “new version” announcements among users who have opted into a reachable channel.  
**Audience:** Eligible opt-in/community/release subscribers.  
**Single variable:** Job/problem framing vs generic release framing.  
**Primary metric:** message exposure → return → Successful Creator.  
**Guardrail:** unsubscribe/dismissal, support burden, no forced identity capture.  
**Decision:** Set the reactivation role of release communications.

### EXP-015 — Community asset activation test

**Status:** BACKLOG  
**Research:** R-029  
**Hypothesis:** A high-quality workflow template/preset reduces time to first meaningful output and improves D7 return for the matching creator job.  
**Audience:** New creators entering one validated workflow wedge.  
**Single variable:** Start from proven community asset vs blank project.  
**Primary metric:** time to first sound / successful creator rate.  
**Guardrail:** D7 return, creator understanding of the workflow, asset rights/compatibility.  
**Decision:** Decide whether community assets deserve a maintained growth program.

### EXP-016 — Async community sufficiency

**Status:** BACKLOG  
**Research:** R-030, R-031  
**Hypothesis:** Issues/docs/Discussions can handle early creator and contributor needs through the first growth milestones without a separate synchronous chat surface.  
**Audience:** Early creator/contributor community.  
**Single variable:** Observational service-quality analysis; do not open a chat merely to run the test.  
**Primary metric:** actionable questions resolved + median useful-response time.  
**Guardrail:** unanswered recurring needs, maintainer load, evidence of users seeking synchronous help elsewhere.  
**Decision:** Keep asynchronous surfaces or justify opening a moderated synchronous community.

## Results discipline

When an experiment closes:

1. record sample size, date range, channel and release version;
2. record the actual result even if it contradicts strategy;
3. update affected `R-*` entries in [`research-register.md`](./research-register.md);
4. update [`decision-log.md`](./decision-log.md) if the evidence changes a durable choice;
5. reconcile positioning/messaging/GTM/growth/community only after the knowledge layer is updated;
6. preserve inconclusive and negative tests to prevent repetition.

## Decision quality

A winning click-through rate is not automatically a winning message. Prefer experiments that optimize downstream creator value:

```text
qualified discovery
→ Studio open
→ first sound
→ meaningful edit
→ save/reopen
→ export
→ return
→ optional advocacy/contribution
```

The farther a result travels through this chain without damaging trust, support health or retention, the more strategically useful it is.
