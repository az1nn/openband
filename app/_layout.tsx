import { Stack, useRouter, useSegments } from "expo-router";
import Head from "expo-router/head";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { View, Platform } from "react-native";
import { Loading } from "../src/components/Loading";
import { ToastProvider } from "../src/components/Toast";
import { audioSystem, disposeAllAudio } from "../src/lib/universalAudio";
import { isDesktop } from "../src/bridge";

import "../global.css";

function RootLayoutProtected() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/tabs");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <Loading message="Carregando..." />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#18181c" },
        headerTintColor: "#fff",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="extractor" options={{ headerShown: false }} />
      <Stack.Screen name="studio/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="mastering" options={{ headerShown: false }} />
      <Stack.Screen name="settings-ai" options={{ title: "IA & Chaves", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    import("../src/lib/i18n");
  }, []);

  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      !("serviceWorker" in navigator) ||
      isDesktop
    )
      return;
    const register = async () => {
      try {
        const resp = await fetch("/sw.js", { method: "HEAD" });
        if (!resp.ok) return;
        await navigator.serviceWorker.register("/sw.js");
      } catch (e) {
        console.warn("Service worker registration failed:", e);
      }
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const initAudio = () => { audioSystem.initialize().catch((e) => console.warn("audio init failed", e)); };
      document.addEventListener("pointerdown", initAudio, { once: true });
      document.addEventListener("keydown", initAudio, { once: true });
      return () => {
        document.removeEventListener("pointerdown", initAudio);
        document.removeEventListener("keydown", initAudio);
        disposeAllAudio();
      };
    } else {
      audioSystem.initialize();
      return () => {
        disposeAllAudio();
      };
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Head>
        <title>OpenBand — Make music. Keep the project.</title>
        <meta
          name="description"
          content="Record, arrange, mix, and export in a local-first, open-source browser studio without mandatory signup or project lock-in."
        />
        <meta name="application-name" content="OpenBand" />
        <meta name="theme-color" content="#0a0a0d" />
        <meta name="color-scheme" content="dark light" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OpenBand" />
        <meta property="og:title" content="OpenBand — Make music. Keep the project." />
        <meta
          property="og:description"
          content="Record, arrange, mix, and export in a local-first, open-source browser studio without mandatory signup or project lock-in."
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="OpenBand — Make music. Keep the project." />
        <meta
          name="twitter:description"
          content="Record, arrange, mix, and export in a local-first, open-source browser studio without mandatory signup or project lock-in."
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <View className="flex-1 bg-dark-bg">
        <StatusBar style="light" />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <RootLayoutProtected />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
