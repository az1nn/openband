import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { UseProjectPreviewReturn } from "../hooks/useProjectPreview";

export interface ProjectPreviewPlayerProps {
  preview: UseProjectPreviewReturn;
  disabled?: boolean;
  testID?: string;
}

export function ProjectPreviewPlayer({
  preview,
  disabled = false,
  testID = "project-preview-player",
}: ProjectPreviewPlayerProps) {
  const { t } = useTranslation();

  const getStatusText = () => {
    switch (preview.status) {
      case "rendering":
        return t("newProject.previewRendering", "Gerando prévia...");
      case "playing":
        return t("newProject.previewPlaying", "Tocando prévia (4 comp.)");
      case "ready":
      case "paused":
        return t("newProject.previewPaused", "Pausado");
      case "error":
        return t("newProject.previewError", "Erro ao gerar prévia");
      case "idle":
      default:
        return t("newProject.previewIdle", "Ouvir prévia (4 comp.)");
    }
  };

  return (
    <View
      testID={testID}
      className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 mb-4 flex-row items-center justify-between shadow-sm"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Pressable
          testID="project-preview-play-btn"
          accessibilityRole="button"
          accessibilityLabel={
            preview.isPlaying
              ? t("newProject.previewPauseA11y", "Pausar prévia")
              : t("newProject.previewPlayA11y", "Reproduzir prévia")
          }
          disabled={disabled || preview.isRendering}
          onPress={() => preview.togglePlay()}
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            preview.isPlaying
              ? "bg-purple-600 active:bg-purple-700"
              : preview.isRendering
              ? "bg-neutral-700 opacity-60"
              : "bg-purple-600/90 active:bg-purple-500"
          }`}
        >
          {preview.isRendering ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-bold ml-0.5">
              {preview.isPlaying ? "❚❚" : "▶"}
            </Text>
          )}
        </Pressable>

        <View className="flex-1">
          <Text className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-0.5">
            {t("newProject.previewTitle", "Prévia da Música")}
          </Text>
          <Text
            testID="project-preview-status"
            numberOfLines={1}
            className={`text-xs ${
              preview.status === "error"
                ? "text-red-400 font-medium"
                : preview.isPlaying
                ? "text-purple-300 font-medium"
                : "text-neutral-400"
            }`}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>

      {preview.status === "error" && (
        <Pressable
          testID="project-preview-retry-btn"
          accessibilityRole="button"
          accessibilityLabel={t("newProject.previewRetry", "Tentar novamente")}
          onPress={() => preview.retry()}
          className="px-2.5 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg"
        >
          <Text className="text-xs text-neutral-200 font-medium">
            {t("newProject.previewRetry", "Tentar novamente")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
