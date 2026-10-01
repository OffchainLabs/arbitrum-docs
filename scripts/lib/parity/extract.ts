/**
 * Article extraction: the main article of a Docusaurus or Fumadocs page, as an ordered list of
 * normalized blocks. Site chrome (navigation, TOC, breadcrumbs, footer, edit and copy buttons,
 * heading anchors, pagination, feedback) never reaches a block.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { fromHtml } from 'hast-util-from-html';

import { imageName, isDefaultCalloutLabel, normalizeCode, normalizeText } from './normalize.ts';
import type { Block, BlockKind } from './schema.ts';

/** A tab or accordion panel the server rendered empty; its content lives in the markdown export. */
export interface HiddenPanel {
  type: 'tab' | 'accordion';
  label: string;
  occurrence: number;
}

/** A block before link canonicalization. A link's `text` is the absolute URL. */
export type RawItem = Block | { kind: 'panel'; panel: HiddenPanel };

export interface Extraction {
  site: 'docusaurus' | 'fumadocs' | 'unknown';
  found: boolean;
  items: RawItem[];
}

type Node = Root | RootContent;

const SKIP_TAGS = new Set([
  'script',
  'style',
  'svg',
  'noscript',
  'template',
  'nav',
  'footer',
  'select',
  'option',
  'input',
  'textarea',
]);

/** Interactive widgets and transient notices, never prose. */
const CHROME_ROLES = new Set(['tablist', 'tab', 'tooltip', 'dialog', 'radiogroup']);

const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'imgcaption',
  'imagewithcaption',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

const classes = (el: Element): string[] => {
  const value = el.properties.className;
  return Array.isArray(value) ? value.map(String) : [];
};
const hasClass = (el: Element, prefix: string): boolean =>
  classes(el).some((name) => name === prefix || name.startsWith(`${prefix}_`));
const prop = (el: Element, name: string): string | undefined => {
  const value = el.properties[name];
  if (value === undefined || value === null || value === false) return undefined;
  return Array.isArray(value) ? value.join(' ') : String(value);
};
const isElement = (node: Node | undefined): node is Element => node?.type === 'element';

function* descendants(node: Node): Generator<Element> {
  if (!('children' in node)) return;
  for (const child of node.children) {
    if (child.type === 'element') {
      yield child;
      yield* descendants(child);
    }
  }
}

const find = (node: Node, test: (el: Element) => boolean): Element | undefined => {
  for (const el of descendants(node)) if (test(el)) return el;
  return undefined;
};

/** Plain text of a subtree, with `<br>` as a newline and skipped chrome left out. */
function plainText(node: Node): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') {
    if (node.tagName === 'br') return '\n';
    if (isChrome(node)) return '';
  }
  if (!('children' in node)) return '';
  return node.children.map((child) => plainText(child)).join('');
}

const isEmpty = (el: Element): boolean =>
  plainText(el).trim() === '' && !find(el, (d) => d.tagName === 'img');

/** Elements that are site chrome or UI on either site, wherever they appear inside the article. */
function isChrome(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (prop(el, 'ariaHidden') === 'true') return true;
  const role = prop(el, 'role');
  if (role && CHROME_ROLES.has(role)) return true;
  if (prop(el, 'ariaLive') !== undefined) return true;
  if (el.properties.dataRadixPopperContentWrapper !== undefined) return true;
  if (el.tagName === 'button' && prop(el, 'ariaLabel') !== undefined) return true;
  return (
    hasClass(el, 'hash-link') ||
    hasClass(el, 'theme-doc-toc-mobile') ||
    hasClass(el, 'theme-doc-footer') ||
    hasClass(el, 'theme-doc-breadcrumbs') ||
    hasClass(el, 'pagination-nav') ||
    hasClass(el, 'katex-html') ||
    hasClass(el, 'buttonGroup')
  );
}

interface Pending {
  text: string[];
  extras: Block[];
}

/** Walks one article subtree and collects blocks in document order. */
class Walker {
  readonly items: RawItem[] = [];
  private readonly byId = new Map<string, Element>();
  private readonly occurrences = new Map<string, number>();
  private pending: Pending = { text: [], extras: [] };

  private readonly baseUrl: string;
  private readonly hidden: boolean;

  constructor(document: Node, baseUrl: string, hidden = false) {
    this.baseUrl = baseUrl;
    this.hidden = hidden;
    for (const el of descendants(document)) {
      const id = prop(el, 'id');
      if (id) this.byId.set(id, el);
    }
  }

  private push(block: Block): void {
    this.items.push(this.hidden ? { ...block, hidden: true } : block);
  }

  private flush(kind: BlockKind, level?: number): void {
    const text = normalizeText(this.pending.text.join(''));
    const extras = this.pending.extras;
    this.pending = { text: [], extras: [] };
    if (text) this.push(level === undefined ? { kind, text } : { kind, text, level });
    for (const extra of extras) this.push(extra);
  }

  /** Collect a container's inline content into one block of `kind`, emitting nested blocks in order. */
  container(
    nodes: ElementContent[],
    kind: BlockKind,
    options: { level?: number; inHeading?: boolean } = {},
  ): void {
    const saved = this.pending;
    this.pending = { text: [], extras: [] };
    this.inline(nodes, kind, options);
    this.flush(kind, options.level);
    this.pending = saved;
  }

  private inline(
    nodes: ElementContent[],
    kind: BlockKind,
    options: { level?: number; inHeading?: boolean },
  ): void {
    for (const node of nodes) {
      if (node.type === 'text') {
        this.pending.text.push(node.value);
        continue;
      }
      if (node.type !== 'element' || isChrome(node)) continue;
      if (BLOCK_TAGS.has(node.tagName) && !options.inHeading) {
        this.flush(kind, options.level);
        this.block(node);
        continue;
      }
      if (node.tagName === 'br') {
        this.pending.text.push(' ');
      } else if (node.tagName === 'img') {
        const image = this.image(node);
        if (image) this.pending.extras.push(image);
      } else if (hasClass(node, 'katex')) {
        const tex = find(node, (d) => d.tagName === 'annotation');
        this.pending.text.push(tex ? plainText(tex) : plainText(node));
      } else if (node.tagName === 'a') {
        const href = prop(node, 'href');
        const before = this.pending.text.length;
        this.inline(node.children, kind, options);
        if (href !== undefined && !(options.inHeading && href.startsWith('#'))) {
          const label = normalizeText(this.pending.text.slice(before).join(''));
          const link = this.link(href, label);
          if (link) this.pending.extras.push(link);
        }
      } else {
        this.inline(node.children, kind, options);
      }
    }
  }

  private link(href: string, label: string): Block | undefined {
    if (/^(javascript|mailto|tel):/i.test(href)) return undefined;
    try {
      return { kind: 'link', text: new URL(href, this.baseUrl).toString(), label };
    } catch {
      return { kind: 'link', text: href, label };
    }
  }

  private image(el: Element): Block | undefined {
    const src = prop(el, 'src');
    if (!src) return undefined;
    const alt = normalizeText(prop(el, 'alt') ?? '');
    return alt
      ? { kind: 'image', text: imageName(src), label: alt }
      : { kind: 'image', text: imageName(src) };
  }

  private code(pre: Element, title: string | undefined): void {
    const codeEl = find(pre, (d) => d.tagName === 'code') ?? pre;
    const text = normalizeCode(plainText(codeEl));
    const block: Block = { kind: 'code', text };
    const cleanTitle = title === undefined ? '' : normalizeText(title);
    if (cleanTitle) block.title = cleanTitle;
    if (text || cleanTitle) this.push(block);
  }

  private panel(type: HiddenPanel['type'], label: string): void {
    const clean = normalizeText(label);
    const key = `${type}:${clean.toLowerCase()}`;
    const occurrence = this.occurrences.get(key) ?? 0;
    this.occurrences.set(key, occurrence + 1);
    this.items.push({ kind: 'panel', panel: { type, label: clean, occurrence } });
  }

  private labelFor(el: Element): string {
    const id = prop(el, 'ariaLabelledBy');
    const trigger = id ? this.byId.get(id) : undefined;
    return trigger ? trigger.children.map((child) => plainText(child)).join('') : '';
  }

  /** Handle one block-level element. */
  block(el: Element): void {
    if (isChrome(el)) return;
    const tag = el.tagName;
    const heading = /^h([1-6])$/.exec(tag);

    if (heading) {
      const kind: BlockKind = prop(el, 'dataAccordionValue') !== undefined ? 'summary' : 'heading';
      this.container(
        el.children,
        kind,
        kind === 'heading' ? { level: Number(heading[1]), inHeading: true } : { inHeading: true },
      );
      return;
    }

    const role = prop(el, 'role');
    if ((role === 'tabpanel' || role === 'region') && isEmpty(el)) {
      this.panel(role === 'tabpanel' ? 'tab' : 'accordion', this.labelFor(el));
      return;
    }

    if (tag === 'pre') {
      this.code(el, prop(el, 'dataParityTitle'));
      return;
    }
    if (hasClass(el, 'theme-code-block') || (tag === 'figure' && hasClass(el, 'shiki'))) {
      const titleEl = find(el, (d) => d.tagName === 'figcaption' || hasClass(d, 'codeBlockTitle'));
      const pre = find(el, (d) => d.tagName === 'pre');
      if (pre) {
        this.code(pre, titleEl ? plainText(titleEl) : undefined);
        return;
      }
    }

    if (hasClass(el, 'theme-admonition') || hasClass(el, 'admonition')) {
      for (const child of el.children) {
        if (!isElement(child)) continue;
        if (hasClass(child, 'admonitionHeading') || hasClass(child, 'admonitionHeader')) {
          this.calloutTitle(plainText(child));
        } else {
          this.block(child);
        }
      }
      return;
    }
    if ((prop(el, 'style') ?? '').includes('--callout-color')) {
      const body = find(el, (d) => hasClass(d, 'flex-col')) ?? el;
      for (const child of body.children) {
        if (!isElement(child)) continue;
        if (child.tagName === 'p' && hasClass(child, 'font-medium'))
          this.calloutTitle(plainText(child));
        else this.block(child);
      }
      return;
    }
    if (el.properties.dataParityCalloutTitle !== undefined) {
      this.calloutTitle(plainText(el));
      return;
    }

    if (tag === 'tr') {
      this.row(el);
      return;
    }

    const kind = blockKindOf(tag);
    if (kind) {
      this.container(el.children, kind);
      return;
    }
    this.container(el.children, 'paragraph');
  }

  private calloutTitle(title: string): void {
    const text = normalizeText(title);
    if (text && !isDefaultCalloutLabel(text)) this.push({ kind: 'callout-title', text });
  }

  private row(tr: Element): void {
    const cells: string[] = [];
    const extras: Block[] = [];
    for (const cell of tr.children) {
      if (!isElement(cell) || (cell.tagName !== 'td' && cell.tagName !== 'th')) continue;
      const nested = new Walker(cell, this.baseUrl);
      nested.container(cell.children, 'paragraph');
      const texts: string[] = [];
      for (const item of nested.items) {
        if (item.kind === 'link' || item.kind === 'image') extras.push(item);
        else if (item.kind === 'code') texts.push(item.text);
        else if (item.kind !== 'panel') texts.push(item.text);
      }
      cells.push(normalizeText(texts.join(' ')));
    }
    if (cells.some((cell) => cell !== ''))
      this.push({ kind: 'table-row', text: cells.join(' | ') });
    for (const extra of extras) this.push(extra);
  }
}

function blockKindOf(tag: string): BlockKind | undefined {
  switch (tag) {
    case 'p':
    case 'dt':
    case 'dd':
      return 'paragraph';
    case 'li':
      return 'list-item';
    case 'blockquote':
      return 'blockquote';
    case 'figcaption':
    case 'imgcaption':
      return 'caption';
    case 'summary':
      return 'summary';
    default:
      return undefined;
  }
}

/** The article roots of a parsed page: the elements whose content is the article. */
function articleRoots(tree: Root): { site: Extraction['site']; roots: Element[] } {
  const docusaurus = find(tree, (el) => hasClass(el, 'theme-doc-markdown'));
  if (docusaurus) return { site: 'docusaurus', roots: [docusaurus] };

  const page = find(tree, (el) => el.tagName === 'article' && prop(el, 'id') === 'nd-page');
  if (page) {
    const roots = page.children.filter(
      (child): child is Element =>
        isElement(child) && (child.tagName === 'h1' || hasClass(child, 'prose')),
    );
    return { site: 'fumadocs', roots };
  }

  const article =
    find(tree, (el) => el.tagName === 'article') ?? find(tree, (el) => el.tagName === 'main');
  return { site: 'unknown', roots: article ? [article] : [] };
}

/** Extract the ordered blocks of a page's main article. `baseUrl` resolves relative links. */
export function extractArticle(html: string, baseUrl: string): Extraction {
  const tree = fromHtml(html);
  const { site, roots } = articleRoots(tree);
  const walker = new Walker(tree, baseUrl);
  for (const root of roots) walker.block(root);
  return { site, found: roots.length > 0, items: walker.items };
}

/** Extract blocks from an arbitrary subtree, marking each as hidden. Used for markdown fallbacks. */
export function extractHidden(document: Root, nodes: ElementContent[], baseUrl: string): Block[] {
  const walker = new Walker(document, baseUrl, true);
  for (const node of nodes) {
    if (isElement(node)) walker.block(node);
    else walker.container([node], 'paragraph');
  }
  return walker.items.filter((item): item is Block => item.kind !== 'panel');
}
