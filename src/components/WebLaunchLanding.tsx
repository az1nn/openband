import { Linking, Pressable, ScrollView, Text, View } from "react-native";

export const OPENBAND_SOURCE_URL = "https://github.com/az1nn/openband";

interface WebLaunchLandingProps {
  onStartCreating: () => void;
  onViewSource?: () => void;
}

export function WebLaunchLanding({
  onStartCreating,
  onViewSource,
}: WebLaunchLandingProps) {
  const openSource =
    onViewSource ?? (() => void Linking.openURL(OPENBAND_SOURCE_URL));

  return (
    <ScrollView
      className="flex-1 bg-dark-bg"
      contentContainerStyle={{ flexGrow: 1 }}
      testID="web-launch-landing"
    >
      <View className="flex-1 px-6 py-8 md:px-10 md:py-10">
        <View
          className="w-full mx-auto flex-1"
          style={{ maxWidth: 1120 }}
        >
          <View className="flex-row items-center justify-between mb-16">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-brand-primary items-center justify-center">
                <Text className="text-white text-xl">♫</Text>
              </View>
              <Text className="text-white text-xl font-bold tracking-tight">
                OpenBand
              </Text>
            </View>
            <View className="px-3 py-1.5 rounded-full border border-dark-border bg-dark-card">
              <Text className="text-gray-300 text-xs font-semibold">Web alpha</Text>
            </View>
          </View>

          <View className="flex-1 justify-center pb-16">
            <Text className="text-brand-primary text-xs font-bold tracking-[3px] uppercase mb-5">
              Open-source music studio
            </Text>
            <Text
              className="text-white font-bold tracking-tight mb-6"
              style={{ fontSize: 64, lineHeight: 68, maxWidth: 780 }}
            >
              Make music. Keep the project.
            </Text>
            <Text
              className="text-gray-400 text-xl leading-8 mb-9"
              style={{ maxWidth: 720 }}
            >
              Record, arrange, mix, and export in a local-first browser studio.
              Start creating without mandatory signup, then inspect the source whenever
              you want.
            </Text>

            <View className="flex-row flex-wrap gap-3 mb-10">
              {[
                "Web first",
                "Local-first projects",
                "Free core creation",
                "Open source",
              ].map((item) => (
                <View
                  key={item}
                  className="px-3 py-2 rounded-lg bg-dark-card border border-dark-border"
                >
                  <Text className="text-gray-300 text-sm">{item}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap gap-3">
              <Pressable
                onPress={onStartCreating}
                accessibilityRole="button"
                accessibilityLabel="Start creating"
                testID="launch-start-creating"
                className="bg-brand-primary rounded-xl px-6 py-4 active:opacity-80"
              >
                <Text className="text-white text-base font-bold">Start creating</Text>
              </Pressable>

              <Pressable
                onPress={openSource}
                accessibilityRole="link"
                accessibilityLabel="View source"
                testID="launch-view-source"
                className="rounded-xl px-6 py-4 border border-dark-border bg-dark-card active:opacity-80"
              >
                <Text className="text-white text-base font-semibold">View source</Text>
              </Pressable>
            </View>
          </View>

          <View className="pt-6 border-t border-dark-border flex-row flex-wrap justify-between gap-4">
            <Text className="text-gray-500 text-xs" style={{ maxWidth: 680 }}>
              Alpha software: keep an independent backup of important work. Local project
              creation is local-first; optional account, collaboration, processing, and AI
              workflows can use hosted services.
            </Text>
            <Text className="text-gray-600 text-xs">Build in public · MIT source</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
