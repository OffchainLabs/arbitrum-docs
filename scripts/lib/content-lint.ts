/**
 * content-lint: MDX that compiles, passes Prettier and `check-links`, and still renders wrong.
 *
 * Text rules read code-masked source (`stripCode`); component rules inspect the MDX syntax tree.
 * Neither reports examples inside code, except `var-in-code`, which deliberately looks there.
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
 *                         A block component (`<Callout>`, `<Tabs>`, `<Cards>`, …) in a paragraph
 *                         whose contents prevent Fumadocs from removing its paragraph wrapper.
 *                         MDX puts it inside a `<p>`, the browser closes the `<p>` at its `<div>`,
 *                         and React hydration fails. Put the tags on their own lines, with a blank
 *                         line before and after.
 *   tabs-null-default     `<Tabs defaultValue={null}>`, a Docusaurus-era prop. Fumadocs takes it
 *                         as the selected tab, so every panel is hidden until a click. Delete it.
 */
import { createProcessor } from '@mdx-js/mdx';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkMath from 'remark-math';

import { MALFORMED_VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';
import { codeRegions, maskCode, stripCode } from './strip-code.ts';

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
const BLOCK_COMPONENTS = new Set([
  'Callout',
  'Accordions',
  'Accordion',
  'Tabs',
  'Tab',
  'Cards',
  'Card',
  'Steps',
  'Step',
]);

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

// Local structural types: mdast/estree are transitive dependencies, not importable here.
interface ExpressionNode {
  type: string;
  start?: number;
  name?: string | ExpressionNode;
  object?: ExpressionNode;
  property?: ExpressionNode;
  openingElement?: ExpressionNode;
  attributes?: { type: string; name?: ExpressionNode; value?: ExpressionNode | null }[];
  expression?: ExpressionNode;
  value?: unknown;
  expressions?: ExpressionNode[];
  quasis?: { value: { cooked?: string | null } }[];
  body?: { expression?: ExpressionNode }[];
}

interface MdxAttribute {
  type: string;
  name?: string;
  data?: { estree?: ExpressionNode };
  value?: string | null | { data?: { estree?: ExpressionNode } };
}

interface MdxNode {
  type: string;
  name?: string | null;
  value?: string;
  attributes?: MdxAttribute[];
  children?: MdxNode[];
  data?: { estree?: ExpressionNode };
  position?: { start: { offset?: number } };
}

const componentParser = createProcessor({ remarkPlugins: [remarkGfm, remarkMath] });

function jsxName(node: ExpressionNode | undefined): string | undefined {
  if (node?.type === 'JSXIdentifier' && typeof node.name === 'string') return node.name;
  if (node?.type === 'JSXMemberExpression') {
    const object = jsxName(node.object);
    const property = jsxName(node.property);
    if (object && property) return `${object}.${property}`;
  }
  return undefined;
}

/** Real JSX inside {expressions}, including attribute expressions, uses ESTree nodes. */
function expressionElements(value: unknown, check: (node: MdxNode) => void): void {
  if (!value || typeof value !== 'object') return;
  const node = value as ExpressionNode;
  if (node.type === 'JSXElement' && node.openingElement) {
    const opening = node.openingElement;
    check({
      type: 'mdxJsxTextElement',
      name: typeof opening.name === 'object' ? jsxName(opening.name) : undefined,
      position: { start: { offset: opening.start } },
      attributes: opening.attributes
        ?.filter((a) => a.type === 'JSXAttribute')
        .map((a) => ({
          type: 'mdxJsxAttribute',
          name: jsxName(a.name),
          value:
            a.value?.type === 'Literal' && typeof a.value.value === 'string'
              ? a.value.value
              : {
                  data: {
                    estree: { type: 'Program', body: [{ expression: a.value?.expression }] },
                  },
                },
        })),
    });
  }
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) expressionElements(item, check);
    } else expressionElements(child, check);
  }
}

function componentTree(source: string): MdxNode | undefined {
  try {
    // Keep code and attributes intact: the parser knows which are strings, code or real JSX.
    // Only frontmatter is masked, at its original offsets, as the build removes it before MDX.
    return componentParser.parse(
      maskCode(source, {
        frontmatter: true,
        fences: false,
        inlineCode: false,
      }),
    ) as unknown as MdxNode;
  } catch {
    // These rules target valid MDX that renders wrong. Syntax errors already fail compilation;
    // the text-based rules still report independent defects in malformed sources.
    return undefined;
  }
}

function attributeExpression(node: MdxNode, name: string): ExpressionNode | undefined {
  const value = node.attributes?.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === name,
  )?.value;
  return typeof value === 'object' && value !== null
    ? value.data?.estree?.body?.[0]?.expression
    : undefined;
}

/** Literal attribute text, including a quoted expression or a static template literal. */
function stringAttribute(node: MdxNode, name: string): string | undefined {
  const value = node.attributes?.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === name,
  )?.value;
  if (typeof value === 'string') return value;
  const expression = attributeExpression(node, name);
  if (expression?.type === 'Literal' && typeof expression.value === 'string')
    return expression.value;
  if (expression?.type === 'TemplateLiteral' && expression.expressions?.length === 0)
    return expression.quasis?.[0]?.value.cooked ?? undefined;
  return undefined;
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

/**
 * Fumadocs' remark-unravel removes a paragraph only if every child is JSX, an expression or
 * whitespace, and at least one is JSX/an expression. Anything else preserves the <p> wrapper.
 */
const unravels = (node: MdxNode): boolean =>
  !!node.children?.some((c) => c.type === 'mdxJsxTextElement' || c.type === 'mdxTextExpression') &&
  node.children.every(
    (c) =>
      c.type === 'mdxJsxTextElement' ||
      c.type === 'mdxTextExpression' ||
      (c.type === 'text' && c.value?.trim() === ''),
  );

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
  const reportedHeadings = new Set<number>();
  function checkElement(node: MdxNode, inParagraph: boolean, headingOffset?: number): void {
    const name = node.name;
    const index = node.position?.start.offset;
    if (!name || index === undefined) return;
    const rootName = name.split('.')[0];
    if (/^[A-Z]/.test(rootName) && !known.has(rootName) && !local.has(rootName)) {
      add(
        'unknown-component',
        index,
        `<${rootName}> is not registered; add it to components/mdx.tsx`,
      );
    }
    if (
      /^[A-Z]/.test(rootName) &&
      headingOffset !== undefined &&
      !reportedHeadings.has(headingOffset)
    ) {
      add('component-in-heading', headingOffset, `move <${name}> out of the heading text`);
      reportedHeadings.add(headingOffset);
    }
    if (name === 'Callout') {
      const type = stringAttribute(node, 'type');
      if (type !== undefined && !CALLOUT_TYPES.includes(type)) {
        add('callout-type', index, `type="${type}": use one of ${CALLOUT_TYPES.join(', ')}`);
      }
    }
    if (name === 'Callout' || name === 'Accordion') {
      const title = stringAttribute(node, 'title');
      const kinds = title === undefined ? [] : markdownIn(title);
      if (kinds.length) {
        add('markdown-in-title', index, `title holds ${kinds.join(' + ')}; write it as plain text`);
      }
    }
    const defaultValue = attributeExpression(node, 'defaultValue');
    if (name === 'Tabs' && defaultValue?.type === 'Literal' && defaultValue.value === null) {
      add('tabs-null-default', index, 'delete defaultValue={null}; the first tab is then selected');
    }
    if (inParagraph && BLOCK_COMPONENTS.has(name)) {
      add(
        'block-component-in-paragraph',
        index,
        `<${name}> is inside a paragraph; put its tags on their own lines with a blank line before and after`,
      );
    }
  }

  function visit(node: MdxNode, inParagraph = false, headingOffset?: number): void {
    if (node.type === 'paragraph') inParagraph = !unravels(node);
    if (node.type === 'heading') headingOffset = node.position?.start.offset;
    if (node.type === 'mdxJsxFlowElement') inParagraph = false;
    if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
      checkElement(node, inParagraph, headingOffset);
      for (const attribute of node.attributes ?? []) {
        if (attribute.value && typeof attribute.value === 'object')
          expressionElements(attribute.value.data?.estree, (element) =>
            checkElement(element, false, headingOffset),
          );
        expressionElements(attribute.data?.estree, (element) =>
          checkElement(element, false, headingOffset),
        );
      }
    }
    expressionElements(node.data?.estree, (element) =>
      checkElement(element, inParagraph, headingOffset),
    );
    for (const child of node.children ?? []) visit(child, inParagraph, headingOffset);
  }
  const tree = componentTree(source);
  if (tree) visit(tree);

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
