import { TrackDef } from "./types";
import {
  Mood,
  generateTracksForGenre,
  GENRES,
} from "./projectTemplates";

export const MAX_PREVIEW_BARS = 4;
export const DEFAULT_PREVIEW_VOLUME = 0.7;

export interface PreviewConfig {
  genreId: string;
  mood?: Mood;
  bpm: number;
  key: string;
  timeSignature: string;
  numBars: number;
  name?: string; // intentionally excluded from fingerprint
}

/**
 * Normalizes TrackDef.volume or BusDef.volume to [0..1] gain.
 * If vol > 1 (e.g. 80 in presets), divides by 100.
 * Clamps result between 0 and 1.
 */
export function normalizeVolumeGain(vol?: number): number {
  if (vol === undefined || vol === null || isNaN(vol)) {
    return 1.0;
  }
  if (vol < 0) return 0;
  if (vol > 1) {
    return Math.min(1.0, vol / 100);
  }
  return Math.min(1.0, Math.max(0, vol));
}

/**
 * Calculates effective bars for preview (clamped between 1 and MAX_PREVIEW_BARS).
 */
export function calculateEffectivePreviewBars(numBars: number): number {
  const safe = typeof numBars === "number" && !isNaN(numBars) ? numBars : 4;
  return Math.max(1, Math.min(safe, MAX_PREVIEW_BARS));
}

/**
 * Produces a stable string fingerprint for preview audio generation.
 * Note: `name` is omitted because editing project name does not alter music audio.
 */
export function computePreviewFingerprint(config: PreviewConfig): string {
  const effectiveBars = calculateEffectivePreviewBars(config.numBars);
  return `${config.genreId}|${config.mood ?? ""}|${config.bpm}|${config.key}|${config.timeSignature}|${effectiveBars}`;
}

/**
 * Generates audio tracks sized specifically for the short preview session.
 */
export function generatePreviewTracks(config: PreviewConfig): TrackDef[] {
  const effectiveBars = calculateEffectivePreviewBars(config.numBars);
  const genre = GENRES.find((g) => g.id === config.genreId) ?? GENRES[0];

  const tracks = generateTracksForGenre(
    genre.id,
    config.bpm,
    config.key,
    config.mood,
    effectiveBars,
    config.timeSignature,
  );

  return tracks;
}
