# Marketing Decision Log

> Purpose: preserve durable marketing decisions, their rationale, authority, and supersession history. This is not a chronological meeting log; only decisions that constrain future marketing belong here.

## Status vocabulary

- `ACTIVE` — current decision.
- `PROVISIONAL` — current operating choice that still depends on evidence.
- `SUPERSEDED` — replaced by a later decision.
- `RETIRED` — no longer applicable without a replacement.

When a decision changes, do not rewrite history silently. Add the replacement decision and mark the old one `SUPERSEDED` with a pointer.

## Decisions

### MD-001 — Lead with creator agency, not feature count

**Status:** ACTIVE  
**Decision:** OpenBand competes at launch on low-friction creation + creator ownership, not on having the largest DAW feature inventory.  
**Rationale:** Mature incumbents already own deeper production workflows, network scale, or both. OpenBand has a sharper and more testable wedge around immediate browser creation, local-first ownership, and open source.  
**Authority:** [`positioning.md`](./positioning.md), [`competitive-landscape.md`](./competitive-landscape.md)  
**Implication:** Feature breadth may support the story, but must not become the hero message.

### MD-002 — Independent creators are the primary launch audience

**Status:** ACTIVE  
**Decision:** Prioritize independent musicians/producers; use guitarists, beatmakers, vocalists and other workflow entries as acquisition wedges around the same core creator job.  
**Rationale:** This audience best matches the current Web MVP contract and does not require enterprise/admin capabilities.  
**Authority:** [`audiences.md`](./audiences.md), [`../product.md`](../product.md)  
**Implication:** Education and B2B remain later validation segments.

### MD-003 — Product-led growth is the primary launch motion

**Status:** ACTIVE  
**Decision:** Optimize discovery → open studio → first sound → create → save/reopen → export → return/share rather than lead → demo → contract.  
**Rationale:** The launch offer is a self-serve free-core creative product, not a validated B2B sales motion.  
**Authority:** [`go-to-market.md`](./go-to-market.md), [`audiences.md`](./audiences.md)  
**Implication:** Landing-to-first-sound matters more than landing-to-signup.

### MD-004 — Creation before registration

**Status:** ACTIVE  
**Decision:** The primary CTA is creation (`Start creating`), and local project creation must not require signup.  
**Rationale:** Registration is not the product value; reaching meaningful sound is.  
**Authority:** [`messaging.md`](./messaging.md), [`../product.md`](../product.md)  
**Implication:** Signup must not become the default acquisition conversion metric.

### MD-005 — Core creation stays free under the current contract

**Status:** ACTIVE  
**Decision:** Opening, creating, preserving and exporting a locally owned core project must not become a paid dependency without an explicit product-strategy change.  
**Rationale:** Free core creation is part of the current product promise and supports the self-serve motion.  
**Authority:** [`../product.md`](../product.md), [`go-to-market.md`](./go-to-market.md)  
**Implication:** Future monetization should focus first on optional hosted convenience, compute, collaboration, support or similar services.

### MD-006 — Local-first ownership is the primary differentiation hypothesis

**Status:** PROVISIONAL  
**Decision:** Keep local-first ownership near the center of positioning while explicitly testing whether users perceive it as valuable.  
**Rationale:** It is a real product boundary and a plausible market white space, but market resonance still needs user evidence.  
**Authority:** [`positioning.md`](./positioning.md), [`research-register.md`](./research-register.md#research-ledger)  
**Implication:** Demonstrate ownership behaviorally; do not turn local-first into anti-cloud ideology.

### MD-007 — AI is an optional capability, not the brand center

**Status:** ACTIVE  
**Decision:** Do not position OpenBand primarily as an AI music product. Name concrete AI jobs only when the workflow is real and sufficiently proven.  
**Rationale:** The brand territory is creation + control; generic AI positioning dilutes authorship and invites claims broader than current evidence.  
**Authority:** [`messaging.md`](./messaging.md), [`README.md`](./README.md)  
**Implication:** Avoid `AI-powered DAW`, `revolutionary AI`, and similar hero language.

### MD-008 — Avoid “X killer” and replacement framing

**Status:** ACTIVE  
**Decision:** Do not position OpenBand as `BandLab killer`, `free Ableton`, or a universal replacement for mature DAWs.  
**Rationale:** It subordinates the brand to competitors and creates unsupported parity expectations.  
**Authority:** [`positioning.md`](./positioning.md), [`competitive-landscape.md`](./competitive-landscape.md)  
**Implication:** Compare jobs and tradeoffs, with explicit limitations.

### MD-009 — Education is a later validation segment

**Status:** ACTIVE  
**Decision:** Do not market OpenBand institutionally until classroom administration, accessibility, privacy/content policy and device constraints are validated.  
**Rationale:** Browser access is promising but insufficient to prove institutional product-market fit.  
**Authority:** [`audiences.md`](./audiences.md), [`research-register.md`](./research-register.md)  
**Implication:** Educator interest may be researched without widening current launch claims.

### MD-010 — `OpenBand` remains a working name pending clearance

**Status:** ACTIVE  
**Decision:** Do not treat the current name as a cleared long-term brand or make expensive identity/media commitments before the naming gate is complete.  
**Rationale:** A same-name product exists in the same music/collaboration category, creating search, store, social and possible legal confusion.  
**Authority:** [`brand.md`](./brand.md), [`competitive-landscape.md`](./competitive-landscape.md)  
**Implication:** Campaign systems and taglines should survive a rename where practical.

### MD-011 — Measure creative outcomes, not vanity activity

**Status:** ACTIVE  
**Decision:** Activation and retention metrics must center on creation, project trust and export rather than registrations, impressions or stars.  
**Rationale:** Those outcomes map directly to the product promise.  
**Authority:** [`measurement.md`](./measurement.md)  
**Implication:** Channel performance should be compared by activated creators, not clicks alone.

### MD-012 — Weekly Successful Creators is the current north-star candidate

**Status:** PROVISIONAL  
**Decision:** Use successful weekly creation/export behavior as the working north-star concept until beta evidence shows which completion behavior best predicts retention.  
**Rationale:** It better represents delivered value than raw traffic or accounts.  
**Authority:** [`measurement.md`](./measurement.md), [`go-to-market.md`](./go-to-market.md)  
**Implication:** Revisit once cohort data is sufficient to correlate completion with repeat use.

### MD-013 — Publish proof before volume

**Status:** ACTIVE  
**Decision:** OpenBand's content engine prioritizes real workflow proof, first-hand education and transparent technical evidence over publishing frequency or broad editorial volume.  
**Rationale:** The product's differentiation must be demonstrated, and current search/video platform guidance favors useful, satisfying, original content rather than commodity output.  
**Authority:** [`content-operating-system.md`](./content-operating-system.md), [`research-register.md`](./research-register.md)  
**Evidence:** R-019, R-021, R-022, R-025; S-012–S-016.  
**Implication:** Skip filler. One strong recorded workflow may feed multiple channels, but derivative assets must preserve real evidence.

### MD-014 — Scale channels by successful creator value

**Status:** ACTIVE  
**Decision:** No acquisition channel is scaled primarily on impressions, views, ranking, stars, upvotes or clicks. Scale decisions require downstream creator activation and acceptable retention/support cost.  
**Rationale:** Channel-level vanity metrics can reward audience mismatch while hiding weak product value.  
**Authority:** [`channel-playbooks.md`](./channel-playbooks.md), [`measurement.md`](./measurement.md), [`go-to-market.md`](./go-to-market.md)  
**Evidence:** R-020, R-022, R-023, R-024.  
**Implication:** The common comparison unit is qualified traffic → Studio open → first sound → successful creator → return.

### MD-015 — Organic search serves proven creator jobs, not keyword inventory

**Status:** PROVISIONAL  
**Decision:** Organic acquisition should start with a small set of creator jobs/workflows that OpenBand can prove, rather than mass-producing SEO pages across broad music-software terms.  
**Rationale:** Search demand is strategically useful only when intent, product proof and downstream activation align.  
**Authority:** [`demand-intelligence.md`](./demand-intelligence.md), [`research-register.md`](./research-register.md)  
**Evidence:** R-019, R-020, R-021; S-012–S-014.  
**Implication:** Search Console/product cohort data should decide which demand clusters expand after launch.

### MD-016 — Retention means return to creative value

**Status:** ACTIVE  
**Decision:** Retention is defined around creators returning to continue or create meaningful work, not merely reopening the app or engaging with lifecycle messages.  
**Rationale:** A local-first creative tool exists to help people make music; notification engagement is not a substitute for repeated product value.  
**Authority:** [`growth-operating-system.md`](./growth-operating-system.md), [`measurement.md`](./measurement.md)  
**Evidence:** R-026, R-027.  
**Implication:** D1/D7/D30 analysis should distinguish passive reopen from successful creative return whenever measurement supports it.

### MD-017 — Lifecycle messaging is permissioned and value-triggered

**Status:** ACTIVE  
**Decision:** OpenBand lifecycle communication must prefer in-product context and public release notes; email/push require explicit opt-in and may not become prerequisites for local creation.  
**Rationale:** Mandatory identity capture would conflict with the local-first/no-signup product contract and could optimize CRM engagement at the expense of creator trust.  
**Authority:** [`lifecycle-messaging.md`](./lifecycle-messaging.md), [`../product.md`](../product.md)  
**Evidence:** R-028.  
**Implication:** No “growth” feature should force account creation merely to enable reminders, reactivation, or referral.

### MD-018 — Community scales only with creator utility and stewardship capacity

**Status:** ACTIVE  
**Decision:** Open new community surfaces or programs only when they solve a recurring creator/contributor job and the project can support moderation, triage, and knowledge maintenance.  
**Rationale:** Empty/noisy channels create support debt and fragmented knowledge; durable docs/issues/discussions should remain preferred until synchronous community clearly adds value.  
**Authority:** [`community-operations.md`](./community-operations.md), [`growth-operating-system.md`](./growth-operating-system.md)  
**Evidence:** R-029, R-030, R-031.  
**Implication:** Member/message counts do not justify adding Discord/Matrix or expanding programs without measurable creator value.

## Decision template

```md
### MD-XXX — Decision title

**Status:** ACTIVE | PROVISIONAL | SUPERSEDED | RETIRED  
**Decision:**  
**Rationale:**  
**Authority:**  
**Evidence:**  
**Implication:**  
**Supersedes / superseded by:**
```

## Change rule

Campaign copy may specialize a decision for a channel, but cannot silently override this log. Material changes to audience priority, core promise, monetization boundary, naming posture, launch motion, content doctrine, channel-scaling rules, lifecycle permission, retention definition, or community-surface strategy require an explicit decision update and reconciliation of downstream docs.
