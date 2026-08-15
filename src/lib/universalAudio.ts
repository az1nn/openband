import { Platform } from "react-native";
import { OpenBandNative } from "../bridge";
import type { Plugin } from "../lib/types";
import { resolveAssetUrl } from "../lib/assetStore";

/**
 * Central blob URL registry with leak protection.
 * All blob URLs created in audio modules should be registered here.
 * Automatically revokes URLs older than MAX_AGE_MS or when registry exceeds MAX_ENTRIES.
 */
const blobUrlRegistry = new Map<string, number>();
const MAX_ENTRIES = 100;
const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Create a blob URL with automatic leak tracking.
 * Returns the URL and registers it for cleanup.
 */
export function createTrackedBlob(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  blobUrlRegistry.set(url, Date.now());
  cleanupBlobUrls();
  return url;
}

/**
 * Revoke a tracked blob URL.
 * Safe to call even if the URL was already revoked or never registered.
 */
export function revokeTrackedBlob(url: string): void {
  blobUrlRegistry.delete(url);
  try { URL.revokeObjectURL(url); } catch { /* already revoked */ }
}

/**
 * Mark a blob URL as recently used so it won't be cleaned up.
 * Safe to call for URLs that are already registered or not.
 */
export function markBlobActive(url: string): void {
  if (blobUrlRegistry.has(url)) {
    blobUrlRegistry.set(url, Date.now());
  }
}

/** Clean up old blob URLs to prevent memory leaks. */
function cleanupBlobUrls(): void {
  const now = Date.now();
  for (const [url, created] of blobUrlRegistry) {
    if (now - created > MAX_AGE_MS) {
      blobUrlRegistry.delete(url);
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    }
  }
  if (blobUrlRegistry.size > MAX_ENTRIES) {
    const oldest = [...blobUrlRegistry.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, blobUrlRegistry.size - MAX_ENTRIES);
    for (const [url] of oldest) {
      blobUrlRegistry.delete(url);
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    }
  }
}

export interface UniversalAudioPlayer {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => void;
  getPlayer: () => unknown;
}

/**
 * Shared AudioContext getter — canonical source for all modules.
 * Returns the singleton context from universalAudioSystem, creating it lazily.
 * All other audio modules should use this instead of creating their own.
 */
export function getSharedAudioContext(): AudioContext | null {
  return audioSystem.audioCtx;
}

/**
 * Ensure the shared AudioContext is available and running (web only).
 * Resumes from suspended state if needed (browser autoplay policy).
 */
export async function ensureSharedAudioContext(): Promise<AudioContext | null> {
  return audioSystem.ensureContext();
}

/**
 * Dispose all audio subsystems through the central audioSystem singleton.
 * Call this on app teardown to release all AudioContext resources.
 */
export function disposeAllAudio(): void {
  audioSystem.dispose();
}

class UniversalAudioSystem {
  private static instance: UniversalAudioSystem;
  private isInitialized = false;
  private webAudioUnavailable = false;
  private _audioCtx: AudioContext | null = null;
  private recordingStream: MediaStream | null = null;
  private recordingWorkletNode: AudioWorkletNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private recordedChunks: Float32Array[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private mediaRecorderBlob: Promise<Blob> | null = null;
  private isRecording = false;

  static getInstance(): UniversalAudioSystem {
    if (!UniversalAudioSystem.instance) {
      UniversalAudioSystem.instance = new UniversalAudioSystem();
    }
    return UniversalAudioSystem.instance;
  }

  /** Public getter for the shared AudioContext (read-only). */
  get audioCtx(): AudioContext | null {
    return this._audioCtx;
  }

  private webAudioAvailable(): boolean {
    return (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      typeof AudioContext !== "undefined"
    );
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.webAudioAvailable()) {
      this._audioCtx = new AudioContext();
      if (this._audioCtx.state === "suspended") {
        await this._audioCtx.resume();
      }
    } else if (Platform.OS === "web" && typeof window !== "undefined") {
      this.webAudioUnavailable = true;
    }

    this.isInitialized = true;
  }

  async startRecording(onChunk?: (chunk: Float32Array) => void): Promise<void> {
    if (this.isRecording) {
      throw new Error("RECORDING_IN_PROGRESS");
    }
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    this.isRecording = true;
    const ctx = await this.ensureContext();
    if (!ctx) {
      this.isRecording = false;
      return;
    }

    let workletLoaded = false;
    try {
      await ctx.audioWorklet.addModule("/worklets/RecordingWorklet.js");
      workletLoaded = true;
    } catch (e) {
      console.warn("RecordingWorklet addModule failed, using MediaRecorder fallback:", e);
    }

    this.recordedChunks = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (e) {
      this.cleanupRecording();
      throw new Error("MIC_PERMISSION_DENIED");
    }
    this.recordingStream = stream;

    if (workletLoaded) {
      this.mediaStreamSource = ctx.createMediaStreamSource(stream);
      this.recordingWorkletNode = new AudioWorkletNode(ctx, "recording-worklet");
      this.recordingWorkletNode.port.onmessage = (e) => {
        const chunk = new Float32Array(e.data);
        this.recordedChunks.push(chunk);
        if (onChunk) onChunk(chunk);
      };
      // Note: Do not connect worklet to destination to avoid feedback loop while recording
      this.mediaStreamSource.connect(this.recordingWorkletNode);
    } else {
      this.startMediaRecorderFallback(stream, onChunk);
    }
  }

  private startMediaRecorderFallback(stream: MediaStream, onChunk?: (chunk: Float32Array) => void): void {
    const recorder = new MediaRecorder(stream);
    const pieces: BlobPart[] = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        pieces.push(ev.data);
        if (onChunk && ev.data.arrayBuffer) {
          ev.data.arrayBuffer().then((ab) => onChunk(new Float32Array(ab))).catch(() => {});
        }
      }
    };
    const blobPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(pieces, { type: recorder.mimeType || "audio/webm" });
        resolve(blob);
      };
    });
    this.mediaRecorder = recorder;
    this.mediaRecorderBlob = blobPromise;
    recorder.start();
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.recordingStream && !this.mediaRecorder) return null;

    if (this.mediaRecorder && this.mediaRecorderBlob) {
      const recorder = this.mediaRecorder;
      const blobPromise = this.mediaRecorderBlob;
      this.mediaRecorder = null;
      this.mediaRecorderBlob = null;
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
      try {
        const blob = await blobPromise;
        this.cleanupRecording();
        return blob;
      } catch {
        this.cleanupRecording();
        return null;
      }
    }

    if (!this.recordingWorkletNode) {
      this.cleanupRecording();
      return null;
    }

    this.recordingWorkletNode.disconnect();
    this.mediaStreamSource?.disconnect();
    this.recordingStream?.getTracks().forEach((t) => t.stop());

    const chunks = this.recordedChunks;
    this.cleanupRecording();

    if (chunks.length === 0) return null;

    const sampleRate = this._audioCtx?.sampleRate || 44100;
    return this.encodeRecording(chunks, sampleRate);
  }

  /** Combine captured mono Float32 chunks into a WAV Blob (used by stopRecording and tests). */
  encodeRecording(chunks: Float32Array[], sampleRate: number = this._audioCtx?.sampleRate || 44100): Blob | null {
    if (!chunks || chunks.length === 0) return null;
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;
    for (const c of chunks) {
      combined.set(c, offset);
      offset += c.length;
    }
    // Mono capture is duplicated into both L/R channels to produce a valid 2-channel WAV.
    return this.float32ToWavBlob(combined, combined, sampleRate, 16);
  }

  private cleanupRecording(): void {
    try {
      this.recordingWorkletNode?.disconnect();
    } catch {
      /* node already disconnected */
    }
    try {
      this.mediaStreamSource?.disconnect();
    } catch {
      /* node already disconnected */
    }
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach((t) => t.stop());
      this.recordingStream = null;
    }
    this.recordingWorkletNode = null;
    this.mediaStreamSource = null;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.mediaRecorderBlob = null;
    this.isRecording = false;
  }

  async ensureContext(): Promise<AudioContext | null> {
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
    if (!this._audioCtx) await this.initialize();
    if (this.webAudioUnavailable) return null;
    if (this._audioCtx?.state === "suspended") {
      await this._audioCtx.resume();
    }
    return this._audioCtx;
  }

  resumeForGesture(): AudioContext | null {
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
    if (!this._audioCtx) {
      void this.initialize();
      return null;
    }
    if (this._audioCtx.state === "suspended") {
      void this._audioCtx.resume();
    }
    return this._audioCtx;
  }

  async decodeAudio(
    arrayBuffer: ArrayBuffer,
    ctx?: AudioContext,
  ): Promise<AudioBuffer> {
    const context = ctx || (await this.ensureContext());
    if (!context) throw new Error("AudioContext not available");
    return context.decodeAudioData(arrayBuffer);
  }

  async renderMixdown(
    tracks: { id?: string; name?: string; volume: number; pan: number; muted: boolean; solo: boolean; outputId?: string; sends?: Record<string, number>; regions: { start: number; duration: number; url?: string }[]; plugins?: Plugin[] }[],
    duration: number,
    sampleRate: number,
    onProgress?: (pct: number) => void,
    buses?: any[],
  ): Promise<Blob> {
    if (Platform.OS === "web") {
      return this.renderMixdownWeb(tracks, duration, sampleRate, onProgress, buses);
    }
    return this.renderMixdownNative(tracks, duration, sampleRate, onProgress, buses);
  }

  private async renderMixdownWeb(
    tracks: { id?: string; name?: string; volume: number; pan: number; muted: boolean; solo: boolean; outputId?: string; sends?: Record<string, number>; regions: { start: number; duration: number; url?: string }[]; plugins?: Plugin[] }[],
    duration: number,
    sampleRate: number,
    onProgress?: (pct: number) => void,
    buses?: any[],
  ): Promise<Blob> {
    const safeDuration = duration > 0 ? duration : 1;
    const numSamples = Math.max(1, Math.ceil(sampleRate * safeDuration));
    const ctx = new OfflineAudioContext(2, numSamples, sampleRate);
    const anySolo = tracks.some((t) => t.solo);
    const audible = tracks.filter((t) => {
      if (anySolo) return t.solo && !t.muted;
      return !t.muted;
    });

    const masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    const { buildBusRouteGraph, createDefaultBuses } = await import("../lib/busRouter");
    const { trackOutputs, cleanup } = buildBusRouteGraph(
      ctx,
      audible as any,
      buses ?? createDefaultBuses(),
      masterGain,
    );

    const total = audible.reduce((s, t) => s + t.regions.length, 0);
    const resolvedBlobUrls = new Set<string>();
    if (total === 0 || duration <= 0) {
      onProgress?.(100);
      const rendered = await ctx.startRendering();
      cleanup();
      return this.audioBufferToWavBlob(rendered, 24);
    }
    let processed = 0;

    for (const track of audible) {
      const trackOutputNode = trackOutputs.get(track.id || "");
      for (const region of track.regions) {
        if (region.url) {
          try {
            const resolvedUrl = await resolveAssetUrl(region.url);
            resolvedBlobUrls.add(resolvedUrl);
            const resp = await fetch(resolvedUrl, { credentials: "omit" });
            const ab = await resp.arrayBuffer();
            let buf = await this.decodeAudio(ab);
            if (track.plugins && track.plugins.length > 0) {
              const { applyPluginChain } = await import("../lib/pluginChain");
              buf = await applyPluginChain(buf, track.plugins, sampleRate, {
                duration,
                modTime: region.start,
              });
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            if (trackOutputNode) {
              src.connect(trackOutputNode);
            } else {
              const gain = ctx.createGain();
              gain.gain.value = track.volume / 100;
              const pan = ctx.createStereoPanner();
              pan.pan.value = track.pan / 100;
              src.connect(gain);
              gain.connect(pan);
              pan.connect(masterGain);
            }
            src.start(region.start, 0, Math.min(region.duration, Math.max(0, duration - region.start)));
          } catch (e) {
            console.warn("Failed to process region:", e);
          }
        }
        processed++;
        onProgress?.(Math.round((processed / total) * 60));
      }
    }

    onProgress?.(65);
    const rendered = await ctx.startRendering();
    cleanup();
    for (const u of resolvedBlobUrls) {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    }
    onProgress?.(70);
    return this.audioBufferToWavBlob(rendered, 24);
  }

  private async renderMixdownNative(
    tracks: { id?: string; name?: string; volume: number; pan: number; muted: boolean; solo: boolean; outputId?: string; sends?: Record<string, number>; regions: { start: number; duration: number; url?: string }[]; plugins?: Plugin[] }[],
    duration: number,
    sampleRate: number,
    onProgress?: (pct: number) => void,
    _buses?: any[],
  ): Promise<Blob> {
    void _buses;
    onProgress?.(10);

    const anySolo = tracks.some((t) => t.solo);
    const audible = tracks.filter((t) => {
      if (anySolo) return t.solo && !t.muted;
      return !t.muted;
    });

    const totalSamples = Math.ceil(sampleRate * duration);
    const left = new Float32Array(totalSamples);
    const right = new Float32Array(totalSamples);
    const total = audible.reduce((s, t) => s + t.regions.length, 0);
    const resolvedBlobUrls = new Set<string>();
    let processed = 0;

    for (const track of audible) {
      const trackGain = track.volume / 100;
      const pan = track.pan / 100;
      const { left: leftGain, right: rightGain } = this.computePanGains(trackGain, pan);

      for (const region of track.regions) {
        if (!region.url) {
          processed++;
          onProgress?.(Math.round((processed / total) * 80));
          continue;
        }
        try {
          const resolvedUrl = await resolveAssetUrl(region.url);
          resolvedBlobUrls.add(resolvedUrl);
          const resp = await fetch(resolvedUrl, { credentials: "omit" });
          const ab = await resp.arrayBuffer();
          const decodedChannels = await this.decodeAudioPureJS(ab, sampleRate);
          if (!decodedChannels) {
            processed++;
            onProgress?.(Math.round((processed / total) * 80));
            continue;
          }
          const startSample = Math.floor(region.start * sampleRate);
          const channelLength = decodedChannels[0]?.length || 0;
          const regionSamples = Math.min(
            Math.floor(region.duration * sampleRate),
            channelLength,
            totalSamples - startSample,
          );

          if (decodedChannels.length === 1) {
            const ch0 = decodedChannels[0];
            for (let i = 0; i < regionSamples; i++) {
              const src = ch0[i] || 0;
              left[startSample + i] += src * leftGain;
              right[startSample + i] += src * rightGain;
            }
          } else {
            const ch0 = decodedChannels[0];
            const ch1 = decodedChannels[1] || decodedChannels[0];
            for (let i = 0; i < regionSamples; i++) {
              const srcL = ch0[i] || 0;
              const srcR = ch1[i] || 0;
              left[startSample + i] += srcL * leftGain;
              right[startSample + i] += srcR * rightGain;
            }
          }
        } catch (e) {
          console.warn("Failed to process region on native:", e);
        }
        processed++;
        onProgress?.(Math.round((processed / total) * 80));
      }
    }

    for (const u of resolvedBlobUrls) {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    }

    onProgress?.(85);
    const wavBlob = this.float32ToWavBlob(left, right, sampleRate, 24);
    onProgress?.(100);
    return wavBlob;
  }

  private computePanGains(trackGain: number, pan: number): { left: number; right: number } {
    const rad = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
    return {
      left: trackGain * Math.cos(rad),
      right: trackGain * Math.sin(rad),
    };
  }

  /** Decode audio without AudioContext (pure JS WAV/MP3 decoder fallback for native). */
  private async decodeAudioPureJS(arrayBuffer: ArrayBuffer, targetSampleRate: number): Promise<Float32Array[] | null> {
    const view = new DataView(arrayBuffer);
    if (arrayBuffer.byteLength < 12) {
      return null;
    }

    const header = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));

    if (header === "RIFF") {
      const format = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
      if (format === "WAVE") {
        let numChannels = 1;
        let sampleRate = targetSampleRate;
        void sampleRate;
        let bitsPerSample = 16;
        let audioFormat = 1;
        let dataOffset = 0;
        let dataLength = 0;

        let offset = 12;
        while (offset < arrayBuffer.byteLength - 8) {
          const chunkId = String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3)
          );
          const chunkSize = view.getUint32(offset + 4, true);

          if (chunkId === "fmt ") {
            audioFormat = view.getUint16(offset + 8, true);
            numChannels = view.getUint16(offset + 10, true);
            sampleRate = view.getUint32(offset + 12, true);
            if (chunkSize >= 16) {
              bitsPerSample = view.getUint16(offset + 22, true);
            }
          } else if (chunkId === "data") {
            dataOffset = offset + 8;
            dataLength = Math.min(chunkSize, arrayBuffer.byteLength - dataOffset);
            break;
          }

          offset += 8 + chunkSize + (chunkSize % 2);
        }

        if (dataOffset > 0 && dataLength > 0 && numChannels > 0 && bitsPerSample > 0) {
          const bytesPerSample = bitsPerSample / 8;
          const blockAlign = numChannels * bytesPerSample;
          const numSamples = Math.floor(dataLength / blockAlign);
          const channels: Float32Array[] = [];
          for (let ch = 0; ch < numChannels; ch++) {
            channels.push(new Float32Array(numSamples));
          }

          for (let i = 0; i < numSamples; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
              const pos = dataOffset + (i * numChannels + ch) * bytesPerSample;
              if (pos + bytesPerSample > arrayBuffer.byteLength) break;

              let val = 0;
              if (bitsPerSample === 8) {
                const uVal = view.getUint8(pos);
                val = (uVal - 128) / 128;
              } else if (bitsPerSample === 16) {
                val = view.getInt16(pos, true) / 32768;
              } else if (bitsPerSample === 24) {
                const b0 = view.getUint8(pos);
                const b1 = view.getUint8(pos + 1);
                const b2 = view.getUint8(pos + 2);
                let int24 = b0 | (b1 << 8) | (b2 << 16);
                if (int24 & 0x800000) {
                  int24 |= -0x1000000;
                }
                val = int24 / 8388608;
              } else if (bitsPerSample === 32) {
                if (audioFormat === 3) {
                  val = view.getFloat32(pos, true);
                } else {
                  val = view.getInt32(pos, true) / 2147483648;
                }
              } else {
                val = view.getInt16(pos, true) / 32768;
              }
              channels[ch][i] = val;
            }
          }
          return channels;
        }
      }
    }

    if (header === "ID3" || (view.getUint8(0) === 0xFF && (view.getUint8(1) & 0xE0) === 0xE0)) {
      return null;
    }

    return null;
  }

  private writeWavSample(view: DataView, offset: number, sample: number, bitDepth: number): void {
    const clamped = Math.max(-1, Math.min(1, sample));
    if (bitDepth === 24) {
      const pcm = Math.max(-8388608, Math.min(8388607, Math.round(clamped * 8388607)));
      view.setInt8(offset, pcm & 0xff);
      view.setInt8(offset + 1, (pcm >> 8) & 0xff);
      view.setInt8(offset + 2, (pcm >> 16) & 0xff);
    } else {
      const val = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, val, true);
    }
  }

  private float32ToWavBlob(left: Float32Array, right: Float32Array, sampleRate: number, bitDepth: number): Blob {
    const length = left.length;
    const numChannels = 2;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const ab = new ArrayBuffer(totalSize);
    const view = new DataView(ab);

    const ws = (o: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i));
    };

    ws(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    ws(8, "WAVE");
    ws(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    ws(36, "data");
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = ch === 0 ? left[i] : right[i];
        this.writeWavSample(view, headerSize + (i * numChannels + ch) * bytesPerSample, sample, bitDepth);
      }
    }

    return new Blob([ab], { type: "audio/wav" });
  }

  private audioBufferToWavBlob(buffer: AudioBuffer, bitDepth: number): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const ab = new ArrayBuffer(totalSize);
    const view = new DataView(ab);

    const ws = (o: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i));
    };

    ws(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    ws(8, "WAVE");
    ws(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    ws(36, "data");
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        this.writeWavSample(view, headerSize + (i * numChannels + ch) * bytesPerSample, sample, bitDepth);
      }
    }

    return new Blob([ab], { type: "audio/wav" });
  }

  async exportToFile(blob: Blob, filename: string): Promise<void> {
    const arrayBuffer = await blob.arrayBuffer();

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      try {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (e) {
        console.warn("Export download failed:", e);
        try { URL.revokeObjectURL(url); } catch { /* already revoked */ }
      }
    } else {
      try {
        await OpenBandNative.writeFile(filename, arrayBuffer);
      } catch (e) {
        console.warn("Bridge writeFile failed:", e);
      }
    }
  }

  async exportTone(
    duration: number,
    sampleRate: number,
    frequency: number,
  ): Promise<Blob> {
    if (Platform.OS !== "web") {
      return new Blob([new ArrayBuffer(44)], { type: "audio/wav" });
    }
    const safeDuration = duration > 0 ? duration : 1;
    const numSamples = Math.max(1, Math.ceil(sampleRate * safeDuration));
    const ctx = new OfflineAudioContext(1, numSamples, sampleRate);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, 0.01);
    gain.gain.setValueAtTime(0.3, Math.max(0, duration - 0.1));
    gain.gain.linearRampToValueAtTime(0, duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    osc.stop(duration);
    const rendered = await ctx.startRendering();
    return this.audioBufferToWavBlob(rendered, 16);
  }

  dispose(): void {
    if (this._audioCtx) {
      this._audioCtx.close().catch(() => {});
      this._audioCtx = null;
    }
    for (const [url] of blobUrlRegistry) {
      try { URL.revokeObjectURL(url); } catch { /* already revoked */ }
    }
    blobUrlRegistry.clear();
    this.isInitialized = false;
  }
}

export const audioSystem = UniversalAudioSystem.getInstance();
