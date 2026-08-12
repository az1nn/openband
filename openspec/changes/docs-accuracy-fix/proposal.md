# Docs Accuracy Fix — Reconcile README + AGENTS vs Actual Stack

## Context

README.md and AGENTS.md reference outdated stack versions and test counts that no longer match the actual repo state. The root `package.json` is the source of truth: `expo: ^57.0.4`, `expo-router: ~57.0.4`.

## Verified Mismatches

| # | File | Line | Current (wrong) | Actual |
|---|------|------|-----------------|--------|
| 1 | README.md | 11 | `[Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) + Expo Router` | Expo ^57.0.4 |
| 2 | README.md | 16 | `[expo-audio](v56.0.0/sdk/audio/) (SDK 56)` | SDK 57 |
| 3 | README.md | 21 | `Vitest (505 tests ...)` | 1479 Vitest |
| 4 | README.md | 20 | `Backend \| FastAPI + Redis + Celery (Docker microservices, optional)` | Express server (backend/src/index.ts, port 3001) + Demucs; optional Docker in openband-backend/ |
| 5 | AGENTS.md | 202 | `expo-audio (SDK 56)` | SDK 57 |
| 6 | AGENTS.md | 400 | `1456 vitest tests` | 1479 vitest tests |

## Real Test Count (captured this run)

- `npx vitest run` → **1479 tests | 1479 passed**
- `npm run test:legacy` → **24 tests | 24 passed**
- Total: **1479 Vitest + 24 legacy node:test**

## Objective

Fix only markdown documentation — no code changes. Leave implementation (doc edits) uncommitted after applying.
