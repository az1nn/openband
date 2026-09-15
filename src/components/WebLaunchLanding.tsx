import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export const OPENBAND_SOURCE_URL = "https://github.com/az1nn/openband";

interface WebLaunchLandingProps {
  onStartCreating: () => void;
  onViewSource?: () => void;
}

export function WebLaunchLanding({
  onStartCreating,
  onViewSource,
}: WebLaunchLandingProps) {
  const { height, width } = useWindowDimensions();
  const compact = width < 768;
  const openSource =
    onViewSource ?? (() => void Linking.openURL(OPENBAND_SOURCE_URL));

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
      testID="web-launch-landing"
    >
      <View style={[styles.shell, compact && styles.shellCompact]}>
        <View style={styles.content}>
          <View style={[styles.header, compact && styles.headerCompact]}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoGlyph}>♫</Text>
              </View>
              <Text style={styles.brandName}>OpenBand</Text>
            </View>
            <View style={styles.alphaBadge}>
              <Text style={styles.alphaText}>Web alpha</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Open-source music studio</Text>
            <Text
              style={[
                styles.headline,
                compact ? styles.headlineCompact : styles.headlineDesktop,
              ]}
            >
              Make music. Keep the project.
            </Text>
            <Text style={[styles.subhead, compact && styles.subheadCompact]}>
              Record, arrange, mix, and export in a local-first browser studio.
              Start creating without mandatory signup, then inspect the source whenever
              you want.
            </Text>

            <View style={styles.proofRow}>
              {[
                "Web first",
                "Local-first projects",
                "Free core creation",
                "Open source",
              ].map((item) => (
                <View key={item} style={styles.proofPill}>
                  <Text style={styles.proofText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.ctaRow}>
              <Pressable
                onPress={onStartCreating}
                accessibilityRole="button"
                accessibilityLabel="Start creating"
                testID="launch-start-creating"
                style={({ pressed }) => [
                  styles.cta,
                  styles.primaryCta,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryCtaText}>Start creating</Text>
              </Pressable>

              <Pressable
                onPress={openSource}
                accessibilityRole="link"
                accessibilityLabel="View source"
                testID="launch-view-source"
                style={({ pressed }) => [
                  styles.cta,
                  styles.sourceCta,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.sourceCtaText}>View source</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.footer, compact && styles.footerCompact]}>
            <Text style={styles.footerCopy}>
              Alpha software: keep an independent backup of important work. Local project
              creation is local-first; optional account, collaboration, processing, and AI
              workflows can use hosted services.
            </Text>
            <Text style={styles.footerMeta}>Build in public · MIT source</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0a0a0d",
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  shellCompact: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 1120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 64,
  },
  headerCompact: {
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 24,
  },
  brandName: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
  },
  alphaBadge: {
    minHeight: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2a2a32",
    backgroundColor: "#141418",
    alignItems: "center",
    justifyContent: "center",
  },
  alphaText: {
    color: "#d1d1d6",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  hero: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 64,
  },
  eyebrow: {
    color: "#ff3b30",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  headline: {
    color: "#ffffff",
    maxWidth: 780,
    fontWeight: "700",
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  headlineDesktop: {
    fontSize: 64,
    lineHeight: 68,
  },
  headlineCompact: {
    fontSize: 42,
    lineHeight: 46,
  },
  subhead: {
    color: "#a1a1aa",
    fontSize: 20,
    lineHeight: 32,
    maxWidth: 720,
    marginBottom: 36,
  },
  subheadCompact: {
    fontSize: 17,
    lineHeight: 27,
  },
  proofRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 40,
  },
  proofPill: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a32",
    backgroundColor: "#141418",
    alignItems: "center",
    justifyContent: "center",
  },
  proofText: {
    color: "#d1d1d6",
    fontSize: 14,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  cta: {
    alignSelf: "flex-start",
    minHeight: 52,
    minWidth: 150,
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCta: {
    backgroundColor: "#ff3b30",
  },
  sourceCta: {
    backgroundColor: "#141418",
    borderWidth: 1,
    borderColor: "#2a2a32",
  },
  pressed: {
    opacity: 0.8,
  },
  primaryCtaText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
  sourceCtaText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#2a2a32",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  footerCompact: {
    flexDirection: "column",
  },
  footerCopy: {
    color: "#8e8e93",
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 680,
  },
  footerMeta: {
    color: "#636366",
    fontSize: 12,
    lineHeight: 18,
  },
});
