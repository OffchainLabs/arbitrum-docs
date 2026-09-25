/**
 * partials — the shared layer for the partials-registry tooling.
 *
 * A "partial" is an underscore-prefixed `.md(x)` fragment inlined into pages with the Fumadocs
 * `<include>` directive. In this repo partials live in a single un-routed root, `content/partials/`
 * (never inside `content/docs/`, so they can never be routed), and are always referenced with the
 * `cwd` flag — `<include cwd>content/partials/…</include>` — which Fumadocs resolves from the repo
 * root. Root-anchored includes are invariant under page moves, so `move-doc`/`restructure` never
 * rewrite them (see `doc-links.extractRefs`).
 *
 * This module is the single source of truth for: locating partials, parsing/resolving `<include>`
 * directives (cwd- and file-relative), and deriving catalog metadata. `generate-partials-catalog`
 * and `partials-check` are thin CLIs over these primitives.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const DOCS_DIR = path.join('content', 'docs');
export const PARTIALS_DIR = path.join('content', 'partials');
export const REGISTRY_FILE = path.join('content', 'partials', 'registry.json');
export const CATALOG_FILE = path.join('content', 'partials', 'CATALOG.md');
export const MANIFEST_FILE = path.join('content', 'partials', 'manifest.json');

/** Convert an OS path to posix separators (stable across platforms and in generated output). */
export function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** True when a file is a partial (underscore-prefixed `.md`/`.mdx`). */
export function isPartial(p) {
  const base = path.basename(p);
  return base.startsWith('_') && /\.mdx?$/i.test(base);
}

/** Recursively list files under `dir` matching `filter(absPath)`. Returns [] if `dir` is absent. */
export function walk(dir, filter) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, filter));
    else if (filter(abs)) out.push(abs);
  }
  return out;
}

/** Absolute paths of every partial under `content/partials/`. */
export function listPartials(repoRoot) {
  return walk(path.join(repoRoot, PARTIALS_DIR), isPartial).sort();
}

/** Absolute paths of every routed doc file under `content/docs/`. */
export function listDocs(repoRoot) {
  return walk(path.join(repoRoot, DOCS_DIR), (p) => /\.mdx?$/i.test(p)).sort();
}

/**
 * Parse every `<include …>path</include>` directive in `source`.
 *
 * @returns {Array<{cwd:boolean, target:string, range:[number,number]}>} where `range` spans the
 * inner path text so it can be rewritten in place.
 */
export function parseIncludes(source) {
  const re = /<include\b([^>]*)>([\s\S]*?)<\/include>/g;
  const out = [];
  for (let m; (m = re.exec(source));) {
    const attrs = m[1];
    const inner = m[2];
    const target = inner.trim();
    if (target === '') continue;
    const cwd = /\bcwd\b/.test(attrs);
    const lead = inner.length - inner.trimStart().length;
    const start = m.index + m[0].indexOf('>') + 1 + lead;
    out.push({ cwd, target, range: [start, start + target.length] });
  }
  return out;
}

/**
 * Resolve an include's target to an absolute path.
 * `cwd` includes resolve from `repoRoot`; file-relative includes from the including file's dir.
 * Strips a trailing `#anchor` (Fumadocs supports section includes).
 */
export function resolveInclude({ cwd, target }, fromAbs, repoRoot) {
  const clean = target.replace(/#.*$/, '');
  return cwd ? path.resolve(repoRoot, clean) : path.resolve(path.dirname(fromAbs), clean);
}

/** The repo-root-relative posix path used inside a `<include cwd>…</include>` directive. */
export function cwdIncludePath(repoRoot, targetAbs) {
  return toPosix(path.relative(repoRoot, targetAbs));
}

/** Source trees that may import partials as MDX component modules (the second consumption path). */
export const IMPORTER_ROOTS = ['components', 'app', 'lib', 'content'];
const IMPORTER_EXT = /\.(?:tsx?|jsx?|mdx?)$/i;

/** Files under IMPORTER_ROOTS that could `import` a partial. */
export function listImporters(repoRoot) {
  return IMPORTER_ROOTS.flatMap((root) =>
    walk(path.join(repoRoot, root), (p) => IMPORTER_EXT.test(p)),
  ).sort();
}

/**
 * Parse `import X from '<spec>'` statements whose specifier resolves to a partial (`_*.md(x)`).
 *
 * @returns {Array<{specifier:string, range:[number,number]}>} `range` spans the specifier text.
 */
export function parsePartialImports(source) {
  const re = /\bfrom\s*(['"])([^'"]+\.mdx?)\1/g;
  const out = [];
  for (let m; (m = re.exec(source));) {
    const specifier = m[2];
    if (!path.basename(specifier).startsWith('_')) continue;
    const start = m.index + m[0].indexOf(specifier);
    out.push({ specifier, range: [start, start + specifier.length] });
  }
  return out;
}

/** Resolve an import specifier to an absolute path (`@/` → repo root, `./` → the importing file). */
export function resolvePartialImport(specifier, fromAbs, repoRoot) {
  if (specifier.startsWith('@/')) return path.resolve(repoRoot, specifier.slice(2));
  if (specifier.startsWith('.')) return path.resolve(path.dirname(fromAbs), specifier);
  return null;
}

/**
 * Map a legacy partial reference (`…/content/docs/<locale>/…/partials/…/_x.mdx`) to its registry
 * location (`…/content/partials/…/_x.mdx`), preserving any `@/` or `./` prefix. Returns null when the
 * reference is not a legacy content/docs partial (so it is a no-op on already-migrated references).
 */
export function mapLegacySpecifier(specifier) {
  const idx = specifier.indexOf('content/docs/');
  if (idx === -1) return null;
  const prefix = specifier.slice(0, idx);
  const parts = specifier.slice(idx).split('/'); // content, docs, <locale>, …, partials, _x.mdx
  const rest = parts.slice(3).filter((s) => s !== 'partials');
  return `${prefix}content/partials/${rest.join('/')}`;
}

/**
 * Split a leading YAML frontmatter block off a partial. Fumadocs `<include>` strips frontmatter, so
 * it never renders — but it may carry a `title` worth reusing in the catalog. `fm` is null when
 * absent.
 *
 * @returns {{fm: {title?: string} | null, body: string}}
 */
export function splitFrontmatter(content) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(content);
  if (!m) return { fm: null, body: content };
  const fm = {};
  const title = /^title:\s*(.+)$/m.exec(m[1]);
  if (title) fm.title = title[1].trim().replace(/^['"]|['"]$/g, '');
  return { fm, body: content.slice(m[0].length) };
}

const HUMANIZE_STRIP = /(?:-partial|-pc)$/;

/** Turn a partial's basename into a human title, e.g. `_custom-gas-token-note` → "Custom gas token note". */
export function humanize(absOrBase) {
  let name = path
    .basename(absOrBase)
    .replace(/\.mdx?$/i, '')
    .replace(/^_/, '');
  name = name.replace(HUMANIZE_STRIP, '');
  name = name.replace(/-/g, ' ').trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

/** First meaningful title: frontmatter `title`, else leading ATX heading, else admonition title, else humanized name. */
export function deriveTitle(content, abs) {
  const { fm, body } = splitFrontmatter(content);
  if (fm?.title) return fm.title;
  const lines = body.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') continue;
    const heading = /^#{1,6}\s+(.*\S)/.exec(line);
    if (heading) return heading[1].trim();
    const admonition = /<VanillaAdmonition\b[^>]*\btitle=(?:"([^"]*)"|'([^']*)')/.exec(line);
    if (admonition) return (admonition[1] ?? admonition[2]).trim();
    break; // only inspect the first non-blank line
  }
  return humanize(abs);
}

/** First prose sentence of a partial, stripped of markdown, for the catalog summary. '' if none. */
export function deriveSummary(content) {
  for (const raw of splitFrontmatter(content).body.split('\n')) {
    const line = raw.trim();
    if (
      line === '' ||
      line.startsWith('#') ||
      line.startsWith('|') ||
      line.startsWith('<') ||
      line.startsWith('{') ||
      line.startsWith('import ') ||
      line.startsWith(':::') ||
      /^[-*_]{3,}$/.test(line) // thematic break
    ) {
      continue;
    }
    const plain = line
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    if (!plain || !/[A-Za-z]/.test(plain)) continue;
    const sentence = /^(.*?[.!?])(?:\s|$)/.exec(plain);
    const text = (sentence ? sentence[1] : plain).trim();
    return text.length > 160 ? text.slice(0, 157).trimEnd() + '…' : text;
  }
  return '';
}

/** Tags derived from a partial's path segments + filename words (dedup, lowercased). */
export function deriveTags(repoRoot, abs) {
  const rel = toPosix(path.relative(path.join(repoRoot, PARTIALS_DIR), abs));
  const segs = rel.replace(/\.mdx?$/i, '').split('/');
  const file = segs.pop().replace(/^_/, '').replace(HUMANIZE_STRIP, '');
  const words = [...segs, ...file.split('-')].map((w) => w.toLowerCase()).filter(Boolean);
  return [...new Set(words)];
}

/** Load the optional curated override registry; {} when absent. */
export function loadRegistry(repoRoot) {
  const file = path.join(repoRoot, REGISTRY_FILE);
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * Build the full catalog model: one record per partial with merged (derived + override) metadata and
 * a usage count of how many pages/partials include it.
 */
export function buildCatalog(repoRoot) {
  const registry = loadRegistry(repoRoot);
  const partials = listPartials(repoRoot);

  const usage = new Map(partials.map((abs) => [abs, 0]));
  const bump = (abs) => usage.has(abs) && usage.set(abs, usage.get(abs) + 1);

  // Consumption path 1: `<include>` directives in docs and partials.
  for (const abs of [...listDocs(repoRoot), ...partials]) {
    const src = readFileSync(abs, 'utf8');
    for (const inc of parseIncludes(src)) bump(resolveInclude(inc, abs, repoRoot));
  }
  // Consumption path 2: ESM `import` of a partial as an MDX component module.
  for (const abs of listImporters(repoRoot)) {
    const src = readFileSync(abs, 'utf8');
    for (const imp of parsePartialImports(src))
      bump(resolvePartialImport(imp.specifier, abs, repoRoot));
  }

  return partials.map((abs) => {
    const rel = cwdIncludePath(repoRoot, abs);
    const content = readFileSync(abs, 'utf8');
    const override = registry[rel] ?? {};
    return {
      path: rel,
      title: override.title ?? deriveTitle(content, abs),
      summary: override.summary ?? deriveSummary(content),
      scope: override.scope ?? 'neutral',
      tags: override.tags ?? deriveTags(repoRoot, abs),
      usedIn: usage.get(abs),
      snippet: `<include cwd>${rel}</include>`,
    };
  });
}

export { existsSync, readFileSync, statSync, path };
