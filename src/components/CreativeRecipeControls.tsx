import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { TIME_SIGNATURES, MUSICAL_KEYS, keyLabel } from "../lib/projectTemplates";
import type { GenreTemplate } from "../lib/projectTemplates";

export interface CreativeRecipe {
  genreId: string;
  mood?: string;
  bpm: number;
  key: string;
  timeSignature: string;
  numBars: number;
  seed: string;
}

interface CreativeRecipeControlsProps {
  recipe: CreativeRecipe;
  onChange: (
    patch: Partial<Pick<CreativeRecipe, "genreId" | "mood" | "bpm" | "key" | "timeSignature" | "numBars">>,
  ) => void;
  genres: GenreTemplate[];
  testID?: string;
}

export function CreativeRecipeControls({
  recipe,
  onChange,
  genres,
  testID,
}: CreativeRecipeControlsProps) {
  const { t } = useTranslation();

  const setBpm = (delta: number) => {
    onChange({ bpm: Math.max(1, recipe.bpm + delta) });
  };
  const setNumBars = (delta: number) => {
    onChange({ numBars: Math.max(1, Math.min(64, recipe.numBars + delta)) });
  };

  return (
    <View testID={testID} className="mb-4">
      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.genre", "Gênero")}
      </Text>
      <View className="flex-row flex-wrap gap-1.5 mb-4">
        {genres.map((g) => {
          const active = g.id === recipe.genreId;
          return (
            <Pressable
              key={g.id}
              testID={`genre-chip-${g.id}`}
              onPress={() => onChange({ genreId: g.id })}
              className={`px-3 py-2 rounded-lg border ${
                active
                  ? "bg-brand-accent/20 border-brand-accent"
                  : "bg-dark-surface border-dark-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? "text-brand-accent" : "text-gray-300"
                }`}
              >
                {g.icon} {g.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-gray-400 text-xs font-medium">
          {t("creative.bpm", "BPM")}
        </Text>
        <Text className="text-gray-500 text-xs font-mono">{recipe.bpm}</Text>
      </View>
      <View className="flex-row gap-2 mb-4">
        <Pressable
          testID="bpm-minus"
          onPress={() => setBpm(-5)}
          className="flex-1 py-2 rounded-lg bg-dark-surface border border-dark-border items-center active:opacity-70"
        >
          <Text className="text-gray-300 font-bold">−5</Text>
        </Pressable>
        <Pressable
          testID="bpm-plus"
          onPress={() => setBpm(5)}
          className="flex-1 py-2 rounded-lg bg-dark-surface border border-dark-border items-center active:opacity-70"
        >
          <Text className="text-gray-300 font-bold">+5</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-gray-400 text-xs font-medium">
          {t("creative.bars", "Compassos")}
        </Text>
        <Text className="text-gray-500 text-xs font-mono">{recipe.numBars}</Text>
      </View>
      <View className="flex-row gap-2 mb-4">
        <Pressable
          testID="numbars-minus"
          onPress={() => setNumBars(-2)}
          className="flex-1 py-2 rounded-lg bg-dark-surface border border-dark-border items-center active:opacity-70"
        >
          <Text className="text-gray-300 font-bold">−2</Text>
        </Pressable>
        <Pressable
          testID="numbars-plus"
          onPress={() => setNumBars(2)}
          className="flex-1 py-2 rounded-lg bg-dark-surface border border-dark-border items-center active:opacity-70"
        >
          <Text className="text-gray-300 font-bold">+2</Text>
        </Pressable>
      </View>

      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.timeSignature", "Fórmula de Compasso")}
      </Text>
      <View className="flex-row flex-wrap gap-1.5 mb-4">
        {TIME_SIGNATURES.map((ts) => {
          const active = ts === recipe.timeSignature;
          return (
            <Pressable
              key={ts}
              testID={`ts-chip-${ts}`}
              onPress={() => onChange({ timeSignature: ts })}
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
                {ts}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-gray-400 text-xs font-medium mb-2">
        {t("creative.key", "Tom")}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {MUSICAL_KEYS.map((k) => {
          const active = k === recipe.key;
          return (
            <Pressable
              key={k}
              testID={`key-chip-${k}`}
              onPress={() => onChange({ key: k })}
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
                {keyLabel(k)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
