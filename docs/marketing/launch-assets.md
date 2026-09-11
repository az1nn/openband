# Launch Assets and Evidence

> Evidence companion to [`launch-checklist.md`](./launch-checklist.md). The checklist owns go/no-go status; this file records what must be captured and what the current repository assets can honestly support.

## Evidence snapshot — 2026-09-11

| Area | Current evidence | Consequence |
| --- | --- | --- |
| Name | An unrelated same-category `OpenBand` is live in both major app stores | No final identity, store metadata, or paid reach before clearance |
| Public entry | The deployed root opens the login route; visitor entry is present but product value is not established first | A public landing surface remains a launch dependency |
| First impression | Deployed auth route exposed `(auth)/login`; repository metadata was generic | Hide route chrome, align metadata, then verify the deployed revision |
| Creative loop | Broad implementation and screenshots exist; an unaided blank-to-export session is not published | Do not market feature breadth as workflow proof |
| Visual proof | The DAW screenshot is the strongest raw asset; several captures are empty, loading, dark, or mock-led | Recapture a rights-cleared project from the launch candidate |
| Identity | App icon, logo glyph, handwritten wordmark, login mark, and sidebar wordmark are inconsistent | Keep the identity provisional until naming is resolved |
| Measurement | Audio-health telemetry exists; a consented activation funnel is not yet release evidence | Publish no activation claim before the measurement contract is implemented |

## Current screenshot register

The source set lives in [`../../marketing/screenshots/`](../../marketing/screenshots/). The detailed UI audit remains in [`../../marketing/SCREEN-SPECS.md`](../../marketing/SCREEN-SPECS.md).

### Best raw candidates

| Asset | Potential use | Required recapture or edit |
| --- | --- | --- |
| `stack/daw-studio.png` | README and product overview | Rights-cleared named project, active playhead, meaningful meters, clean crop |
| `stack/stem-extractor.png` | Focused stem story | Real input-to-result sequence and license-safe audio |
| `stack/mastering-suite.png` | Finish/export story | Populated waveform, meters, and a real version result |
| `tabs/3d-studio-tab.png` | Secondary exploration story | Fix overlapping UI; publish only after core Studio proof |
| `tabs/momentos.png` | Community/sample story | Replace mock identity and content with consented material |

### Do not use as hero proof

| Asset group | Reason |
| --- | --- |
| `auth/login.png` | Registration is not the promised outcome; captured route chrome is broken |
| `tabs/biblioteca.png` | Empty state communicates absence rather than value |
| `tabs/conta.png` | Account and plan scaffolding distract from creation |
| `tabs/feed.png` | Onboarding and mock content obscure a real creator result |
| `tabs/ajustes.png` | Supporting utility screen, not acquisition proof |
| `creative/mixing-console.png` and `creative/synth-lab.png` | Loading states are not product evidence |
| Other 3D room stills | Visually dark and difficult to understand without audible context |

## Minimum public-beta asset set

### Product proof

- One 60–90 second uncut landscape demo: blank project → first sound → meaningful edit → save/reopen → export.
- One 20–30 second vertical cut from the same tested workflow.
- Five desktop stills: entry, first sound, edit, save/reopen, and export.
- Mobile captures only from a verified mobile build, not a narrow desktop viewport.
- Three level-matched audio A/B examples with documented rights.
- One downloadable or reproducible starter project with a clear license.

### Trust and distribution

- Supported-browser and known-limitations pages tied to a release.
- Privacy/data-flow, terms, support, and security-reporting routes.
- Contributor path and public changelog.
- Canonical URL, favicon, page metadata, and social preview.
- Final icon/avatar/header only after the naming gate.

## Hero demo shot list

Capture the full path first. Derive shorter edits only after the uncut proof is archived.

| Beat | What the viewer must see | Evidence captured |
| --- | --- | --- |
| 1. Entry | Public page and visitor/local CTA | Start URL, release, browser |
| 2. First action | Record, import, instrument, or starter choice | No hidden preloaded state |
| 3. First sound | Transport and audible output | Elapsed time and audio route |
| 4. Meaningful edit | One arrangement, level, MIDI, or effect change | Clear audible before/after |
| 5. Persistence | Save, reload, and recover the same project | Project/assets survive |
| 6. Export | Create and play the exported file | Non-empty, decodable, audible result |

Show waiting, permissions, and recoverable failures honestly. A cut must never imply that an unproven step succeeded.

## Capture specifications

| Deliverable | Canvas | Safe area | Primary use |
| --- | --- | --- | --- |
| Landscape demo | 1920×1080 | Key UI inside central 1600×900 | Landing, YouTube, press |
| Repository still | 1600×900 | No key text in outer 48 px | README, articles |
| Social landscape | 1200×675 | Key content inside central 1080×567 | Link previews |
| Square | 1080×1080 | Key content inside central 920×920 | Carousels |
| Vertical | 1080×1920 | Avoid top/bottom 240 px | Reels, Shorts, TikTok |

Keep a lossless master and crop per channel. Do not stretch one export to every format.

## Short-form production rule

The first two seconds begin with sound or an unmistakable transformation: dry-to-shaped guitar, isolated-to-full mix, empty-to-eight-bars, rough-to-finished bounce, or a visible edit with an audible result.

Then:

1. Put one tension in on-screen text.
2. Show two or three real product actions.
3. Level-match and label A/B audio where relevant.
4. State alpha limits if they affect the demonstrated path.
5. Use one CTA that opens the exact workflow shown.

Do not open with a logo animation, founder monologue, menu tour, or unsupported feature list.

## Rights, consent, and privacy record

Before an asset is approved, record:

- composition, master, performance, artwork, sample, and project-file owners;
- licensed channels, territories, formats, edits, attribution, and usage period;
- explicit consent for any creator's name, face, voice, screen, session, or quote;
- whether an AI-generated or synthetic element needs disclosure;
- confirmation that tokens, email, local paths, personal data, and private projects are absent;
- the exact release/commit, browser/device, and capture date;
- where the signed release or license evidence is stored.

Do not assume a sample pack permits isolated-stem redistribution.

## Asset approval record

```text
Asset ID:
Campaign / channel:
Source release / commit:
Workflow shown:
Claim supported:
Rights evidence:
Consent evidence:
Privacy review:
Product review:
Known limitations disclosed:
Owner:
Approval / expiry:
```

An asset expires when the shown interface, workflow, claim, rights, or destination no longer matches the promoted release.
