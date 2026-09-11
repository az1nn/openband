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
| Retention | creator returns to same/new project | Was the tool useful enough to reuse? |
| Advocacy | voluntary share/star/feedback | Did value create a public action? |
| Community | meaningful contributor conversion | Does openness compound? |

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
- channel → activated-creator rate;
- README → live app CTR;
- GitHub star rate per qualified repository visitor;
- launch post → activated creator, not only clicks.

### Community
- unique issue reporters who provide reproducible evidence;
- contributor first-PR completion rate;
- repeat contributors;
- discussion questions answered;
- community-created reusable assets after that system exists.

## Avoid vanity metrics

Do not use these as primary success evidence:
- raw impressions;
- follower count;
- repository stars in isolation;
- total registered users;
- number of implemented features;
- test count;
- lines of code;
- downloads without activation.

They can provide context but should not drive product positioning.

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

### Safe properties

Use only what is necessary for product-quality segmentation:
- anonymous/session install identifier if justified;
- runtime (`web`, later `android`, `ios`, `desktop`);
- browser family/major version;
- coarse device class;
- feature path (`record`, `import`, `instrument`);
- elapsed milliseconds for activation stages;
- normalized error category;
- release version.

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

## Weekly launch dashboard

Keep the first dashboard compact:

1. qualified visits;
2. Studio opens;
3. first-sound success + median/P75 time;
4. save/reopen success;
5. export success + median/P75 blank→export time;
6. 7-day creator return rate;
7. top normalized failure categories;
8. top acquisition channels by activated creators;
9. qualitative themes from support/feedback.

If a metric cannot change a product or marketing decision, it probably does not belong on the launch dashboard.
