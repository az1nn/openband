import { saveProject, type ProjectData } from "./projectStore";
import { redactSecrets } from "./telemetry";
import type { CreativeVariation } from "./creativeSession";

export type PersistenceScope = "creative-session" | "project";

export const CREATIVE_SESSION_SCOPE: PersistenceScope = "creative-session";

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
