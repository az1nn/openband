# Measurement

## Measurement philosophy

OpenBand is local-first. Analytics should be intentionally minimal, privacy-respecting, and incapable of reconstructing a user's music project.

Measure whether the product fulfills its promise. Do not instrument every click just because it is technically possible.

## Primary launch metric

### Activated Creator

A creator is activated when, in a first or early session, they:

1. enter the Studio;
2. produce an audible first sound;
3. preserve the project successfully;
4. export a valid audio file.

Launch target from the product contract:

- first sound: **< 60 seconds**;
- blank project → valid exported song: **< 10 minutes**.

The actual measured distribution matters more than the target alone. Track median, P75, P90, and failure rate.

## North-star candidate

> **Weekly creators who successfully export from a project they can reopen.**

Why:
- rewards creation rather than browsing;
- couples persistence trust with output trust;
- is more meaningful than signups or page views;
- remains compatible with local-first visitor mode.

This can evolve once retention patterns are understood.

## Successful Creator operating unit

For growth operations, use a **Successful Creator** as a unique creator/session identity that, within the measurement window and without inspecting creative content:

1. starts or opens a project;
2. produces sound;
3. makes a meaningful edit/creation action;
4. saves/reopens or exports successfully.

This is an operating definition, not a permanent identity model. Prefer privacy-safe anonymous/coarse identifiers and revise the definition if beta evidence shows a better predictor of repeated creator value.

## Funnel metrics

| Stage | Metric | Question |
| --- | --- | --- |
| Discovery | qualified landing visits | Are the right people finding us? |
| Intent | studio-open rate | Does the promise create action? |
| Activation 1 | first-sound success rate | Can a new creator make sound? |
| Activation 2 | first-sound time | How much friction exists? |
| Trust | save success | Does the project persist? |
| Trust | reopen success | Can the creator recover the project? |
| Completion | export success | Can the creator leave with a song? |
| Completion | blank→export time | Is the core loop actually fast? |
| Retention | creator returns to meaningful creation | Was the tool useful enough to reuse? |
| Advocacy | voluntary share/referral/feedback | Did value create a voluntary public action? |
| Community | meaningful creator/contributor participation | Does openness compound creator value? |

## Secondary metrics

### Product
- recording success/failure rate;
- import success/failure rate;
- export decoding/validation failure rate;
- storage/quota/permission failure rate;
- crash/error-free creative sessions;
- percentage of sessions reaching at least one edit after first sound.

### Marketing
- landing → Studio CTR;
- demo play/completion rate;
- channel → activated/successful-creator rate;
- README → live app CTR;
- GitHub star rate per qualified repository visitor;
- launch post → successful creator, not only clicks.

### Retention / growth
- D1 creator return;
- D7 creator return;
- D30 creator return when sample size supports it;
- repeated Successful Creator sessions;
- same-project continuation vs new-project creation when measurable without inspecting project content;
- cohort retention by acquisition wedge/channel;
- creator return after a meaningful release/fix;
- support burden per active creator cohort.

### Referral / advocacy
- voluntary referral/share initiation after successful output;
- referred visitor → Studio open;
- referred visitor → Successful Creator;
- D7 return of referred creators;
- creator-created tutorials/assets that produce downstream successful creators;
- actionable feedback reporters who return.

### Community
- unique issue reporters who provide reproducible evidence;
- contributor first-PR completion rate;
- repeat contributors;
- actionable questions answered;
- median time to first useful response;
- unresolved recurring questions;
- community-created reusable assets that are actually used;
- maintainer review/support load;
- moderation/private-data incidents.

## Avoid vanity metrics

Do not use these as primary success evidence:
- raw impressions;
- follower/member count;
- repository stars in isolation;
- total registered users;
- message count;
- Discord/Discussion activity volume;
- number of implemented features;
- test count;
- lines of code;
- downloads without activation.

They can provide context but should not drive product positioning or community scaling.

## Event taxonomy

If analytics are implemented, prefer coarse product-outcome events.

### Suggested events

- `landing_view`
- `studio_open`
- `project_created_local`
- `first_sound`
- `record_start`
- `record_success`
- `record_failure`
- `import_success`
- `edit_first_success`
- `save_success`
- `save_failure`
- `reopen_success`
- `reopen_failure`
- `export_start`
- `export_success`
- `export_failure`
- `feedback_open`
- `github_source_click`

Optional future growth events, only if justified and privacy-safe:
- `referral_prompt_shown`
- `referral_action`
- `release_note_open`
- `community_link_open`

Do not add events merely because they are easy to instrument.

### Safe properties

Use only what is necessary for product-quality segmentation:
- anonymous/session install identifier if justified;
- runtime (`web`, later `android`, `ios`, `desktop`);
- browser family/major version;
- coarse device class;
- feature path (`record`, `import`, `instrument`);
- elapsed milliseconds for activation stages;
- normalized error category;
- release version;
- coarse acquisition/referral source when justified.

### Never collect in marketing analytics

- raw audio;
- project titles;
- lyrics;
- MIDI content;
- file names;
- API keys;
- AI prompts;
- exact local file paths;
- authentication tokens;
- chat content;
- collaborator identities;
- precise location.

Any hosted feature needing richer operational logs should have its own explicit data contract and retention policy.

## Privacy model

Recommended hierarchy:

1. Use deterministic client-side validation and test telemetry first.
2. Prefer anonymous aggregate product events for public beta.
3. Make analytics disclosure easy to find.
4. Give users a reasonable opt-out if telemetry is not strictly necessary.
5. Do not let marketing analytics become a hidden cloud dependency for local projects.
6. Do not create account/email identity solely to improve lifecycle attribution.
7. Do not infer creative intent/content from local project material for growth segmentation.

## Lifecycle measurement

Lifecycle messaging must be evaluated by creator value, not message engagement alone.

Primary chain:

```text
eligible / opted-in exposure
→ product return
→ first sound / meaningful edit
→ save/export
→ later return
```

Guardrails:
- dismissal;
- unsubscribe/opt-out;
- support complaints;
- no forced signup/identity capture;
- no degradation in activation trust.

Open/click rate can diagnose packaging, but cannot prove lifecycle value.

## Community health model

Community health combines utility, response quality, compounding knowledge, and stewardship cost.

Track:

```text
creator question / evidence
→ useful response
→ durable answer / issue / research item
→ product or knowledge improvement
→ creator value
```

Useful community output should eventually become one or more of:
- canonical documentation;
- actionable issue;
- sanitized research evidence;
- reusable creator asset;
- contribution;
- release-note closure.

If activity creates no durable value and consumes increasing maintainer time, treat it as a warning signal.

## Milestone measurement gates

### 0–100 Successful Creators
Focus:
- first-session reliability;
- top activation failures;
- qualitative creator language;
- initial D7 baseline;
- save/export trust.

### 100–250
Focus:
- cohort comparison by wedge/channel;
- D7 return;
- support load;
- reasons for return/abandonment.

### 250–500
Focus:
- repeatable proof/content acquisition;
- community asset impact;
- referral quality;
- reactivation via releases;
- contributor/community service quality.

### 500–1,000
Focus:
- stability of Successful Creator cohorts;
- strongest repeatable growth loop;
- support/moderation scalability;
- D30 when meaningful;
- observed demand for optional hosted/team/compute jobs.

## Qualitative research

Numbers will identify friction; they will not explain creator confidence.

For the first 20–40 alpha testers, record:
- screen capture with consent;
- think-aloud notes;
- first moment they hesitate;
- first moment they feel the project is "real";
- interpretation of "local-first" before explanation;
- perceived difference from their current DAW;
- whether they trust save/reopen/export;
- one sentence they would use to describe the product to another musician.

The exact words users repeat should influence copy more than internal feature names.

## Experiment framework

Every marketing experiment should state:

```md
Hypothesis:
Audience:
Single variable:
Primary metric:
Guardrail metric:
Minimum evidence:
Decision date:
Result:
Decision:
```

Examples:

### Hero-message test
Hypothesis: ownership-led copy increases Studio opens among open-source/local-first visitors without reducing creator activation.

Primary metric: landing → Studio open.
Guardrail: Studio open → first sound.

### Demo test
Hypothesis: showing an uncut 40-second first-sound workflow increases qualified starts more than a montage of advanced features.

Primary metric: demo viewers → Studio open.
Guardrail: activation completion.

## Weekly launch/growth dashboard

Keep the dashboard compact:

1. Successful Creators: new + returning.
2. Studio opens and first-sound success + median/P75 time.
3. Save/reopen success.
4. Export success + median/P75 blank→export time.
5. D7 creator return by major acquisition wedge/channel.
6. Top normalized product failure categories.
7. Referral/advocacy-generated Successful Creators.
8. Community/support health: unresolved questions + response/review burden.
9. Top qualitative creator themes.
10. One decision for the next cycle.

If a metric cannot change a product, growth, or community decision, it probably does not belong on the weekly dashboard.
