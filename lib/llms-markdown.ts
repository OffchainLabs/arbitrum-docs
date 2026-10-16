/**
 * llms-markdown: how MDX components read in the markdown mirrors (`/<slug>.md`,
 * `/llms.mdx/**`) and `/llms-full.txt`.
 *
 * Fumadocs' `remarkLLMs` (`postprocess.includeProcessedMarkdown` in source.config.ts) runs after
 * every plugin in `lib/mdx-options.ts` and slices each page's authored source by node position
 * into `_markdown`. Left alone, a reader of the mirror sees `<Var name="…" />` instead of the
 * value and `<Term id="…">` around every glossary word. `remarkLlmsMarkdown` walks the tree and
 * records, with `replaceSource()` from `fumadocs-core/mdx-plugins/stringifier`, the markdown the
 * slicer prints in place of each of the site's components. A replacement can be a function; it
 * receives the stringifier, so the edits inside the component (a `<Var>` in a `<Callout>`) still
 * apply. Fenced and inline code are not JSX nodes and are never edited. The rendered page is
 * unchanged: edits live beside the tree, not in it. A plugin that only mutates or removes a node
 * leaves the mirror as authored, which is why `lib/var-links.ts` and `lib/mdx-comments.ts` record
 * their edits the same way.
 *
 * - `<Var name>` becomes its value from content/vars.json. An unknown name keeps the tag, so a
 *   typo stays visible, as `lib/var-links.ts` does for `{var:…}`.
 * - `<Term>`, `<Steps>`, `<Step>`, `<Accordions>`, `<Tabs>` and any other capitalised component
 *   become their children, one blank line between blocks. A self-closing widget
 *   (`<VendingMachine />`) becomes nothing.
 * - `<Callout type title>` becomes a blockquote opening with the bold title, or the type's label.
 * - `<Accordion title>` and `<Tab value>` become a level-4 heading and their body.
 * - `<Cards>` of `<Card title href description>` become a link list; a lone `<Card>` a link line.
 * - `<AEL address chainID>` becomes a link to the address on the chain's explorer.
 * - `<ImageZoom>` becomes a markdown image, from its own `src`/`alt` or its `<img>` child's.
 * - Lower-case elements (`<table>`, `<a>`, `<br />`) are HTML and stay as they are.
 * - A string-literal expression (`{' '}`) becomes its text; other expressions stay.
 *
 * Covered by `scripts/lib/llms-markdown.test.ts`, which compiles fixtures through this plugin and
 * `remarkLLMs` in the order fumadocs-mdx runs them.
 */
import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';

import { VARS_PATH, compilerOf, readVars } from './var-links.ts';

type SourceFile = Parameters<typeof replaceSource>[0];
type SourceNode = Parameters<typeof replaceSource>[1];
type Replacement = Parameters<typeof replaceSource>[2];
type Stringifier = Parameters<Extract<Replacement, (s: never) => string>>[0];

/** The stringifier only reads a node's position, so the local shape is enough. */
const asSource = (node: Node): SourceNode => node as SourceNode;

/** The slice of an mdast node this module reads. */
interface Node {
  type: string;
  value?: unknown;
  children?: Node[];
}

/** The slice of an `mdxJsxFlowElement` / `mdxJsxTextElement` this module reads. */
interface JsxElement extends Node {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
  children: Node[];
}

/** The label a `<Callout>` with no title opens with. */
const CALLOUT_LABELS: Readonly<Record<string, string>> = {
  info: 'Note',
  warn: 'Warning',
  warning: 'Warning',
  error: 'Caution',
  idea: 'Tip',
  success: 'Success',
};

/**
 * Explorer roots by chain ID, the same table `components/mdx/AddressExplorerLink.tsx` renders
 * from (the test checks the two agree). Copied, because that module pulls in ethers.
 */
export const EXPLORER_ROOTS: Readonly<Record<string, string>> = {
  1: 'https://etherscan.io/address',
  42161: 'https://arbiscan.io/address',
  42170: 'https://nova.arbiscan.io/address',
  8453: 'https://basescan.org/address',
  11155111: 'https://sepolia.etherscan.io/address',
  421614: 'https://sepolia.arbiscan.io/address',
  84532: 'https://sepolia.basescan.org/address',
};

/** Heading depth for an accordion or tab title: below any section heading a page would use. */
const PANEL_HEADING_DEPTH = 4;

export interface RemarkLlmsMarkdownOptions {
  /** Values for `<Var>`. Without them, the plugin reads content/vars.json on every compile. */
  vars?: Readonly<Record<string, unknown>>;
}

/** The remark plugin. Records a markdown replacement for every component node it recognises. */
export function remarkLlmsMarkdown({ vars }: RemarkLlmsMarkdownOptions = {}): (
  tree: Node,
  file: SourceFile,
) => void {
  return (tree, file) => {
    // Read per compile and registered as a dependency, as `lib/var-links.ts` does, so an edit to
    // vars.json recompiles the page under `pnpm dev`.
    const values = vars ?? readVars();
    if (vars === undefined) compilerOf(file)?.addDependency(VARS_PATH);
    const walk = (node: Node): void => {
      const markdown = markdownOf(node, values);
      if (markdown !== undefined) replaceSource(file, asSource(node), markdown);
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

function markdownOf(
  node: Node,
  values: Readonly<Record<string, unknown>>,
): Replacement | undefined {
  if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') {
    // `{' '}` and other string literals read as their text; any other expression is code.
    const literal = /^\s*(['"])((?:(?!\1)[^\\\n])*)\1\s*$/.exec(String(node.value));
    return literal ? literal[2] || ' ' : undefined;
  }
  if (!isJsxElement(node)) return undefined;
  const name = node.name ?? '';
  // A fragment (`<>…</>`) is only a wrapper. Lower case is HTML, which markdown carries as is.
  if (name !== '' && !/^[A-Z]/.test(name)) return undefined;
  return componentMarkdown(node, name, values);
}

function componentMarkdown(
  element: JsxElement,
  name: string,
  values: Readonly<Record<string, unknown>>,
): Replacement | undefined {
  switch (name) {
    case 'Var': {
      const key = attribute(element, 'name');
      if (key === undefined || !Object.hasOwn(values, key)) return undefined;
      return String(values[key]);
    }
    case 'Callout': {
      const type = attribute(element, 'type') ?? 'info';
      const label = attribute(element, 'title') ?? CALLOUT_LABELS[type] ?? 'Note';
      if (element.type === 'mdxJsxTextElement')
        return (s) => `**${label}** ${s.inner(asSource(element))}`;
      return (s) => quote(`**${label}**\n\n${blocks(s, element)}`);
    }
    case 'Accordion':
    case 'Tab': {
      const title = attribute(element, 'title') ?? attribute(element, 'value');
      if (title === undefined || element.type === 'mdxJsxTextElement') return unwrap(element);
      return (s) => `${'#'.repeat(PANEL_HEADING_DEPTH)} ${title}\n\n${blocks(s, element)}`;
    }
    case 'Cards':
      return (s) =>
        element.children
          .map((child) => `${isCard(child) ? '* ' : ''}${s.stringify(asSource(child))}`)
          .join('\n');
    case 'Card': {
      const line = cardLine(element);
      if (element.children.length === 0) return line;
      return (s) => `${line}\n\n${blocks(s, element)}`;
    }
    case 'AEL': {
      const address = attribute(element, 'address');
      if (address === undefined) return unwrap(element);
      const root = EXPLORER_ROOTS[attribute(element, 'chainID') ?? ''];
      return root ? `[${address}](${root}/${address})` : `\`${address}\``;
    }
    case 'ImageZoom': {
      const source = imageSource(element);
      if (source === undefined) return unwrap(element);
      return `![${source.alt ?? ''}](${source.src})`;
    }
    default:
      return unwrap(element);
  }
}

function isJsxElement(node: Node): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

function isCard(node: Node): node is JsxElement {
  return isJsxElement(node) && node.type === 'mdxJsxFlowElement' && node.name === 'Card';
}

/** The children alone. A flow element's children are blocks, so a blank line separates them. */
function unwrap(element: JsxElement): Replacement {
  if (element.type === 'mdxJsxTextElement') return (s) => s.inner(asSource(element));
  return (s) => blocks(s, element);
}

/**
 * The children of a flow element as markdown, one blank line apart. Authored source has a single
 * newline between sibling components (`</Tab>\n<Tab>`), which would run their bodies together.
 */
function blocks(s: Stringifier, element: JsxElement): string {
  return element.children
    .map((child) => s.stringify(asSource(child)))
    .filter((text) => text !== '')
    .join('\n\n');
}

/** A blockquote: every line prefixed, a bare `>` on an empty line. */
function quote(text: string): string {
  return text
    .split('\n')
    .map((line) => (line === '' ? '>' : `> ${line}`))
    .join('\n');
}

/** A literal attribute, or the source of an expression attribute (`chainID={42161}`). */
function attribute(element: JsxElement, name: string): string | undefined {
  const attr = element.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  if (!attr) return undefined;
  if (typeof attr.value === 'string') return attr.value;
  const expression = attr.value as { value?: unknown } | null | undefined;
  if (typeof expression?.value !== 'string') return undefined;
  // A string literal in braces (`title={'x'}`) reads as the string.
  return expression.value.trim().replace(/^(['"`])([\s\S]*)\1$/, '$2');
}

/** `[title](href): description`, or the bold title when there is no link. */
function cardLine(card: JsxElement): string {
  const title = attribute(card, 'title') ?? '';
  const href = attribute(card, 'href');
  const description = attribute(card, 'description');
  const head = href ? `[${title}](${href})` : `**${title}**`;
  return description ? `${head}: ${description}` : head;
}

/** `src`/`alt` on the element, or on the first `<img>` inside it. */
function imageSource(element: JsxElement): { src: string; alt?: string } | undefined {
  const src = attribute(element, 'src');
  if (src) return { src, alt: attribute(element, 'alt') };
  for (const child of element.children) {
    if (!isJsxElement(child)) {
      if (!child.children) continue;
      const found = imageSource({ ...element, attributes: [], children: child.children });
      if (found) return found;
      continue;
    }
    if (child.name === 'img') {
      const url = attribute(child, 'src');
      if (url) return { src: url, alt: attribute(child, 'alt') };
    }
    const found = imageSource(child);
    if (found) return found;
  }
  return undefined;
}
