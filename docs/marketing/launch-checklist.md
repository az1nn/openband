# Launch Checklist

## Purpose

This checklist connects marketing readiness to the actual Web MVP contract. A launch campaign is not green while the core creative loop is red.

Use three states:
- `[ ]` not proven;
- `[-]` partial / blocked;
- `[x]` proven with evidence.

## Gate A — Brand and legal clarity

- [ ] Product name cleared enough for public investment across app stores, search, domains, social handles, and relevant trademark databases.
- [ ] Exact-same-category `OpenBand` collision has a documented decision: rename, differentiate with counsel/clearance, or another explicit path.
- [ ] Canonical domain chosen.
- [ ] Canonical social handles reserved where useful.
- [ ] Repository `LICENSE` / copyright / third-party notice presentation reviewed for accuracy.
- [ ] Privacy/data-ownership language reflects actual product behavior.
- [ ] Terms/support/contact requirements for public beta identified.

**No paid identity/media spend before this gate.**

## Gate B — Product promise

Mapped to Issue #46 and launch slices.

### Entry
- [ ] Public Web deployment is stable.
- [ ] Visitor can reach a local project without mandatory signup.
- [ ] Blank Studio has obvious first actions.
- [ ] Supported browsers are documented.
- [ ] Microphone/storage permissions have clear failure states.

### First sound
- [ ] A new visitor can produce first sound in under 60 seconds in the intended browser path.
- [ ] Real microphone recording starts/stops reliably.
- [ ] New recording is immediately audible.
- [ ] Import path is reliable enough for launch.
- [ ] At least one non-recording path to sound is obvious.

### Arrange / mix
- [ ] Launch-scope region edits behave correctly.
- [ ] Transport works reliably.
- [ ] BPM/metronome work in the same flow.
- [ ] mute/solo/volume/pan are understandable.
- [ ] undo/redo protects basic creative actions.
- [ ] failures are visible and non-destructive.

### Persistence trust
- [ ] Autosave behavior is proven.
- [ ] Reload preserves project structure/state.
- [ ] Recorded/imported audio assets survive reopen.
- [ ] Closing/reopening browser does not orphan the project in tested conditions.
- [ ] quota/storage/permission failures are visible.
- [ ] recovery/import-export path is documented if available.

### Export trust
- [ ] WAV export available.
- [ ] Exported file is non-empty, decodable, and audible.
- [ ] Export reflects launch-scope mixer state.
- [ ] Export failure is explicit and non-destructive.
- [ ] Deterministic fixture validates exported result.

### End-to-end proof
- [ ] E2E covers project → sound → edit → save/reload → export.
- [ ] Manual real-microphone smoke is green.
- [ ] New-user median first-sound time measured.
- [ ] New-user blank→export time measured.
- [ ] At least 15 external alpha users have attempted the core task.

## Gate C — Positioning and copy

- [ ] Product category finalized.
- [ ] Core promise finalized.
- [ ] Positioning statement approved.
- [ ] P1 audience selected.
- [ ] 3 message pillars trace to product evidence.
- [ ] Competitor references are accurate and current.
- [ ] No "professional-grade," "best," "unlimited," or parity claims without evidence.
- [ ] AI claims describe a concrete job rather than using AI as generic hype.
- [ ] Local-first / offline / privacy wording has been reviewed against actual data flows.

## Gate D — Landing page

- [ ] Hero leads with outcome/differentiation rather than feature inventory.
- [ ] Primary CTA is `Start creating` or equivalent.
- [ ] Secondary CTA is `View source`.
- [ ] Real OpenBand product visual appears above or immediately below the fold.
- [ ] 20–40 second uncut creative-loop proof exists.
- [ ] Creative-loop section explains Start → Shape → Finish.
- [ ] Ownership/local-first section explains what stays local and where cloud is optional/used.
- [ ] Open-source section links to source/roadmap/contributing.
- [ ] Launch status separates reliable-now vs expanding/experimental capabilities.
- [ ] FAQ covers account, storage, browser support, export, privacy, AI/cloud, and limitations.
- [ ] Metadata, title, description, OG image, favicon, canonical URL, sitemap, robots are correct.
- [ ] Mobile layout is verified even if creation is initially desktop-browser optimized.
- [ ] Analytics is minimal and disclosed.

## Gate E — GitHub as a marketing surface

- [ ] README first screen is user-first.
- [ ] Live-demo CTA present.
- [ ] Hero screenshot or short visual proof present.
- [ ] Launch status visible.
- [ ] Tech stack moved below product value.
- [ ] `CONTRIBUTING.md` exists.
- [ ] `CODE_OF_CONDUCT.md` exists.
- [ ] `SECURITY.md` exists or security reporting path is explicit.
- [ ] Issue templates exist.
- [ ] Discussions enabled if community support is ready.
- [ ] Relevant repository topics expanded.
- [ ] Social preview image configured.
- [ ] Releases/changelog used for public milestones.
- [ ] Roadmap points to real issue/spec sources rather than stale wishlists.

## Gate F — Launch assets

Minimum set:

- [ ] 1 hero product screenshot.
- [ ] 1 uncut first-sound clip.
- [ ] 1 blank-project-to-export video.
- [ ] 1 guitar/instrument workflow if reliable.
- [ ] 1 local-first ownership diagram.
- [ ] 1 GitHub/open-source architecture/build story.
- [ ] social avatar/header set after naming is cleared.
- [ ] GitHub social preview.
- [ ] launch-post copy variants for GitHub/HN/Reddit/social.
- [ ] press/creator fact sheet with only verified claims.

## Gate G — Alpha evidence

For each tester, capture:
- [ ] acquisition source;
- [ ] role/workflow;
- [ ] time to first sound;
- [ ] time to export;
- [ ] blocker count;
- [ ] save/reopen confidence;
- [ ] product-description sentence in their own words;
- [ ] return intent;
- [ ] permission status for any quote/video used publicly.

Alpha exit suggestion:
- at least 80% complete first sound without help;
- at least 70% reach export without a launch-blocking defect;
- no credible data-loss bug remains open;
- top three confusion themes have either been fixed or deliberately accepted;
- ownership proposition is understood without a long explanation.

These are strategic thresholds, not immutable product requirements. Adjust with evidence.

## Gate H — Public beta distribution

- [ ] GitHub release published.
- [ ] canonical landing live.
- [ ] launch status clearly says beta if appropriate.
- [ ] support/issue triage owner defined.
- [ ] rollback path exists.
- [ ] one launch post prepared for each selected community, not copy-pasted blindly.
- [ ] creator outreach list is small and relevant.
- [ ] short-form clips derive from real demos.
- [ ] launch-day metrics dashboard works.
- [ ] feedback triage cadence defined for the first 72 hours.

## First 72 hours

Monitor:
- first-sound failures;
- recording/browser regressions;
- persistence failures;
- export failures;
- broken landing→Studio path;
- unexpected data/privacy questions;
- misunderstanding of "local-first";
- name confusion with the unrelated OpenBand product;
- repeated onboarding questions that copy can solve.

Prioritize reliability and clarity fixes over adding new features.

## First 30 days

- [ ] Publish real activation results.
- [ ] Replace launch assumptions with observed audience data.
- [ ] Rewrite copy using phrases users actually use.
- [ ] Identify best channel by activated creators, not traffic.
- [ ] Establish 7-day creator return baseline.
- [ ] Ship at least one feedback-driven improvement with a public before/after.
- [ ] Decide whether community motion is strong enough for Discussions/challenges/templates expansion.
- [ ] Revisit monetization only if activation and return intent justify it.

## Kill criteria for a campaign

Pause distribution—not product work—if:
- data loss is reproducible;
- export is frequently invalid;
- recording failure is widespread on supported browsers;
- name confusion dominates discovery;
- landing copy promises a workflow that is not release-grade;
- traffic increases while activation collapses.

Marketing cannot compensate for a broken creative loop; it only makes the breakage more visible.
