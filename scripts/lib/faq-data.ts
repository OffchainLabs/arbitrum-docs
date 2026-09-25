/**
 * faq-data — cross-check `<FAQStructuredData faqsId>` / `<FAQStructuredDataJsonLd faqsId>` usages
 * in `content/docs` against the static JSON files in `components/mdx/FAQStructuredData/data/` and
 * the `FaqsId` union in `components/mdx/FAQStructuredData/types.ts`.
 *
 * `FAQStructuredData` (see `components/mdx/FAQStructuredData/index.tsx`) resolves `faqsId`
 * through a static `Record<FaqsId, FAQ[]>` and throws on an unknown id, but MDX content is never
 * type-checked against that union — a typo in a page's `faqsId` attribute would only surface when
 * someone requests that page. This module makes the check static instead: every `faqsId` written
 * in `content/docs` must be a member of the `FaqsId` union and have a same-named `<id>-faqs.json`
 * data file, and every data file must parse as a non-empty array of `{ question, answer, key }`
 * string triples.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** One `faqsId` attribute in an MDX source, with its 1-based line. */
export interface FaqsIdUsage {
  id: string;
  line: number;
}

/** Where a `faqsId` is used: the docs-relative file and the line in it. */
export interface FaqsIdSite {
  rel: string;
  line: number;
}

/** A used `faqsId` and every place it is used. */
export interface FaqsIdReport {
  id: string;
  sites: FaqsIdSite[];
}

/** A data file that did not validate, with every issue found in it. */
export interface MalformedDataFile {
  id: string;
  file: string;
  issues: string[];
}

export interface FaqDataCheck {
  usagesById: Map<string, FaqsIdSite[]>;
  missingDataFile: FaqsIdReport[];
  missingDeclaration: FaqsIdReport[];
  malformed: MalformedDataFile[];
  unusedDataFile: string[];
}

const FAQ_FIELDS = ['question', 'answer', 'key'] as const;

/**
 * Match `<FAQStructuredData faqsId="...">` or `<FAQStructuredDataJsonLd faqsId="...">` (either
 * quote style) in one MDX source string. Both names are registered for the same component in
 * `components/mdx.tsx`, so a page can legally use either.
 */
const FAQS_ID_RE = /<FAQStructuredData(?:JsonLd)?\b[^>]*\bfaqsId\s*=\s*["']([^"']+)["']/g;

/** Extract every `faqsId` usage from one MDX file's source, with 1-based line numbers. */
export function extractFaqsIdUsages(source: string): FaqsIdUsage[] {
  const usages: FaqsIdUsage[] = [];
  for (const match of source.matchAll(FAQS_ID_RE)) {
    const line = source.slice(0, match.index).split('\n').length;
    usages.push({ id: match[1], line });
  }
  return usages;
}

/**
 * Extract the string-literal members of the `FaqsId` union from `types.ts`'s source, e.g.
 * `'bridging' | 'building' | ...`. This is the set of ids `FAQ_MAP` is guaranteed (by
 * `Record<FaqsId, FAQ[]>` and `tsc`) to have an entry for, so a content usage must be checked
 * against it directly -- checking against the data directory alone would miss a data file dropped
 * in without a matching `FaqsId`/`FAQ_MAP` entry, which passes a directory-only check but throws
 * at render.
 */
export function extractFaqsIdUnion(typesSource: string): string[] {
  const match = typesSource.match(/export type FaqsId =([^;]+);/);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/** Recursively list `.mdx` file paths under `dir`, relative to `dir`. */
export function listMdxFiles(dir: string): string[] {
  const results: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const entryAbs = path.join(abs, entry.name);
      const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(entryAbs, entryRel);
      } else if (entry.name.endsWith('.mdx')) {
        results.push(entryRel);
      }
    }
  };
  walk(dir, '');
  return results.sort();
}

/**
 * Validate a parsed FAQ data file's shape. Returns an array of human-readable issue strings;
 * empty means the file is well-formed.
 */
export function validateFaqEntries(data: unknown): string[] {
  if (!Array.isArray(data)) return ['data is not an array'];
  if (data.length === 0) return ['data array is empty'];

  const issues: string[] = [];
  const seenKeys = new Set<string>();
  data.forEach((entry: unknown, i) => {
    // A non-object entry reads as one with no fields, which is what `entry?.[field]` gave it.
    const fields: Record<string, unknown> =
      typeof entry === 'object' && entry !== null ? { ...entry } : {};
    for (const field of FAQ_FIELDS) {
      const value = fields[field];
      if (typeof value !== 'string' || value.length === 0) {
        issues.push(`entry ${i}: "${field}" is not a non-empty string`);
      }
    }
    const key = fields.key;
    if (typeof key === 'string') {
      if (seenKeys.has(key)) issues.push(`entry ${i}: duplicate key "${key}"`);
      seenKeys.add(key);
    }
  });
  return issues;
}

/**
 * Full check: scan `docsRoot` for `faqsId` usages, scan `dataDir` for `<id>-faqs.json` files,
 * parse the declared `FaqsId` union out of `typesFile`, and report every mismatch. All filesystem
 * access happens here; `extractFaqsIdUsages`, `extractFaqsIdUnion`, and `validateFaqEntries` above
 * stay pure and unit-testable on fixtures.
 */
export function checkFaqData({
  docsRoot,
  dataDir,
  typesFile,
}: {
  docsRoot: string;
  dataDir: string;
  typesFile: string;
}): FaqDataCheck {
  const usagesById = new Map<string, FaqsIdSite[]>();
  for (const rel of listMdxFiles(docsRoot)) {
    const source = readFileSync(path.join(docsRoot, rel), 'utf8');
    for (const { id, line } of extractFaqsIdUsages(source)) {
      const sites = usagesById.get(id) ?? [];
      sites.push({ rel, line });
      usagesById.set(id, sites);
    }
  }
  const sitesOf = (id: string): FaqsIdSite[] => usagesById.get(id) ?? [];

  const dataFiles = readdirSync(dataDir).filter((f) => f.endsWith('-faqs.json'));
  const idsWithDataFile = new Set(dataFiles.map((f) => f.replace(/-faqs\.json$/, '')));

  const missingDataFile = [...usagesById.keys()]
    .filter((id) => !idsWithDataFile.has(id))
    .sort()
    .map((id) => ({ id, sites: sitesOf(id) }));

  // Checking against the data directory alone (above) would miss the case where a data file
  // exists and matches a content usage, but the `FaqsId` union in `types.ts` -- and therefore
  // `FAQ_MAP` -- has no entry for it: that combination throws at render, not at any static check.
  const declaredIds = new Set(extractFaqsIdUnion(readFileSync(typesFile, 'utf8')));
  const missingDeclaration = [...usagesById.keys()]
    .filter((id) => !declaredIds.has(id))
    .sort()
    .map((id) => ({ id, sites: sitesOf(id) }));

  const malformed: MalformedDataFile[] = [];
  for (const file of dataFiles) {
    const id = file.replace(/-faqs\.json$/, '');
    const abs = path.join(dataDir, file);
    let issues: string[];
    try {
      const parsed: unknown = JSON.parse(readFileSync(abs, 'utf8'));
      issues = validateFaqEntries(parsed);
    } catch (err) {
      issues = [`invalid JSON: ${err instanceof Error ? err.message : String(err)}`];
    }
    if (issues.length > 0) malformed.push({ id, file, issues });
  }

  const unusedDataFile = [...idsWithDataFile].filter((id) => !usagesById.has(id)).sort();

  return { usagesById, missingDataFile, missingDeclaration, malformed, unusedDataFile };
}
