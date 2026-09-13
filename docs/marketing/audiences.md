# Audience, IUP, and ICP

> Status: operating audience model for the Web MVP and early growth. This document defines who OpenBand should prioritize, how to recognize fit, and how messaging changes by audience. It complements [`positioning.md`](./positioning.md), [`messaging.md`](./messaging.md), and [`go-to-market.md`](./go-to-market.md).

## Operating model

OpenBand is currently **IUP-first, not ICP-first**.

- **IUP — Ideal User Profile:** the creator most likely to activate, finish something useful, return, and recommend the product.
- **ICP — Ideal Customer Profile:** a future organization likely to buy hosted collaboration, compute, support, or deployment services without forcing the core product away from creator ownership.

The current business model does not justify leading with B2B qualification. The launch motion is product-led: discover → try → make sound → create → export → return → share.

## Primary IUP — independent creator

The primary user is an independent musician or producer who wants to move from a musical idea to an audible, saved, and exported track with minimal setup and without mandatory account lock-in.

Typical forms include:
- bedroom producer;
- singer-songwriter;
- beatmaker;
- guitarist or other instrument-first creator;
- electronic musician;
- multi-instrumentalist.

### Core job to be done

> When I have an idea, help me turn it into something I can hear, shape, save, and export before the creative impulse disappears.

### Main pains

- setup friction before the first sound;
- blank-canvas paralysis;
- workflows split across recorder, beat tool, DAW, stem utility, mastering service, and cloud storage;
- account or subscription gates before creation;
- project formats and hosted state that create lock-in;
- too much complexity before the user reaches a useful result;
- many sketches started but few completed.

### Desired outcomes

The user experiences value when they can:
1. open the studio;
2. start without mandatory signup;
3. produce sound quickly;
4. record, import, or create musical material;
5. make a meaningful edit;
6. save and reopen the same work;
7. export a valid audio result;
8. return later and continue.

The emotional transition is:

```text
"I have an idea"
      ↓
"I am making music"
      ↓
"This became a track"
      ↓
"My project is still mine"
```

## High-fit signals

A creator is a stronger fit when several of these are true:
- creates original music regularly;
- starts ideas more often than they finish them;
- uses multiple tools to complete one track;
- values fast access over deep setup;
- is sensitive to recurring subscriptions or account gates;
- cares about project ownership, portability, or local workflows;
- is willing to try browser-based creative tools;
- exports demos, sketches, beats, or finished tracks regularly;
- likes open-source, independent, or inspectable software.

## IUP scoring heuristic

This is a research and recruitment heuristic, not a product permission system.

| Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Creates music | rarely | occasionally | frequently |
| Creates original material | rarely | sometimes | often |
| Tool fragmentation pain | low | moderate | high |
| Need for fast start | low | medium | high |
| Values project ownership | low | medium | high |
| Rejects lock-in | no | somewhat | yes |
| Needs exportable results | rarely | sometimes | often |
| Openness to browser tools | low | medium | high |

Interpretation:
- **0–5:** low fit;
- **6–10:** potential fit;
- **11–13:** good fit;
- **14–16:** core OpenBand user.

## Workflow-entry personas

These are acquisition wedges into the same core product, not separate products.

### Independent creator

**Trigger:** a new musical idea.

**Pain:** too much friction between inspiration and an editable track.

**Promise:**
> Start with the idea. Leave with a track.

**Proof:** browser entry, visitor/local path, recording/import, arrangement, save/reopen, export.

**Primary CTA:** **Start creating**

**Best channels:** YouTube, creator communities, Reddit, short-form video.

### Beatmaker

**Trigger:** a sample, groove, or drum idea.

**Pain:** a beat exists, but turning it into a complete track requires switching tools or losing momentum.

**Promise:**
> Start with the beat. Finish the track.

**Proof:** sampler/beat workflows, MIDI, arrangement, mixer, effects, export when release-grade.

**Primary CTA:** **Make a beat**

**Content hooks:** sample → beat → arrangement → export; one-sample challenges; beat-from-scratch demos.

### Guitarist / instrument-first creator

**Trigger:** a riff, progression, tone, or live instrument idea.

**Pain:** capturing a simple idea often requires opening several layers of recording and amp/effect tooling.

**Promise:**
> Plug in an idea. Build the song around it.

**Proof:** guitar/input path, pedal/amp workflow, recording, multitrack arrangement, effects, export when verified.

**Primary CTA:** **Record a riff**

**Content hooks:** riff → track; tone recipes; pedalboard experiments; quick home-recording workflows.

### Vocalist / singer-songwriter

**Trigger:** melody, lyric, voice memo, or acoustic sketch.

**Pain:** phone recordings capture inspiration but often do not provide a natural path to an arranged song.

**Promise:**
> Capture the idea before it disappears.

**Proof:** recording/import, multitrack arrangement, effects, mix, save/reopen, export.

**Primary CTA:** **Record your idea**

**Content hooks:** voice memo → song; vocal layering; songwriter workflow; before/after production.

### Producer / power creator

**Trigger:** an active production session or unfinished track.

**Pain:** repeated tool switching between creation, editing, processing, stems, mastering, and export.

**Promise:**
> Move from sketch to finished track without breaking creative context.

**Proof:** the verified integrated production workflow. Do not use expansion features as proof before their complete user journeys are launch-grade.

**Primary CTA:** **Open the studio**

**Content hooks:** complete production sessions, sound design, mixer workflows, performance and architecture proof.

### Open-source audio advocate

**Trigger:** discovery of an interesting browser-audio, local-first, or open-source music project.

**Pain:** creative software is often opaque, difficult to extend, or tied to vendor-controlled state.

**Promise:**
> Creative infrastructure you can inspect.

**Proof:** public source, architecture, specs, tests, roadmap, contribution process.

**Primary CTA:** **View source** / **Contribute**

**Best channels:** GitHub, developer communities, WebAudio/audio engineering communities, technical launch posts.

## Anti-IUP

Do not let these users define the Web MVP:
- teams expecting complete Pro Tools, Ableton Live, Logic, or FL Studio replacement parity;
- large commercial sessions with demanding routing and plugin ecosystems;
- orchestral/scoring workflows requiring mature specialist notation and library integration;
- mission-critical real-time collaboration expectations;
- enterprise administration as the primary buying requirement.

These users may become valid later. They should not distort the launch contract now.

## Persona messaging matrix

| Persona | Trigger | Pain | Promise | Primary proof | CTA |
| --- | --- | --- | --- | --- | --- |
| Independent creator | musical idea | setup + fragmentation | Start with an idea. Leave with a track. | core creative loop | Start creating |
| Beatmaker | sample / groove | beat never becomes song | Start with the beat. Finish the track. | beat → arrange → mix → export | Make a beat |
| Guitarist | riff / tone | fragmented guitar workflow | Plug in an idea. Build the song. | guitar → record → arrange | Record a riff |
| Vocalist / songwriter | melody / voice memo | idea trapped in a sketch | Capture it before it disappears. | record/import → arrange → export | Record your idea |
| Producer | unfinished production | tool switching | Finish without breaking context. | integrated verified workflow | Open the studio |
| OSS advocate | technical discovery | closed creative software | Creative infrastructure you can inspect. | source + specs + architecture | View source |

All proof is subordinate to the claim guardrails in [`messaging.md`](./messaging.md). If a capability is not release-grade, qualify or remove it from acquisition copy.

## Messaging by funnel stage

### Awareness

Lead with the problem, not the feature inventory.

Examples:
- Your best music idea should not die during setup.
- Why does making one simple demo require five tools?
- A music project should not become useless because an account or subscription changed.

### Interest

Explain the product in one move:

> A local-first, open-source browser music studio built around start → shape → finish → keep.

### Activation

Do not route the first session through marketing education. Route it into creation.

Primary CTA:
> **Start creating**

Useful in-product progression:

```text
Make your first sound
        ↓
Turn it into something
        ↓
Save it
        ↓
Take it with you
```

### Retention

The message changes from product discovery to project continuation:
- Pick up where you left off.
- Finish what you started.
- Your project is ready when you are.

### Advocacy

Invite proof and participation:
- share what you made;
- report where the workflow broke;
- contribute code, docs, presets, tests, or feedback;
- show the next creator what can be made.

## Future ICP — hypothesis, not launch market

The B2B ICP becomes relevant only when OpenBand has a real organizational offer and validated demand.

Potential early segments:
- creator collectives;
- small independent studios;
- indie labels;
- music communities or creator platforms;
- music education after classroom validation.

### Organizational fit signals

A future organization is more attractive when it:
- has roughly 5–100 active creators rather than enterprise-scale complexity;
- wants browser accessibility across heterogeneous devices;
- has recurring problems with project exchange, shared assets, or workflow consistency;
- values self-hosting, local control, open source, or explicit data boundaries;
- can benefit from hosted sync, collaboration, compute, storage, support, or managed deployment;
- does not require the free local core to become a paid dependency.

### Possible future offers

- hosted sync/collaboration;
- organization workspaces;
- managed compute for expensive processing;
- storage and recovery convenience;
- managed/private deployment;
- commercial support;
- institutional deployment assistance.

These are hypotheses. Do not publish pricing or enterprise promises until product policy, code gates, economics, support expectations, and public copy agree.

## Anti-ICP

Do not prioritize as the first commercial market:
- major labels;
- large universities;
- broadcast networks;
- film/post-production enterprises;
- AAA game studios;
- large professional studios with complex SLA/security/integration requirements.

The acquisition cost and product requirements are mismatched with the current stage.

## Strategic priority

1. **P0 — independent musicians and producers.**
2. **P1 — beatmakers, guitarists, and vocalists as acquisition wedges.**
3. **P2 — open-source audio developers and advocates.**
4. **P3 — creator collectives and small professional teams after collaboration proof.**
5. **P4 — education and institutional customers after explicit validation.**

## Decision rule

For a new feature, campaign, or partnership, ask:

> Does this help the independent creator move from an idea to something audible, saved, and exportable with less friction and more control?

If not, the work needs an explicit strategic reason to outrank the core user journey.
