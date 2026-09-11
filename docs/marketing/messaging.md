# Messaging System

## Message house

### Brand belief

Creative software should increase a musician's agency. The creator should be able to start quickly, understand what the tool is doing, keep control of the project, and leave with a usable result.

### Core promise

> **Make music. Keep the project.**

### Expanded promise

> A local-first, open-source music studio for turning an idea into a real track in the browser—without mandatory signup or project lock-in.

### Three message pillars

#### 1. Start creating
Open the studio and get to sound quickly.

Proof:
- Web-first;
- visitor/local project path;
- target first sound < 60s;
- recording, import, instruments and core arrangement.

#### 2. Finish something
The core loop is built around a song you can save, reopen, hear, and export.

Proof:
- launch gate targets blank project → valid exported song < 10 minutes;
- persistence trust and export trust are explicit release gates;
- core mixer/transport/editing are part of the same flow.

#### 3. Stay in control
The project is not valuable only while a vendor account is available.

Proof:
- local-first ownership path;
- open source;
- project recovery/import-export direction;
- optional cloud/AI capabilities should remain explicit rather than silently becoming the authority.

## Tagline candidates

The naming gate may change the product name; these lines are designed to survive a rename.

Recommended launch line:

> **Make music. Keep the project.**

Alternatives:

- **The open studio for making music.**
- **Create without lock-in.**
- **Your song starts here. Your project stays yours.**
- **From blank project to finished track—openly.**
- **A music studio that starts with creation, not registration.**

Avoid slogans centered on "AI," "revolution," "professional-grade," "ultimate," "next-gen," or "BandLab killer."

## One-liners by audience

### General
OpenBand is a local-first, open-source music studio that runs in the browser and helps you get from a blank project to an exported track without mandatory signup.

### Musicians
Record, arrange, mix, and export a song without making an account the price of starting.

### Guitarists
Plug in, shape a tone, record the idea, and build the track in one open studio.

### Open-source audience
An open-source, local-first browser DAW built around creator ownership instead of mandatory cloud state.

### Developers / contributors
A TypeScript/Expo music-production stack with transparent specs, architecture, tests, and a public roadmap—built in the open.

## Repository description options

Recommended once the launch flow is proven:

> Local-first, open-source music studio for the Web. Record, arrange, mix and export without mandatory signup or project lock-in.

Short variant:

> Local-first open-source browser DAW for recording, arranging, mixing and exporting music.

Do not lead the repository description with a long feature list. Features belong below the value proposition.

## Landing-page copy architecture

### Hero

**Eyebrow**
Open-source music studio

**Headline**
Make music. Keep the project.

**Subhead**
Record, arrange, mix, and export in a local-first browser studio. Start creating without mandatory signup—and inspect the source whenever you want.

**Primary CTA**
Start creating

**Secondary CTA**
View source

**Proof row**
Web first · Local-first projects · Free core creation · Open source

### Section 2 — The creative loop

**Headline**
From blank project to something you can share.

1. **Start** — Record, import, or create your first sound.
2. **Shape** — Arrange, balance, and edit the track.
3. **Finish** — Save, reopen, and export a real audio file.

The launch demo should show this sequence uncut. The product should provide the proof before the page provides more claims.

### Section 3 — Ownership

**Headline**
Your project is not a hostage to an account.

Copy:
Local projects should remain useful without mandatory signup. Cloud collaboration and hosted services can add convenience later, but they should not redefine who owns the work.

### Section 4 — Open source

**Headline**
Open by design.

Copy:
Inspect the code, follow the roadmap, report a bug, contribute a fix, or build on the ideas. OpenBand's development is public because creative infrastructure earns more trust when its behavior can be examined.

### Section 5 — Creative depth

Do not dump the entire README feature inventory here. Use 3–5 grouped cards and only mark launch-grade capabilities as immediately available.

Suggested groups:
- Record & arrange
- Instruments & guitar
- Mix & finish
- Optional AI tools
- Collaboration & community — clearly marked "expanding" until launch-grade

### Section 6 — Community

**Headline**
Built with musicians, not only for them.

CTAs:
- Star on GitHub
- Report an issue
- Join discussions — after GitHub Discussions is enabled
- Contribute

## README opening rewrite target

The first screen of the README should answer these questions before showing the stack:

1. What is this?
2. Why is it different?
3. Can I try it now?
4. What is actually launch-ready?
5. How do I run it locally?

Suggested top structure:

```md
# <Product name>

**Make music. Keep the project.**

A local-first, open-source browser music studio for recording, arranging, mixing and exporting without mandatory signup.

[Try the Web app] [Launch status] [Contributing]

<hero screenshot / 20–40s loop>

## Why this exists
...

## Launch status
...

## Quick start
...

## Features
...

## Architecture / stack
...
```

## Social bio copy

### X / Bluesky / Threads
Open-source, local-first music studio. Make tracks in the browser, keep control of the project, follow the build in public.

### YouTube
OpenBand development, music-production demos, guitar workflows, sound design, local-first product experiments, and transparent build logs.

### GitHub organization/profile pin
Building an open-source, local-first music studio for creators who want fast workflows without project lock-in.

## Voice

### Attributes
- musician-first;
- concise;
- confident but falsifiable;
- technically literate;
- independent without being anti-company;
- playful in demos, disciplined in claims.

### Vocabulary to prefer
- create
- record
- track
- project
- song
- local-first
- open source
- own / control
- export
- inspect
- contribute

### Vocabulary to use carefully
- free — distinguish free core from future optional paid services;
- private — specify which workflow and where data goes;
- offline — use only where proven on the target runtime;
- professional — demonstrate rather than declare;
- AI — name the concrete job it performs;
- collaborative — distinguish repository implementation from launch-grade UX.

## Claim guardrails

### Safe when the launch gates are green
- local-first project path;
- no mandatory signup for a local project;
- open source;
- free core creation;
- browser-first;
- first-sound and export time targets, only when measured and published as evidence.

### Require qualification
- cross-platform;
- offline-first;
- real-time collaboration;
- AI privacy;
- stem separation;
- mastering;
- app-store availability;
- production-grade / professional-grade.

### Never use without evidence
- "best"
- "fastest"
- "industry-leading"
- "zero latency"
- "unlimited"
- "100% private"
- "replaces Ableton/FL Studio/Logic"
- "feature parity with BandLab"

## Launch post skeleton

**Hook**
I wanted a music studio where opening a project did not begin with surrendering the project to an account.

**Problem**
Browser music tools are convenient; open-source DAWs are powerful. The gap worth exploring is immediate browser creation with local-first ownership.

**Product**
The public Web MVP focuses on one job: blank project → sound → edit → save/reopen → export.

**Proof**
Show the uncut workflow and publish the actual measured time.

**Ask**
Try the flow, break it, open an issue, or contribute. Early feedback should focus on creation reliability rather than wishlist breadth.
