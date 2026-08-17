import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createProject } from "../src/lib/stateAssetSeparation";

import { Synth } from "../src/components/Synth";
import { Sampler } from "../src/components/Sampler";
import { Looper } from "../src/components/Looper";
import { CodeSampler } from "../src/components/CodeSampler";
import { PromptSampler } from "../src/components/PromptSampler";
import { Patchbay } from "../src/components/Patchbay";
import { Tuner } from "../src/components/Tuner";
import { MidiLearnPanel } from "../src/components/MidiLearnPanel";
import { MasteringSuite } from "../src/components/MasteringSuite";
import { MixManager } from "../src/components/MixManager";
import { AutomationLane } from "../src/components/AutomationLane";
import { BranchManager } from "../src/components/BranchManager";
import { CommitModal } from "../src/components/CommitModal";
import { VersionHistory } from "../src/components/CommitModal";

describe("Comprehensive Studio Tools Test Suite", () => {
  it("renders Synth tool and handles close", () => {
    const onClose = vi.fn();
    const { getByText } = render(<Synth visible={true} onClose={onClose} bpm={120} />);
    expect(getByText(/synth/i)).toBeTruthy();
  });

  it("renders Sampler tool", () => {
    const onClose = vi.fn();
    const onAddToTrack = vi.fn();
    const { getByText } = render(<Sampler visible={true} onClose={onClose} onAddToTrack={onAddToTrack} />);
    expect(getByText(/sampler/i)).toBeTruthy();
  });

  it("renders Looper tool", () => {
    const onClose = vi.fn();
    const onCommitLoop = vi.fn();
    const { getByText } = render(<Looper visible={true} onClose={onClose} bpm={120} onCommitLoop={onCommitLoop} />);
    expect(getByText(/looper/i)).toBeTruthy();
  });

  it("renders CodeSampler tool", () => {
    const onClose = vi.fn();
    const onRender = vi.fn();
    const { getByText } = render(<CodeSampler visible={true} onClose={onClose} onRender={onRender} bpm={120} />);
    expect(getByText(/code/i)).toBeTruthy();
  });

  it("renders PromptSampler tool", () => {
    const onClose = vi.fn();
    const onRender = vi.fn();
    const { getAllByText } = render(<PromptSampler visible={true} onClose={onClose} onRender={onRender} bpm={120} />);
    expect(getAllByText(/prompt/i).length).toBeGreaterThan(0);
  });

  it("renders Patchbay tool", () => {
    const onClose = vi.fn();
    const { getByText } = render(<Patchbay visible={true} onClose={onClose} trackIds={["t1", "t2"]} />);
    expect(getByText(/patchbay|routing/i)).toBeTruthy();
  });

  it("renders Tuner overlay", () => {
    const onClose = vi.fn();
    const { getByText } = render(<Tuner visible={true} onClose={onClose} />);
    expect(getByText(/afinador/i)).toBeTruthy();
  });

  it("renders MidiLearnPanel tool", () => {
    const onClose = vi.fn();
    const { getAllByText } = render(<MidiLearnPanel visible={true} onClose={onClose} tracks={[]} />);
    expect(getAllByText(/midi|learn/i).length).toBeGreaterThan(0);
  });

  it("renders MasteringSuite tool", () => {
    const onClose = vi.fn();
    const { getAllByText } = render(<MasteringSuite onBack={onClose} />);
    expect(getAllByText(/mastering/i).length).toBeGreaterThan(0);
  });

  it("renders MixManager tool", () => {
    const onSave = vi.fn();
    const onLoad = vi.fn();
    const onDelete = vi.fn();
    const onCompare = vi.fn();
    const { getByText } = render(
      <MixManager
        snapshots={[]}
        activeMixId=""
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDelete}
        onCompare={onCompare}
      />
    );
    expect(getByText(/mix|snapshot/i)).toBeTruthy();
  });

  it("renders AutomationLane tool", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AutomationLane
        points={[]}
        onChange={onChange}
        duration={10}
        color="#fff"
        visible={true}
        label="Volume"
        minValue={0}
        maxValue={1}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders BranchManager tool", () => {
    const onClose = vi.fn();
    const { getByText } = render(<BranchManager visible={true} onClose={onClose} />);
    expect(getByText(/branch/i)).toBeTruthy();
  });

  it("renders CommitModal tool", () => {
    const onClose = vi.fn();
    const onCommit = vi.fn();
    const { getAllByText } = render(<CommitModal visible={true} onClose={onClose} onCommit={onCommit} />);
    expect(getAllByText(/commit/i).length).toBeGreaterThan(0);
  });

  it("renders VersionHistory tool", async () => {
    await createProject();
    const onClose = vi.fn();
    const onRevert = vi.fn();
    const { getAllByText } = render(<VersionHistory visible={true} onClose={onClose} onRevert={onRevert} />);
    expect(getAllByText(/version|history/i).length).toBeGreaterThan(0);
  });
});
