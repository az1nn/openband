# Lifecycle Messaging

> Purpose: define how OpenBand communicates with creators after discovery without turning a local-first product into an account-centric CRM funnel.

## Lifecycle principle

Lifecycle messaging exists to help the creator continue making music.

It must not redefine product value around registration, notifications, or cloud identity.

Primary rule:

> **Value first. Permission second. Message only when the message helps the creator act.**

## Channel hierarchy

Prefer channels in this order:

1. **In-product state and contextual guidance** — available without account and tied directly to the current task.
2. **Release notes / public changelog** — useful for reactivation and trust without requiring private identity.
3. **GitHub/community subscriptions** — creator or contributor explicitly chooses the surface.
4. **Opt-in email** — only when an account/newsletter mechanism exists and consent is explicit.
5. **Push notifications** — only for supported runtimes, explicit opt-in, and a proven creator job.

Never make email/push permission a prerequisite for local project creation.

## Lifecycle states and jobs

| State | Creator context | Useful message job | Avoid |
| --- | --- | --- | --- |
| Visitor | evaluating relevance | show proof and next action | feature dump |
| Starter | Studio open, no first sound | remove immediate friction | signup prompt |
| First sound | heard something | help shape it | celebration that interrupts flow |
| Active creator | editing/recording | reveal the next useful control | generic product tour |
| Saved | project preserved | reinforce trust / reopening | upsell |
| Exported | tangible output exists | acknowledge completion, optional share/feedback | forced referral |
| Returning | reopens project/app | continue where they left off | reset onboarding |
| Dormant opt-in user | has not returned | provide a concrete reason to return | guilt / artificial urgency |
| Advocate | shared/recommended/helped | close loop, invite deeper contribution | exploitative asks |
| Contributor | made project contribution | make next contribution easier | generic creator lifecycle spam |

## Core lifecycle messages

### 1. Start

Goal: move from Studio open to first sound.

Good:
- “Record, import, or create your first sound.”
- “Start with the idea you already have.”
- “No account needed for a local project.” — only where behavior is verified.

Avoid:
- “Create your account to begin.”
- long modal tutorials before sound.

### 2. First sound

Goal: convert novelty into meaningful creation.

Good:
- “You have sound. Shape it.”
- contextual next actions based on the path already chosen;
- one obvious edit/arrange step.

Avoid:
- achievement overlays that stop playback;
- asking for ratings/referrals immediately.

### 3. Preserve

Goal: create confidence that work will survive.

Good:
- clear save state;
- plain-language explanation of where the project lives;
- explicit warning if an action can risk unsaved work.

Avoid:
- vague cloud language;
- false “100% private” claims.

### 4. Export

Goal: deliver a portable outcome.

Good:
- “Your track is ready.”
- output location/format information;
- optional next actions: continue editing, start another project, share feedback.

Potential referral ask only after success:
- “Made something worth sharing? Show the workflow or send OpenBand to another creator.”

Avoid:
- share-to-unlock export;
- repeated share prompts.

### 5. Return

Goal: re-enter creative context quickly.

Good:
- “Continue your project.”
- recent local projects when technically/privacy appropriate;
- release note highlighting a fix or workflow improvement relevant to creators.

Avoid:
- generic “we miss you” messaging;
- pretending to know the contents of a local project.

## Lifecycle by surface

### In-product

Use for:
- next-action guidance;
- save/export state;
- limitations;
- recovery instructions;
- contextual feature discovery.

Principles:
- brief;
- dismissible when non-critical;
- tied to current state;
- no invented personalization based on project content.

### Release notes

Use for:
- meaningful creator-visible improvements;
- bug-fix closure;
- supported workflow expansion;
- transparent limitations.

Template:

```md
## What changed
<creator-visible behavior>

## Why it matters
<job / pain reduced>

## Try it
<one concrete workflow>

## Known limits
<important qualification>
```

### Opt-in email

Only when explicit consent exists.

Useful categories:
- important product/release updates;
- creator research invitations;
- community challenge or reusable asset when genuinely relevant;
- security/service notices for hosted features where applicable.

Do not:
- purchase lists;
- auto-enroll local-only visitors;
- infer email from unrelated services;
- send high-frequency engagement nudges merely to lift a metric.

### Community notifications

Use GitHub Discussions/issues/releases or future community surfaces according to user subscription behavior.

Do not duplicate the same announcement across every channel without adapting context.

## Dormancy and reactivation

Dormancy is not failure by itself. Music creation is episodic.

Before defining a reactivation program, determine:
- natural project cadence;
- whether creators return weekly, monthly, or around specific creative moments;
- which improvements genuinely create a reason to return.

Potential reactivation triggers:
- fix to a reported blocker;
- new workflow capability relevant to a previously observed job;
- creator challenge/template;
- project portability/recovery improvement;
- performance/reliability improvement.

Never message based on fabricated knowledge of a creator’s unfinished song.

## Message matrix

| Moment | Promise | Proof | CTA |
| --- | --- | --- | --- |
| Discovery | Make music. Keep the project. | real workflow demo | Start creating |
| Studio open | Reach sound quickly | immediate local workflow | Make first sound |
| First sound | Turn it into something | edit/arrange controls | Shape the track |
| Save | Your work persists | explicit save/reopen behavior | Continue |
| Export | Leave with a real result | valid audio output | Keep creating / optional share |
| Return | Continue your work | recent project/reopen | Resume |
| Release improvement | The tool got better at a real job | before/after or issue link | Try the improved flow |
| Advocacy | Help another creator | actual output/workflow | Share / contribute |

## Lifecycle experiment rules

Any lifecycle intervention must define:
- state being changed;
- channel;
- user permission basis;
- primary behavior;
- guardrail (dismissal, unsubscribe, activation, support burden);
- whether the message is useful without personalization.

Never optimize opens/clicks while creator completion or trust falls.

## Privacy boundary

Lifecycle systems must not collect or expose:
- song/project names for marketing segmentation;
- raw audio;
- lyrics;
- MIDI content;
- local file paths;
- collaborator identities;
- precise location;
- AI prompts;
- other private creative content.

If hosted collaboration later requires identity-aware operational messaging, define a separate data/retention contract.

## Copy guardrails

Prefer:
- continue;
- create;
- finish;
- save;
- export;
- try the improved workflow;
- your project / your track only when context supports it.

Avoid:
- “we noticed you haven't finished your song”;
- “your music is waiting for you” when the system cannot know that;
- false urgency;
- manipulative streaks;
- countdowns unrelated to a real event;
- mandatory social pressure.

## Success model

Lifecycle messaging succeeds when it increases creator value while preserving trust.

Measure:
- first-sound completion;
- save/export completion;
- return to successful creation;
- reactivation after meaningful releases;
- opt-out/unsubscribe/dismissal when relevant;
- qualitative trust feedback.

Do not define success as message volume or notification permission rate.
