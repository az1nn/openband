import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const errors = [];

function trackedFiles() {
  return execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

function readText(relative) {
  const file = path.join(root, relative);
  const stat = fs.statSync(file);
  if (stat.size > 1024 * 1024) return null;
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) return null;
  return buffer.toString("utf8");
}

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key material"],
  [/\bsk-proj-[A-Za-z0-9_-]{20,}\b/, "OpenAI project key"],
  [/\bghp_[A-Za-z0-9]{30,}\b/, "GitHub personal access token"],
  [/\bgithub_pat_[A-Za-z0-9_]{30,}\b/, "GitHub fine-grained token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key"],
];

const nativeFrontendPatterns = [
  [/(?:from\s+|require\s*\(\s*)["'](?:node:)?fs(?:\/promises)?["']/, "direct filesystem import"],
  [/(?:from\s+|require\s*\(\s*)["']electron["']/, "direct Electron import"],
  [/(?:from\s+|require\s*\(\s*)["']@tauri-apps\//, "direct Tauri import"],
];

for (const relative of trackedFiles()) {
  const normalized = relative.replaceAll("\\", "/");
  const base = path.posix.basename(normalized);

  if (/^\.env(?:\..+)?$/.test(base) && base !== ".env.example") {
    errors.push(`${normalized}: tracked environment file is forbidden`);
  }

  let content;
  try {
    content = readText(normalized);
  } catch {
    continue;
  }
  if (content === null) continue;

  const sourceSurface = /^(app|src|backend|electron)\//.test(normalized);
  if (sourceSurface) {
    for (const [pattern, label] of secretPatterns) {
      if (pattern.test(content)) errors.push(`${normalized}: possible ${label}`);
    }
  }

  if (/^(app|src)\//.test(normalized)) {
    for (const [pattern, label] of nativeFrontendPatterns) {
      if (pattern.test(content)) errors.push(`${normalized}: ${label} violates @bridge/OpenBandNative boundary`);
    }
  }
}

if (errors.length === 0) {
  process.stdout.write("Security policy: PASS\n");
} else {
  process.stderr.write(`Security policy: FAIL (${errors.length})\n`);
  for (const error of errors) process.stderr.write(`  - ${error}\n`);
  process.exitCode = 1;
}
