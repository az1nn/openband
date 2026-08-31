import type { LockRole } from "./lockPolicy";

const SECRET_KEY_RE = /(approval)?token|secret|password|api[_-]?key|access[_-]?token|refresh[_-]?token|uri|path|blob|audio[_-]?uri|filename/i;

export type CreativeTelemetryEvent =
  | { type: "session_opened"; genreId: string; ts: number }
  | { type: "recipe_configured"; genreId: string; ts: number }
  | { type: "locks_changed"; lockedRoles: LockRole[]; ts: number }
  | { type: "variation_generated"; variationId: string; musicalHash: string; ts: number }
  | { type: "variation_selected"; variationId: string; ts: number }
  | { type: "preview_started"; cacheKey: string; ts: number }
  | { type: "preview_ended"; cacheKey: string; reason: "natural" | "stopped"; ts: number }
  | { type: "preview_rejected"; reason: "busy"; ts: number }
  | { type: "promotion_succeeded"; projectId: string; ts: number }
  | { type: "promotion_failed"; reason: string; ts: number };

export function redactSecrets<T>(value: T): T {
  const clone = cloneValue(value);
  return scrub(clone) as T;
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value)) as T;
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function scrub(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => scrub(item));
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      if (SECRET_KEY_RE.test(key)) continue;
      out[key] = scrub(val);
    }
    return out;
  }
  return node;
}

export interface TelemetryReporter {
  track(event: CreativeTelemetryEvent): void;
}

const KNOWN_TYPES = new Set([
  "session_opened",
  "recipe_configured",
  "locks_changed",
  "variation_generated",
  "variation_selected",
  "preview_started",
  "preview_ended",
  "preview_rejected",
  "promotion_succeeded",
  "promotion_failed",
]);

export function createTelemetry(
  reporter?: (event: CreativeTelemetryEvent) => void,
): {
  track(event: CreativeTelemetryEvent): void;
  redact: typeof redactSecrets;
} {
  return {
    track(event: CreativeTelemetryEvent) {
      if (!event || typeof event !== "object") return;
      if (!KNOWN_TYPES.has((event as { type: string }).type)) return;
      const safe = redactSecrets(event);
      if (reporter) reporter(safe);
    },
    redact: redactSecrets,
  };
}
