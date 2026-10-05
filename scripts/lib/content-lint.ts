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
 *   component-in-heading  A JSX component (`<Var>`, `<Term>`, …) in a heading. Fumadocs compiles
 *                         heading text into the table of contents as JSX with no component in
 *                         scope, so `next build` fails with "X is not defined". Move it below.
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
 *   unknown-component     A capitalised JSX tag that `components/mdx.tsx` does not register, that
 *                         is not a Fumadocs default and that the file neither imports nor exports.
 *                         MDX throws at render for an undefined component. Register it.
 *   callout-type          `<Callout type>` outside `info|warn|error|idea|success`, the five
 *                         spellings the house style and CLAUDE.md name (Fumadocs also accepts
 *                         `warning` and `tip` as aliases, but an unknown type renders silently
 *                         with no icon and the muted colour, so the gate keeps to one list).
 *   markdown-in-title     Markdown (`**`, `_x_`, `*x*`, backticks, a `[link](…)`) in the `title` of
 *                         a `<Callout>` or `<Accordion>`. The title is a plain string, so the reader
 *                         sees the asterisks.
 *   block-component-in-paragraph
 *                         A block component (`<Callout>`, `<Tabs>`, `<Cards>`, …) opened and closed
 *                         on one line with text beside it, on the line above or on the line below.
 *                         MDX puts it inside a `<p>`, the browser closes the `<p>` at its `<div>`,
 *                         and React hydration fails. Put the tags on their own lines, with a blank
 *                         line before and after.
 *   tabs-null-default     `<Tabs defaultValue={null}>`, a Docusaurus-era prop. Fumadocs takes it
 *                         as the selected tab, so every panel is hidden until a click. Delete it.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MALFORMED_VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';
import { codeRegions, stripCode } from './strip-code.ts';

export const RULES = {
  'docusaurus-directive': 'unconverted Docusaurus ::: directive renders as literal text',
  'var-in-code': '<Var> inside code renders as a literal tag',
  'var-in-link': '<Var> in a link destination never substitutes',
  'link-in-heading': 'link inside a heading nests <a> inside <a>',
  'component-in-heading': 'a JSX component in a heading breaks the table of contents at build',
  'tr-in-table': '<tr> is a direct child of <table>',
  'remote-image': 'markdown image with a remote src renders broken',
  'docusaurus-var-token': 'Docusaurus @@variable@@ token renders as literal text',
  'quicklook-anchor': 'Docusaurus quicklook anchor renders with no link or hover',
  'site-import': 'Docusaurus @site/@theme import does not resolve',
  'unknown-component': 'JSX component is not registered, so the page throws at render',
  'callout-type': 'Callout type is not one of the five house types',
  'markdown-in-title': 'markdown in a title attribute renders as literal text',
  'block-component-in-paragraph':
    'block component glued to text renders inside <p> and breaks hydration',
  'tabs-null-default': 'Tabs defaultValue={null} hides every panel',
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

/**
 * Components every page gets from `fumadocs-ui/mdx`'s default export, which `components/mdx.tsx`
 * spreads first. `content-lint.test.ts` checks this list against the installed package.
 */
export const FUMADOCS_DEFAULT_COMPONENTS: readonly string[] = [
  'Callout',
  'CalloutContainer',
  'CalloutDescription',
  'CalloutTitle',
  'Card',
  'Cards',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
];

export const CALLOUT_TYPES: readonly string[] = ['info', 'warn', 'error', 'idea', 'success'];

/** Components that render a block element, so MDX must not put them inside a paragraph. */
const BLOCK_COMPONENTS = 'Callout|Accordions|Accordion|Tabs|Tab|Cards|Card|Steps|Step';

const REGISTRY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../components/mdx.tsx',
);

/** The capitalised keys of the component map in a `components/mdx.tsx` source. */
export function registeredComponents(registrySource: string): Set<string> {
  const names = new Set<string>();
  const body = /const merged = \{([\s\S]*?)\n\s*\};/.exec(registrySource)?.[1] ?? '';
  for (const m of body.matchAll(/^\s*([A-Z]\w*)\s*[,:]/gm)) names.add(m[1]);
  return names;
}

let knownComponents: Set<string> | undefined;

/** Every component a page can use without importing it: the registry plus Fumadocs' defaults. */
function defaultKnownComponents(): Set<string> {
  knownComponents ??= new Set([
    ...FUMADOCS_DEFAULT_COMPONENTS,
    ...(existsSync(REGISTRY) ? registeredComponents(readFileSync(REGISTRY, 'utf8')) : []),
  ]);
  return knownComponents;
}

/** Names a file brings into scope itself, with `import` or `export const|function|class`. */
function localNames(text: string): Set<string> {
  const names = new Set<string>();
  for (const m of text.matchAll(/^import\s+([^'"]+?)\s+from\s+['"]/gm)) {
    for (const part of m[1].replace(/[{}]/g, ',').split(',')) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.replace(/^\*\s*/, '')
        .trim();
      if (name) names.add(name);
    }
  }
  for (const m of text.matchAll(/^export\s+(?:const|let|var|function|class)\s+([A-Za-z_]\w*)/gm)) {
    names.add(m[1]);
  }
  return names;
}

/** The whole opening tag that starts at `start`, read from the original source (quotes and braces respected). */
function openingTag(source: string, start: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start + 1; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return source.slice(start, i + 1);
  }
  return source.slice(start);
}

/** A string attribute's value in an opening tag: `a="x"`, `a='x'` or `a={"x"}`. */
function attribute(tag: string, name: string): string | undefined {
  const m = new RegExp(
    `\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`)\\s*\\})`,
  ).exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]) : undefined;
}

/** What markdown a plain-string title holds, if any. */
function markdownIn(title: string): string[] {
  const found: string[] = [];
  if (/\*\*|__/.test(title)) found.push('bold');
  else if (/(^|[\s(])([*_])(?=\S)[^*_]*\S\2(?=$|[\s).,:;!?])/.test(title)) found.push('emphasis');
  if (title.includes('`')) found.push('code');
  if (/\[[^\]]*\]\(/.test(title)) found.push('a link');
  return found;
}

/** A line whose own content is only JSX tags, such as `</Tab>` or `<Callout>x</Callout>`. */
const jsxOnly = (line: string): boolean => /^<.*>$/.test(line.trim());

/** A line that ends the paragraph above it, so a component on the next line is not glued to it. */
const endsParagraph = (line: string): boolean =>
  line.trim() === '' ||
  jsxOnly(line) ||
  /^\s{0,3}(?:#{1,6}(?:\s|$)|(?:[-*_]\s*){3,}$|\||import\s|export\s)/.test(line);

/**
 * A line that starts a new block, so it does not continue a paragraph above it. A list item or a
 * blockquote interrupts a paragraph, but a component after one is still glued in by lazy
 * continuation, which is why `endsParagraph` does not accept them.
 */
const startsBlock = (line: string): boolean =>
  endsParagraph(line) || /^\s{0,3}(?:>|[-*+]\s|1[.)]\s)/.test(line);

export interface LintOptions {
  /** Components usable without an import. Defaults to `components/mdx.tsx` plus Fumadocs' defaults. */
  components?: ReadonlySet<string>;
}

export function lintSource(source: string, options: LintOptions = {}): Finding[] {
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
    const component = /<([A-Z][A-Za-z0-9]*)[\s/>]/.exec(heading.replace(/`[^`]*`/g, ' '));
    if (component)
      add('component-in-heading', m.index, `move <${component[1]}> out of the heading text`);
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

  const known = options.components ?? defaultKnownComponents();
  const local = localNames(text);
  for (const m of text.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>.])/g)) {
    const name = m[1];
    if (known.has(name) || local.has(name)) continue;
    add('unknown-component', m.index, `<${name}> is not registered; add it to components/mdx.tsx`);
  }

  for (const m of text.matchAll(/<(Callout|Accordion|Tabs)(?=[\s/>])/g)) {
    const tag = openingTag(source, m.index);
    if (m[1] === 'Callout') {
      const type = attribute(tag, 'type');
      if (type !== undefined && !CALLOUT_TYPES.includes(type)) {
        add('callout-type', m.index, `type="${type}": use one of ${CALLOUT_TYPES.join(', ')}`);
      }
    }
    if (m[1] !== 'Tabs') {
      const title = attribute(tag, 'title');
      const kinds = title === undefined ? [] : markdownIn(title);
      if (kinds.length) {
        add(
          'markdown-in-title',
          m.index,
          `title holds ${kinds.join(' + ')}; write it as plain text`,
        );
      }
    }
    if (m[1] === 'Tabs' && /\sdefaultValue\s*=\s*\{\s*null\s*\}/.test(tag)) {
      add(
        'tabs-null-default',
        m.index,
        'delete defaultValue={null}; the first tab is then selected',
      );
    }
  }

  const lines = text.split('\n');
  let offset = 0;
  const single = new RegExp(
    `<(${BLOCK_COMPONENTS})\\b[^>]*>.*?</\\1>|<(?:${BLOCK_COMPONENTS})\\b[^>]*/>`,
  );
  for (const [i, line] of lines.entries()) {
    const m = single.exec(line);
    if (m) {
      const before = line
        .slice(0, m.index)
        .replace(/^\s*(?:[-*+]|\d+[.)]|>)\s+/, '')
        .trim();
      const after = line.slice(m.index + m[0].length).trim();
      const selfClosing = m[1] === undefined;
      const where: string[] = [];
      if (before !== '' && !before.endsWith('>')) where.push('text before it on the line');
      if (after !== '' && !after.startsWith('<')) where.push('text after it on the line');
      if (!selfClosing) {
        if (i > 0 && !endsParagraph(lines[i - 1])) where.push('text on the line above');
        if (i + 1 < lines.length && !startsBlock(lines[i + 1]))
          where.push('text on the line below');
      }
      if (where.length) {
        const name = m[1] ?? /<(\w+)/.exec(m[0])?.[1];
        add(
          'block-component-in-paragraph',
          offset + m.index,
          `<${name}> has ${where.join(' and ')}; put its tags on their own lines with a blank line before and after`,
        );
      }
    }
    offset += line.length + 1;
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
