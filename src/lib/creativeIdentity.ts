import type { TrackDef } from "./types";

export type MusicalContentSource = {
  genreId: string;
  tracks: TrackDef[];
};

export type StableRole =
  | "rhythm"
  | "bass"
  | "harmony"
  | "melody"
  | "fx"
  | "unknown";

export type SourceRecipe = {
  genreId: string;
  mood?: string;
  bpm: number;
  key: string;
  timeSignature: string;
  numBars: number;
};

export type PreviewRenderSettings = {
  previewAlgorithmVersion: string;
  previewBudgetBars: number;
  renderSettings: { quality: string };
};

function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ (h << 5) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export function resolveStableRole(track: TrackDef): StableRole {
  const name = track.name.toLowerCase();
  if (
    /kick|bass\s*drum|bd|snare|sd|rim|hi[\s-]?hat|hh|open\s*hh|closed\s*hh|ride|crash/.test(
      name,
    )
  )
    return "rhythm";
  if (/bass|808|sub|low/.test(name)) return "bass";
  if (
    /vocal|vox|voice|singer|rap|lead|melody|synth\s*lead|arp/.test(name)
  )
    return "melody";
  if (
    /pad|atmos|ambient|string|choir|keys|piano|rhodes|organ|epiano|guitar|gtr|acoustic|electric|riff/.test(
      name,
    )
  )
    return "harmony";
  if (/fx|effect|riser|downlifter|sweep|noise/.test(name)) return "fx";
  if (track.midiNotes && track.midiNotes.length > 0) {
    const avg =
      track.midiNotes.reduce((sum, n) => sum + n.pitch, 0) /
      track.midiNotes.length;
    if (avg < 50) return "bass";
    if (avg > 75) return "melody";
    return "harmony";
  }
  return "unknown";
}

function canonicalTrackContent(track: TrackDef): string {
  const midi = (track.midiNotes ?? [])
    .slice()
    .sort((a, b) => a.start - b.start)
    .map((n) => `${n.pitch}:${n.start}:${n.duration}:${n.velocity}`)
    .join(",");
  const regions = track.regions
    .slice()
    .sort((a, b) => a.start - b.start)
    .map((r) => `${r.start}:${r.duration}`)
    .join(",");
  const plugins = track.plugins
    .map((p) => p.type)
    .sort()
    .join(",");
  return `${track.name}|${midi}|${regions}|${plugins}`;
}

export function musicalContentHash(result: MusicalContentSource): string {
  const buckets: Record<string, string[]> = {};
  for (const track of result.tracks) {
    const role = resolveStableRole(track);
    (buckets[role] = buckets[role] ?? []).push(canonicalTrackContent(track));
  }
  const parts: string[] = [];
  for (const role of Object.keys(buckets).sort()) {
    parts.push(`${role}:${buckets[role].sort().join("|")}`);
  }
  return hashString(
    JSON.stringify({ genreId: result.genreId, roles: parts.join(";") }),
  );
}

export function recipeFingerprint(recipe: SourceRecipe): string {
  return hashString(
    JSON.stringify({
      genreId: recipe.genreId,
      mood: recipe.mood ?? "",
      bpm: recipe.bpm,
      key: recipe.key,
      timeSignature: recipe.timeSignature,
      numBars: recipe.numBars,
    }),
  );
}

export function persistenceIntegrityHash(payload: {
  projectId: string;
  musicalContentHash: string;
  approvalToken: string;
  sourceRecipe: SourceRecipe;
}): string {
  return hashString(
    JSON.stringify({
      projectId: payload.projectId,
      musicalContentHash: payload.musicalContentHash,
      approvalToken: payload.approvalToken,
      sourceRecipe: {
        genreId: payload.sourceRecipe.genreId,
        mood: payload.sourceRecipe.mood ?? "",
        bpm: payload.sourceRecipe.bpm,
        key: payload.sourceRecipe.key,
        timeSignature: payload.sourceRecipe.timeSignature,
        numBars: payload.sourceRecipe.numBars,
      },
    }),
  );
}

export function previewCacheKey(
  musicalHash: string,
  settings: PreviewRenderSettings,
): string {
  return `${musicalHash}|${settings.previewAlgorithmVersion}|${settings.previewBudgetBars}|${settings.renderSettings.quality}`;
}
