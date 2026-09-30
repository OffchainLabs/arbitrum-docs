/**
 * Content of tab and accordion panels that Fumadocs leaves empty in the server HTML, recovered
 * from the page's markdown export (`/docs/<slug>.md`, served by app/llms.mdx). The export is
 * processed MDX: includes are resolved, but `<Var>`, `<Term>` and the panel components are still
 * JSX, so each is rendered here the way the page renders it.
 */
import { createProcessor } from '@mdx-js/mdx';
import type { Element, ElementContent, Root as HastRoot } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import { type Handler, type State, toHast } from 'mdast-util-to-hast';
import remarkGfm from 'remark-gfm';

import { type HiddenPanel, extractHidden } from './extract.ts';
import type { Block } from './schema.ts';

interface JsxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface JsxNode {
  type: string;
  name?: string | null;
  attributes?: JsxAttribute[];
  children?: unknown[];
}

const attribute = (node: JsxNode, name: string): string | undefined => {
  const found = node.attributes?.find(
    (attr) => attr.type === 'mdxJsxAttribute' && attr.name === name,
  );
  return typeof found?.value === 'string' ? found.value : undefined;
};

/** String attributes of an HTML element written as JSX, in hast property form. */
const htmlProperties = (node: JsxNode): Element['properties'] => {
  const properties: Element['properties'] = {};
  for (const attr of node.attributes ?? []) {
    if (attr.type !== 'mdxJsxAttribute' || !attr.name || typeof attr.value !== 'string') continue;
    const name = attr.name === 'class' || attr.name === 'className' ? 'className' : attr.name;
    properties[name] = name === 'className' ? attr.value.split(/\s+/) : attr.value;
  }
  return properties;
};

const element = (
  tagName: string,
  properties: Element['properties'],
  children: ElementContent[],
): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});

function jsxHandler(vars: Record<string, unknown>): Handler {
  return (state: State, node: JsxNode) => {
    const inline = node.type === 'mdxJsxTextElement';
    const children = (): ElementContent[] => state.all(node as Parameters<State['all']>[0]);
    switch (node.name) {
      case 'Var': {
        const value = vars[attribute(node, 'name') ?? ''];
        return { type: 'text', value: value === undefined || value === null ? '' : String(value) };
      }
      case 'Accordion':
        return element(
          'div',
          { dataParityPanel: 'accordion', dataParityLabel: attribute(node, 'title') ?? '' },
          children(),
        );
      case 'Tab':
        return element(
          'div',
          {
            dataParityPanel: 'tab',
            dataParityLabel: attribute(node, 'value') ?? attribute(node, 'title') ?? '',
          },
          children(),
        );
      case 'Callout': {
        const title = attribute(node, 'title');
        const heading = title
          ? [element('p', { dataParityCalloutTitle: '' }, [{ type: 'text', value: title }])]
          : [];
        return element('div', {}, [...heading, ...children()]);
      }
      default:
        if (node.name && /^[a-z][a-z0-9]*$/.test(node.name))
          return element(node.name, htmlProperties(node), children());
        return element(inline ? 'span' : 'div', {}, children());
    }
  };
}

const codeHandler: Handler = (
  _state,
  node: { lang?: string | null; meta?: string | null; value: string },
) => {
  const title = /title="([^"]*)"/.exec(node.meta ?? '')?.[1];
  return element('pre', title ? { dataParityTitle: title } : {}, [
    element('code', {}, [{ type: 'text', value: node.value }]),
  ]);
};

/** Parse a markdown export into a hast tree with every panel's content in place. */
export function markdownToHast(markdown: string, vars: Record<string, unknown>): HastRoot {
  const processor = createProcessor({ format: 'mdx', remarkPlugins: [remarkGfm] });
  const mdast = processor.parse(markdown) as MdastRoot;
  const jsx = jsxHandler(vars);
  const tree = toHast(mdast, {
    handlers: { code: codeHandler },
    unknownHandler: (state, node: JsxNode) =>
      node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'
        ? jsx(state, node, undefined)
        : undefined,
  });
  return tree.type === 'root' ? tree : { type: 'root', children: [tree as ElementContent] };
}

const panelKey = (type: string, label: string): string =>
  `${type}:${label.replace(/\s+/g, ' ').trim().toLowerCase()}`;

/**
 * Blocks for every panel in a markdown export, keyed by `type:label` and listed in document order,
 * so the n-th empty panel with a label takes the n-th panel with that label.
 */
export function panelBlocks(
  markdown: string,
  vars: Record<string, unknown>,
  baseUrl: string,
): Map<string, Block[][]> {
  const tree = markdownToHast(markdown, vars);
  const panels = new Map<string, Block[][]>();
  const visit = (node: HastRoot | ElementContent): void => {
    if (node.type === 'element' && node.properties.dataParityPanel !== undefined) {
      const key = panelKey(
        String(node.properties.dataParityPanel),
        String(node.properties.dataParityLabel ?? ''),
      );
      const list = panels.get(key) ?? [];
      list.push(extractHidden(tree, node.children, baseUrl));
      panels.set(key, list);
    }
    if ('children' in node) for (const child of node.children) visit(child as ElementContent);
  };
  visit(tree);
  return panels;
}

/** The recovered blocks for one hidden panel, or undefined when the export has no such panel. */
export function lookupPanel(
  panels: Map<string, Block[][]>,
  panel: HiddenPanel,
): Block[] | undefined {
  return panels.get(panelKey(panel.type, panel.label))?.[panel.occurrence];
}
