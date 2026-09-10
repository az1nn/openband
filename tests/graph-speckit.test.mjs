import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createGraph, createNode, addNode, serialize } from "../graph/core.mjs";
import { normativeSpecFiles, scanSpecs } from "../graph/specs.mjs";
import { checkRepository } from "../scripts/sdd-policy-check.mjs";

const roots = [];

function tmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openband-graph-"));
  roots.push(root);
  return root;
}

function write(root, rel, content = "") {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function validFeature(root, name, tier = "T3", planExtra = "") {
  write(root, `specs/${name}/spec.md`, "# Spec\n");
  write(root, `specs/${name}/plan.md`, `# Plan\n\nADR: NOT REQUIRED\n${planExtra}\n`);
  write(root, `specs/${name}/tasks.md`, "# Tasks\n");
  write(
    root,
    `specs/${name}/openband.json`,
    JSON.stringify({ schemaVersion: 1, tier, issue: 1, riskTriggers: [], dependsOn: [] }, null, 2)
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("Spec Kit Architecture Graph", () => {
  it("scans only normative feature and durable knowledge artifacts", () => {
    const root = tmpRoot();
    write(root, "specs/001-feature/spec.md", "References src/domain.ts");
    write(root, "specs/001-feature/tasks.md", "References src/ignored.ts");
    write(root, ".specify/templates/spec-template.md", "References src/ignored.ts");
    write(root, "docs/architecture.md", "References src/domain.ts");
    write(root, "docs/adr/0001-boundary.md", "References src/domain.ts");
    write(root, "docs/contracts/project.md", "References src/domain.ts");
    write(root, "docs/random.md", "References src/ignored.ts");

    const rel = normativeSpecFiles(root).map((file) => path.relative(root, file).replaceAll(path.sep, "/"));
    expect(rel).toEqual([
      "docs/adr/0001-boundary.md",
      "docs/architecture.md",
      "docs/contracts/project.md",
      "specs/001-feature/spec.md",
    ]);
  });

  it("creates specifies edges from Spec Kit spec.md and ignores tasks/.specify", () => {
    const root = tmpRoot();
    write(root, "src/domain.ts", "export const domain = true;\n");
    write(root, "src/ignored.ts", "export const ignored = true;\n");
    write(root, "specs/001-feature/spec.md", "Use src/domain.ts");
    write(root, "specs/001-feature/tasks.md", "Use src/ignored.ts");
    write(root, ".specify/memory/constitution.md", "Use src/ignored.ts");

    const graph = createGraph();
    addNode(graph, createNode("src/domain.ts", "source", "src/domain.ts"));
    addNode(graph, createNode("src/ignored.ts", "source", "src/ignored.ts"));
    scanSpecs(root, { graph });

    expect(graph.nodes.some((node) => node.id === "specs/001-feature/spec.md" && node.type === "spec")).toBe(true);
    expect(graph.nodes.some((node) => node.id.endsWith("tasks.md"))).toBe(false);
    expect(graph.nodes.some((node) => node.id.startsWith(".specify/"))).toBe(false);
    expect(graph.edges).toContainEqual({
      source: "specs/001-feature/spec.md",
      target: "src/domain.ts",
      type: "specifies",
      spec: "specs/001-feature/spec.md",
    });
    expect(graph.edges.some((edge) => edge.target === "src/ignored.ts")).toBe(false);
  });

  it("serializes deterministically", () => {
    const root = tmpRoot();
    write(root, "src/domain.ts", "export const domain = true;\n");
    write(root, "specs/001-feature/spec.md", "Use src/domain.ts");

    const build = () => {
      const graph = createGraph();
      addNode(graph, createNode("src/domain.ts", "source", "src/domain.ts"));
      scanSpecs(root, { graph });
      return serialize(graph);
    };

    expect(build()).toBe(build());
  });
});

describe("OpenBand SDD policy", () => {
  it("accepts a valid T3 feature", () => {
    const root = tmpRoot();
    validFeature(root, "001-valid");
    expect(checkRepository(root)).toEqual([]);
  });

  it("rejects mutable workflow state in openband.json", () => {
    const root = tmpRoot();
    validFeature(root, "001-invalid");
    const metadata = path.join(root, "specs/001-invalid/openband.json");
    const data = JSON.parse(fs.readFileSync(metadata, "utf8"));
    data.status = "approved";
    fs.writeFileSync(metadata, JSON.stringify(data), "utf8");

    expect(checkRepository(root).some((error) => error.includes("mutable workflow field 'status'"))).toBe(true);
  });

  it("requires adversarial and recovery planning for T4", () => {
    const root = tmpRoot();
    validFeature(root, "001-critical", "T4");
    const errors = checkRepository(root);
    expect(errors.some((error) => error.includes("adversarial verification"))).toBe(true);
    expect(errors.some((error) => error.includes("rollback or recovery"))).toBe(true);
  });
});
