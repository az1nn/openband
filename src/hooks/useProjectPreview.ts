import { useState, useRef, useEffect, useCallback } from "react";
import {
  PreviewConfig,
  computePreviewFingerprint,
  generatePreviewTracks,
  DEFAULT_PREVIEW_VOLUME,
} from "../lib/projectPreview";
import { renderTracksToUrl } from "../lib/midiSynth";
import { revokeTrackedBlob } from "../lib/universalAudio";
import { useUniversalAudio } from "./useUniversalAudio";

export type PreviewStatus = "idle" | "rendering" | "ready" | "playing" | "paused" | "error";

export interface UseProjectPreviewOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export interface UseProjectPreviewReturn {
  status: PreviewStatus;
  isPlaying: boolean;
  isRendering: boolean;
  errorMessage: string | null;
  previewUrl: string | null;
  togglePlay: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useProjectPreview(
  config: PreviewConfig,
  options?: UseProjectPreviewOptions,
): UseProjectPreviewReturn {
  const enabled = options?.enabled ?? true;
  const debounceMs = options?.debounceMs ?? 200;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasActivatedRef = useRef(false);
  const currentUrlRef = useRef<string | null>(null);
  const revisionRef = useRef(0);
  const inFlightRef = useRef(false);
  const pendingConfigRef = useRef<PreviewConfig | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const lastFingerprintRef = useRef<string>("");

  const universalAudio = useUniversalAudio(previewUrl);

  useEffect(() => {
    universalAudio.setVolume(DEFAULT_PREVIEW_VOLUME);
  }, [previewUrl]);

  // Clean up a URL immediately
  const cleanupUrl = (url: string | null) => {
    if (url) {
      try {
        revokeTrackedBlob(url);
      } catch (e) {
        console.warn("revokeTrackedBlob failed in useProjectPreview:", e);
      }
    }
  };

  // Perform render execution (concurrency max 1)
  const performRender = useCallback(async (targetConfig: PreviewConfig, shouldAutoPlay: boolean) => {
    if (!isMountedRef.current || !enabled) return;

    if (inFlightRef.current) {
      pendingConfigRef.current = targetConfig;
      return;
    }

    inFlightRef.current = true;
    setIsRendering(true);
    setErrorMessage(null);

    const thisRevision = ++revisionRef.current;

    try {
      const tracks = generatePreviewTracks(targetConfig);
      const url = await renderTracksToUrl(tracks, targetConfig.bpm, targetConfig.mood);

      if (!isMountedRef.current || !enabled || thisRevision !== revisionRef.current) {
        // Obsolete or unmounted: revoke immediately
        cleanupUrl(url);
      } else {
        // Clean up previous active URL
        if (currentUrlRef.current && currentUrlRef.current !== url) {
          cleanupUrl(currentUrlRef.current);
        }
        currentUrlRef.current = url;
        setPreviewUrl(url);
        setErrorMessage(null);

        if (shouldAutoPlay && url) {
          try {
            await universalAudio.play();
          } catch (err) {
            console.warn("Preview auto-play failed (best effort):", err);
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current && thisRevision === revisionRef.current) {
        setErrorMessage(err instanceof Error ? err.message : "Falha ao gerar prévia");
      }
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) {
        setIsRendering(false);
      }

      // If a pending config arrived while rendering, process it now
      if (pendingConfigRef.current && isMountedRef.current && enabled) {
        const next = pendingConfigRef.current;
        pendingConfigRef.current = null;
        performRender(next, shouldAutoPlay);
      }
    }
  }, [enabled, universalAudio]);

  // Initial Play / explicit toggle
  const togglePlay = useCallback(async () => {
    if (!hasActivatedRef.current || !previewUrl) {
      hasActivatedRef.current = true;
      await performRender(config, true);
    } else {
      if (universalAudio.isPlaying) {
        await universalAudio.pause();
      } else {
        await universalAudio.play();
      }
    }
  }, [config, previewUrl, universalAudio, performRender]);

  const play = useCallback(async () => {
    if (!hasActivatedRef.current || !previewUrl) {
      hasActivatedRef.current = true;
      await performRender(config, true);
    } else {
      await universalAudio.play();
    }
  }, [config, previewUrl, universalAudio, performRender]);

  const pause = useCallback(async () => {
    await universalAudio.pause();
  }, [universalAudio]);

  const stop = useCallback(async () => {
    await universalAudio.stop();
  }, [universalAudio]);

  const retry = useCallback(async () => {
    await performRender(config, hasActivatedRef.current);
  }, [config, performRender]);

  // Watch for configuration changes to trigger auto-refresh once activated
  useEffect(() => {
    if (!enabled) return;

    const currentFp = computePreviewFingerprint(config);
    const fpChanged = currentFp !== lastFingerprintRef.current;
    lastFingerprintRef.current = currentFp;

    if (hasActivatedRef.current && fpChanged) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && enabled) {
          const wasPlaying = universalAudio.isPlaying;
          performRender(config, wasPlaying);
        }
      }, debounceMs);
    }
  }, [config, enabled, debounceMs, performRender, universalAudio.isPlaying]);

  // Cleanup on unmount or disable
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (currentUrlRef.current) {
        cleanupUrl(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, []);

  // Compute composite status
  let status: PreviewStatus = "idle";
  if (errorMessage) {
    status = "error";
  } else if (isRendering) {
    status = "rendering";
  } else if (previewUrl) {
    status = universalAudio.isPlaying ? "playing" : "ready";
  }

  return {
    status,
    isPlaying: universalAudio.isPlaying,
    isRendering,
    errorMessage,
    previewUrl,
    togglePlay,
    play,
    pause,
    stop,
    retry,
  };
}
