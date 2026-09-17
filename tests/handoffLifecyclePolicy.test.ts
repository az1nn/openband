import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const sessionRouterAdapter = read(".qwen/skills/auto-skill-session-router/SKILL.md");
const sessionRouter = read(".agents/skills/openband-session-router/SKILL.md");
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

const sessionRouterAdapterRef = ".qwen/skills/auto-skill-session-router/SKILL.md";
const canonicalSessionRouterRef = ".agents/skills/openband-session-router/SKILL.md";

describe("task-lived handoff lifecycle policy", () => {
  it("routes standalone siga through the canonical OpenBand project skill", () => {
    expect(sessionRouterAdapter).toContain(canonicalSessionRouterRef);
    expect(sessionRouterAdapter).toContain("standalone `siga`");
    expect(sessionRouterAdapter).toContain("az1nn/openband");
    expect(sessionRouterAdapter).toContain("OPENBAND AGENT TREE");
    expect(sessionRouterAdapter).toContain("ACTIVE/OBSERVER");
    expect(sessionRouterAdapter).toContain("ONE TASK = ONE CHAT");
  });

  it("hard-locks siga to the canonical OpenBand repository", () => {
    for (const source of [sessionRouter, sessionPolicy, projectInstructions]) {
      expect(source).toContain("az1nn/openband");
      expect(source).toContain("REPO_MISMATCH");
    }

    expect(sessionRouter).toContain("Repository identity is a hard safety boundary");
    expect(sessionRouter).toContain("perform no mutation");
    expect(projectInstructions).toContain("Never infer the repository");
  });

  it("requires a visible agent tree before long siga work", () => {
    for (const source of [sessionRouter, sessionPolicy, projectInstructions]) {
      expect(source).toContain("OPENBAND AGENT TREE");
      expect(source).toContain("RepoProbe");
      expect(source).toContain("GitHubProbe");
      expect(source).toContain("SpecKitProbe");
      expect(source).toContain("EvidenceProbe");
      expect(source).toContain("DependencyProbe");
    }

    expect(sessionRouter).toContain("show all currently relevant live task branches");
    expect(sessionPolicy).toContain("explicit dependencies");
  });

  it("keeps foreign active sessions read-only instead of duplicating ownership", () => {
    for (const source of [sessionRouter, sessionPolicy, projectInstructions]) {
      expect(source).toContain("ACTIVE/OBSERVER");
      expect(source).toContain("READ-ONLY EVIDENCE MAY FAN OUT");
      expect(source).toContain("TASK AUTHORITY MAY NOT");
    }

    expect(sessionRouter).toContain("must **not** duplicate implementation");
    expect(sessionRouter).toContain("Routine `siga` alone does not grant write authority");
    expect(sessionPolicy).toContain("must not mutate the task branch");
    expect(projectInstructions).toContain("must not mutate that task");
  });

  it("keeps Spec Kit as lifecycle authority after session routing", () => {
    expect(sessionRouter).toContain("Spec Kit remains the engineering lifecycle authority");
    expect(sessionRouter).toContain(".agents/skills/openband-ask/SKILL.md");
    expect(sessionRouter).toContain("openband-ask");
    expect(sessionRouter).toContain("Spec Kit workflow when required");
  });

  it("keeps session routing derived from canonical repository state", () => {
    expect(sessionPolicy).toContain("ONE TASK = ONE CHAT");
    expect(sessionPolicy).toContain("Operational status belongs to GitHub Issues/PRs");
    expect(sessionPolicy).toContain("<!-- openband-session-lease -->");
    expect(sessionPolicy).toContain("Elapsed time alone does not prove abandonment");
    expect(sessionPolicy).toContain("must not execute it in the same chat");
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

  it("keeps the legacy handoff entrypoint as a compatibility router", () => {
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
      expect(source).toContain(sessionRouterAdapterRef);
      expect(source).toContain("ONE TASK = ONE CHAT");
    }

    expect(agents).toContain(canonicalSessionRouterRef);
    expect(projectInstructions).toContain(canonicalSessionRouterRef);

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
