# Internationalization (i18n)

## Overview
OpenBand is localized through `react-i18next`. The canonical default locale is **pt-BR** (primary market Brazil), with English as the fallback language and Spanish as a third supported language. Dictionaries live in `src/locales/{en,pt,es}.json`; the i18next wiring, device-locale detection, and the `useT` convenience hook live in `src/lib/i18n.ts`. A language toggle in `app/tabs/settings.tsx` switches the active language across all migrated screens.

## Implementation Notes
`src/lib/i18n.ts` imports the three JSON dictionaries and builds `resources` keyed as `en`, `pt-BR`, `pt` (alias for `pt.json`), and `es` (`:9-14`). Initialization reads a persisted `localStorage["openband_language"]` choice, normalizes the device `languageCode` (`pt` → `pt-BR`, `:29-31`), defaults to `'pt-BR'` when nothing matches, and sets `fallbackLng: 'en'` (`:33-40`). `useT` is exported as `export const useT = () => useTranslation().t` (`:49`). `changeLanguage` persists the new language to `localStorage` (`:51-60`). The module is imported for side-effect initialization in `app/_layout.tsx`; no React provider is required.

Migrated screens call `const t = useT()` (or `useTranslation().t`) and use `t("namespace.key", "English fallback")` so a missing key still renders readable English instead of the key string. Translation keys are namespaced per screen (`settings`, `feed`, `library`, `account`, `newProject`, `moments`, `extractor`).

## Requirements

### Requirement: pt-BR Default Locale with English Fallback
The application MUST initialize in `pt-BR` by default. The resources table MUST key both `pt-BR` and `pt` to the same `pt.json` dictionary so the legacy language toggle keeps working. Any missing key in the active locale MUST fall back to the English (`en`) dictionary.

#### Scenario: First launch on unsupported device locale
- **Given** no saved language and a device `languageCode` not in `{pt, en, es}`
- **When** i18n initializes
- **Then** `i18n.language` is `"pt-BR"`

#### Scenario: Brazilian device locale normalization
- **Given** a device `languageCode` of `"pt"`
- **When** the init resolver runs
- **Then** the language is normalized to `"pt-BR"` and resolves against the `pt-BR` resource entry

### Requirement: Language Toggle
The settings screen (`app/tabs/settings.tsx`) MUST render a language selector for `en` / `pt` / `es`. Selecting a language MUST call `changeLanguage`, persist the choice to `localStorage["openband_language"]`, and visually highlight the active language.

#### Scenario: Switch to English
- **Given** `i18n.language` is `"pt-BR"`
- **When** the user presses the "English" chip in Settings
- **Then** `changeLanguage("en")` is called
- **And** subsequent screens render English strings with no hardcoded leakage

### Requirement: Namespaced Dictionaries (pt-BR / en / es Parity)
The three files `src/locales/en.json`, `pt.json`, and `es.json` MUST contain identical key sets for every shipped namespace. Shipped namespaces and their source screens:

| Namespace | Extracted from | Shipped state |
|---|---|---|
| `settings` | `app/tabs/settings.tsx` (mock profile, appearance, info, plan) | SHIPPED |
| `feed` | `app/tabs/index.tsx` (share/copy toasts, genre labels, error alerts, loading) | SHIPPED |
| `library` | `app/tabs/library.tsx` | SHIPPED |
| `account` | `app/tabs/account.tsx` (profile edit, sign-out confirm, plan) | SHIPPED |
| `newProject` | `src/components/NewProject.tsx` | SHIPPED |
| `moments` | `app/tabs/moments.tsx` (tabs, credits, free packs) | SHIPPED |
| `extractor` | `app/extractor.tsx` (status texts, alerts, stem labels, result actions) | SHIPPED |
| `studio` | `app/studio/[id].tsx` | **NOT IMPLEMENTED** |
| `mastering` | `app/mastering/index.tsx` | **NOT IMPLEMENTED** |
| `explorer` | `app/tabs/explorer.tsx` | **NOT IMPLEMENTED** |
| `mixer` | `app/mixing-console.tsx` | **NOT IMPLEMENTED** |

Interpolation uses i18next `{{var}}` syntax (e.g. `extractor.doneSummary` with `count`/`source`). Code/identifier strings (command ids, MIDI tokens, canvas glyphs, transport unicode) stay out of the dictionaries — they are not user-visible.

#### Scenario: Deep key parity across locales
- **Given** `en.json`, `pt.json`, `es.json`
- **When** the nested key sets are compared
- **Then** they are identical across all three files

### Requirement: Migrated Screens (Shipped)
`app/tabs/settings.tsx`, `app/tabs/index.tsx`, `app/tabs/library.tsx`, `app/tabs/account.tsx`, `app/tabs/moments.tsx`, `app/extractor.tsx`, and `src/components/NewProject.tsx` MUST render all user-visible strings through `t(...)` with an English fallback. No hardcoded user-visible pt-BR or English literals remain in these files.

#### Scenario: Toggle language across migrated screens
- **Given** the migrated batch renders in `pt-BR`
- **When** the user switches to `es` in Settings
- **Then** all migrated screens re-render Spanish strings with no untranslated literals

### Requirement: Studio Namespace — NOT IMPLEMENTED
The `studio` namespace MUST exist in all three dictionaries and cover every user-visible string in `app/studio/[id].tsx`: permission alerts, record/generate/MIDI-import errors, command-palette labels (Play, Record, Undo, Redo, Delete, Add Track), the track menu, the "Salvo ✓" toast, and compare/mix labels. The screen currently hardcodes Portuguese strings (e.g. `Alert.alert("Capa", "Capa não salva: armazenamento cheio")` at `app/studio/[id].tsx:329`).

- **Status:** NOT IMPLEMENTED (deferred)

#### Scenario: Studio screen localized
- **Given** the deferred `studio` namespace exists
- **When** `app/studio/[id].tsx` renders its alerts and menus
- **Then** all strings resolve through `t("studio.*")` and reflect the active language

### Requirement: Mastering Namespace — NOT IMPLEMENTED
The `mastering` namespace MUST exist in all three dictionaries and cover every user-visible string in `app/mastering/index.tsx` (chain labels, export strings, LUFS labels).

- **Status:** NOT IMPLEMENTED (deferred)

### Requirement: Explorer Namespace + Screen Migration — NOT IMPLEMENTED
The `explorer` namespace MUST exist in all three dictionaries and `app/tabs/explorer.tsx` MUST be migrated to use `t("explorer.*")` with English fallbacks. The screen currently has no `useTranslation` usage.

- **Status:** NOT IMPLEMENTED (deferred)

### Requirement: Mixer Namespace — NOT IMPLEMENTED
The `mixer` namespace MUST exist in all three dictionaries and cover user-visible text labels in `app/mixing-console.tsx` (unicode transport glyphs stay as-is).

- **Status:** NOT IMPLEMENTED (deferred)

### Requirement: i18n Coverage Test — NOT IMPLEMENTED
A `tests/i18n-coverage.test.ts` file MUST exist and assert:
- Deep key parity across `en.json`, `pt.json`, `es.json`.
- Per-namespace key counts grow beyond the pre-change ~14-key baseline.
- No leftover user-visible hardcoded string literals in the migrated batch (`app/tabs/*`, `src/components/NewProject.tsx`, `app/extractor.tsx`) outside `t(...)` calls.

- **Status:** NOT IMPLEMENTED (deferred)

## Test Requirements (Vitest)
- [ ] Locale dictionaries (`en`/`pt`/`es`) share identical nested key sets
- [ ] `useT()` returns a working translation function bound to the active language
- [ ] Switching language via `changeLanguage` persists to `localStorage["openband_language"]`
- [ ] Migrated screens contain no user-visible hardcoded string literals outside `t(...)`
- [ ] Default language resolves to `pt-BR` with `pt` → `pt-BR` normalization and `en` fallback
