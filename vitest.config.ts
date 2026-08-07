import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import okReporter from "./tests/ok-reporter";

const rootDir = process.cwd();

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/types.test.ts", "tests/presets.test.ts"],
    ...(isCI
      ? {
          pool: "forks",
          maxWorkers: 1,
          maxConcurrency: 1,
          execArgv: ["--max-old-space-size=4096"],
          isolate: true,
        }
      : {}),
    server: {
      deps: {
        inline: ["react-native"],
      },
    },
    reporters: [okReporter()],
    dangerouslyIgnoreUnhandledErrors: true,
    onUnhandledError: (error) => {
      console.error("[vitest] unhandled error (ignored):", error?.message || error);
    },
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
      "@bridge": resolve(rootDir, "./src/bridge/index.ts"),
      "@bridge/": resolve(rootDir, "./src/bridge/"),
    },
  },
  optimizeDeps: {
    exclude: ["react-native"],
  },
});
