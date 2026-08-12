# Design — Docs Accuracy Fix

## Corrections

### 1. README.md Framework row (line 11)
```
OLD: [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) + [Expo Router](https://expo.github.io/router/)
NEW: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) + [Expo Router](https://expo.github.io/router/)
```

### 2. README.md Audio row (line 16)
```
OLD: [`expo-audio`](https://docs.expo.dev/versions/v56.0.0/sdk/audio/) (SDK 56) + HTML5 Audio (web)
NEW: [`expo-audio`](https://docs.expo.dev/versions/v57.0.0/sdk/audio/) (SDK 57) + HTML5 Audio (web)
```

### 3. README.md Backend row (line 20)
```
OLD: FastAPI + Redis + Celery (Docker microservices, optional)
NEW: [Express](https://expressjs.com/) (port 3001, Demucs stem separation + mastering + auth) | optional Docker microservices in `openband-backend/` (FastAPI + Redis + Celery)
```

### 4. README.md Testing row (line 21)
```
OLD: [Vitest](https://vitest.dev/) (505 tests with interactive dashboard) + [Playwright](https://playwright.dev/) (E2E) + legacy `node:test` (24 tests)
NEW: [Vitest](https://vitest.dev/) (1479 tests with interactive dashboard) + [Playwright](https://playwright.dev/) (E2E) + legacy `node:test` (24 tests)
```

### 5. AGENTS.md Audio System (line 202)
```
OLD: Uses `expo-audio` (SDK 56), NOT `expo-av`
NEW: Uses `expo-audio` (SDK 57), NOT `expo-av`
```

### 6. AGENTS.md Full suite totals (line 400)
```
OLD: Full suite totals: 1456 vitest tests + 24 legacy node:test tests across 80 test files (78 at tests/ root + 2 in tests/plugins/)
NEW: Full suite totals: 1479 vitest tests + 24 legacy node:test tests across 80 test files (78 at tests/ root + 2 in tests/plugins/)
```
