export type AutomationCurve = "linear" | "exponential";

export interface ScheduledAutomationPoint {
  time: number;
  value: number;
  curve: AutomationCurve;
}

export function applyAutomationToParam(
  param: AudioParam,
  points: ScheduledAutomationPoint[],
  startTime: number,
  offsetTime: number = 0,
): void {
  if (points.length === 0) return;

  param.cancelScheduledValues(startTime);

  if (points.length === 1) {
    param.setValueAtTime(points[0].value, startTime + points[0].time + offsetTime);
    return;
  }

  const sorted = [...points].sort((a, b) => a.time - b.time);

  param.setValueAtTime(sorted[0].value, startTime + sorted[0].time + offsetTime);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const targetTime = startTime + curr.time + offsetTime;

    if (
      curr.curve === "exponential" &&
      prev.value > 0 &&
      curr.value > 0
    ) {
      param.exponentialRampToValueAtTime(curr.value, targetTime);
    } else {
      param.linearRampToValueAtTime(curr.value, targetTime);
    }
  }
}

export function buildAutomationSchedule(
  points: ScheduledAutomationPoint[],
  bpm: number,
): ScheduledAutomationPoint[] {
  if (points.length === 0) return [];
  const beatDuration = 60 / Math.max(1, bpm);
  return points.map((p) => ({
    ...p,
    time: p.time * beatDuration,
  }));
}

export function interpolateAutomationValue(
  points: ScheduledAutomationPoint[],
  time: number,
): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].value;

  const sorted = [...points].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time)
    return sorted[sorted.length - 1].value;

  let lo = 0;
  let hi = sorted.length - 1;
  while (hi - lo > 1) {
    const m = Math.floor((lo + hi) / 2);
    if (sorted[m].time <= time) lo = m;
    else hi = m;
  }

  const p0 = sorted[lo];
  const p1 = sorted[hi];
  const range = p1.time - p0.time;
  const frac = range === 0 ? 0 : (time - p0.time) / range;

  if (p1.curve === "exponential" && p0.value > 0 && p1.value > 0) {
    const ratio = p1.value / p0.value;
    return p0.value * Math.pow(ratio, frac);
  }

  return p0.value + (p1.value - p0.value) * frac;
}


function clampAutomationValue(value: number, minValue: number, maxValue: number): number {
  const low = Math.min(minValue, maxValue);
  const high = Math.max(minValue, maxValue);
  return Math.min(high, Math.max(low, value));
}

export function interpolatePanAutomationSegment(
  startValue: number,
  endValue: number,
  fraction: number,
  curve: AutomationCurve,
  minValue: number = -100,
  maxValue: number = 100,
): number {
  const f = Math.min(1, Math.max(0, fraction));
  const eased =
    curve === "exponential"
      ? Math.expm1(f) / Math.expm1(1)
      : f;
  return clampAutomationValue(
    startValue + (endValue - startValue) * eased,
    minValue,
    maxValue,
  );
}

export function interpolatePanAutomationValue(
  points: ScheduledAutomationPoint[],
  time: number,
  minValue: number = -100,
  maxValue: number = 100,
): number {
  if (points.length === 0) {
    return clampAutomationValue(0, minValue, maxValue);
  }

  const sorted = [...points].sort((a, b) => a.time - b.time);
  if (points.length === 1 || time <= sorted[0].time) {
    return clampAutomationValue(sorted[0].value, minValue, maxValue);
  }

  const last = sorted[sorted.length - 1];
  if (time >= last.time) {
    return clampAutomationValue(last.value, minValue, maxValue);
  }

  let lo = 0;
  let hi = sorted.length - 1;
  while (hi - lo > 1) {
    const middle = Math.floor((lo + hi) / 2);
    if (sorted[middle].time <= time) lo = middle;
    else hi = middle;
  }

  const start = sorted[lo];
  const end = sorted[hi];
  const duration = end.time - start.time;
  const fraction = duration <= 0 ? 1 : (time - start.time) / duration;
  return interpolatePanAutomationSegment(
    start.value,
    end.value,
    fraction,
    end.curve,
    minValue,
    maxValue,
  );
}

const PAN_AUTOMATION_MIN_SEGMENT_STEPS = 16;
const PAN_AUTOMATION_MAX_STEP_SECONDS = 0.05;

export function applyPanAutomationToParam(
  param: AudioParam,
  points: ScheduledAutomationPoint[],
  startTime: number,
  offsetTime: number = 0,
): void {
  if (points.length === 0) return;

  param.cancelScheduledValues(startTime);

  const sorted = [...points]
    .map((point) => ({
      ...point,
      value: clampAutomationValue(point.value, -1, 1),
    }))
    .sort((a, b) => a.time - b.time);

  const first = sorted[0];
  param.setValueAtTime(
    first.value,
    startTime + first.time + offsetTime,
  );

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    const segmentDuration = current.time - previous.time;
    const targetTime = startTime + current.time + offsetTime;

    if (segmentDuration <= 0) {
      param.setValueAtTime(current.value, targetTime);
      continue;
    }

    if (current.curve === "linear") {
      param.linearRampToValueAtTime(current.value, targetTime);
      continue;
    }

    const steps = Math.max(
      PAN_AUTOMATION_MIN_SEGMENT_STEPS,
      Math.ceil(segmentDuration / PAN_AUTOMATION_MAX_STEP_SECONDS),
    );

    for (let step = 1; step <= steps; step++) {
      const fraction = step / steps;
      const segmentTime =
        previous.time + segmentDuration * fraction;
      const value = interpolatePanAutomationSegment(
        previous.value,
        current.value,
        fraction,
        current.curve,
        -1,
        1,
      );
      param.linearRampToValueAtTime(
        value,
        startTime + segmentTime + offsetTime,
      );
    }
  }
}
