# Demand Intelligence

> Purpose: map how qualified creators express demand before OpenBand has enough first-party search and cohort data. This document turns search/category curiosity into testable acquisition hypotheses; it is not a keyword-volume report.

## Operating principle

OpenBand should not publish pages because a phrase appears related to music production. A demand theme becomes actionable only when three conditions align:

1. **Real user intent** — the query expresses a job, pain, comparison, or workflow a creator actually has.
2. **Product proof** — the promoted release can satisfy the intent without widening claims.
3. **Downstream value** — the traffic can plausibly reach first sound, meaningful creation, save/export, and return.

Search volume without product fit is not demand worth serving.

## Demand layers

| Layer | User question | Example intent | Best response |
| --- | --- | --- | --- |
| Category | What kind of tool solves this? | browser DAW, open-source DAW | category/landing page + real demo |
| Job | How do I complete this task? | record guitar in browser | workflow page/video |
| Pain | How do I avoid this friction? | DAW without signup, keep project locally | explanatory proof page |
| Capability | Can a browser tool do this? | multitrack recorder, MIDI editor | product capability page with evidence |
| Comparison | Which tradeoff fits me? | browser DAW vs desktop DAW | balanced comparison by job |
| Technical | How is this built? | Web Audio DAW architecture | engineering article / GitHub |
| Brand | What is OpenBand? | OpenBand DAW | brand page after naming clearance |

## Initial demand map

These are **candidate clusters**, not validated search opportunities.

### D1 — Browser music creation

Representative language:
- browser DAW;
- web DAW;
- online music studio;
- online multitrack recorder;
- music production in browser.

User job:
> Start creating without installing a heavyweight desktop tool.

Proof required:
- public Web entry;
- actual sound creation;
- basic editing;
- persistence;
- valid export.

Primary success metric:
- organic entry → Studio open → first sound.

### D2 — Open-source music production

Representative language:
- open source DAW;
- open source music production software;
- open source browser DAW.

User job:
> Find a music-production tool whose source and development can be inspected.

Proof required:
- public repository;
- accurate license/attribution presentation;
- current architecture/product docs;
- runnable product path.

Primary success metric:
- organic entry → product usage or meaningful GitHub action.

### D3 — Low-friction / ownership

Representative language:
- DAW without account;
- music app without signup;
- local-first music app;
- own project files;
- music software without cloud lock-in.

User job:
> Create without making account/cloud dependency the price of starting.

Risk:
- this language may be low-volume or unfamiliar even if the underlying job is valuable.

Validation:
- Search Console/query data after launch;
- creator language from interviews;
- ownership-led copy experiment.

### D4 — Guitar workflow

Representative language:
- record guitar in browser;
- browser guitar amp simulator;
- online guitar pedalboard;
- guitar recording software no install.

User job:
> Get a usable tone, record the riff, and develop it into a track quickly.

Proof required:
- input path that works reliably on supported browsers;
- tone shaping that can be demonstrated honestly;
- record → arrange → export flow.

### D5 — Beatmaking / sample workflow

Representative language:
- browser beat maker;
- online beat maker;
- sample to beat workflow;
- browser sampler;
- beat maker with export.

User job:
> Turn a sample or rhythmic idea into something arranged and exportable.

Strategic caution:
This is a crowded category. Do not target broad beat-maker terms until OpenBand has a concrete workflow advantage or content proof.

### D6 — Songwriting / capture

Representative language:
- record song idea online;
- turn voice memo into song;
- songwriter recording tool;
- quick demo recording software.

User job:
> Capture the idea before the creative impulse disappears, then continue shaping it.

Validation:
Use creator language before deciding whether search demand uses “songwriter,” “demo,” “voice memo,” or another vocabulary.

### D7 — Developer / Web Audio

Representative language:
- Web Audio DAW;
- browser DAW architecture;
- open source Web Audio project;
- React audio editor;
- local-first audio app.

User job:
> Learn from, inspect, or contribute to a technically interesting music-software system.

Primary success metric:
- qualified repository visitor → issue/discussion/PR/repeat contribution.

## Search-intent qualification score

Score every proposed organic topic from `0–2` on each dimension.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Audience fit | weak/unclear | adjacent | primary IUP |
| Job clarity | vague | implied | concrete |
| Product proof | unavailable | partial | launch-grade |
| Differentiation | commodity | some angle | distinct tradeoff/proof |
| Activation path | no clear CTA | indirect | direct to relevant workflow |
| Evidence freshness | stale/unknown | needs check | current |

Interpretation:
- `0–4`: do not prioritize;
- `5–8`: research/observe;
- `9–10`: candidate;
- `11–12`: high-priority test.

This score ranks experiments; it does not predict search volume.

## SEO doctrine

OpenBand follows a people-first strategy:

- create pages because they solve a creator's job, not to manufacture keyword inventory;
- show first-hand product evidence: real screenshots, uncut demos, measured workflows, limitations;
- use the words creators use naturally in titles, headings, alt text, descriptions, and internal links;
- make important pages crawlable and internally connected;
- avoid scaled thin pages, templated comparison spam, or AI-generated commodity content;
- disclose methodology when tests, benchmarks, or AI assistance materially affect the content;
- keep pages current when their claims depend on release behavior, pricing, competitors, or support status.

Google's current guidance emphasizes helpful, reliable, people-first content and clear query language rather than content made primarily for ranking. See S-012/S-013.

## AI-search / generative-search posture

Do not create a separate “GEO” content factory.

The same durable advantages apply:
- original evidence;
- first-hand product experience;
- clear authorship and methodology;
- useful structure;
- unique technical/creator perspective;
- source-backed factual claims;
- non-commodity material that cannot be reproduced by summarizing other sites.

Google's AI-search guidance explicitly favors useful, original, non-commodity content rather than recycled summaries; see S-014.

## Demand-validation workflow

```mermaid
flowchart LR
  A[Creator job / research] --> B[Candidate intent]
  B --> C[Check current SERP / platform search]
  C --> D[Verify product proof]
  D --> E[Score opportunity]
  E --> F[Publish one useful proof asset]
  F --> G[Measure query → activation]
  G --> H[Update research register]
  H --> A
```

For each candidate:

```md
Demand ID:
Audience:
Job:
Observed language:
Search/channel surface:
Current result landscape:
Product proof available:
Primary CTA:
Primary metric:
Guardrail:
Decision date:
Result:
```

## Search Console operating model

Once a stable public domain exists, Search Console data should replace guesswork.

Track:
- queries generating impressions;
- pages receiving qualified impressions;
- query → click rate;
- landing → Studio open;
- organic → first sound;
- organic → successful creator;
- country/device differences where privacy-safe and decision-useful.

Do not optimize a page solely because impressions rise. A page that attracts broad irrelevant traffic can damage focus even if SEO metrics look good.

## Content types by intent

| Intent | Preferred artifact | CTA |
| --- | --- | --- |
| Category | concise landing / category explainer | Start creating |
| Workflow | step-by-step proof + video | Open relevant workflow |
| Pain/ownership | behavioral explanation | Try local project |
| Capability | evidence page | Try feature/workflow |
| Comparison | balanced tradeoff analysis | Choose/try relevant path |
| Technical | architecture/build article | View source / contribute |

## Comparison-content rule

Comparison pages are allowed only when:
- the compared job is real;
- competitor evidence is current;
- strengths of the other product are acknowledged;
- OpenBand limitations are explicit;
- the page contains original workflow evidence;
- the goal is user decision quality, not inflammatory SEO capture.

Never mass-produce `OpenBand vs X` pages.

## Naming risk

Because `OpenBand` currently has a same-category collision, branded search data is contaminated by ambiguity. Until naming clearance is complete:
- prioritize problem/workflow/category discovery;
- avoid interpreting branded impressions as clean awareness;
- do not buy significant branded media;
- keep durable SEO assets rename-friendly where practical.

## What this document does not claim

It does not claim:
- validated keyword volumes;
- ranking feasibility;
- expected traffic;
- conversion benchmarks;
- that any candidate phrase is worth a page;
- that SEO is the primary acquisition channel.

Those become evidence only after measured demand and activation exist.
