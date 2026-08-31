import { saveProject, type ProjectData } from "./projectStore";
import { redactSecrets } from "./telemetry";
import { musicalContentHash } from "./creativeIdentity";
import type { CreativeVariation } from "./creativeSession";
import type { Recipe } from "./snapshotPromotion";
import type { ProjectStarterResult } from "./projectStarter";

export type PersistenceScope = "creative-session" | "project";

export const CREATIVE_SESSION_SCOPE: PersistenceScope = "creative-session";

function parseTimeSignature(timeSignature: string): [number, number] {
  const parts = timeSignature.split("/").map((n) => parseInt(n, 10));
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return [parts[0], parts[1]];
  }
  return [4, 4];
}

export function createEphemeralSessionStore<T = unknown>(): {
  get(id: string): T | undefined;
  set(id: string, v: T): void;
  remove(id: string): void;
  clear(): void;
  size(): number;
} {
  const map = new Map<string, T>();
  return {
    get(id: string): T | undefined {
      return map.get(id);
    },
    set(id: string, v: T): void {
      map.set(id, v);
    },
    remove(id: string): void {
      map.delete(id);
    },
    clear(): void {
      map.clear();
    },
    size(): number {
      return map.size;
    },
  };
}

export function persistProjectDurable(projectId: string, projectData: unknown): void {
  const data = projectData as Omit<ProjectData, "id" | "lastSaved">;
  saveProject(projectId, redactSecrets(data));
}

export function redactForDurable(
  variation: CreativeVariation,
): Omit<CreativeVariation, "preview"> {
  const { preview: _preview, ...rest } = variation;
  return rest;
}

export function recursiveSecretRedaction<T>(value: T): T {
  return redactSecrets(value);
}

export function scopeIsEphemeral(scope: PersistenceScope): boolean {
  return scope === CREATIVE_SESSION_SCOPE;
}

export function persistCreativeDecision(
  projectId: string,
  recipe: Recipe,
  _previewUri: string | null,
  result: ProjectStarterResult,
): void {
  const bpm = recipe.bpm || result.bpm || 120;
  const data: Omit<ProjectData, "id" | "lastSaved"> = {
    title: result.name || recipe.name || "",
    genre: recipe.genreId || result.genreId,
    key: recipe.key || result.key,
    bpm,
    mood: (recipe.mood || result.mood || undefined) as string | undefined,
    tracks: result.tracks,
    groups: [],
    buses: [],
    trackAssignments: {},
    masterPlugins: [],
    masteringChain: [],
    sendBuses: [],
    trackAmpChains: {},
    mixSnapshots: [],
    activeMixId: undefined,
    metronome: {
      bpm,
      timeSig: parseTimeSignature(result.timeSignature),
      accentInterval: 4,
      volume: 1,
      enabled: false,
      countIn: false,
      countInBars: 2,
    },
    recordSettings: {
      armed: false,
      inputSource: "mic" as const,
      quality: "high" as const,
      sampleRate: 44100 as const,
      mono: false,
      preRoll: 1,
    },
    musicalContentHash: musicalContentHash(result),
  };
  saveProject(projectId, redactSecrets(data));
}
