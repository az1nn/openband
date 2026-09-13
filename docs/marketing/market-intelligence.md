# Market Intelligence

> Status: strategic market model for the Web MVP and early-growth phase. This document separates **market context**, **addressability hypotheses**, and **operational targets**. It must not turn broad music-industry statistics into fake precision about OpenBand's market size.

## Executive view

OpenBand is entering a real, global and growing music economy, but its launch market is narrower than the total music industry.

Current evidence supports three conclusions:

1. digital music creation has large-scale participation;
2. browser-based and free/freemium creation is already normalized by major competitors;
3. OpenBand does **not** yet have enough evidence to publish a defensible numeric TAM/SAM for its specific local-first browser-DAW wedge.

The correct near-term approach is:

> **Use external data to understand market context; use product evidence to measure the actual reachable market.**

## Macro context

Checked 2026-09-13; sources are registered in [`source-registry.md`](./source-registry.md).

- IFPI reports global recorded-music revenue of **US$31.7B in 2025**, up 6.4% year over year.
- Latin America was the fastest-growing reported region at **+17.1%**.
- Brazil grew **14.1%** and moved to the **#8** recorded-music market globally.
- BandLab publicly describes a community of **100M+ creators** / creators and fans depending on the surface.
- Spotify's 2025 economics show substantial activity outside the superstar tier, including a 100,000th-ranked artist generating more than US$7,300 from Spotify alone.

These facts show economic and creator activity. They do **not** prove how many people need OpenBand, prefer browser creation, value local-first ownership, or will pay for optional services.

## Category structure

OpenBand sits across several overlapping categories rather than one clean market bucket.

| Category | Typical value proposition | Representative reference | OpenBand relationship |
| --- | --- | --- | --- |
| Browser creator platform | immediate access, cloud projects, community, collaboration | BandLab | closest mass-market behavior reference; different ownership model |
| Online collaborative DAW | browser production + cloud collaboration | Soundtrap | validates browser production; collaboration is not OpenBand's launch wedge |
| Open-source desktop DAW | ownership, inspectability, depth | Ardour | validates open/inspectable creative tooling; much deeper mature desktop DAW |
| Free/open desktop production | zero-cost production, community development | LMMS | validates free/open demand; different runtime and workflow emphasis |
| Commercial desktop/mobile DAW | depth, performance, ecosystem | Ableton/FL Studio/Cubasis-class tools | establishes user expectations; not the launch comparison OpenBand should try to win |
| Focused music utilities | one job such as stems, mastering, tuning or recording | many | OpenBand can absorb some jobs over time, but should not market utility inventory as the wedge |

## Market segmentation

### Segment A — Independent browser-first creators

**Launch priority:** highest.

Characteristics:
- produces music independently or in a very small group;
- comfortable starting work in a browser;
- values low setup friction;
- needs an idea → track workflow more than enterprise administration;
- may currently use several lightweight tools or a DAW plus utilities.

Evidence state: **HYPOTHESIS** as an OpenBand-specific segment size; behavior exists in the category, but reach and conversion are unmeasured.

### Segment B — Instrument-first home creators

**Launch priority:** high acquisition wedge.

Subsegments:
- guitarists/bassists;
- singer-songwriters/vocalists;
- keyboard/MIDI creators.

Reason to test: the trigger is concrete and demo-friendly: riff, melody, progression, voice memo → track.

Evidence state: **HYPOTHESIS**.

### Segment C — Beatmakers / sample-first creators

**Launch priority:** high acquisition experiment.

Reason to test:
- short-form transformation content maps naturally to the workflow;
- first-sound can be very fast;
- strong overlap with browser/mobile creation behavior.

Evidence state: **HYPOTHESIS**.

### Segment D — Open-source / local-first developer-musicians

**Launch priority:** high advocacy value, smaller consumer TAM.

Jobs:
- inspect the tool;
- trust architecture and data boundaries;
- contribute;
- self-direct or self-host where supported.

Evidence state: **HYPOTHESIS** for growth impact, **VERIFIED** that the project has a public source/contribution surface.

### Segment E — Small creative teams / collectives

**Launch priority:** later.

Potential value:
- project continuity;
- collaboration;
- hosted sync;
- managed services.

Evidence state: **HYPOTHESIS**; commercial workflow is not validated.

### Segment F — Education

**Launch priority:** later validation.

Potential value:
- browser access;
- lower installation burden;
- consistent environment;
- open-source/self-host potential.

Missing proof:
- classroom administration;
- accessibility;
- student privacy;
- content controls;
- device policy;
- teacher workflows.

Evidence state: **OBSERVED opportunity / unvalidated offer**.

## Geographic intelligence

### Global default

The product is digital, browser-first and open source, so geography should not become an artificial product boundary.

### Brazil / Latin America research cohort

Current market context justifies a dedicated experiment, not a global strategy rewrite:

- Latin America grew 17.1% in recorded-music revenue in 2025;
- Brazil grew 14.1% and became the #8 recorded-music market;
- Spotify reports approximately R$2B in 2025 royalties generated by Brazilian artists, up 24% year over year.

Hypothesis:

> Brazilian/LatAm independent creators may be an efficient early cohort for creator interviews, localized content and activation testing.

What this does not prove:
- that Brazil should be OpenBand's primary launch geography;
- that local-first is more valuable there than elsewhere;
- that willingness to pay is higher;
- that recorded-music growth translates directly into DAW adoption.

## TAM / SAM / SOM model

### Why no fake market-size number

A top-down figure such as “music production software is a US$X billion market” is not enough to size OpenBand. The product contract is narrower:

- Web-first;
- independent creator first;
- no mandatory signup for local creation;
- local-first ownership;
- open source;
- core creation free.

The addressable population depends on behavior and preference, not only industry spending.

### TAM — Total Addressable Creator Universe

Definition:

> People globally who create music digitally and could plausibly use a general-purpose music-creation environment.

Current state: **UNKNOWN numerically**.

Useful proxies:
- BandLab's 100M+ creator/community scale demonstrates mass participation in accessible digital music creation;
- global recorded-music economics demonstrate a large and growing downstream music economy;
- Spotify artist economics show meaningful economic activity across a long tail of artists.

Do not add these numbers together. They overlap and describe different populations.

### SAM — Serviceable Available Market

Definition:

> Digital music creators whose workflows, devices and preferences make a browser-first, low-friction, local-first studio relevant.

Current state: **UNKNOWN numerically**.

SAM must be estimated from observed behavior:
- supported-browser/device reach;
- qualified traffic by creator persona;
- studio-open rate;
- first-sound activation;
- successful save/reopen/export;
- D7 return;
- qualitative preference for local ownership;
- language/geography reach.

A defensible SAM model should be built after public beta cohorts exist.

### SOM — Serviceable Obtainable Market

For the current stage, use an **operational SOM**, not a fabricated percentage of an unvalidated TAM.

Initial milestone:

> **1,000 Weekly Successful Creators (WSC)**

A successful creator should satisfy the current measurement contract: meaningful creation plus preservation/output evidence as defined in [`measurement.md`](./measurement.md).

Why this is preferable:
- it is measurable;
- it represents actual delivered value;
- it can be attributed to acquisition channels;
- it creates evidence for retention and monetization later;
- it avoids pretending the company knows market share before it knows product-market fit.

After 1,000 WSC, the model can graduate to cohort-based forecasts such as 10K WSC and region/channel-level obtainable creator counts.

## Market-sizing inputs to collect

Before producing numeric SAM or revenue opportunity estimates, collect:

| Input | Why it matters |
| --- | --- |
| Qualified visits by persona/channel | reachable demand |
| Studio-open rate | proposition resonance |
| First-sound success | activation feasibility |
| Save/reopen/export completion | delivered product value |
| D7/D30 creator retention | recurring utility |
| Project frequency per creator | workflow intensity |
| Browser/device support distribution | technical serviceability |
| Geography/language distribution | reachable regional market |
| Existing-tool stack | substitution/complement behavior |
| Local-first importance score | differentiation strength |
| Paid-service interest | future monetizable demand |
| Compute/collab usage | hosted-cost and revenue potential |

## Competitive economic patterns

Observed monetization patterns in adjacent products:

1. **Freemium creation + paid advanced services** — BandLab and Soundtrap.
2. **Open source + paid convenience/support/builds** — Ardour.
3. **Fully free/open community software** — LMMS.
4. **Institutional quote / seat economics** — Soundtrap for Education.

This validates multiple viable business-model archetypes around music creation. It does **not** validate one for OpenBand.

OpenBand's current boundary remains:

> Core local creation stays free; monetization comes later only after activation and retention evidence.

See [`pricing-landscape.md`](./pricing-landscape.md).

## Market attractiveness vs readiness

| Segment | Market attractiveness | OpenBand readiness | Current action |
| --- | --- | --- | --- |
| Independent creators | High | Medium, pending launch gates | primary alpha/beta research |
| Guitarists | Medium–High | Medium | acquisition wedge test |
| Beatmakers | Medium–High | Medium | short-form wedge test |
| Singer-songwriters | Medium–High | Medium | workflow/message test |
| OSS developer-musicians | Medium | High for advocacy | community/contributor motion |
| Small teams/collectives | Medium | Low | interview later |
| Education | Potentially high | Low | defer institutional GTM |
| Enterprise studios/labels | Unknown | Very low | anti-ICP for current stage |

## Market signals to monitor quarterly

- browser DAW pricing and free-plan boundaries;
- competitor active-user/community claims;
- competitor movement toward AI generation vs creator-control positioning;
- local-first/offline/project-portability messaging in creative software;
- open-source audio project funding models;
- Web Audio / browser capability changes affecting serviceability;
- creator-economy and independent-artist economics;
- Brazil/LatAm music-industry growth;
- education procurement/pricing only when that segment enters validation.

## Strategic questions still open

1. Is speed or ownership the stronger first-click acquisition promise?
2. Which persona produces the highest **activated creator**, not merely click, rate?
3. Does local-first materially improve D7/D30 retention or only brand preference?
4. Is OpenBand a substitute for a primary DAW, a sketchpad, or a bridge between utilities for early adopters?
5. Which workflows generate repeat project creation?
6. Which optional hosted capability creates enough value to support future revenue without violating the core-free boundary?
7. Does Brazil/LatAm outperform other cohorts after normalizing for founder/community reach?

These questions should move through [`research-register.md`](./research-register.md) and [`experiments.md`](./experiments.md), not be answered by intuition.
