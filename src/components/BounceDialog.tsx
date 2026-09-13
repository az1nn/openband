import { useState, useCallback } from "react";
import { View, Text, Modal, Pressable, Alert, Platform } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { audioSystem } from "../lib/universalAudio";
import type { BusDef, Plugin, TrackDef } from "../lib/types";
import type { Mood } from "../lib/projectTemplates";
import { ExportTrustError, renderProjectWav, validateWavBlob } from "../lib/exportTrust";
import { exportVideo, downloadVideoFile, VideoExportOptions, isVideoExportSupported, renderVideoJob } from "../lib/videoExport";

type ExportMode = "audio" | "video";

const VIDEO_FORMATS: { key: "webm" | "mp4"; label: string; ext: string }[] = [
  { key: "webm", label: "WebM", ext: ".webm" },
  { key: "mp4", label: "MP4", ext: ".mp4" },
];

interface BounceDialogProps {
  visible: boolean;
  onClose: () => void;
  projectTitle: string;
  duration: number;
  bpm?: number;
  tracks?: TrackDef[];
  buses?: BusDef[];
  masterPlugins?: Plugin[];
  mood?: Mood;
  testID?: string;
}

function safeBaseName(title: string): string {
  return title.replace(/[^a-zA-Z0-9_-]/g, "").replace(/\s+/g, "_") || "openband";
}

export function BounceDialog({
  visible,
  onClose,
  projectTitle,
  duration,
  bpm = 120,
  tracks = [],
  buses = [],
  masterPlugins = [],
  mood,
  testID,
}: BounceDialogProps) {
  const [mode, setMode] = useState<ExportMode>("audio");
  const [videoFormat, setVideoFormat] = useState<"webm" | "mp4">("webm");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoColor, setVideoColor] = useState("#6366f1");
  const [video, setVideo] = useState(false);

  const updateProgress = useCallback((pct: number) => {
    setProgress(pct);
  }, []);

  const handleVideoExport = useCallback(async () => {
    setExporting(true);
    setProgress(0);

    if (!isVideoExportSupported()) {
      Alert.alert(
        "Vídeo indisponível",
        "A exportação de vídeo requer um navegador web compatível.",
      );
      setExporting(false);
      return;
    }

    try {
      await audioSystem.initialize();
      const ext = VIDEO_FORMATS.find((f) => f.key === videoFormat)?.ext || ".webm";
      const videoTracks = tracks.map((t) => ({
        id: t.id,
        name: t.name,
        volume: t.volume,
        pan: t.pan,
        muted: t.muted,
        solo: t.solo,
        regions: t.regions.map((r) => ({
...r,
          color: t.name.toLowerCase().includes("drum") ? "#f59e0b"
            : t.name.toLowerCase().includes("bass") ? "#10b981"
            : t.name.toLowerCase().includes("vocal") ? "#ec4899"
            : videoColor,
        })),
      }));
      const videoOptions: VideoExportOptions = {
        width: 1080,
        height: 1920,
        title: projectTitle,
        color: videoColor,
        format: videoFormat,
      };
      const result = await exportVideo(
        videoTracks,
        bpm,
        Math.min(duration, 300),
        videoOptions,
        updateProgress,
      );
      updateProgress(95);
      const filename = `${safeBaseName(projectTitle)}_video${ext}`;
      await downloadVideoFile(result.blob, filename, updateProgress);
      updateProgress(100);
      Alert.alert("Exportado", `Vídeo exportado como ${videoFormat.toUpperCase()}`);
    } catch (e) {
      console.error("Video export failed:", e);
      Alert.alert("Erro", "Falha ao exportar vídeo. O recurso requer um navegador web compatível.");
    } finally {
      setExporting(false);
    }
  }, [videoFormat, projectTitle, duration, bpm, tracks, videoColor, updateProgress]);

  const handleExport = useCallback(async () => {
    if (mode === "video") {
      await handleVideoExport();
      return;
    }

    setExporting(true);
    setProgress(0);
    try {
      await audioSystem.initialize();
      let blob: Blob;
      let sampleRate = 44100;
      let bitDepth = Platform.OS === "web" ? 16 : 24;

      if (Platform.OS === "web") {
        const result = await renderProjectWav(
          { tracks, bpm, mood, buses, masterPlugins },
          updateProgress,
        );
        blob = result.blob;
        sampleRate = result.sampleRate;
        bitDepth = result.bitDepth;
      } else {
        if (tracks.length === 0) {
          throw new ExportTrustError(
            "NO_RENDERABLE_CONTENT",
            "This project has no renderable content to export.",
          );
        }
        blob = await audioSystem.renderMixdown(
          tracks.map((track) => ({
            ...track,
            outputId: track.outputId ?? undefined,
          })),
          duration,
          44100,
          updateProgress,
          buses,
        );
        await validateWavBlob(blob);
      }

      const filename = `${safeBaseName(projectTitle)}_mix.wav`;
      await audioSystem.exportToFile(blob, filename);
      updateProgress(100);
      Alert.alert(
        "Exportado",
        `Mix exportado como WAV (${bitDepth}-bit, ${(sampleRate / 1000).toFixed(1)}kHz)`,
      );

      if (video) {
        if (!isVideoExportSupported()) {
          Alert.alert(
            "Vídeo indisponível",
            "A exportação de vídeo requer um navegador web compatível.",
          );
        } else {
          const result = await renderVideoJob({
            durationSec: Math.min(duration, 300),
            fps: 30,
            onProgress: updateProgress,
          });
          const videoFilename = `${safeBaseName(projectTitle)}_video.webm`;
          await audioSystem.exportToFile(result.blob, videoFilename);
          Alert.alert("Vídeo exportado", `Vídeo salvo como ${videoFilename}`);
        }
      }
    } catch (e) {
      console.error("Export failed:", e);
      const message = e instanceof ExportTrustError
        ? e.message
        : "Falha ao exportar mix. O projeto não foi alterado.";
      Alert.alert("Erro", message);
    } finally {
      setExporting(false);
    }
  }, [mode, projectTitle, duration, tracks, bpm, mood, buses, masterPlugins, updateProgress, video, handleVideoExport]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable className="w-full max-w-sm bg-dark-surface rounded-3xl border border-dark-border p-5">
          <Text className="text-white text-lg font-bold mb-1">Exportar Mix</Text>
          <Text className="text-gray-500 text-xs mb-5">Exportação de áudio confiável para lançamento</Text>

          <Text className="label mb-2">Mode</Text>
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setMode("audio")}
              className={`flex-1 py-2.5 rounded-xl items-center border ${mode === "audio" ? "bg-brand-primary/20 border-brand-primary" : "bg-dark-elevated border-dark-border"}`}
            >
              <Text className={`text-sm font-semibold ${mode === "audio" ? "text-brand-primary" : "text-white"}`}>Audio</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("video")}
              className={`flex-1 py-2.5 rounded-xl items-center border ${mode === "video" ? "bg-brand-accent/20 border-brand-accent" : "bg-dark-elevated border-dark-border"}`}
            >
              <Text className={`text-sm font-semibold ${mode === "video" ? "text-brand-accent" : "text-white"}`}>Video</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="label">Vídeo</Text>
            <Pressable
              onPress={() => setVideo(!video)}
              className={`px-4 py-2 rounded-xl border ${video ? "bg-brand-accent/20 border-brand-accent" : "bg-dark-elevated border-dark-border"}`}
            >
              <Text className={`text-sm font-semibold ${video ? "text-brand-accent" : "text-white"}`}>{video ? "Ligado" : "Desligado"}</Text>
            </Pressable>
          </View>

          {mode === "audio" ? (
            <View className="mb-5 rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-3">
              <Text className="text-brand-primary font-bold text-sm">WAV</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {Platform.OS === "web" ? "16-bit · 44.1kHz · full project mix" : "44.1kHz · native WAV mix"}
              </Text>
            </View>
          ) : (
            <>
              <Text className="label mb-2">Formato</Text>
              <View className="flex-row gap-2 mb-4">
                {VIDEO_FORMATS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setVideoFormat(f.key)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${videoFormat === f.key ? "bg-brand-accent/20 border-brand-accent" : "bg-dark-elevated border-dark-border"}`}
                  >
                    <Text className={`text-sm font-semibold ${videoFormat === f.key ? "text-brand-accent" : "text-white"}`}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text className="label mb-2">Cor do waveform</Text>
              <View className="flex-row gap-2 mb-5">
                {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setVideoColor(c)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${videoColor === c ? "border-2 border-white" : "border-2 border-transparent"}`}
                    style={{ backgroundColor: c } as Record<string, string>}
                  >
                    {videoColor === c && <Text className="text-white text-xs">{"\u2713"}</Text>}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {exporting && (
            <View className="mb-5">
              <ProgressBar progress={progress} className="mb-2" />
              <Text className="text-gray-400 text-xs text-center">{progress}%</Text>
            </View>
          )}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-xl border border-dark-border items-center active:opacity-70"
              disabled={exporting}
            >
              <Text className="text-gray-400 text-sm font-semibold">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleExport}
              className="flex-1 py-3 rounded-xl bg-brand-primary items-center active:opacity-80 disabled:opacity-50"
              disabled={exporting}
            >
              <Text className={`text-white text-sm font-bold ${exporting ? "opacity-70" : ""}`}>
                {exporting ? "Exportando..." : "Exportar"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
