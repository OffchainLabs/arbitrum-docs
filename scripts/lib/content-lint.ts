/**
 * content-lint: MDX that compiles, passes Prettier and `check-links`, and still renders wrong.
 *
 * Every rule reads the source with code masked (`stripCode`), so syntax shown as an example inside
 * a fence or an inline code span is never reported, except `var-in-code`, which looks inside code.
 *
 *   docusaurus-directive  A `:::note` line. Nothing converts it, so the reader sees the colons.
 *   var-in-code           `<Var>` inside a fence or inline code span. MDX does not evaluate
 *                         components in code, so the reader sees the literal tag.
 *   var-in-link           `<Var>` inside a link destination or an `href`/`to`/`src` attribute, or
 *                         a `{var:…}` placeholder whose name is not an identifier. The tag holds
 *                         spaces and quotes, so the link never parses (or the attribute is cut
 *                         short). A `{var:name}` placeholder is the working form.
 *   link-in-heading       A link or bare URL in a heading. Fumadocs wraps heading content in its
 *                         own anchor, so the page serves `<a>` inside `<a>` and React hydration
 *                         fails. `[#custom-id]` and images are fine.
 *   tr-in-table           A `<tr>` directly inside `<table>`. The browser inserts a `<tbody>` the
 *                         server HTML lacks, so React hydration fails.
 *   remote-image          A markdown image with an `http(s)` src. It becomes `next/image`, whose
 *                         optimizer rejects every remote host here, so the reader gets a broken
 *                         image. Commit the file under `public/`, or wrap an `<img>` in `<ImageZoom>`.
 *   docusaurus-var-token  A Docusaurus `@@name@@` or `@@name=value@@` token. Nothing substitutes
 *                         it, so the reader sees the token. Write `<Var name="name" />`.
 *   quicklook-anchor      A Docusaurus `<a data-quicklook-from="…">` glossary anchor. It renders
 *                         with no link and no hover. Write `<Term id="…">…</Term>`.
 *   site-import           An `import … from '@site/…'` or `'@theme/…'` line. Those are Docusaurus
 *                         aliases and do not resolve here, so the build fails. Use an `<include>`
 *                         or a component registered in `components/mdx.tsx`.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { MALFORMED_VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';
import { codeRegions, stripCode } from './strip-code.ts';

export const RULES = {
  'docusaurus-directive': 'unconverted Docusaurus ::: directive renders as literal text',
  'var-in-code': '<Var> inside code renders as a literal tag',
  'var-in-link': '<Var> in a link destination never substitutes',
  'link-in-heading': 'link inside a heading nests <a> inside <a>',
  'tr-in-table': '<tr> is a direct child of <table>',
  'remote-image': 'markdown image with a remote src renders broken',
  'docusaurus-var-token': 'Docusaurus @@variable@@ token renders as literal text',
  'quicklook-anchor': 'Docusaurus quicklook anchor renders with no link or hover',
  'site-import': 'Docusaurus @site/@theme import does not resolve',
} as const;

export type RuleId = keyof typeof RULES;

/** One defect in one source string. `line` is 1-indexed. */
export interface Finding {
  rule: RuleId;
  line: number;
  message: string;
}

export interface FileFinding extends Finding {
  rel: string;
}

const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

const lineOf = (source: string, index: number): number => source.slice(0, index).split('\n').length;

const LINK_IN_BRACKETS = /(?<!!)\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/;
const ANY_LINK = /!?\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/g;
const TAG = /<\/?[A-Za-z][A-Za-z0-9.-]*(?:\s[^>]*)?\/?>/g;
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?(https?:\/\/[^\s<>)]+)/g;
const LINK_DEFINITION = /^[ \t]{0,3}\[([^\]\n]+)\]:[ \t]*<?(\S+?)>?(?:[ \t]|$)/gm;
const IMAGE_REFERENCE = /!\[([^\]]*)\]\[([^\]]*)\]/g;

const label = (s: string): string => s.trim().replace(/\s+/g, ' ').toLowerCase();

export function lintSource(source: string): Finding[] {
  const findings: Finding[] = [];
  const text = stripCode(source);
  const add = (rule: RuleId, index: number, message: string) =>
    findings.push({ rule, line: lineOf(source, index), message });

  for (const m of text.matchAll(/^[ \t]*:::+[^\n]*/gm)) {
    add('docusaurus-directive', m.index, m[0].trim().slice(0, 60));
  }

  for (const region of codeRegions(source, { mdxComments: true })) {
    if (region.kind !== 'fence' && region.kind !== 'inlineCode') continue;
    for (const vm of source.slice(region.start, region.end).matchAll(/<Var\b[^>]*>/g)) {
      add('var-in-code', region.start + vm.index, vm[0]);
    }
  }

  for (const m of text.matchAll(/\]\([^)\n]*<Var\b/g)) {
    add('var-in-link', m.index, 'use a {var:name} placeholder in the destination instead');
  }
  for (const m of text.matchAll(/\b(?:href|to|src)\s*=\s*["'][^"'<>]*<Var\b/g)) {
    add('var-in-link', m.index, 'use a {var:name} placeholder in the attribute instead');
  }
  for (const m of text.matchAll(MALFORMED_VAR_PLACEHOLDER)) {
    add('var-in-link', m.index, `${m[0]} is not a placeholder; the name must be a variable key`);
  }

  for (const m of text.matchAll(/^#{1,6}[ \t]+([^\n]*)$/gm)) {
    const heading = m[1];
    const problems: string[] = [];
    if (LINK_IN_BRACKETS.test(heading)) problems.push('a markdown link');
    if (/<a[\s>]/i.test(heading)) problems.push('an <a> element');
    const rest = heading.replace(ANY_LINK, ' ').replace(TAG, ' ');
    if (/(?:https?:\/\/|\bwww\.)\S/i.test(rest)) problems.push('a bare URL');
    if (problems.length)
      add('link-in-heading', m.index, `heading contains ${problems.join(' + ')}`);
  }

  for (const table of text.matchAll(/<table[\s>][\s\S]*?<\/table>/g)) {
    let depth = 0;
    for (const tok of table[0].matchAll(/<(\/?)(thead|tbody|tfoot|tr)\b/gi)) {
      const [, closing, name] = tok;
      if (name.toLowerCase() !== 'tr') depth += closing ? -1 : 1;
      else if (depth === 0 && !closing) {
        add('tr-in-table', table.index + tok.index, 'wrap the rows in <thead>, <tbody> or <tfoot>');
      }
    }
  }

  for (const m of text.matchAll(MARKDOWN_IMAGE)) add('remote-image', m.index, m[1]);
  const definitions = new Map<string, string>();
  for (const m of text.matchAll(LINK_DEFINITION)) {
    if (!definitions.has(label(m[1]))) definitions.set(label(m[1]), m[2]);
  }
  for (const m of text.matchAll(IMAGE_REFERENCE)) {
    const url = definitions.get(label(m[2] || m[1]));
    if (url && /^https?:\/\//i.test(url)) add('remote-image', m.index, url);
  }

  for (const m of text.matchAll(/@@\w+(?:=[^@\n]*)?@@/g)) {
    const name = /@@(\w+)/.exec(m[0])?.[1];
    add('docusaurus-var-token', m.index, `${m[0]}: write <Var name="${name}" /> instead`);
  }

  for (const m of text.matchAll(/data-quicklook-from/g)) {
    add('quicklook-anchor', m.index, 'write <Term id="…">…</Term> instead');
  }

  for (const m of text.matchAll(/(?:from|import)\s+['"](@(?:site|theme)\/[^'"]*)['"]/g)) {
    add(
      'site-import',
      m.index,
      `${m[1]} is a Docusaurus alias; use <include> or a registered component`,
    );
  }

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

/** Lint every MDX file under `content/`, or only `files` (absolute or repo-root-relative). */
export function lintContent(repoRoot: string, files?: readonly string[]): FileFinding[] {
  const targets = files
    ? files.map((f) => path.resolve(repoRoot, f)).filter(isMdx)
    : walk(path.join(repoRoot, 'content'), isMdx);
  return targets.flatMap((abs) => {
    const rel = toPosix(path.relative(repoRoot, abs));
    return lintSource(readFileSync(abs, 'utf8')).map((f) => ({ rel, ...f }));
  });
}
