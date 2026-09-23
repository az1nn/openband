import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ID_PATTERN = /\b(?:S|R|MD|EXP)-\d{3}\b/g;

const REGISTRIES = {
  S: 'source-registry.md',
  R: 'research-register.md',
  MD: 'decision-log.md',
  EXP: 'experiments.md',
};

const ALLOWED_STATES = {
  R: new Set(['VERIFIED', 'OBSERVED', 'HYPOTHESIS', 'UNKNOWN', 'STALE']),
  MD: new Set(['ACTIVE', 'PROVISIONAL', 'SUPERSEDED', 'RETIRED']),
  EXP: new Set(['BACKLOG', 'RUNNING', 'DECIDED', 'INCONCLUSIVE', 'CANCELLED']),
};

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function maskFencedCode(markdown) {
  let insideFence = false;
  let fenceMarker = null;

  return markdown
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart();
      const marker = trimmed.startsWith('```') ? '```' : trimmed.startsWith('~~~') ? '~~~' : null;

      if (marker) {
        if (!insideFence) {
          insideFence = true;
          fenceMarker = marker;
        } else if (marker === fenceMarker) {
          insideFence = false;
          fenceMarker = null;
        }
        return '';
      }

      return insideFence ? '' : line;
    })
    .join('\n');
}

function githubSlugBase(rawHeading) {
  return rawHeading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function collectHeadingSlugs(markdown) {
  const counts = new Map();
  const slugs = new Set();

  for (const line of maskFencedCode(markdown).split('\n')) {
    const match = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const base = githubSlugBase(match[1]);
    if (!base) continue;

    const seen = counts.get(base) ?? 0;
    const slug = seen === 0 ? base : `${base}-${seen}`;
    counts.set(base, seen + 1);
    slugs.add(slug);
  }

  return slugs;
}

function normalizeLinkTarget(rawTarget) {
  const target = rawTarget.trim();
  if (!target) return null;

  if (target.startsWith('<') && target.endsWith('>')) {
    return target.slice(1, -1);
  }

  // Markdown optionally permits a title after the destination. The knowledge-base
  // files use simple destinations, so keeping the first whitespace-delimited token
  // avoids treating the title as part of the path.
  return target.split(/\s+/)[0];
}

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function parseHeadingRegistry(text, prefix) {
  const definitions = [];
  const regex = new RegExp(`^###\\s+(${prefix}-\\d{3})\\s+[—-]`, 'gm');
  let match;

  while ((match = regex.exec(text)) !== null) {
    definitions.push({ id: match[1], index: match.index, line: lineNumberAt(text, match.index) });
  }

  return definitions;
}

function parseResearchRegistry(text) {
  const definitions = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^\|\s*(R-\d{3})\s*\|([^|]*)\|\s*([A-Z]+)\s*\|/);
    if (!match) return;
    definitions.push({ id: match[1], line: index + 1, state: match[3] });
  });

  return definitions;
}

function extractBlockState(text, definition, nextDefinition) {
  const end = nextDefinition?.index ?? text.length;
  const block = text.slice(definition.index, end);
  const match = block.match(/^\*\*Status:\*\*\s*([A-Z]+)/m);
  return match?.[1] ?? null;
}

function createError(code, file, line, message) {
  return { code, file, line, message };
}

async function pathExists(candidate) {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

export async function validateMarketingKb(repoRoot = process.cwd()) {
  const marketingDir = path.join(repoRoot, 'docs', 'marketing');
  const errors = [];
  const definitions = new Map();
  const definitionLocations = new Map();
  const markdownCache = new Map();

  const marketingFiles = await listMarkdownFiles(marketingDir);
  for (const file of marketingFiles) {
    markdownCache.set(file, await fs.readFile(file, 'utf8'));
  }

  const registryData = {};
  for (const [prefix, filename] of Object.entries(REGISTRIES)) {
    const file = path.join(marketingDir, filename);
    const text = markdownCache.get(file) ?? (await fs.readFile(file, 'utf8'));
    markdownCache.set(file, text);

    const items = prefix === 'R' ? parseResearchRegistry(text) : parseHeadingRegistry(text, prefix);
    registryData[prefix] = { file, text, items };

    for (const item of items) {
      const prior = definitionLocations.get(item.id);
      if (prior) {
        errors.push(
          createError(
            'DUPLICATE_ID',
            path.relative(repoRoot, file),
            item.line,
            `${item.id} is already defined at ${prior.file}:${prior.line}`,
          ),
        );
      } else {
        definitions.set(item.id, prefix);
        definitionLocations.set(item.id, {
          file: path.relative(repoRoot, file),
          line: item.line,
        });
      }
    }
  }

  for (const item of registryData.R.items) {
    if (!ALLOWED_STATES.R.has(item.state)) {
      errors.push(
        createError(
          'INVALID_STATE',
          path.relative(repoRoot, registryData.R.file),
          item.line,
          `${item.id} uses invalid research state ${item.state}`,
        ),
      );
    }
  }

  for (const prefix of ['MD', 'EXP']) {
    const { file, text, items } = registryData[prefix];
    items.forEach((item, index) => {
      const state = extractBlockState(text, item, items[index + 1]);
      if (!state) {
        errors.push(
          createError(
            'MISSING_STATE',
            path.relative(repoRoot, file),
            item.line,
            `${item.id} is missing a Status field`,
          ),
        );
      } else if (!ALLOWED_STATES[prefix].has(state)) {
        errors.push(
          createError(
            'INVALID_STATE',
            path.relative(repoRoot, file),
            item.line,
            `${item.id} uses invalid ${prefix} state ${state}`,
          ),
        );
      }
    });
  }

  for (const item of registryData.S.items) {
    const items = registryData.S.items;
    const itemIndex = items.indexOf(item);
    const end = items[itemIndex + 1]?.index ?? registryData.S.text.length;
    const block = registryData.S.text.slice(item.index, end);
    const grade = block.match(/^- Grade:\s*([A-D])\b/m)?.[1] ?? null;
    if (!grade) {
      errors.push(
        createError(
          'INVALID_SOURCE_GRADE',
          path.relative(repoRoot, registryData.S.file),
          item.line,
          `${item.id} must declare source Grade A, B, C, or D`,
        ),
      );
    }
  }

  for (const [file, rawText] of markdownCache.entries()) {
    const relativeFile = path.relative(repoRoot, file);
    const text = maskFencedCode(rawText);

    for (const match of text.matchAll(ID_PATTERN)) {
      if (!definitions.has(match[0])) {
        errors.push(
          createError(
            'UNRESOLVED_ID',
            relativeFile,
            lineNumberAt(text, match.index ?? 0),
            `${match[0]} is referenced but has no canonical definition`,
          ),
        );
      }
    }

    const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
    for (const match of text.matchAll(linkPattern)) {
      const normalized = normalizeLinkTarget(match[1]);
      if (!normalized) continue;
      if (/^(?:https?:|mailto:|tel:|data:)/i.test(normalized)) continue;

      const [rawPath, rawFragment] = normalized.split('#', 2);
      const fragment = rawFragment ? decodeURIComponent(rawFragment) : null;
      const targetPath = rawPath
        ? path.resolve(path.dirname(file), decodeURIComponent(rawPath.split('?')[0]))
        : file;

      if (!(await pathExists(targetPath))) {
        errors.push(
          createError(
            'BROKEN_LINK',
            relativeFile,
            lineNumberAt(text, match.index ?? 0),
            `Markdown link target does not exist: ${normalized}`,
          ),
        );
        continue;
      }

      if (fragment && path.extname(targetPath).toLowerCase() === '.md') {
        let targetMarkdown = markdownCache.get(targetPath);
        if (targetMarkdown == null) {
          targetMarkdown = await fs.readFile(targetPath, 'utf8');
          markdownCache.set(targetPath, targetMarkdown);
        }

        const slugs = collectHeadingSlugs(targetMarkdown);
        if (!slugs.has(fragment.toLowerCase())) {
          errors.push(
            createError(
              'BROKEN_ANCHOR',
              relativeFile,
              lineNumberAt(text, match.index ?? 0),
              `Markdown anchor does not exist: ${normalized}`,
            ),
          );
        }
      }
    }
  }

  return {
    errors,
    stats: {
      files: marketingFiles.length,
      sources: registryData.S.items.length,
      research: registryData.R.items.length,
      decisions: registryData.MD.items.length,
      experiments: registryData.EXP.items.length,
    },
  };
}

async function main() {
  const result = await validateMarketingKb(process.cwd());

  if (result.errors.length > 0) {
    console.error(`Marketing KB integrity check failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) {
      console.error(`- [${error.code}] ${error.file}:${error.line} ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const { files, sources, research, decisions, experiments } = result.stats;
  console.log(
    `Marketing KB integrity check passed: ${files} markdown files, ${sources} sources, ${research} research items, ${decisions} decisions, ${experiments} experiments.`,
  );
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedAsScript) {
  await main();
}
