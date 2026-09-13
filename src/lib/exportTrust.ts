import type { BusDef, Plugin, TrackDef } from "./types";
import type { Mood } from "./projectTemplates";
import { MOODS } from "./projectTemplates";
import { audioBufferToWavBlob } from "./audio";
import { applyPluginChain } from "./pluginChain";
import {
  getProjectDurationSeconds,
  renderTrackStem,
} from "./midiSynth";

export type ExportTrustErrorCode =
  | "NO_RENDERABLE_CONTENT"
  | "AUDIO_CONTEXT_UNAVAILABLE"
  | "TRACK_RENDER_FAILED"
  | "MASTER_RENDER_FAILED"
  | "INVALID_WAV";

export class ExportTrustError extends Error {
  constructor(
    public readonly code: ExportTrustErrorCode,
    message: string,
  ) {
    super(message);
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

export interface RenderedExportStem {
  track: TrackDef;
  buffer: AudioBuffer;
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

function busGainForTrack(track: TrackDef, buses: Map<string, BusDef>): number {
  const outputId = track.outputId || "master";
  if (outputId === "master") return 1;
  const bus = buses.get(outputId);
  if (!bus) return 1;
  return bus.muted ? 0 : Math.max(0, bus.volume);
}

function normalizeSendAmount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const normalized = value > 1 ? value / 100 : value;
  return Math.max(0, Math.min(1, normalized));
}

export function routeGainForTrack(track: TrackDef, buses: BusDef[]): number {
  const busMap = new Map(buses.map((bus) => [bus.id, bus]));
  let gain = busGainForTrack(track, busMap);
  for (const [busId, amount] of Object.entries(track.sends ?? {})) {
    const bus = busMap.get(busId);
    if (!bus || bus.muted) continue;
    gain += normalizeSendAmount(amount) * Math.max(0, bus.volume);
  }
  return gain;
}

function makeStereoBuffer(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
): AudioBuffer {
  if (typeof OfflineAudioContext === "undefined") {
    throw new ExportTrustError(
      "AUDIO_CONTEXT_UNAVAILABLE",
      "Offline audio rendering is unavailable in this browser.",
    );
  }
  const factory = new OfflineAudioContext(2, 1, sampleRate);
  const buffer = factory.createBuffer(2, left.length, sampleRate);
  buffer.getChannelData(0).set(left);
  buffer.getChannelData(1).set(right);
  const closable = factory as { close?: () => Promise<void> };
  if (typeof closable.close === "function") {
    void closable.close().catch(() => undefined);
  }
  return buffer;
}

export function mixRenderedStems(
  stems: RenderedExportStem[],
  buses: BusDef[],
  length: number,
  sampleRate: number,
): AudioBuffer {
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  for (const { track, buffer } of stems) {
    const routeGain = routeGainForTrack(track, buses);
    if (routeGain === 0) continue;
    const sourceLeft = buffer.getChannelData(0);
    const sourceRight =
      buffer.numberOfChannels > 1
        ? buffer.getChannelData(1)
        : sourceLeft;
    const samples = Math.min(length, buffer.length, sourceLeft.length, sourceRight.length);
    for (let i = 0; i < samples; i++) {
      left[i] += sourceLeft[i] * routeGain;
      right[i] += sourceRight[i] * routeGain;
    }
  }

  return makeStereoBuffer(left, right, sampleRate);
}

async function applyMood(
  buffer: AudioBuffer,
  mood: Mood | undefined,
  sampleRate: number,
): Promise<AudioBuffer> {
  const preset = mood ? MOODS.find((item) => item.id === mood) : undefined;
  if (!preset) return buffer;
  if (typeof OfflineAudioContext === "undefined") {
    throw new ExportTrustError(
      "AUDIO_CONTEXT_UNAVAILABLE",
      "Offline audio rendering is unavailable in this browser.",
    );
  }

  const ctx = new OfflineAudioContext(2, Math.max(1, buffer.length), sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  let output: AudioNode = source;

  if (preset.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = preset.filter.type;
    filter.frequency.value = preset.filter.freq;
    filter.Q.value = preset.filter.q;
    output.connect(filter);
    output = filter;
  }

  if (preset.reverb) {
    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - preset.reverb.mix * 0.7;
    const wetGain = ctx.createGain();
    wetGain.gain.value = preset.reverb.mix;
    const irDuration = Math.min(preset.reverb.decay, 10);
    const irLength = Math.max(1, Math.ceil(sampleRate * irDuration));
    const impulse = ctx.createBuffer(2, irLength, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        data[i] =
(Math.random() * 2 - 1) *
          Math.exp(-i / (sampleRate * 0.5));
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    output.connect(dryGain);
    dryGain.connect(ctx.destination);
    output.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(ctx.destination);
  } else {
    output.connect(ctx.destination);
  }

  source.start(0);
  const rendered = await ctx.startRendering();
  const closable = ctx as { close?: () => Promise<void> };
  if (typeof closable.close === "function") {
    void closable.close().catch(() => undefined);
  }
  return rendered;
}

function ascii(view: DataView, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(offset + i));
  return out;
}

export async function validateWavBlob(blob: Blob): Promise<void> {
  if (!(blob instanceof Blob) || blob.size <= 44) {
    throw new ExportTrustError("INVALID_WAV", "Export did not produce a non-empty WAV file.");
  }
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  if (bytes.byteLength < 44 || ascii(view, 0, 4) !== "RIFF" || ascii(view, 8, 4) !== "WAVE") {
    throw new ExportTrustError("INVALID_WAV", "Exported audio is not a valid RIFF/WAVE file.");
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
    throw new ExportTrustError("INVALID_WAV", "Exported WAV has no audio data payload.");
  }
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

  const renderable = selectRenderableTracks(snapshot.tracks);
  if (renderable.length === 0) {
    throw new ExportTrustError(
      "NO_RENDERABLE_CONTENT",
      "The current mute/solo state has no renderable project content.",
    );
  }

  const sampleRate = 44100 as const;
  const targetLength = Math.max(1, Math.ceil(duration * sampleRate));
  const stems: RenderedExportStem[] = [];
  onProgress?.(5);

  for (let index = 0; index < renderable.length; index++) {
    const track = renderable[index];
    let buffer: AudioBuffer | null;
    try {
      buffer = await renderTrackStem(
        track,
        snapshot.bpm,
        duration,
        snapshot.buses,
        { strict: true },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ExportTrustError(
        "TRACK_RENDER_FAILED",
        `Could not render track "${track.name}": ${message}`,
      );
    }
    if (!buffer) {
      throw new ExportTrustError(
        "TRACK_RENDER_FAILED",
        `Could not render track "${track.name}".`,
      );
    }
    stems.push({ track, buffer });
    onProgress?.(10 + Math.round(((index + 1) / renderable.length) * 60));
  }

  let mixed = mixRenderedStems(stems, snapshot.buses, targetLength, sampleRate);
  mixed = await applyMood(mixed, snapshot.mood, sampleRate);
  onProgress?.(80);

  if (snapshot.masterPlugins.length > 0) {
    try {
      mixed = await applyPluginChain(mixed, snapshot.masterPlugins, sampleRate, { duration });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ExportTrustError(
        "MASTER_RENDER_FAILED",
        `Could not render the master effect chain: ${message}`,
      );
    }
  }

  const blob = audioBufferToWavBlob(mixed, 16);
  onProgress?.(95);
  await validateWavBlob(blob);
  onProgress?.(100);
  return { blob, duration, sampleRate, bitDepth: 16 };
}
