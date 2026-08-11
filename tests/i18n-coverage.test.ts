import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import en from "../src/locales/en.json";
import pt from "../src/locales/pt.json";
import es from "../src/locales/es.json";

const flattenKeys = (obj: Record<string, any>, prefix = ""): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value, path);
    }
    return [path];
  });
};

const countNamespaceKeys = (obj: Record<string, any>, ns: string): number =>
  flattenKeys(obj[ns] ?? {}).length;

const MIGRATED_FILES = [
  "app/studio/[id].tsx",
  "app/studio/hooks.ts",
  "app/studio/parts.tsx",
  "app/studio/StudioModals.tsx",
  "app/mastering/index.tsx",
  "src/components/MasteringSuite.tsx",
  "src/components/MasteringChain.tsx",
  "src/components/MasteringVersionManager.tsx",
  "src/components/MasteringUpload.tsx",
  "src/components/LufsMeter.tsx",
  "app/mixing-console.tsx",
  "app/explorer.tsx",
];

const LEFTOVER_WORDS = [
  "Salvo",
  "Permissão",
  "Erro",
  "Cancelar",
  "Salvar",
  "Excluir",
  "Trocar",
  "versão",
  "Nenhuma versão",
  "Master exportado",
  "Cadeia de Masterização",
  "Faça upload",
  "Renderizar",
  "Codificando",
  "Título do projeto",
  "Avançar 5 segundos",
];

const read = (p: string) =>
  readFileSync(resolve(process.cwd(), p), "utf-8");

const stripTTranslationFallbacks = (src: string): string =>
  src.replace(/t\(\s*"[^"]*"\s*,\s*"[^"]*"/g, "t(");

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wordBoundaryRe = (word: string): RegExp =>
  new RegExp(`\\b${escapeRegExp(word)}\\b`);

describe("i18n coverage: deep key parity", () => {
  it("en, pt and es have identical nested key sets", () => {
    const enKeys = flattenKeys(en).sort();
    expect(flattenKeys(pt).sort()).toEqual(enKeys);
    expect(flattenKeys(es).sort()).toEqual(enKeys);
  });
});

describe("i18n coverage: namespace depth", () => {
  it("core namespaces each have at least 10 keys in all locales", () => {
    for (const ns of ["studio", "mastering", "explorer", "mixer", "feed"]) {
      expect(countNamespaceKeys(en, ns), `en.${ns}`).toBeGreaterThanOrEqual(10);
      expect(countNamespaceKeys(pt, ns), `pt.${ns}`).toBeGreaterThanOrEqual(10);
      expect(countNamespaceKeys(es, ns), `es.${ns}`).toBeGreaterThanOrEqual(10);
    }
  });

  it("total flattened key count exceeds the stub baseline in all locales", () => {
    const total = flattenKeys(en).length;
    expect(flattenKeys(pt).length).toBe(total);
    expect(flattenKeys(es).length).toBe(total);
    expect(total).toBeGreaterThanOrEqual(250);
  });
});

describe("i18n coverage: migrated screens have no leftover PT literals", () => {
  it("migrated batch contains no hardcoded PT user strings outside t() calls", () => {
    for (const file of MIGRATED_FILES) {
      const stripped = stripTTranslationFallbacks(read(file));
      for (const word of LEFTOVER_WORDS) {
        expect(
          stripped,
          `${file} must not contain a leftover "${word}" literal`,
        ).not.toMatch(wordBoundaryRe(word));
      }
    }
  });

  it("explorer embeds the translated title instead of a hardcoded MISSÃO", () => {
    const src = read("app/explorer.tsx");
    expect(src).not.toContain("MISSÃO");
    expect(src).toContain('MISSION_HTML(t("explorer.title", "MISSION"))');
  });
});

describe("i18n coverage: new keys present", () => {
  it("new studio and mastering keys exist in all three locales", () => {
    const known = [
      "studio.toolBranches",
      "studio.toolCommit",
      "studio.toolSampler",
      "studio.toolSynth",
      "studio.toolPatchbay",
      "studio.toolMidi",
      "studio.toolLooper",
      "studio.toolCodeSampler",
      "studio.toolPromptSampler",
      "studio.toolSamples",
      "studio.a11yProjectTitle",
      "studio.a11yEditProjectTitle",
      "studio.a11ySeekBack",
      "studio.a11ySeekForward",
      "studio.a11yGenerateCover",
      "studio.a11yPause",
      "studio.a11yPlay",
      "studio.a11yStopRecording",
      "studio.a11yRecord",
      "studio.a11yStop",
      "studio.a11yUndo",
      "studio.a11yRedo",
      "studio.a11yOpenCommands",
      "studio.a11yMoreTools",
      "studio.a11yZoomOut",
      "studio.a11yZoomIn",
      "studio.a11yResetZoom",
      "mastering.errorTitle",
      "mastering.mp3Cbr",
      "mastering.on",
      "mastering.off",
      "mastering.bypass",
      "mastering.ab",
      "mastering.inputLabel",
      "mastering.singleFile",
      "mastering.stemsLabel",
      "mastering.multiTrackHint",
      "mastering.uploadMix",
      "mastering.uploadStems",
      "mastering.uploadRangeHint",
      "mastering.uploadStemsHint",
      "mastering.metricIntegrated",
      "mastering.metricShortTerm",
      "mastering.metricTruePeak",
      "mastering.metricLra",
      "mastering.unitLufs",
      "mastering.unitDbtp",
      "mastering.unitLu",
    ];
    for (const key of known) {
      expect(en, `en.${key}`).toHaveProperty(key);
      expect(pt, `pt.${key}`).toHaveProperty(key);
      expect(es, `es.${key}`).toHaveProperty(key);
    }
  });

  it("English values for the newly added keys are correct", () => {
    expect(en.studio.toolBranches).toBe("⎇  Branches");
    expect(en.studio.a11yProjectTitle).toBe("Project title");
    expect(en.studio.a11yResetZoom).toBe("Reset zoom");
    expect(en.mastering.errorTitle).toBe("Error");
    expect(en.mastering.uploadMix).toBe("Upload .wav Mix");
    expect(en.mastering.mp3Cbr).toBe("MP3 320 kbps CBR");
    expect(en.mastering.unitDbtp).toBe("dBTP");
    expect(en.mastering.unitLu).toBe("LU");
  });

  it("new keys resolve to non-empty strings in every locale", () => {
    for (const locale of [en, pt, es]) {
      for (const ns of ["studio", "mastering"]) {
        for (const leaf of flattenKeys(
          (locale as Record<string, any>)[ns],
        )) {
          const parts = leaf.split(".");
          let value: any = (locale as Record<string, any>)[ns];
          for (const p of parts) value = value[p];
          expect(typeof value, `${ns}.${leaf}`).toBe("string");
          expect(value.length, `${ns}.${leaf}`).toBeGreaterThan(0);
        }
      }
    }
  });
});
