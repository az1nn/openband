import { describe, it, expect } from "vitest";

interface AssistantIntent {
  action: string;
  payload: Record<string, unknown>;
}

function parsePrompt(prompt: string): AssistantIntent {
  const lower = prompt.toLowerCase();
  if (lower.includes("bpm") || lower.includes("tempo")) {
    const match = lower.match(/\d+/);
    const bpm = match ? parseInt(match[0], 10) : 120;
    return { action: "setBpm", payload: { bpm } };
  }
  if (lower.includes("chord") || lower.includes("progression")) {
    return { action: "generateChords", payload: { key: "C", style: "pop" } };
  }
  return { action: "unknown", payload: { prompt } };
}

describe("AI Audio Assistant & Voice Command Parser", () => {
  it("parses tempo / bpm adjustment prompts", () => {
    const res = parsePrompt("Please set tempo to 135 bpm");
    expect(res.action).toBe("setBpm");
    expect(res.payload.bpm).toBe(135);
  });

  it("parses chord progression generation prompts", () => {
    const res = parsePrompt("Generate a catchy chord progression");
    expect(res.action).toBe("generateChords");
    expect(res.payload.key).toBe("C");
  });

  it("handles unknown prompts gracefully", () => {
    const res = parsePrompt("Do something magical");
    expect(res.action).toBe("unknown");
    expect(res.payload.prompt).toBe("Do something magical");
  });
});
