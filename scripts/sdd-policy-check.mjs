import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TIERS = new Set(["T0", "T1", "T2", "T3", "T4"]);
const ALLOWED_KEYS = new Set(["schemaVersion", "tier", "issue", "riskTriggers", "dependsOn", "requiredChecks"]);
const T2_PLUS = new Set(["T2", "T3", "T4"]);
const T3_PLUS = new Set(["T3", "T4"]);
const FORBIDDEN_MUTABLE_KEYS = new Set([
  "status",
  "progress",
  "assignee",
  "currentTask",
  "retries",
  "convergeStatus",
  "approved",
  "designApproved",
  "finalApproved",
]);

const LIVE_GOVERNANCE_FILES = [
  ".specify/memory/constitution.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  ".agents/skills/openband-ask/SKILL.md",
  ".agents/skills/openband-session-router/SKILL.md",
  ".qwen/skills/auto-skill-session-router/SKILL.md",
  ".qwen/skills/auto-skill-continue-work/SKILL.md",
  ".qwen/skills/auto-skill-caveman-handoff/SKILL.md",
  ".qwen/skills/auto-skill-verified-context-handoff/SKILL.md",
  "sdd/README.md",
  "docs/ai/chatgpt-project-instructions.md",
  "docs/ai/context-handoff.md",
  "docs/ai/durable-context.md",
  "docs/ai/session-routing.md",
  "docs/ai/session-handoff-template.md",
  "docs/ai/siga-orchestration.md",
  "docs/ai/siga-capabilities.json",
];

const STALE_MERGE_PHRASES = [
  "human merge gate",
  "ready_for_human",
  "human design/merge gates",
  "merged by a human",
  "human merges the verified pr head",
  "authorize a t2+ merge",
];

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function featureDirs(root) {
  const specs = path.join(root, "specs");
  if (!fs.existsSync(specs)) return [];
  return fs
    .readdirSync(specs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(specs, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function duplicateStrings(values) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function checkStringArray(errors, feature, key, value) {
  if (value === undefined && key === "riskTriggers") return;
  if (!Array.isArray(value)) {
    errors.push(`${feature}: '${key}' must be an array`);
    return;
  }
  if (value.some((item) => typeof item !== "string" || item.trim() === "")) {
    errors.push(`${feature}: '${key}' must contain only non-empty strings`);
  }
  const duplicates = duplicateStrings(value);
  if (duplicates.length > 0) {
    errors.push(`${feature}: '${key}' contains duplicates: ${duplicates.join(", ")}`);
  }
}

function architectureDecisionIsExplicit(plan) {
  const line = plan
    .split(/\r?\n/)
    .find((candidate) => /\bADR\s*:/i.test(candidate));
  if (!line) return false;
  const normalized = line.replace(/[*_`]/g, "");
  return /ADR\s*:\s*NOT REQUIRED\b/i.test(normalized) || /ADR\s*:\s*docs\/adr\//i.test(normalized);
}

export function checkFeature(root, dir) {
  const errors = [];
  const feature = path.basename(dir);
  const metadataPath = path.join(dir, "openband.json");
  if (!fs.existsSync(metadataPath)) return errors;

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch (error) {
    return [`${feature}: openband.json is invalid JSON (${error.message})`];
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [`${feature}: openband.json must contain an object`];
  }

  for (const key of Object.keys(metadata)) {
    if (FORBIDDEN_MUTABLE_KEYS.has(key)) {
      errors.push(`${feature}: mutable workflow field '${key}' is forbidden in openband.json`);
    } else if (!ALLOWED_KEYS.has(key)) {
      errors.push(`${feature}: unknown openband.json field '${key}'`);
    }
  }

  if (![1, 2].includes(metadata.schemaVersion)) errors.push(`${feature}: schemaVersion must be 1 or 2`);
  if (!TIERS.has(metadata.tier)) errors.push(`${feature}: tier must be T0, T1, T2, T3 or T4`);
  if (!Number.isInteger(metadata.issue) || metadata.issue < 1) {
    errors.push(`${feature}: issue must be a positive integer`);
  }
  checkStringArray(errors, feature, "riskTriggers", metadata.riskTriggers);
  checkStringArray(errors, feature, "dependsOn", metadata.dependsOn);
  if (metadata.requiredChecks !== undefined) checkStringArray(errors, feature, "requiredChecks", metadata.requiredChecks);
  if (
    metadata.schemaVersion === 2 &&
    T2_PLUS.has(metadata.tier) &&
    (!Array.isArray(metadata.requiredChecks) || metadata.requiredChecks.length === 0)
  ) {
    errors.push(`${feature}: schemaVersion 2 T2+ requires non-empty requiredChecks`);
  }

  for (const dependency of Array.isArray(metadata.dependsOn) ? metadata.dependsOn : []) {
    if (!fs.existsSync(path.join(root, "specs", dependency))) {
      errors.push(`${feature}: dependency '${dependency}' does not resolve to specs/${dependency}`);
    }
  }

  if (T2_PLUS.has(metadata.tier)) {
    for (const artifact of ["spec.md", "plan.md", "tasks.md"]) {
      if (!fs.existsSync(path.join(dir, artifact))) {
        errors.push(`${feature}: ${metadata.tier} requires ${artifact}`);
      }
    }
  }

  const plan = readText(path.join(dir, "plan.md"));
  if (T3_PLUS.has(metadata.tier) && plan !== null && !architectureDecisionIsExplicit(plan)) {
    errors.push(`${feature}: ${metadata.tier} plan must contain 'ADR: docs/adr/...' or 'ADR: NOT REQUIRED'`);
  }

  if (metadata.tier === "T4" && plan !== null) {
    if (!/adversarial/i.test(plan)) errors.push(`${feature}: T4 plan must include adversarial verification`);
    if (!/(rollback|recovery)/i.test(plan)) errors.push(`${feature}: T4 plan must include rollback or recovery planning`);
  }

  return errors;
}

export function checkLiveGovernance(root) {
  const errors = [];

  for (const relative of LIVE_GOVERNANCE_FILES) {
    const content = readText(path.join(root, relative));
    if (content === null) continue;
    const normalized = content.toLowerCase();
    for (const phrase of STALE_MERGE_PHRASES) {
      if (normalized.includes(phrase)) {
        errors.push(`${relative}: stale merge semantics '${phrase}'`);
      }
    }
  }

  const agents = readText(path.join(root, "AGENTS.md"));
  if (agents !== null) {
    if (!/AUTOMATED DESIGN VALIDATION/.test(agents)) {
      errors.push("AGENTS.md: must define AUTOMATED DESIGN VALIDATION for T2+");
    }
    if (!/EVIDENCE-DRIVEN MERGE GATE/.test(agents)) {
      errors.push("AGENTS.md: must define EVIDENCE-DRIVEN MERGE GATE");
    }
    if (!/exact merge-candidate HEAD/i.test(agents)) {
      errors.push("AGENTS.md: Merge Gate must be bound to the exact merge-candidate HEAD");
    }
  }

  const constitution = readText(path.join(root, ".specify/memory/constitution.md"));
  if (constitution !== null) {
    if (!/evidence-driven/i.test(constitution) || !/exact candidate HEAD/i.test(constitution)) {
      errors.push("constitution: PR-first governance must define evidence-driven exact-HEAD merge authorization");
    }
  }

  const handoff = readText(path.join(root, "docs/ai/session-handoff-template.md"));
  if (handoff !== null && !/Merge Gate: `[^`]*SATISFIED/.test(handoff)) {
    errors.push("session handoff: Merge Gate state must include SATISFIED");
  }

  return errors;
}

export function checkSigaOrchestration(root) {
  const errors = [];
  const corePath = path.join(root, "docs/ai/siga-orchestration.md");
  const manifestPath = path.join(root, "docs/ai/siga-capabilities.json");
  const canonicalPath = path.join(root, ".agents/skills/openband-session-router/SKILL.md");
  const compatibilityPath = path.join(root, ".qwen/skills/auto-skill-session-router/SKILL.md");

  const core = readText(corePath);
  const canonical = readText(canonicalPath);
  const compatibility = readText(compatibilityPath);

  if (core === null) {
    errors.push("SIGA: missing docs/ai/siga-orchestration.md");
  } else {
    if (!/REAL STATE > REPOSITORY HANDOFF > MEMORY > CHAT/.test(core)) {
      errors.push("SIGA: core must preserve real-state authority ordering");
    }
    for (const token of ["RECONCILE", "DECIDE", "EXECUTE", "VERIFY", "PERSIST", "RESUME", "WATCH", "ADVANCE"]) {
      if (!new RegExp(`\\b${token}\\b`).test(core)) errors.push(`SIGA: core missing '${token}'`);
    }
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`SIGA: invalid/missing capability manifest (${error.message})`);
  }

  if (manifest) {
    if (manifest?.siga?.protocol !== 1) errors.push("SIGA: capability manifest protocol must be 1");
    if (manifest?.siga?.architecture !== "repository-local") errors.push("SIGA: architecture must be repository-local");
    if (manifest?.siga?.stateScope !== "repository") errors.push("SIGA: state scope must be repository-local");
    if (manifest?.siga?.authority !== "derived") errors.push("SIGA: checkpoint authority must be derived");
    if (manifest?.siga?.canonicalSkill !== ".agents/skills/openband-session-router/SKILL.md") {
      errors.push("SIGA: canonicalSkill must point to the OpenBand session router");
    }
    if (manifest?.checkpoint?.standalone_mutable_store !== false) {
      errors.push("SIGA: standalone mutable checkpoint store is forbidden");
    }

    const capabilities = manifest?.capabilities;
    const adapters = manifest?.adapters;
    if (!capabilities || typeof capabilities !== "object" || Array.isArray(capabilities)) {
      errors.push("SIGA: capabilities must be an object");
    } else {
      for (const [name, enabled] of Object.entries(capabilities)) {
        if (typeof enabled !== "boolean") errors.push(`SIGA: capability '${name}' must be boolean`);
        if (enabled === true && (!adapters || typeof adapters[name] !== "string" || adapters[name].trim() === "")) {
          errors.push(`SIGA: enabled capability '${name}' requires a local adapter`);
        }
      }
    }
  }

  if (canonical === null) {
    errors.push("SIGA: canonical session-router skill is missing");
  } else {
    for (const token of ["RESUME", "WATCH", "ADVANCE", "docs/ai/siga-orchestration.md", "docs/ai/siga-capabilities.json"]) {
      if (!canonical.includes(token)) errors.push(`SIGA: canonical skill missing '${token}'`);
    }
  }

  if (compatibility === null || !compatibility.includes(".agents/skills/openband-session-router/SKILL.md")) {
    errors.push("SIGA: compatibility router must delegate to the canonical skill");
  }

  for (const duplicate of [".siga/SKILL.md", "SIGA.md", "skills/siga/SKILL.md"]) {
    if (fs.existsSync(path.join(root, duplicate))) errors.push(`SIGA: duplicate canonical implementation at ${duplicate}`);
  }
  for (const central of ["maestri", ".maestri"]) {
    if (fs.existsSync(path.join(root, central))) errors.push(`SIGA: forbidden central runtime path '${central}'`);
  }

  return errors;
}

export function checkRepository(root = process.cwd()) {
  const errors = [];
  for (const dir of featureDirs(root)) errors.push(...checkFeature(root, dir));
  errors.push(...checkLiveGovernance(root));
  errors.push(...checkSigaOrchestration(root));
  return errors;
}

export function runPolicyCheck(root = process.cwd()) {
  const errors = checkRepository(root);
  if (errors.length === 0) {
    process.stdout.write("SDD policy: PASS\n");
    return 0;
  }
  process.stderr.write(`SDD policy: FAIL (${errors.length})\n`);
  for (const error of errors) process.stderr.write(`  - ${error}\n`);
  return 1;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const rootIndex = process.argv.indexOf("--root");
  const root = rootIndex >= 0 && process.argv[rootIndex + 1]
    ? path.resolve(process.argv[rootIndex + 1])
    : process.cwd();
  process.exitCode = runPolicyCheck(root);
}
