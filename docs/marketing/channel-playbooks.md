# Channel Playbooks

> Purpose: define how OpenBand should behave on each acquisition/community channel, what evidence belongs there, how success is measured, and which anti-patterns to avoid.

The channel is not the strategy. Audience, product truth, and creator value come first.

## Channel selection rule

Prioritize a channel only when:

1. the target audience actually uses it for the relevant job;
2. OpenBand has a native proof format for it;
3. downstream product activation can be measured at least coarsely;
4. the team can sustain authentic participation;
5. the support/production burden does not exceed learning value.

## Channel portfolio

| Channel | Primary role | Best audience | Best proof format | Primary downstream metric |
| --- | --- | --- | --- | --- |
| YouTube | product proof + education | musicians/producers | real workflow video | viewer → successful creator |
| Shorts/Reels/TikTok | discovery | guitar/beat/songwriting | input → transformation → output | qualified visit → first sound |
| GitHub | credibility + contribution | developer-musicians | source, specs, releases, build logs | meaningful contributor action |
| Reddit | research + specialist discovery | niche creator/OSS communities | transparent workflow/build post | discussion → qualified activation |
| Hacker News | technical launch story | developers/technical founders | Show HN + live demo/source | qualified repo/demo action |
| Product Hunt | launch concentration | early adopters | launch proof package | activated creators, not upvotes |
| Creator partnerships | borrowed trust | workflow-specific creators | honest use/test session | cohort activation + retention |
| Search | persistent demand capture | job-aware creators | proof/education page | organic → successful creator |

## YouTube

### Role

OpenBand's strongest channel for proving that a browser music studio can actually complete a creative workflow.

### Audience jobs

- “Show me whether this really works.”
- “Teach me how to record/build/mix this idea.”
- “Show me the tradeoff before I try another tool.”
- “Show me how this system is built.”

### Formats

**Proof**
- 30–90 second uncut first-sound demonstration;
- 3–6 minute idea → export workflow;
- guitar/beat/songwriting vertical workflow.

**Education**
- one concrete creator job;
- troubleshooting;
- workflow recipes.

**Build in public**
- difficult audio problem;
- before/after behavior;
- architecture with actual code/product evidence.

### Packaging

YouTube's current official guidance emphasizes relevance, engagement, quality, viewer satisfaction, compelling title/thumbnail packaging, and early delivery on the promise. Tags are secondary rather than the main discovery mechanism; see S-015/S-016.

Use:
- creator/job language in titles;
- thumbnails that communicate the transformation;
- concise intros;
- actual sound/UI immediately;
- accurate descriptions and links;
- chapters when useful.

Avoid:
- deceptive thumbnails;
- “algorithm hacks” detached from viewer value;
- generic feature-tour titles;
- 30-second logos/intros before proof;
- optimizing for views that do not create qualified product use.

### Metrics

Platform:
- click-through rate;
- average view duration / retention;
- return viewers;
- comments/questions from target users.

Product:
- video → Studio open;
- video → first sound;
- video cohort → successful creator;
- D7 return.

## Short-form: YouTube Shorts / Instagram Reels / TikTok

### Role

Acquire attention through an immediately understandable musical transformation.

### Native content

Good:
- riff → tone → recorded sketch;
- raw vocal → layered idea;
- one sample → beat;
- blank project → first sound;
- project closed → reopened → exported.

Weak:
- narration over static screenshots;
- dense architecture explanations;
- “10 features in 20 seconds”;
- clips with no audible result.

### Hook discipline

The first frame/seconds should show:
- the recognizable creative input;
- the problem/tension;
- or the output that makes the viewer want to see how it happened.

### CTA

Use one:
- Start creating;
- Try the workflow;
- Watch the full session.

Do not combine “follow, like, star, sign up, join Discord, subscribe” into one CTA stack.

### Metrics

Do not pick winners by views alone.

Use:
- qualified profile/site visits;
- Studio opens;
- first-sound conversion;
- successful creator rate;
- retention by content cohort.

## GitHub

### Role

OpenBand's public proof of openness, technical seriousness, maintainability, and contribution path.

GitHub officially exposes repository customization/discovery surfaces including README, topics, social preview, licensing, sponsorship, search/explore, and contribution paths; see S-017/S-018.

### Repository discovery checklist

- concise repository description;
- accurate topics;
- strong first-screen README;
- social preview image;
- canonical demo URL;
- explicit launch status;
- license/attribution accuracy;
- CONTRIBUTING / SECURITY / conduct docs as appropriate;
- releases for meaningful public milestones;
- issue templates that produce useful evidence;
- Discussions when there is capacity to support them.

### Content

Best:
- real engineering problem solved;
- architecture/ADR explanation;
- reproducible issue;
- benchmark with method;
- transparent release note;
- “why this tradeoff exists.”

Avoid:
- manufacturing beginner issues to inflate contributor counts;
- repo-star campaigns disconnected from usage;
- claiming test count or lines of code as product value;
- README feature dumping above the core proposition.

### Metrics

- README → demo CTR;
- reproducible issues;
- first-PR completion;
- repeat contributors;
- discussions that improve product knowledge;
- repository visitors who also become creators.

Stars are context, not north star.

## Reddit

### Role

Specialist research, transparent project discussion, feedback, and occasional qualified discovery.

Current Reddit policy distinguishes authentic participation from spam; repeated unsolicited promotion or mass-posting is prohibited, and individual communities can have stricter rules. Some communities use a roughly 10% self-promotion convention; see S-019/S-020.

### Operating rules

Before posting:
- read the community rules;
- participate without promoting;
- understand common problems and vocabulary;
- disclose project affiliation;
- ask moderators when promotion policy is ambiguous.

Good post:
> I kept losing the thread between a quick guitar idea and a full DAW session, so I'm testing a browser/local-first workflow. Here's a real recording, what currently works, what breaks, and the specific feedback I'm looking for.

Bad post:
> Revolutionary free AI DAW! Check us out! [same text in 12 subreddits]

### Best communities

Identify by problem/audience, not by raw member count:
- music production;
- home recording;
- guitar/bass;
- beatmaking;
- songwriting;
- Linux/open-source audio;
- Web Audio/web development;
- local-first/self-hosting where the product job is actually relevant.

### Metrics

- quality of feedback;
- repeated creator language;
- qualified click → activation;
- issues created from discussion;
- moderator/community acceptance.

High comment count with low product fit is not success.

## Hacker News

### Role

A concentrated technical launch/discussion channel when OpenBand has something genuinely technically interesting and demonstrable.

### Story angle

Lead with:
- what was built;
- why browser/local-first audio is hard;
- the technical tradeoff;
- live demo;
- source;
- limitations.

Potential themes:
- local-first browser DAW;
- deterministic audio export in Web environments;
- cross-runtime React/Expo audio architecture;
- graph/spec-driven engineering for a creative tool.

Avoid:
- generic launch marketing language;
- fake controversy;
- pretending a consumer product is only an engineering demo;
- posting before the demo survives real traffic.

### Metric

Qualified demo/repository use and technically useful feedback, not front-page duration.

## Product Hunt

### Role

Launch amplification after the activation path is already reliable.

### Prerequisites

- stable public demo;
- polished launch visuals;
- clear product truth;
- fast first sound;
- working save/reopen/export;
- support docs;
- enough capacity to respond to feedback;
- naming situation resolved enough for public brand investment.

### Metric

- Product Hunt visitor → Studio open;
- activated creators;
- successful creators;
- D7 return;
- useful feedback.

Upvotes are secondary.

## Creator partnerships

### Role

Borrow trust from creators whose audience already experiences the target workflow pain.

### Partner fit

Score:
- audience overlap;
- credibility in the workflow;
- willingness to show real product use;
- audience engagement quality;
- production fit;
- reasonable support burden.

Prefer micro/specialist creators initially over broad music entertainment reach.

### Brief

Do not script praise.

Provide:
- actual product status;
- one workflow to test;
- known limitations;
- disclosure expectations;
- permission/rights terms;
- one desired CTA;
- how feedback will be used.

Ask for honest friction and failure, not endorsement.

### Metric

- partner cohort → activation;
- successful creator rate;
- D7 return;
- qualitative audience fit;
- cost per successful creator if paid.

## Search / organic

Detailed strategy lives in [`demand-intelligence.md`](./demand-intelligence.md).

Channel role:
- capture existing creator intent;
- answer workflow/problem questions with first-hand proof;
- build durable discovery that compounds beyond launch spikes.

Do not create large keyword inventories before the corresponding product workflows are proven.

## Owned surfaces

### Landing page

Role:
Convert qualified intent into product action.

Primary CTA:
**Start creating**

Secondary:
**View source**

### README

Role:
Explain value + truth + how to try/build/contribute.

### Email

Do not create a newsletter merely because startups “should have one.”

Use email only if there is a real recurring job, such as:
- release updates requested by users;
- waitlist/invite lifecycle;
- creator challenge participation;
- project/service notifications for opted-in hosted features.

### Community chat/Discord

Do not open a community server before there is capacity and a concrete reason for asynchronous community interaction. Empty communities reduce trust.

## Channel attribution

At minimum, preserve:
- source/channel;
- campaign/content ID;
- landing path;
- release version where relevant.

Then evaluate:

```text
channel
→ qualified visit
→ Studio open
→ first sound
→ meaningful edit
→ save/export
→ return
```

Do not optimize channels independently of product quality.

## Channel experiment template

```md
Channel:
Audience:
Research hypothesis:
Proof asset:
CTA:
Distribution method:
Primary platform metric:
Primary product metric:
Guardrail:
Support cost:
Window:
Result:
Decision: SCALE | ITERATE | HOLD | STOP
Knowledge update:
```

## Scale criteria

Scale a channel only when:
- activation is at or above the current qualified baseline;
- retention is not materially worse;
- audience is strategically relevant;
- content/support cost is sustainable;
- the channel can produce more than one lucky spike;
- policy/community behavior remains healthy.

## Stop criteria

Stop or deprioritize when:
- reach repeatedly fails to produce first sound;
- audience mismatch creates support noise;
- platform incentives push claims outside the product truth;
- acquisition depends on spammy/repetitive behavior;
- the channel requires a content cadence the project cannot sustain;
- results cannot be distinguished from launch novelty after repeated tests.
