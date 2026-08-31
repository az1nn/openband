import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

interface CreativeVariation {
  variationId: string;
  musicalContentHash: string;
}

interface CreativeVariationSwitcherProps {
  variations: readonly CreativeVariation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  visibleCount?: number;
  testID?: string;
}

export function CreativeVariationSwitcher({
  variations,
  selectedId,
  onSelect,
  visibleCount = 3,
  testID,
}: CreativeVariationSwitcherProps) {
  const { t } = useTranslation();
  const visible = variations.slice(0, visibleCount);
  const overflow = variations.length - visible.length;

  return (
    <View testID={testID} className="mb-4">
      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.variations", "Variações")}
      </Text>
      <View className="flex-row flex-wrap gap-2 items-center">
        {visible.map((v) => {
          const active = v.variationId === selectedId;
          return (
            <Pressable
              key={v.variationId}
              testID={`variation-chip-${v.variationId}`}
              onPress={() => onSelect(v.variationId)}
              className={`px-3 py-2 rounded-lg border ${
                active
                  ? "bg-brand-accent/20 border-brand-accent"
                  : "bg-dark-surface border-dark-border"
              }`}
            >
              <Text
                className={`font-mono text-sm font-bold ${
                  active ? "text-brand-accent" : "text-gray-400"
                }`}
              >
                {v.musicalContentHash.slice(0, 6)}
              </Text>
            </Pressable>
          );
        })}
        {overflow > 0 && (
          <View testID="variation-more" className="px-3 py-2">
            <Text className="text-gray-500 text-sm font-medium">+{overflow}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
