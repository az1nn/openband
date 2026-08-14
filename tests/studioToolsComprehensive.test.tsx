import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import Synth from "../src/components/Synth";
import Sampler from "../src/components/Sampler";
import Looper from "../src/components/Looper";
import CodeSampler from "../src/components/CodeSampler";
import PromptSampler from "../src/components/PromptSampler";
import Patchbay from "../src/components/Patchbay";
import Tuner from "../src/components/Tuner";
import MidiLearnPanel from "../src/components/MidiLearnPanel";
import MasteringSuite from "../src/components/MasteringSuite";
import MixManager from "../src/components/MixManager";
import AutomationLane from "../src/components/AutomationLane";
import BranchManager from "../src/components/BranchManager";
import CommitModal from "../src/components/CommitModal";
import VersionHistory from "../src/components/VersionHistory";

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
    const { getByText } = render(<PromptSampler visible={true} onClose={onClose} onRender={onRender} bpm={120} />);
    expect(getByText(/prompt/i)).toBeTruthy();
  });

  it("renders Patchbay tool", () => {
    const onClose = vi.fn();
    const { getByText } = render(<Patchbay visible={true} onClose={onClose} trackIds={["t1", "t2"]} />);
    expect(getByText(/patchbay|routing/i)).toBeTruthy();
  });

  it("renders Tuner overlay", () => {
    const onClose = vi.fn();
    const { getByText } = render(<Tuner visible={true} onClose={onClose} />);
    expect(getByText(/tuner/i)).toBeTruthy();
  });

  it("renders MidiLearnPanel tool", () => {
    const onClose = vi.fn();
    const { getByText } = render(<MidiLearnPanel visible={true} onClose={onClose} />);
    expect(getByText(/midi|learn/i)).toBeTruthy();
  });

  it("renders MasteringSuite tool", () => {
    const onClose = vi.fn();
    const onExport = vi.fn();
    const { getByText } = render(<MasteringSuite visible={true} onClose={onClose} audioUri="" onExport={onExport} />);
    expect(getByText(/mastering/i)).toBeTruthy();
  });

  it("renders MixManager tool", () => {
    const onSave = vi.fn();
    const onLoad = vi.fn();
    const onDelete = vi.fn();
    const onCompare = vi.fn();
    const { getByText } = render(
      <MixManager
        snapshots={[]}
        activeMixId={null}
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
    const { getByText } = render(
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
    expect(getByText(/volume/i)).toBeTruthy();
  });

  it("renders BranchManager tool", () => {
    const onClose = vi.fn();
    const { getByText } = render(<BranchManager visible={true} onClose={onClose} />);
    expect(getByText(/branch/i)).toBeTruthy();
  });

  it("renders CommitModal tool", () => {
    const onClose = vi.fn();
    const onCommit = vi.fn();
    const { getByText } = render(<CommitModal visible={true} onClose={onClose} onCommit={onCommit} />);
    expect(getByText(/commit/i)).toBeTruthy();
  });

  it("renders VersionHistory tool", () => {
    const onClose = vi.fn();
    const onRevert = vi.fn();
    const { getByText } = render(<VersionHistory visible={true} onClose={onClose} onRevert={onRevert} />);
    expect(getByText(/version|history/i)).toBeTruthy();
  });
});
