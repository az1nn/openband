# Marketing Research Register

> Purpose: keep market assumptions, observations, evidence, and validation work traceable. This file is not campaign copy. It is the research ledger behind positioning and go-to-market decisions.

## Evidence states

Use one state per research item:

- `VERIFIED` — supported by current product behavior or a directly checked external source.
- `OBSERVED` — seen in qualitative/market evidence but not yet strong enough to generalize.
- `HYPOTHESIS` — plausible and strategically useful, but still requires testing.
- `UNKNOWN` — material question without enough evidence.
- `STALE` — previously useful evidence that must be refreshed before reuse.

A research item may inform a decision without becoming a public claim. Public claims remain governed by [`messaging.md`](./messaging.md) and the launch gates.

## Freshness policy

- Current product behavior: re-check against the promoted release before launch copy is published.
- Competitor/product claims: re-check before any campaign, comparison page, press pitch, or launch post that depends on them.
- User research: preserve date, sample, task, and method; do not silently generalize from a small sample.
- Search demand, pricing, app-store status, platform support, and legal/name availability are time-sensitive by default.
- Platform discovery/policy guidance should be refreshed before major distribution pushes.
- External evidence should be registered in [`source-registry.md`](./source-registry.md) when it becomes reusable decision evidence.

## Research ledger

| ID | Question / proposition | State | Current evidence | Next validation | Decision impact |
| --- | --- | --- | --- | --- | --- |
| R-001 | Independent creators value a low-friction path from idea to export. | HYPOTHESIS | Product strategy and audience model are built around this job; no broad user validation yet. | Closed alpha task study with 15–40 creators; measure first sound, export, hesitation and reuse intent. | Primary audience, onboarding, hero copy. |
| R-002 | Local-first ownership is meaningful enough to differentiate OpenBand, not merely technically interesting. | HYPOTHESIS | Competitive review shows a plausible white space; internal product contract makes ownership explicit. | Ask alpha testers to explain the product in their own words before teaching the concept; test ownership-led vs speed-led copy. | Positioning and message hierarchy. |
| R-003 | No mandatory signup materially reduces activation friction. | HYPOTHESIS | Visitor/local project path is part of the launch contract. | Compare studio-open → first-sound completion and abandonment; collect qualitative reasons for drop-off. | CTA and onboarding design. |
| R-004 | Guitarists are an efficient early acquisition wedge. | HYPOTHESIS | Distinct instrument-first workflow and demonstrable visual/audio content. | Run a focused riff → track campaign and compare activated-creator rate against general creator traffic. | Content/channel allocation. |
| R-005 | Beatmakers are an efficient short-form acquisition wedge. | HYPOTHESIS | Sample/beat transformation maps well to short-form content. | Test sample → beat → export clips with channel-tagged activation. | Short-form content strategy. |
| R-006 | Singer-songwriters respond strongly to the “capture before it disappears” job. | HYPOTHESIS | Voice/melody capture is a clear emotional trigger, but not yet validated. | Test voice memo → song workflow content and first-session interviews. | Persona messaging. |
| R-007 | Open-source development can create early advocates and contributors before consumer scale. | HYPOTHESIS | Public repo, architecture/specs and contributor path exist. | Track qualified GitHub traffic → issue/report/PR/repeat contribution, not stars alone. | Developer-community GTM. |
| R-008 | Education is attractive but premature as a primary market. | OBSERVED | Browser/no-install characteristics are promising, while classroom administration, accessibility, content policy and device constraints remain unproven. | Conduct educator interviews only after creator MVP reliability is established. | Prevent premature institutional positioning. |
| R-009 | Small creator teams/collectives could become a future B2B customer profile. | HYPOTHESIS | Collaboration and hosted-service directions exist, but there is no validated commercial offer. | Interview small studios, collectives and indie labels after collaboration workflows are release-grade. | Future ICP and monetization. |
| R-010 | Current `OpenBand` naming creates same-category confusion risk. | VERIFIED | Same-name music/collaboration product observed in major app stores; see [`competitive-landscape.md`](./competitive-landscape.md) and [`brand.md`](./brand.md). | Complete formal naming clearance before significant identity/media investment. | Brand gate. |
| R-011 | First-sound and blank-project → export time are useful activation quality indicators. | HYPOTHESIS | Targets exist in the product contract and measurement model. | Instrument distributions and correlate with D7 return/reuse intent. | Activation KPI design. |
| R-012 | “Weekly Successful Creators” is a better north-star than registrations or raw traffic. | HYPOTHESIS | Metric combines creation, persistence and output trust. | Validate correlation with retention after enough beta cohorts exist. | Growth operating model. |
| R-013 | The broader music economy is large and growing, but recorded-music revenue is context rather than OpenBand TAM. | VERIFIED | IFPI 2026 reports US$31.7B global recorded-music revenue in 2025, +6.4%; see S-001. | Refresh with annual IFPI release; never convert directly into DAW TAM. | Market narrative and sizing discipline. |
| R-014 | Accessible digital music creation has demonstrated mass-scale participation. | VERIFIED | BandLab publicly describes a 100M+ creator/community scale; see S-003/S-005. | Refresh company-scale claim quarterly; measure OpenBand's own qualified creator reach. | Confirms category scale, not OpenBand market share. |
| R-015 | Brazil/Latin America is worth a dedicated early creator-acquisition/research cohort. | HYPOTHESIS | IFPI reports LatAm +17.1% and Brazil +14.1%/#8 in 2025; Spotify reports ~R$2B Brazilian artist royalties; see S-001/S-002. | Run a localized cohort and compare activated creator + retention after controlling for channel/community access. | Geographic content/research allocation. |
| R-016 | Adjacent music-creation products validate multiple monetization archetypes while OpenBand's own willingness-to-pay remains unproven. | OBSERVED | BandLab/Soundtrap freemium; Ardour paid convenience/support; LMMS free/open; see S-003–S-010 and [`pricing-landscape.md`](./pricing-landscape.md). | After retention proof, research concrete hosted sync/compute/team jobs and current spend. | Future business model; prevents premature pricing. |
| R-017 | The numeric size of OpenBand's browser-first/local-first serviceable market is currently unknown. | UNKNOWN | Large creator and music-economy proxies exist, but none measure the exact preference/device/workflow intersection. | Build bottom-up SAM from beta traffic, activation, browser/device compatibility, persona mix, geography and retention. | TAM/SAM/SOM credibility. |
| R-018 | An operational SOM milestone is more useful now than a percentage of an unvalidated market estimate. | HYPOTHESIS | GTM already targets the first 1,000 successful creators; WSC is tied to delivered value. | Validate WSC against D7/D30 retention and cohort growth; graduate to forecast model after 1,000 WSC. | Growth planning and investor/strategy narrative. |
| R-019 | Organic discovery should prioritize creator jobs with product proof rather than broad keyword inventory. | HYPOTHESIS | Current Google guidance favors helpful, reliable, people-first content; OpenBand already has explicit creator jobs and proof requirements; see S-012/S-013. | Publish a small set of proof-led workflow pages after launch, then compare organic → successful-creator conversion. | SEO/content prioritization. |
| R-020 | Search demand should be qualified by downstream activation, not impressions or ranking alone. | HYPOTHESIS | Product-led funnel already makes first sound/successful creation the value event; search guidance does not imply traffic itself equals usefulness. | Track Search Console/query cohorts through Studio open, first sound, save/export and return. | Organic growth KPI design. |
| R-021 | Original first-hand product evidence is a durable advantage for both traditional and generative search discovery. | OBSERVED | Google Search/AI guidance emphasizes useful, original, non-commodity, first-hand material; see S-013/S-014. | Compare proof-rich workflow/engineering content against generic explanatory pages once enough organic data exists. | Content production doctrine. |
| R-022 | YouTube is likely the strongest early proof channel because real music workflows are audiovisual and the platform rewards audience-relevant packaging/satisfaction. | HYPOTHESIS | Product proof maps naturally to video; current YouTube guidance emphasizes relevance, engagement, quality, viewer satisfaction and clear packaging; see S-015/S-016. | Publish matched proof formats and track viewer → Studio open → successful creator → D7 return. | Channel allocation and content format. |
| R-023 | GitHub can acquire valuable advocates/contributors when the repository is treated as a product/discovery surface rather than only source storage. | HYPOTHESIS | GitHub provides README/topics/social preview/search/explore/contribution discovery surfaces; see S-017/S-018. | Measure README/demo CTR, qualified repo visitors, reproducible issues, first PR and repeat contributor behavior. | OSS/community GTM. |
| R-024 | Reddit can produce useful qualitative research and qualified niche acquisition only through authentic, community-specific participation. | OBSERVED | Current Reddit policy prohibits repeated unsolicited spam and emphasizes relevant/authentic participation; community rules can be stricter; see S-019/S-020. | Run small disclosed community posts only where allowed and compare feedback quality + activation against support/time cost. | Community-channel playbook. |
| R-025 | Proof-first content should outperform high-volume feature/editorial output for early OpenBand growth. | HYPOTHESIS | Core positioning depends on demonstrable workflows; platform/search guidance rewards audience usefulness and satisfaction rather than output volume. | Compare cohorts from real workflow proof vs generic feature/news content using successful creator + retention. | Content operating model. |
| R-026 | Returning to meaningful creation is a more useful retention signal than app reopen alone. | HYPOTHESIS | Product value is creative completion/continuation; current metrics already distinguish first sound, edit, save and export. | Compare D7/D30 cohorts using passive reopen vs repeated meaningful edit/save/export and correlate with qualitative reuse intent. | Retention definition and growth dashboard. |
| R-027 | Value-triggered referral after successful output will produce higher-quality acquisition than early generic share prompts. | HYPOTHESIS | Referral logically follows delivered creator value; no OpenBand referral data exists yet. | Test an optional post-export/share invitation against no prompt and measure referral → successful creator → return. | Referral loop design. |
| R-028 | Permissioned/contextual lifecycle messaging can improve return without requiring account-centric CRM. | HYPOTHESIS | Local-first product contract limits identity capture; release notes and in-product context can operate without mandatory email. | Test release-note/in-product reactivation on eligible cohorts and track return-to-successful-creation plus dismissal/opt-out. | Lifecycle channel strategy. |
| R-029 | Reusable community assets can shorten activation and increase retention when they solve a real workflow job. | HYPOTHESIS | GTM already identifies templates/presets/recipes as possible community compounding loops. | Compare new-creator cohorts using a proven template/preset vs blank start; measure first sound, export and D7. | Community asset investment. |
| R-030 | Durable asynchronous surfaces are sufficient for early community operations; synchronous chat should wait for recurring unmet demand. | HYPOTHESIS | Issues/docs/discussions preserve searchable knowledge and require less moderation fragmentation; no evidence yet that chat is necessary. | Track recurring support/discussion patterns and whether creators explicitly need synchronous interaction before opening a chat surface. | Community surface strategy. |
| R-031 | Maintainer support/moderation capacity becomes a material growth constraint as creator/community participation scales. | HYPOTHESIS | Community programs create triage/review/moderation load; current scale is too early to quantify. | Track useful-response time, unresolved questions, review load and moderation incidents across 100/250/500/1,000 creator milestones. | Community scaling gates and stewardship model. |

## Research capture template

Use this structure when adding qualitative or market research:

```md
### R-XXX — Short question

State: HYPOTHESIS | OBSERVED | VERIFIED | UNKNOWN | STALE
Date:
Method:
Sample / source:
What we observed:
What this does not prove:
Affected decisions:
Next validation:
Links:
```

## Evidence discipline

- Record what was actually observed, not what the team hoped to observe.
- Separate product facts from market interpretation.
- Small qualitative samples are directional, not population estimates.
- A competitor screenshot or pricing page proves only what was visible at the observation date.
- Recorded-music revenue, platform users and artist economics are market context/proxies, not interchangeable TAM inputs.
- Platform guidance explains mechanics/policies; it does not prove that a channel will work for OpenBand.
- Community activity is not evidence of retention unless it connects to creator value.
- Absence of evidence is not negative evidence.
- A failed experiment should update the register instead of disappearing from history.

## Relationship to other marketing docs

```mermaid
flowchart LR
  S[Source registry] --> R[Research register]
  MI[Market / demand intelligence] --> R
  CR[Creator research] --> R
  GO[Growth / lifecycle / community ops] --> R
  R --> D[Decision log]
  R --> P[Positioning / Audiences]
  D --> P
  P --> M[Messaging]
  P --> G[GTM]
  R --> E[Experiments]
  E --> R
  E --> D
  M --> C[Campaign / launch assets]
  G --> C
```

Research informs strategy; strategy governs execution; experiments feed evidence back into the system.
