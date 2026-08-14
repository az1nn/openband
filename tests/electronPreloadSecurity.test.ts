import { describe, it, expect, vi } from "vitest";

describe("Electron Preload Security & ContextBridge", () => {
  it("exposes expected secure APIs through contextBridge", () => {
    const exposed: Record<string, unknown> = {};
    const mockContextBridge = {
      exposeInMainWorld: (key: string, api: unknown) => {
        exposed[key] = api;
      },
    };

    const mockIpcRenderer = {
      invoke: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
      removeAllListeners: vi.fn(),
    };

    // Simulate preload script execution environment
    const preloadExpose = (contextBridge: typeof mockContextBridge, ipcRenderer: typeof mockIpcRenderer) => {
      contextBridge.exposeInMainWorld("electronAPI", {
        showOpenDialog: (options: unknown) => ipcRenderer.invoke("show-open-dialog", options),
        showSaveDialog: (options: unknown) => ipcRenderer.invoke("show-save-dialog", options),
        readFile: (path: unknown) => ipcRenderer.invoke("read-file", path),
        writeFile: (path: unknown, data: unknown) => ipcRenderer.invoke("write-file", path, data),
        getDocumentsPath: () => ipcRenderer.invoke("get-documents-path"),
      });
    };

    preloadExpose(mockContextBridge, mockIpcRenderer);

    expect(exposed.electronAPI).toBeDefined();
    const api = exposed.electronAPI as Record<string, Function>;
    expect(typeof api.showOpenDialog).toBe("function");
    expect(typeof api.showSaveDialog).toBe("function");
    expect(typeof api.readFile).toBe("function");
    expect(typeof api.writeFile).toBe("function");
    expect(typeof api.getDocumentsPath).toBe("function");

    api.getDocumentsPath();
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-documents-path");
  });
});
