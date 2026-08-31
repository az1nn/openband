import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface CreativePreviewPlayerProps {
  cacheKey: string | null;
  status: "stopped" | "playing" | "failed";
  onPlay: () => void;
  onStop: () => void;
  budgetBars: number;
  testID?: string;
}

export function CreativePreviewPlayer({
  cacheKey,
  status,
  onPlay,
  onStop,
  budgetBars,
  testID,
}: CreativePreviewPlayerProps) {
  const { t } = useTranslation();
  const isPlaying = status === "playing";
  const disabled = cacheKey === null;

  return (
    <View testID={testID} className="mb-4">
      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.preview", "Pré-escuta")}
      </Text>
      <View className="flex-row items-center gap-3">
        {isPlaying ? (
          <Button
            title={t("creative.stop", "Parar")}
            onPress={onStop}
            variant="secondary"
            disabled={disabled}
            testID="preview-stop"
          />
        ) : (
          <Button
            title={t("creative.play", "Tocar")}
            onPress={onPlay}
            variant="primary"
            disabled={disabled}
            testID="preview-play"
          />
        )}
        <View className="flex-1">
          <Text className="text-gray-300 text-xs">
            {t("creative.budgetBars", "Bars")}: {budgetBars}
          </Text>
          <Text className="text-gray-600 text-[10px] font-mono">
            {cacheKey ? cacheKey.slice(0, 12) : "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}
