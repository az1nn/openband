const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const stubPath = path.resolve(__dirname, "scripts", "expo-fx-stub.js");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  resolveRequest(context, moduleName, platform) {
    if (
      moduleName === "./Expo.fx" &&
      context.originModulePath.replace(/\\/g, "/").includes("node_modules/expo/src/Expo.ts")
    ) {
      const candidate = path.resolve(path.dirname(context.originModulePath), "Expo.fx");
      if (!fs.existsSync(candidate)) {
        return { filePath: stubPath, type: "sourceFile" };
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
