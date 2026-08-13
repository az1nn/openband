import fs from "node:fs";
import path from "node:path";
import { createGraph, serialize } from "./core.mjs";
import { scanSources } from "./scan.mjs";
import { scanSpecs, scanTests } from "./specs.mjs";

export function buildGraph(root = process.cwd()) {
  const graph = createGraph();
  scanSources(root, { graph });
  scanTests(root, { graph });
  scanSpecs(root, { graph });
  return graph;
}

export function writeGraph(root = process.cwd(), outPath) {
  const graph = buildGraph(root);
  const target = outPath || path.join(root, ".openband", "graph.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, serialize(graph), "utf8");
  return { graph, target };
}

export function loadGraph(file) {
  const content = fs.readFileSync(file, "utf8");
  return JSON.parse(content);
}
