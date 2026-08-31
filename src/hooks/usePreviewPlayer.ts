import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import type { ProjectStarterResult } from "../lib/projectStarter";
import { previewCacheKeyFor } from "../lib/previewBudget";
import { PreviewPlayback, type PreviewStatus } from "../lib/previewLifecycle";
import { audioSystem } from "../lib/universalAudio";

export function usePreviewPlayer(): {
  play: (args: {
    uri: string;
    musicalHash: string;
    result: ProjectStarterResult;
  }) => Promise<void>;
  stop: () => void;
  status: PreviewStatus;
  cacheKey: string | null;
} {
  const playbackRef = useRef<PreviewPlayback>(new PreviewPlayback());
  const busyRef = useRef(false);
  const [status, setStatus] = useState<PreviewStatus>("stopped");
  const [cacheKey, setCacheKey] = useState<string | null>(null);

  const player = useAudioPlayer("");
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    const pb = playbackRef.current;
    if (
      playerStatus.isLoaded &&
      !playerStatus.playing &&
      pb.status === "playing" &&
      busyRef.current
    ) {
      busyRef.current = false;
      pb.end();
      setStatus("stopped");
    }
  }, [playerStatus.playing, playerStatus.isLoaded, playerStatus.didJustFinish]);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        console.error("Preview pause-on-unmount error");
      }
      playbackRef.current.stop();
    };
  }, [player]);

  const play = async (args: {
    uri: string;
    musicalHash: string;
    result: ProjectStarterResult;
  }) => {
    const pb = playbackRef.current;
    const key = previewCacheKeyFor(args.musicalHash, args.result);

    if (!args.uri) {
      setCacheKey(key);
      setStatus("stopped");
      return;
    }

    const outcome = pb.play();
    if (!outcome.accepted) {
      try {
        player.pause();
        player.seekTo(0);
      } catch {
        console.error("Preview busy-rejection cleanup error");
      }
      return;
    }

    setCacheKey(key);
    setStatus("playing");
    busyRef.current = false;

    try {
      if (Platform.OS === "web") {
        await audioSystem.ensureContext();
      }
      await player.replace(args.uri);
      await player.play();
      busyRef.current = true;
    } catch (err) {
      busyRef.current = false;
      pb.stop();
      setStatus("stopped");
      console.error("Preview play error", err);
    }
  };

  const stop = () => {
    const pb = playbackRef.current;
    pb.stop();
    busyRef.current = false;
    setStatus("stopped");
    try {
      player.pause();
      player.seekTo(0);
    } catch {
      console.error("Preview stop error");
    }
  };

  return { play, stop, status, cacheKey };
}
