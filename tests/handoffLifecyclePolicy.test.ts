import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const continueSkill = read(".qwen/skills/auto-skill-continue-work/SKILL.md");
const cavemanSkill = read(".qwen/skills/auto-skill-caveman-handoff/SKILL.md");
const compatibilitySkill = read(
  ".qwen/skills/auto-skill-verified-context-handoff/SKILL.md",
);
const agents = read("AGENTS.md");
const contextPolicy = read("docs/ai/context-handoff.md");
const projectInstructions = read("docs/ai/chatgpt-project-instructions.md");
const template = read("docs/ai/session-handoff-template.md");

const canonicalSkillRefs = [
  ".qwen/skills/auto-skill-continue-work/SKILL.md",
  ".qwen/skills/auto-skill-caveman-handoff/SKILL.md",
];

describe("task-lived handoff lifecycle policy", () => {
  it("keeps continue-work responsible for live tasks", () => {
    expect(continueSkill).toContain("safe work remains? continue it");
    expect(continueSkill).toContain("ONLY_USER_SAID_GENERATE_HANDOFF");
    expect(continueSkill).toContain("It never emits a handoff itself").not;
    expect(continueSkill).toContain(
      ".qwen/skills/auto-skill-caveman-handoff/SKILL.md",
    );
  });

  it("makes Caveman closeout-only and rejects early emission", () => {
    expect(cavemanSkill).toContain("This skill is **closeout-only**");
    expect(cavemanSkill).toContain("SAFE_WORK_REMAINS");
    expect(cavemanSkill).toContain(
      ".qwen/skills/auto-skill-continue-work/SKILL.md",
    );
    expect(cavemanSkill).toContain("do not emit a handoff");
  });

  it("keeps the legacy entrypoint as a compatibility router", () => {
    for (const ref of canonicalSkillRefs) {
      expect(compatibilitySkill).toContain(ref);
    }
    expect(compatibilitySkill).toContain(
      "user asks for handoff -> stop task -> emit handoff",
    );
    expect(compatibilitySkill).toContain("Never use:");
  });

  it("converges repository policy on continue-first semantics", () => {
    for (const source of [agents, contextPolicy, projectInstructions]) {
      for (const ref of canonicalSkillRefs) {
        expect(source).toContain(ref);
      }
    }

    expect(agents).toContain("do **not** stop merely to emit a handoff");
    expect(contextPolicy).toContain(
      "user asks for handoff != permission to stop task",
    );
    expect(projectInstructions).toContain(
      "The user's handoff request specifies the eventual output",
    );
  });

  it("gates the template on a genuine task closeout boundary", () => {
    expect(template).toContain("A Caveman handoff is **closeout-only**");
    expect(template).toContain("TASK_COMPLETE");
    expect(template).toContain("BLOCKED_NO_SAFE_WORK");
    expect(template).toContain("HUMAN_GATE_NO_SAFE_WORK");
    expect(template).toContain("If `SAFE_WORK_REMAINS`");
  });
});
