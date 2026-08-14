import type { NativeBridge } from "./interface";
import { electronBridge } from "./electron";
import { tauriBridge } from "./tauri";
import { browserBridge } from "./browser";

export type {
  NativeBridge,
  OpenDialogOptions,
  SaveDialogOptions,
  ProjectMeta,
  BridgeAudioDevice,
  BridgeHardwareChannel,
  BridgePatchRoute,
} from "./interface";

type BridgeEnvironment = "electron" | "tauri" | "browser";

function detectEnvironment(): BridgeEnvironment {
  if (typeof window === "undefined") {
    return "browser";
  }

  if (window.electronAPI) {
    return "electron";
  }

  if (window.__TAURI__) {
    return "tauri";
  }

  return "browser";
}

const environment = detectEnvironment();

export const isDesktop = environment !== "browser";
export const isElectron = environment === "electron";

function detectBridge(): NativeBridge {
  switch (environment) {
    case "electron":
      return electronBridge;
    case "tauri":
      return tauriBridge;
    default:
      return browserBridge;
  }
}

export const OpenBandNative: NativeBridge = detectBridge();
