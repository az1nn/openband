# Contributing to OpenBand

Thanks for helping build an open music-making workspace. A useful contribution starts from a creator problem and ends with evidence that the relevant workflow still works.

## Good first contributions

- Reproduce and reduce a reported bug.
- Improve a confusing setup or product document.
- Add a focused regression test.
- Improve accessibility or localization without changing behavior.
- Profile a real audio path and attach reproducible evidence.
- Clarify a small issue before proposing a broad refactor.

For product or architecture changes, open an issue or discussion-sized proposal before implementation so the expected outcome and risk can be agreed.

## Setup

```bash
git clone https://github.com/az1nn/openband.git
cd openband
npm ci
npm run web
```

Optional local API:

```bash
cd backend
npm ci
npm run dev
```

Node.js 22 or newer is required. Python/Demucs, Supabase, Redis, and object storage are optional and depend on the workflow being developed.

## Before coding

1. Read [`AGENTS.md`](AGENTS.md) and the [Constitution](.specify/memory/constitution.md).
2. Identify the issue/request and creator-visible outcome.
3. Confirm current behavior with a minimal reproduction.
4. Read only the relevant architecture, contract, ADR, spec, and source context.
5. Determine the risk tier. T2+ work follows the Spec Kit lifecycle and human design/merge gates.
6. Create a branch; never push a production change directly to `master`.

## Branches and pull requests

Use a focused branch name:

```text
agent/<issue>-<short-slug>
```

Keep a pull request coherent. Explain:

- the problem and affected creator workflow;
- what changed and what did not;
- risk tier and important boundaries;
- how behavior was verified;
- known limitations or follow-up work;
- screenshots or audio evidence when they materially help review.

Do not hide failing checks, unrelated cleanup, generated secrets, personal data, proprietary audio, or unlicensed samples in a change.

## Engineering boundaries

- `app/` and `src/` must not call Node filesystem, Electron, or Tauri APIs directly.
- Runtime-specific I/O crosses `@bridge` / `OpenBandNative`.
- Git/Markdown/code are the source of truth; Neo4j/graph outputs are engineering toolchain artifacts.
- Durable topology belongs in `docs/architecture.md`; durable contracts belong in `docs/contracts/`; architecture decisions belong in `docs/adr/`.
- A feature spec is historical after merge and is not rewritten to describe later behavior.
- Mock or fallback behavior must not be represented as production evidence.

## Verification

Select checks from the change impact; CI runs the complete merge matrix.

```bash
npm run lint
npm test
npm run test:legacy
npm run test:graph-sdd
npm run graph:ci
npm run build
```

Backend changes also require:

```bash
cd backend
npm ci
npx tsc --noEmit
```

Use focused tests while iterating, then run the risk-appropriate gate. If a required check is blocked or flaky, report that state; it is not a pass.

## Audio and visual evidence

- Use original, public-domain, or clearly licensed test material.
- Never commit a creator's private session, keys, tokens, email, or local paths.
- Level-match A/B audio when making a quality claim.
- Capture current UI from the tested commit.
- Label simulated or mock data clearly.
- Include platform, browser/device, sample rate, and relevant hardware for audio bugs.

## Documentation

Write for the next human who must make a decision. Keep documentation concise, current, and non-duplicative. Link to the owning source rather than copying its status into several files.

Marketing claims must follow the guardrails in [`docs/marketing/messaging.md`](docs/marketing/messaging.md#claim-guardrails). The marketing source of truth lives in [`docs/marketing/`](docs/marketing/README.md).

## Review expectations

Maintainers may ask to reduce scope, add proof, revisit a design gate, or separate follow-up work. T2+ changes are merged by a human only after the verified PR head passes the required gate.
