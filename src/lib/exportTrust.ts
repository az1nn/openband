import type { BusDef, Plugin, TrackDef } from "./types";
import type { Mood } from "./projectTemplates";
import {
  FullProjectRenderError,
  getProjectDurationSeconds,
  renderTracksToWavBlob,
} from "./midiSynth";

export type ExportTrustErrorCode =
  | "NO_RENDERABLE_CONTENT"
  | "TRACK_RENDER_FAILED"
  | "MASTER_RENDER_FAILED"
  | "PROJECT_RENDER_FAILED"
  | "INVALID_WAV";

export class ExportTrustError extends Error {
  constructor(
    public readonly code: ExportTrustErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ExportTrustError";
  }
}

export interface ExportProjectSnapshot {
  tracks: TrackDef[];
  bpm: number;
  mood?: Mood;
  buses: BusDef[];
  masterPlugins: Plugin[];
}

export interface ExportWavResult {
  blob: Blob;
  duration: number;
  sampleRate: 44100;
  bitDepth: 16;
}

function cloneSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createExportSnapshot(input: {
  tracks: TrackDef[];
  bpm: number;
  mood?: Mood;
  buses?: BusDef[];
  masterPlugins?: Plugin[];
}): ExportProjectSnapshot {
  return {
    tracks: cloneSerializable(input.tracks),
    bpm: input.bpm,
    mood: input.mood,
    buses: cloneSerializable(input.buses ?? []),
    masterPlugins: cloneSerializable(input.masterPlugins ?? []),
  };
}

export function selectRenderableTracks(tracks: TrackDef[]): TrackDef[] {
  const anySolo = tracks.some((track) => track.solo);
  return tracks.filter((track) => {
    if (track.muted) return false;
    if (anySolo && !track.solo) return false;
    return Boolean(
      track.midiNotes?.length ||
        track.regions?.some((region) => Boolean(region.url)),
    );
  });
}

function ascii(view: DataView, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(view.getUint8(offset + i));
  }
  return out;
}

export async function validateWavBlob(blob: Blob): Promise<void> {
  if (!(blob instanceof Blob) || blob.type !== "audio/wav" || blob.size <= 44) {
    throw new ExportTrustError(
      "INVALID_WAV",
      "Export did not produce a non-empty WAV file.",
    );
  }

  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  if (
    bytes.byteLength < 44 ||
    ascii(view, 0, 4) !== "RIFF" ||
    ascii(view, 8, 4) !== "WAVE"
  ) {
    throw new ExportTrustError(
      "INVALID_WAV",
      "Exported audio is not a valid RIFF/WAVE file.",
    );
  }

  let offset = 12;
  let dataSize = 0;
  while (offset + 8 <= view.byteLength) {
    const id = ascii(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    if (id === "data") {
      dataSize = Math.min(size, Math.max(0, view.byteLength - offset - 8));
      break;
    }
    offset += 8 + size + (size % 2);
  }

  if (dataSize <= 0) {
    throw new ExportTrustError(
      "INVALID_WAV",
      "Exported WAV has no audio data payload.",
    );
  }
}

function exportErrorFromRender(error: unknown): ExportTrustError {
  if (error instanceof FullProjectRenderError) {
    const code: ExportTrustErrorCode =
      error.stage === "master-effect"
        ? "MASTER_RENDER_FAILED"
        : error.stage === "source" || error.stage === "track-effect"
          ? "TRACK_RENDER_FAILED"
          : "PROJECT_RENDER_FAILED";
    return new ExportTrustError(code, error.message, { cause: error });
  }

  const message = error instanceof Error ? error.message : String(error);
  return new ExportTrustError(
    "PROJECT_RENDER_FAILED",
    `Could not render the project mix: ${message}`,
    { cause: error },
  );
}

export async function renderProjectWav(
  input: {
    tracks: TrackDef[];
    bpm: number;
    mood?: Mood;
    buses?: BusDef[];
    masterPlugins?: Plugin[];
  },
  onProgress?: (pct: number) => void,
): Promise<ExportWavResult> {
  const snapshot = createExportSnapshot(input);
  const duration = getProjectDurationSeconds(snapshot.tracks, snapshot.bpm);
  if (!(duration > 0)) {
    throw new ExportTrustError(
      "NO_RENDERABLE_CONTENT",
      "This project has no renderable audio or MIDI content to export.",
    );
  }

  if (selectRenderableTracks(snapshot.tracks).length === 0) {
    throw new ExportTrustError(
      "NO_RENDERABLE_CONTENT",
      "The current mute/solo state has no renderable project content.",
    );
  }

  onProgress?.(5);
  let blob: Blob | null;
  try {
    blob = await renderTracksToWavBlob(
      snapshot.tracks,
      snapshot.bpm,
      snapshot.mood,
      snapshot.buses,
      snapshot.masterPlugins,
      { strict: true, normalizeMixerUnits: true },
    );
  } catch (error) {
    throw exportErrorFromRender(error);
  }

  if (!blob) {
    throw new ExportTrustError(
      "PROJECT_RENDER_FAILED",
      "The project renderer did not produce an audio result.",
    );
  }

  onProgress?.(90);
  await validateWavBlob(blob);
  onProgress?.(100);
  return { blob, duration, sampleRate: 44100, bitDepth: 16 };
}
