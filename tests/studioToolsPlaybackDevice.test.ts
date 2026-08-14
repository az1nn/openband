import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Studio Tools & Device Playback Bridge Suite", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
  });

  it("tauriBridge handles desktop stub operations safely", async () => {
    const { tauriBridge } = await import("../src/bridge/tauri");
    expect(await tauriBridge.showOpenDialog({})).toBeNull();
    expect(await tauriBridge.showSaveDialog({})).toBeNull();
    expect(await tauriBridge.getDocumentsPath()).toBe("");
    expect(await tauriBridge.getAppDataPath()).toBe("");
    expect(await tauriBridge.listProjects()).toEqual([]);
    expect(await tauriBridge.loadProject("1")).toBeNull();
    expect(await tauriBridge.enumerateAudioDevices()).toEqual({ inputs: [], outputs: [] });
  });

  it("browserBridge provides functional local storage and fallback capabilities", async () => {
    const { browserBridge } = await import("../src/bridge/browser");
    const docs = await browserBridge.getDocumentsPath();
    expect(typeof docs).toBe("string");

    await browserBridge.saveProject("test-proj", JSON.stringify({ name: "Demo" }));
    const loaded = await browserBridge.loadProject("test-proj");
    expect(loaded).toContain("Demo");

    const projects = await browserBridge.listProjects();
    expect(projects.length).toBeGreaterThanOrEqual(1);

    await browserBridge.deleteProject("test-proj");
    const afterDelete = await browserBridge.loadProject("test-proj");
    expect(afterDelete).toBeNull();
  });

  it("OpenBandNative auto-detects Tauri environment when window.__TAURI__ is present", async () => {
    (window as unknown as { __TAURI__?: unknown }).__TAURI__ = { invoke: vi.fn() };
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;

    const { OpenBandNative, isDesktop } = await import("../src/bridge/index");
    expect(isDesktop).toBe(true);
    const docPath = await OpenBandNative.getDocumentsPath();
    expect(docPath).toBe("");
  });

  it("OpenBandNative auto-detects Electron environment when window.electronAPI is present", async () => {
    const fakeAPI = {
      showOpenDialog: vi.fn().mockResolvedValue("/path/audio.wav"),
      showSaveDialog: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
      getDocumentsPath: vi.fn().mockResolvedValue("/home/user/Documents"),
      getAppDataPath: vi.fn(),
      listProjects: vi.fn().mockResolvedValue([]),
      saveProject: vi.fn(),
      loadProject: vi.fn(),
      deleteProject: vi.fn(),
      onMenuAction: vi.fn(),
      removeMenuActionListener: vi.fn(),
      enumerateAudioDevices: vi.fn().mockResolvedValue({ inputs: [], outputs: [] }),
      openHardwareInput: vi.fn().mockResolvedValue(true),
      closeHardwareInput: vi.fn(),
      createPatchRoute: vi.fn(),
      removePatchRoute: vi.fn(),
      getPatchRoutes: vi.fn().mockResolvedValue([]),
    };

    (window as unknown as { electronAPI: unknown }).electronAPI = fakeAPI;
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;

    const { OpenBandNative, isDesktop, isElectron } = await import("../src/bridge/index");
    expect(isDesktop).toBe(true);
    expect(isElectron).toBe(true);

    const docPath = await OpenBandNative.getDocumentsPath();
    expect(docPath).toBe("/home/user/Documents");

    const opened = await OpenBandNative.showOpenDialog({});
    expect(opened).toBe("/path/audio.wav");
    expect(fakeAPI.showOpenDialog).toHaveBeenCalled();
  });
});
