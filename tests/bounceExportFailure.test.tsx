import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Alert } from "react-native";
import { BounceDialog } from "../src/components/BounceDialog";

const mocks = vi.hoisted(() => ({
  renderProjectWav: vi.fn(),
  exportToFile: vi.fn(),
  initialize: vi.fn(),
}));

vi.mock("../src/lib/exportTrust", () => {
  class ExportTrustError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.name = "ExportTrustError";
      this.code = code;
    }
  }
  return {
    ExportTrustError,
    renderProjectWav: mocks.renderProjectWav,
    validateWavBlob: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../src/lib/universalAudio", () => ({
  audioSystem: {
    initialize: mocks.initialize,
    exportToFile: mocks.exportToFile,
    renderMixdown: vi.fn(),
  },
}));

vi.mock("../src/lib/videoExport", () => ({
  exportVideo: vi.fn(),
  downloadVideoFile: vi.fn(),
  isVideoExportSupported: vi.fn(() => false),
  renderVideoJob: vi.fn(),
}));

describe("BounceDialog strict export failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.initialize.mockResolvedValue(undefined);
    mocks.renderProjectWav.mockRejectedValue(new Error("asset decode failed"));
    vi.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("surfaces the failure explicitly and never downloads a file", async () => {
    render(
      <BounceDialog
        visible={true}
        onClose={() => {}}
        projectTitle="Failure fixture"
        duration={1}
        bpm={120}
        tracks={[
          {
            id: "track-1",
            name: "Missing source",
            color: "#fff",
            muted: false,
            solo: false,
            volume: 100,
            pan: 0,
            sends: {},
            regions: [
              {
                id: "region-1",
                start: 0,
                duration: 1,
                url: "asset://missing",
              },
            ],
            sidechainSource: null,
            plugins: [],
            automation: {},
            outputId: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("Exportar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Falha ao exportar mix. O projeto não foi alterado.",
      );
    });
    expect(mocks.exportToFile).not.toHaveBeenCalled();
  });
});
