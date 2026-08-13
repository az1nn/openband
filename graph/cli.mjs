import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGraph, writeGraph } from "./builder.mjs";
import { validate, summarize } from "./validate.mjs";
import {
  resolveTarget,
  directDeps,
  directDependents,
  transitiveDeps,
  transitiveDependents,
  shortestPath,
} from "./traversal.mjs";
import { impactAnalysis, buildContextBundle } from "./impact.mjs";
import { edgeStats } from "./relations.mjs";

function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, flags };
}

function out(data, flags) {
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  }
}

function fail(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

export function run(argv = process.argv.slice(2)) {
  const { positionals, flags } = parseArgs(argv);
  const command = positionals.shift();
  if (!command) {
    fail("Usage: node graph/cli.mjs <build|validate|deps|dependents|path|impact|context> [args] [--json]");
  }
  const root = flags.root ? path.resolve(flags.root) : process.cwd();

  switch (command) {
    case "build": {
      const { graph, target } = writeGraph(root, flags.out ? path.resolve(flags.out) : undefined);
      const stats = edgeStats(graph);
      if (flags.json) {
        out(graph, flags);
      } else {
        process.stdout.write(
          `Built graph -> ${target}\nNodes: ${stats.nodes}\nEdges: ${stats.edges}\nBy type: ${JSON.stringify(stats.byType)}\n`
        );
      }
      return;
    }
    case "validate": {
      const graph = buildGraph(root);
      const result = validate(graph);
      const summary = summarize(result);
      if (flags.json) {
        out({ ...summary, errors: result.errors, warnings: result.warnings }, flags);
      } else {
        process.stdout.write(`Validation: ${summary.valid ? "PASS" : "FAIL"}\n`);
        process.stdout.write(`Errors: ${summary.errors}\n`);
        process.stdout.write(`Warnings: ${summary.warnings}\n`);
        for (const e of result.errors) process.stdout.write(`  [${e.code}] ${e.message}\n`);
        for (const w of result.warnings) process.stdout.write(`  [${w.code}] ${w.message}\n`);
      }
      if (!summary.valid) process.exit(1);
      return;
    }
    case "deps": {
      const target = positionals[0];
      if (!target) fail("deps requires a <target>");
      const graph = buildGraph(root);
      const result = flags.transitive ? transitiveDeps(graph, target) : directDeps(graph, target);
      if (flags.json) out(result, flags);
      else {
        process.stdout.write(`Dependencies of ${target}${flags.transitive ? " (transitive)" : ""}:\n`);
        for (const r of result) process.stdout.write(`  - ${r}\n`);
      }
      return;
    }
    case "dependents": {
      const target = positionals[0];
      if (!target) fail("dependents requires a <target>");
      const graph = buildGraph(root);
      const result = flags.transitive ? transitiveDependents(graph, target) : directDependents(graph, target);
      if (flags.json) out(result, flags);
      else {
        process.stdout.write(`Dependents of ${target}${flags.transitive ? " (transitive)" : ""}:\n`);
        for (const r of result) process.stdout.write(`  - ${r}\n`);
      }
      return;
    }
    case "path": {
      const from = positionals[0];
      const to = positionals[1];
      if (!from || !to) fail("path requires <from> <to>");
      const graph = buildGraph(root);
      const result = shortestPath(graph, from, to);
      if (flags.json) out(result, flags);
      else {
        if (!result) process.stdout.write(`No dependency path from ${from} to ${to}\n`);
        else process.stdout.write(`Path (${result.length} steps):\n  ${result.join(" -> ")}\n`);
      }
      return;
    }
    case "impact": {
      const target = positionals[0];
      if (!target) fail("impact requires a <target>");
      const graph = buildGraph(root);
      const result = impactAnalysis(graph, target);
      if (flags.json) out(result, flags);
      else {
        if (result.error) process.stdout.write(`${result.error}\n`);
        else {
          process.stdout.write(`${result.summary}\n`);
          process.stdout.write(`Direct dependents:\n`);
          for (const d of result.directDependents) process.stdout.write(`  - ${d}\n`);
        }
      }
      return;
    }
    case "context": {
      const target = positionals[0];
      if (!target) fail("context requires a <target>");
      const graph = buildGraph(root);
      const result = buildContextBundle(graph, target);
      if (flags.json) out(result, flags);
      else {
        if (result.error) process.stdout.write(`${result.error}\n`);
        else {
          process.stdout.write(`Context bundle for ${result.target.id} (${result.target.type}):\n`);
          process.stdout.write(`  dependsOn (${result.dependsOn.length}):\n`);
          for (const d of result.dependsOn) process.stdout.write(`    - ${d.id} [${d.type}]\n`);
          process.stdout.write(`  dependedOnBy (${result.dependedOnBy.length}):\n`);
          for (const d of result.dependedOnBy) process.stdout.write(`    - ${d.id} [${d.type}]\n`);
        }
      }
      return;
    }
    default:
      fail(`Unknown command: ${command}`);
  }
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  run();
}
