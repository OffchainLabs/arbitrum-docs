import fs from 'node:fs';
import path from 'node:path';

export interface GlossaryTerm {
  key: string;
  title: string;
}

export interface QuickLookAnchor {
  lineNumber: number;
  key: string;
  displayText: string;
}

// Titles shorter than this are too generic to match safely (e.g. "L1").
const MIN_TITLE_LENGTH = 2;

/**
 * Reads the checked-in glossary and returns its terms.
 *
 * @param glossaryPath Absolute path to static/glossary.json.
 * @returns One `{ key, title }` per entry with a string `title`.
 * @throws {Error} If the file is missing or not valid JSON.
 */
export function loadGlossaryTerms(glossaryPath: string): GlossaryTerm[] {
  let raw: string;
  try {
    raw = fs.readFileSync(glossaryPath, 'utf8');
  } catch {
    throw new Error(
      `Could not read glossary at ${glossaryPath}. Run \`yarn build-glossary\` first.`,
    );
  }
  let data: Record<string, { title?: unknown }>;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Glossary at ${glossaryPath} is not valid JSON. Run \`yarn build-glossary\`.`);
  }
  const terms: GlossaryTerm[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value.title === 'string') {
      terms.push({ key, title: value.title });
    }
  }
  return terms;
}

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive, word-bounded matcher accepting a trailing plural. */
function termMatcher(title: string): RegExp {
  const plural = /[A-Za-z0-9]$/.test(title) ? '(?:e?s)?' : '';
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(title)}${plural}(?![A-Za-z0-9])`, 'i');
}

/** Blanks spans that must never be wrapped, preserving index alignment. */
function maskExclusions(line: string): string {
  const blank = (match: string): string => ' '.repeat(match.length);
  return line
    .replace(/`[^`]*`/g, blank)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, blank)
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, blank)
    .replace(/<[^>]+>/g, blank);
}

/** Marks lines entirely off-limits: frontmatter, fences, headings, import/export. */
function excludedLines(lines: string[]): boolean[] {
  const excluded = new Array<boolean>(lines.length).fill(false);
  let inFrontmatter = false;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && /^---\s*$/.test(line)) {
      inFrontmatter = true;
      excluded[i] = true;
      continue;
    }
    if (inFrontmatter) {
      excluded[i] = true;
      if (/^---\s*$/.test(line)) inFrontmatter = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(line)) {
      excluded[i] = true;
      inFence = !inFence;
      continue;
    }
    if (inFence || /^\s{0,3}#{1,6}\s/.test(line) || /^\s*(import|export)\s/.test(line)) {
      excluded[i] = true;
    }
  }
  return excluded;
}

/** Keys already wrapped in a data-quicklook-from anchor anywhere in the file. */
function alreadyWrappedKeys(content: string): Set<string> {
  const keys = new Set<string>();
  const re = /data-quicklook-from\s*=\s*(['"])(.*?)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) keys.add(m[2]);
  return keys;
}

interface LineMatch {
  start: number;
  end: number;
  term: GlossaryTerm;
}

/**
 * Wraps the first mention of each glossary term in `content`, skipping excluded
 * lines/spans and any term already wrapped elsewhere in the file. At most one
 * anchor per line (earliest match wins).
 *
 * @returns The applied `updatedContent` and the `anchors` that were added.
 */
export function generateQuickLooks(
  content: string,
  terms: GlossaryTerm[],
): { anchors: QuickLookAnchor[]; updatedContent: string } {
  if (terms.length === 0) return { anchors: [], updatedContent: content };

  const lines = content.split('\n');
  const excluded = excludedLines(lines);
  const wrapped = alreadyWrappedKeys(content);
  const byLine = new Map<number, LineMatch>();

  for (const term of terms) {
    if (term.title.length < MIN_TITLE_LENGTH) continue;
    if (wrapped.has(term.key)) continue;
    const matcher = termMatcher(term.title);
    for (let i = 0; i < lines.length; i++) {
      if (excluded[i]) continue;
      const found = matcher.exec(maskExclusions(lines[i]));
      if (!found) continue;
      const candidate: LineMatch = { start: found.index, end: found.index + found[0].length, term };
      const existing = byLine.get(i);
      if (!existing || candidate.start < existing.start) byLine.set(i, candidate);
      break; // first mention only
    }
  }

  const anchors: QuickLookAnchor[] = [];
  for (const [lineIndex, m] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
    const line = lines[lineIndex];
    const displayText = line.slice(m.start, m.end);
    lines[lineIndex] =
      line.slice(0, m.start) +
      `<a data-quicklook-from="${m.term.key}">${displayText}</a>` +
      line.slice(m.end);
    anchors.push({ lineNumber: lineIndex + 1, key: m.term.key, displayText });
  }

  return { anchors, updatedContent: lines.join('\n') };
}

const GLOSSARY_PATH = path.join(__dirname, '..', 'static', 'glossary.json');

function usage(): never {
  process.stderr.write('Usage: yarn generate-quicklooks <file.md|.mdx> [--check | --write]\n');
  process.exit(1);
}

function main(): void {
  const argv = process.argv.slice(2);
  const write = argv.includes('--write');
  const check = argv.includes('--check');
  const files = argv.filter((a) => !a.startsWith('--'));
  if (files.length !== 1) usage();
  const file = files[0];
  if (!/\.mdx?$/.test(file)) {
    process.stderr.write(`Not a markdown file: ${file}\n`);
    process.exit(1);
  }

  const terms = loadGlossaryTerms(GLOSSARY_PATH); // fails fast with actionable message

  let content: string;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    process.stderr.write(`Could not read file: ${file}\n`);
    process.exit(1);
  }

  const { anchors, updatedContent } = generateQuickLooks(content, terms);

  if (anchors.length === 0) {
    process.stdout.write(`No glossary terms to wrap in ${file}.\n`);
    process.exit(0);
  }

  if (check) {
    for (const a of anchors)
      process.stdout.write(`${file}:${a.lineNumber} ${a.key} (${a.displayText})\n`);
    process.stdout.write(`${anchors.length} glossary term(s) unwrapped in ${file}.\n`);
    process.exit(1);
  }

  if (write) {
    fs.writeFileSync(file, updatedContent);
    process.stdout.write(`Wrapped ${anchors.length} glossary term(s) in ${file}.\n`);
    process.exit(0);
  }

  process.stdout.write(`${anchors.length} glossary term(s) would be wrapped in ${file}:\n`);
  for (const a of anchors)
    process.stdout.write(`  L${a.lineNumber}  ${a.key}  (${a.displayText})\n`);
  process.stdout.write(`Apply with: yarn generate-quicklooks ${file} --write\n`);
  process.exit(0);
}

if (require.main === module) main();
