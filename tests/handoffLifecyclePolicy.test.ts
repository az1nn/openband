import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const sessionRouter = read(".qwen/skills/auto-skill-session-router/SKILL.md");
const continueSkill = read(".qwen/skills/auto-skill-continue-work/SKILL.md");
const cavemanSkill = read(".qwen/skills/auto-skill-caveman-handoff/SKILL.md");
const compatibilitySkill = read(
  ".qwen/skills/auto-skill-verified-context-handoff/SKILL.md",
);
const agents = read("AGENTS.md");
const contextPolicy = read("docs/ai/context-handoff.md");
const sessionPolicy = read("docs/ai/session-routing.md");
const projectInstructions = read("docs/ai/chatgpt-project-instructions.md");
const template = read("docs/ai/session-handoff-template.md");

const executionSkillRefs = [
  ".qwen/skills/auto-skill-continue-work/SKILL.md",
  ".qwen/skills/auto-skill-caveman-handoff/SKILL.md",
];

const sessionRouterRef = ".qwen/skills/auto-skill-session-router/SKILL.md";

describe("task-lived handoff lifecycle policy", () => {
  it("routes standalone siga before task execution", () => {
    expect(sessionRouter).toContain("ONE TASK = ONE CHAT");
    expect(sessionRouter).toContain("ACTIVE");
    expect(sessionRouter).toContain("WAITING");
    expect(sessionRouter).toContain("NEXT");
    expect(sessionRouter).toContain("standalone command");
    expect(sessionRouter).toContain("<!-- openband-session-lease -->");
    expect(sessionRouter).toContain("must never roll forward into a distinct next task");

    for (const ref of executionSkillRefs) {
      expect(sessionRouter).toContain(ref);
    }
  });

  it("keeps session routing derived from canonical repository state", () => {
    expect(sessionPolicy).toContain("ONE TASK = ONE CHAT");
    expect(sessionPolicy).toContain("Operational status belongs to GitHub Issues/PRs");
    expect(sessionPolicy).toContain("<!-- openband-session-lease -->");
    expect(sessionPolicy).toContain("Routine `siga` is not takeover authorization");
    expect(sessionPolicy).toContain(
      "must not execute it in the same chat",
    );
  });

  it("keeps continue-work responsible for live tasks", () => {
    expect(continueSkill).toContain("safe work remains? continue it");
    expect(continueSkill).toContain("ONLY_USER_SAID_GENERATE_HANDOFF");
    expect(continueSkill).toContain("It never emits a handoff itself");
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
    for (const ref of executionSkillRefs) {
      expect(compatibilitySkill).toContain(ref);
    }
    expect(compatibilitySkill).toContain(
      "user asks for handoff -> stop task -> emit handoff",
    );
    expect(compatibilitySkill).toContain("Never use:");
  });

  it("converges repository policy on session-first and continue-first semantics", () => {
    for (const source of [agents, projectInstructions]) {
      expect(source).toContain(sessionRouterRef);
      expect(source).toContain("ONE TASK = ONE CHAT");
    }

    for (const source of [agents, contextPolicy, projectInstructions]) {
      for (const ref of executionSkillRefs) {
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
