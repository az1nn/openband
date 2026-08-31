import type { ProjectStarterResult } from "./projectStarter";
import {
  type PreviewRenderSettings,
  previewCacheKey,
} from "./creativeIdentity";

export const PREVIEW_ALGORITHM_VERSION = "v1";

function clampInt(value: number, min: number, max: number): number {
  const floor = Math.floor(value);
  return Math.max(min, Math.min(max, floor));
}

export function previewBudgetBars(result: ProjectStarterResult): number {
  return clampInt(result.numBars, 1, 4);
}

export function zeroBasedBarWindow(
  totalBars: number,
  budgetBars: number,
): { startBar: number; endBarExclusive: number } {
  const end =
    totalBars <= 0
      ? 0
      : Math.min(budgetBars, totalBars);
  return { startBar: 0, endBarExclusive: end };
}

export function isWithinPreview(barIndex: number, budgetBars: number): boolean {
  return barIndex >= 0 && barIndex < budgetBars;
}

export function previewSettingsFor(
  result: ProjectStarterResult,
): PreviewRenderSettings {
  return {
    previewAlgorithmVersion: PREVIEW_ALGORITHM_VERSION,
    previewBudgetBars: previewBudgetBars(result),
    renderSettings: { quality: "standard" },
  };
}

export function previewCacheKeyFor(
  musicalHash: string,
  result: ProjectStarterResult,
  extra?: Partial<PreviewRenderSettings>,
): string {
  const base = previewSettingsFor(result);
  const merged: PreviewRenderSettings = { ...base, ...extra };
  return previewCacheKey(musicalHash, merged);
}

export function invalidatedBySource(
  current: { hash: string; settings: PreviewRenderSettings } | null,
  candidate: { hash: string; settings: PreviewRenderSettings },
): boolean {
  if (current === null) return true;
  if (current.hash !== candidate.hash) return true;
  return (
    JSON.stringify(current.settings) !== JSON.stringify(candidate.settings)
  );
}
