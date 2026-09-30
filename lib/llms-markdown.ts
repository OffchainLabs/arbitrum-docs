/**
 * llms-markdown: how MDX components read in the markdown mirrors (`/docs/<slug>.md`,
 * `/llms.mdx/**`) and `/llms-full.txt`.
 *
 * Fumadocs stringifies each page's final mdast into `_markdown` (`postprocess.
 * includeProcessedMarkdown` in source.config.ts), and by default writes every JSX element back out
 * as JSX: a reader of the mirror sees `<Var name="…" />` instead of the value and `<Term id="…">`
 * around every glossary word. `llmsStringify` is the `stringify` hook Fumadocs calls for each node
 * before its default; it returns plain markdown for the site's components and `undefined` for
 * everything else. It runs on the tree, so fenced and inline code (which are not JSX nodes) are
 * never touched, and it does not change the rendered page, which compiles from the same tree.
 *
 * - `<Var name>` becomes its value from content/vars.json. An unknown name keeps the tag, so a
 *   typo stays visible, as `lib/var-links.ts` does for `{var:…}`.
 * - `<Term>`, `<Steps>`, `<Step>`, `<Accordions>`, `<Tabs>` and any other capitalised component
 *   become their children. A self-closing widget (`<VendingMachine />`) becomes nothing.
 * - `<Callout type title>` becomes a blockquote opening with the bold title, or the type's label.
 * - `<Accordion title>` and `<Tab value>` become a level-4 heading and their body.
 * - `<Cards>` of `<Card title href description>` become a link list; a lone `<Card>` a link line.
 * - `<AEL address chainID>` becomes a link to the address on the chain's explorer.
 * - `<ImageZoom>` becomes a markdown image, from its own `src`/`alt` or its `<img>` child's.
 * - Lower-case elements (`<table>`, `<a>`, `<br />`) are HTML and stay as they are.
 * - A string-literal expression (`{' '}`) becomes its text; other expressions stay.
 *
 * Covered by `scripts/lib/llms-markdown.test.ts`, which compiles fixtures through the same
 * Fumadocs plugin.
 */
import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms';

import { readVars } from './var-links.ts';

type Hook = NonNullable<LLMsOptions['stringify']>;
type Node = Parameters<Hook>[0];
type Parent = Parameters<Hook>[1];
type State = Parameters<Hook>[2];
type Info = Parameters<Hook>[3];

/** The slice of an `mdxJsxFlowElement` / `mdxJsxTextElement` this module reads. */
interface JsxElement {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
  children: Node[];
  data?: Record<string, unknown>;
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

let vars: Record<string, unknown> | undefined;

export interface LlmsStringifyOptions {
  /** Values for `<Var>`. Defaults to content/vars.json, read on first use. */
  vars?: Readonly<Record<string, unknown>>;
}

/** Build the hook. `llmsStringify` is this with the defaults. */
export function createLlmsStringify({ vars: given }: LlmsStringifyOptions = {}): Hook {
  const values = (): Readonly<Record<string, unknown>> => given ?? (vars ??= readVars());

  return (node, parent, state, info) => {
    if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') {
      // `{' '}` and other string literals read as their text; any other expression is code.
      const literal = /^\s*(['"])((?:(?!\1)[^\\\n])*)\1\s*$/.exec(node.value);
      return literal ? literal[2] || ' ' : undefined;
    }
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return undefined;
    const element = node as unknown as JsxElement;
    const name = element.name ?? '';
    // A fragment (`<>…</>`) is only a wrapper. Lower case is HTML, which markdown carries as is.
    if (name !== '' && !/^[A-Z]/.test(name)) return undefined;

    const out = componentMarkdown(element, name, parent, state, info, values);
    if (out === undefined) return undefined;
    if (out !== '') return out;
    // Fumadocs treats an empty return as "no override" and would print the JSX, so an element
    // that reads as nothing says so through the node data its stringifier honours instead.
    element.data = { ...element.data, _stringify: { text: '' } };
    return undefined;
  };
}

export const llmsStringify: Hook = createLlmsStringify();

function componentMarkdown(
  element: JsxElement,
  name: string,
  parent: Parent,
  state: State,
  info: Info,
  values: () => Readonly<Record<string, unknown>>,
): string | undefined {
  switch (name) {
    case 'Var': {
      const key = attribute(element, 'name');
      const all = values();
      if (key === undefined || !Object.hasOwn(all, key)) return undefined;
      return String(all[key]);
    }
    case 'Callout': {
      const title = attribute(element, 'title');
      const type = attribute(element, 'type') ?? 'info';
      const label = title ?? CALLOUT_LABELS[type] ?? 'Note';
      const heading = paragraph([strong(label)]);
      if (element.type === 'mdxJsxTextElement') {
        return phrasing(
          state,
          synthetic('paragraph', [strong(label), text(' '), ...element.children]),
          info,
        );
      }
      return state.handle(
        synthetic('blockquote', [heading, ...element.children]),
        parent,
        state,
        info,
      );
    }
    case 'Accordion':
    case 'Tab': {
      const title = attribute(element, 'title') ?? attribute(element, 'value');
      if (title === undefined || element.type === 'mdxJsxTextElement') {
        return children(element, state, info);
      }
      return flow(
        state,
        [synthetic('heading', [text(title)], { depth: PANEL_HEADING_DEPTH }), ...element.children],
        info,
      );
    }
    case 'Cards':
      return flow(state, cardBlocks(element), info);
    case 'Card': {
      const line = paragraph(cardLine(element));
      return flow(state, [line, ...element.children], info);
    }
    case 'AEL': {
      const address = attribute(element, 'address');
      if (address === undefined) return children(element, state, info);
      const root = EXPLORER_ROOTS[attribute(element, 'chainID') ?? ''];
      const node = root
        ? synthetic('link', [text(address)], { url: `${root}/${address}` })
        : synthetic('inlineCode', [], { value: address });
      return state.handle(node, parent, state, info);
    }
    case 'ImageZoom': {
      const source = imageSource(element);
      if (source === undefined) return children(element, state, info);
      return state.handle(
        synthetic('image', [], { url: source.src, alt: source.alt ?? '' }),
        parent,
        state,
        info,
      );
    }
    default:
      return children(element, state, info);
  }
}

/** The children alone, as flow or as phrasing to match the element. */
function children(element: JsxElement, state: State, info: Info): string {
  const parent = element as unknown as Parameters<State['containerFlow']>[0];
  return element.type === 'mdxJsxFlowElement'
    ? state.containerFlow(parent, info)
    : state.containerPhrasing(parent as Parameters<State['containerPhrasing']>[0], info);
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

/** Consecutive `<Card>` children become one list; anything else between them stays in order. */
function cardBlocks(cards: JsxElement): Node[] {
  const out: Node[] = [];
  let items: Node[] = [];
  const flush = (): void => {
    if (items.length > 0) out.push(synthetic('list', items, { ordered: false, spread: false }));
    items = [];
  };
  for (const child of cards.children) {
    const card = child as unknown as JsxElement;
    if (card.type === 'mdxJsxFlowElement' && card.name === 'Card') {
      items.push(
        synthetic('listItem', [paragraph(cardLine(card)), ...card.children], { spread: false }),
      );
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

/** `[title](href): description`, or the bold title when there is no link. */
function cardLine(card: JsxElement): Node[] {
  const title = attribute(card, 'title') ?? '';
  const href = attribute(card, 'href');
  const description = attribute(card, 'description');
  const head = href ? synthetic('link', [text(title)], { url: href }) : strong(title);
  return description ? [head, text(`: ${description}`)] : [head];
}

/** `src`/`alt` on the element, or on the first `<img>` inside it. */
function imageSource(element: JsxElement): { src: string; alt?: string } | undefined {
  const src = attribute(element, 'src');
  if (src) return { src, alt: attribute(element, 'alt') };
  for (const child of element.children) {
    const nested = child as unknown as JsxElement;
    if (nested.type !== 'mdxJsxFlowElement' && nested.type !== 'mdxJsxTextElement') {
      const inner = (child as { children?: Node[] }).children;
      if (!inner) continue;
      const found = imageSource({ ...element, attributes: [], children: inner });
      if (found) return found;
      continue;
    }
    if (nested.name === 'img') {
      const url = attribute(nested, 'src');
      if (url) return { src: url, alt: attribute(nested, 'alt') };
    }
    const found = imageSource(nested);
    if (found) return found;
  }
  return undefined;
}

/** Blocks joined as markdown flow content, under a root built for output only. */
function flow(state: State, kids: Node[], info: Info): string {
  return state.containerFlow(
    synthetic('root', kids) as Parameters<State['containerFlow']>[0],
    info,
  );
}

function phrasing(state: State, parent: Node, info: Info): string {
  return state.containerPhrasing(parent as Parameters<State['containerPhrasing']>[0], info);
}

/** A node built for output only; it never enters the compiled tree. */
function synthetic(type: string, kids: Node[], fields: Record<string, unknown> = {}): Node {
  return { type, children: kids, ...fields } as unknown as Node;
}

function text(value: string): Node {
  return { type: 'text', value } as unknown as Node;
}

function strong(value: string): Node {
  return synthetic('strong', [text(value)]);
}

function paragraph(kids: Node[]): Node {
  return synthetic('paragraph', kids);
}
