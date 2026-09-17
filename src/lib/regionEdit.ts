import type { TrackRegion } from "./types";

/** Compatibility alias: source-window fields now belong to TrackRegion itself. */
export type EditableRegion = TrackRegion;

export interface RegionSourceWindow {
  offset: number;
  length: number;
}

function finiteNonNegative(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Resolve the source segment selected by a TrackRegion. Legacy regions remain
 * valid: missing offset reads from source 0 and missing length reads duration.
 * When decoded source duration is known, the selection is clamped to it.
 */
export function resolveRegionSourceWindow(
  region: Pick<TrackRegion, "duration" | "offset" | "length">,
  sourceDuration?: number,
): RegionSourceWindow {
  const fallbackLength = finiteNonNegative(region.duration);
  const rawOffset = finiteNonNegative(region.offset);
  const rawLength = finiteNonNegative(region.length, fallbackLength);

  if (typeof sourceDuration !== "number" || !Number.isFinite(sourceDuration)) {
    return { offset: rawOffset, length: rawLength };
  }

  const maxSource = Math.max(0, sourceDuration);
  const offset = Math.min(rawOffset, maxSource);
  const length = Math.min(rawLength, Math.max(0, maxSource - offset));
  return { offset, length };
}

export function trimRegion(
  region: EditableRegion,
  edge: "start" | "end",
  deltaSec: number,
  sourceDuration: number,
): EditableRegion {
  const { offset, length } = resolveRegionSourceWindow(region, sourceDuration);
  const maxSource = finiteNonNegative(sourceDuration);
  const safeStart = finiteNonNegative(region.start);
  const safeDuration = finiteNonNegative(region.duration);

  if (edge === "start") {
    const maxDelta = Math.min(length, safeDuration);
    const minDelta = -Math.min(offset, safeStart);
    const d = clamp(Number.isFinite(deltaSec) ? deltaSec : 0, minDelta, maxDelta);
    const newStart = Math.max(0, safeStart + d);
    const newOffset = clamp(offset + d, 0, maxSource);
    const newLength = Math.max(0, length - d);
    return {
      ...region,
      start: newStart,
      duration: newLength,
      offset: newOffset,
      length: newLength,
    };
  }

  const maxDelta = Math.max(0, maxSource - offset) - length;
  const minDelta = -Math.min(length, safeDuration);
  const d = clamp(Number.isFinite(deltaSec) ? deltaSec : 0, minDelta, maxDelta);
  const newLength = Math.max(0, length + d);
  return {
    ...region,
    duration: newLength,
    offset,
    length: newLength,
  };
}

export function splitRegion(
  region: EditableRegion,
  atSec: number,
): [EditableRegion, EditableRegion] {
  const { offset, length } = resolveRegionSourceWindow(region);
  const start = finiteNonNegative(region.start);
  const duration = finiteNonNegative(region.duration);
  const end = start + duration;
  const at = clamp(Number.isFinite(atSec) ? atSec : start, start, end);
  const leftDur = at - start;
  const rightDur = end - at;

  const left: EditableRegion = {
    ...region,
    start,
    duration: leftDur,
    offset,
    length: Math.min(length, leftDur),
  };
  const rightSourceLength = Math.max(0, length - leftDur);
  const right: EditableRegion = {
    ...region,
    id: `${region.id}-b`,
    start: at,
    duration: rightDur,
    offset: offset + Math.min(leftDur, length),
    length: Math.min(rightSourceLength, rightDur),
  };
  return [left, right];
}

export function moveRegion(
  region: EditableRegion,
  deltaSec: number,
): EditableRegion {
  return {
    ...region,
    start: Math.max(0, finiteNonNegative(region.start) + (Number.isFinite(deltaSec) ? deltaSec : 0)),
  };
}

export function crossfadeGain(a: number, b: number): [number, number] {
  const total = a + b;
  const t = total > 0 ? a / total : 0.5;
  const angle = t * (Math.PI / 2);
  return [Math.cos(angle), Math.sin(angle)];
}
