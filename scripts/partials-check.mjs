/**
 * partials-check — guardrails for the partials registry. The authority on include resolution.
 *
 * Errors (exit 1):
 *   R1  every `<include>` in a doc or partial resolves to an existing file
 *   R2  no partial (`_*.md(x)`) remains under content/docs (routing-leak prevention)
 *   R4  every content/partials/registry.json entry maps to an existing partial; scope is valid
 *   R6  CATALOG.md / manifest.json are up to date
 * Warnings (exit 0):
 *   R3  a partial defines a top-level H1, or uses a JSX component that is neither globally
 *       registered (components/mdx.tsx) nor imported in the file
 *
 *   node scripts/partials-check.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  DOCS_DIR,
  cwdIncludePath,
  isPartial,
  listDocs,
  listImporters,
  listPartials,
  loadRegistry,
  parseIncludes,
  parsePartialImports,
  resolveInclude,
  resolvePartialImport,
  splitFrontmatter,
  walk,
} from './lib/partials.mjs';

const repoRoot = process.cwd();
const errors = [];
const warnings = [];
const rel = (abs) => path.relative(repoRoot, abs);

/** Uppercase component names registered globally in components/mdx.tsx. */
function globalComponents() {
  const file = path.join(repoRoot, 'components', 'mdx.tsx');
  if (!existsSync(file)) return new Set();
  const src = readFileSync(file, 'utf8');
  const body = /return\s*\{([\s\S]*?)\}\s*satisfies/.exec(src);
  const scope = body ? body[1] : src;
  const names = new Set();
  for (const m of scope.matchAll(/\b([A-Z][A-Za-z0-9]*)\b\s*[,:]/g)) names.add(m[1]);
  return names;
}

// R1: every reference to a partial resolves — both `<include>` directives and ESM imports.
function checkIncludes() {
  for (const abs of [...listDocs(repoRoot), ...listPartials(repoRoot)]) {
    const src = readFileSync(abs, 'utf8');
    for (const inc of parseIncludes(src)) {
      const targetAbs = resolveInclude(inc, abs, repoRoot);
      if (!existsSync(targetAbs)) {
        errors.push(
          `R1 ${rel(abs)}: include target not found — <include${inc.cwd ? ' cwd' : ''}>${inc.target}</include>`,
        );
      }
    }
  }
  for (const abs of listImporters(repoRoot)) {
    const src = readFileSync(abs, 'utf8');
    for (const imp of parsePartialImports(src)) {
      const targetAbs = resolvePartialImport(imp.specifier, abs, repoRoot);
      if (targetAbs && !existsSync(targetAbs)) {
        errors.push(`R1 ${rel(abs)}: partial import not found — '${imp.specifier}'`);
      }
    }
  }
  // A partial→partial include must be relative: a partial may be compiled outside the docs pipeline
  // (when ESM-imported as a component), where fumadocs-mdx's `cwd` context is undefined and crashes.
  for (const abs of listPartials(repoRoot)) {
    for (const inc of parseIncludes(readFileSync(abs, 'utf8'))) {
      if (inc.cwd) {
        errors.push(
          `R1 ${rel(abs)}: partial→partial include must be relative, not cwd — <include cwd>${inc.target}</include>`,
        );
      }
    }
  }
}

// R2: no partials left in the routed tree.
function checkNoRoutedPartials() {
  for (const abs of walk(path.join(repoRoot, DOCS_DIR), isPartial)) {
    errors.push(
      `R2 ${rel(abs)}: partial under content/docs — move it to content/partials/ (routing leak).`,
    );
  }
}

// R3: self-containment (warnings).
function checkSelfContained(globals) {
  for (const abs of listPartials(repoRoot)) {
    const src = readFileSync(abs, 'utf8');
    if (/^---\n/.test(src)) {
      warnings.push(
        `R3 ${rel(abs)}: has YAML frontmatter — vestigial in a partial (stripped by <include>); consider removing.`,
      );
    }
    const firstContent = splitFrontmatter(src)
      .body.split('\n')
      .map((l) => l.trim())
      .find((l) => l !== '');
    if (firstContent && /^#\s+\S/.test(firstContent)) {
      warnings.push(
        `R3 ${rel(abs)}: starts with a top-level H1 (\`# \`); partials should start at \`##\` or lower.`,
      );
    }
    const imported = new Set(
      [...src.matchAll(/\bimport\b[^;]*?\b([A-Z][A-Za-z0-9]*)\b/g)].map((m) => m[1]),
    );
    for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) {
      const name = m[1];
      if (!globals.has(name) && !imported.has(name)) {
        warnings.push(
          `R3 ${rel(abs)}: uses <${name}> which is not globally registered or imported in-file.`,
        );
      }
    }
  }
}

// R4: registry integrity.
function checkRegistry() {
  const registry = loadRegistry(repoRoot);
  const known = new Set(listPartials(repoRoot).map((abs) => cwdIncludePath(repoRoot, abs)));
  for (const [key, entry] of Object.entries(registry)) {
    if (!known.has(key)) errors.push(`R4 registry.json: "${key}" does not match any partial.`);
    if (entry.scope && !['neutral', 'localized'].includes(entry.scope)) {
      errors.push(
        `R4 registry.json: "${key}" has invalid scope "${entry.scope}" (expected neutral|localized).`,
      );
    }
  }
}

// R6: catalog freshness (delegate to the generator's --check).
function checkCatalogFresh() {
  try {
    execFileSync('node', ['scripts/generate-partials-catalog.mjs', '--check'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
  } catch (e) {
    errors.push(`R6 ${(e.stderr?.toString() || e.message).trim()}`);
  }
}

function main() {
  checkIncludes();
  checkNoRoutedPartials();
  checkSelfContained(globalComponents());
  checkRegistry();
  checkCatalogFresh();

  for (const w of warnings) console.warn(`warn: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    console.error(`\npartials-check: ${errors.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
  }
  console.log(`partials-check: passed (${warnings.length} warning(s)).`);
}

main();
