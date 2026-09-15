import { Redirect, useRouter } from "expo-router";
import { Platform } from "react-native";
import { WebLaunchLanding } from "../src/components/WebLaunchLanding";

export default function Index() {
  const router = useRouter();

  if (Platform.OS !== "web") {
    return <Redirect href="/tabs" />;
  }

  return <WebLaunchLanding onStartCreating={() => router.push("/login")} />;
}
