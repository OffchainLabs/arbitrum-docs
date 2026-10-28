/**
 * What the content rules share: the rule type, the code-masked text of a file, and a flat list of
 * every JSX element with the context the component rules need.
 *
 * Text rules match a regex against the masked text, where every fenced block, inline code span and
 * MDX comment is blanked to spaces of the same length, so an example inside code is never reported
 * and an offset in the masked text is an offset in the source. Component rules read the element
 * list, which includes real JSX inside `{expressions}` and attribute expressions. Both are computed
 * once per file and cached on the `SourceCode`.
 */
import type { CustomRuleDefinitionType, RuleVisitor } from '@eslint/core';
import type { Node, Parent, Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isMdxComment } from '../lib/mdx-comments.ts';
import type { MdxSourceCode } from './language.ts';

export type MdxRuleDefinition<
  MessageIds extends string = string,
  RuleOptions extends unknown[] = [],
> = CustomRuleDefinitionType<
  { LangOptions: Record<string, unknown>; Code: MdxSourceCode; Visitor: RuleVisitor; Node: Node },
  { MessageIds: MessageIds; RuleOptions: RuleOptions }
>;

export const REPO_ROOT: string = fileURLToPath(new URL('..', import.meta.url));

// Local structural types: estree nodes as mdast-util-mdx attaches them under `data.estree`.
export interface ExpressionNode {
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
  body?: ExpressionNode[];
  [key: string]: unknown;
}

type WithEstree = Node & { data?: { estree?: ExpressionNode } };

/** One attribute of a JSX element: a literal string, or the expression it holds. */
export interface AttributeView {
  name: string;
  literal?: string;
  expression?: ExpressionNode;
}

/** One JSX element, written as MDX or as real JSX inside an expression. */
export interface ElementView {
  name: string;
  /** Source offset of the opening tag. */
  offset: number;
  attributes: AttributeView[];
  /** Inside a paragraph that keeps its `<p>` wrapper (see `unravels`). */
  inParagraph: boolean;
  /** Source offset of the enclosing heading, if any. */
  headingOffset?: number;
}

const masked = new WeakMap<MdxSourceCode, string>();
const elements = new WeakMap<MdxSourceCode, ElementView[]>();

/** `[start, end)` source ranges of every fence, inline code span and MDX comment. */
function codeRanges(root: Root): [number, number][] {
  const ranges: [number, number][] = [];
  const visit = (node: Node): void => {
    const { position } = node;
    if (
      position?.start.offset !== undefined &&
      position.end.offset !== undefined &&
      (node.type === 'code' || node.type === 'inlineCode' || isMdxComment(node))
    ) {
      ranges.push([position.start.offset, position.end.offset]);
      return;
    }
    for (const child of (node as Parent).children ?? []) visit(child);
  };
  visit(root);
  return ranges;
}

/** The source with code and MDX comments blanked, same length and line count. */
export function maskedText(sourceCode: MdxSourceCode): string {
  let text = masked.get(sourceCode);
  if (text !== undefined) return text;
  const chars = sourceCode.text.split('');
  for (const [start, end] of codeRanges(sourceCode.ast)) {
    for (let i = start; i < end; i++) if (chars[i] !== '\n') chars[i] = ' ';
  }
  text = chars.join('');
  masked.set(sourceCode, text);
  return text;
}

function jsxName(node: ExpressionNode | undefined): string | undefined {
  if (node?.type === 'JSXIdentifier' && typeof node.name === 'string') return node.name;
  if (node?.type === 'JSXMemberExpression') {
    const object = jsxName(node.object);
    const property = jsxName(node.property);
    if (object && property) return `${object}.${property}`;
  }
  return undefined;
}

function estreeAttributes(opening: ExpressionNode): AttributeView[] {
  const out: AttributeView[] = [];
  for (const a of opening.attributes ?? []) {
    if (a.type !== 'JSXAttribute') continue;
    const name = jsxName(a.name);
    if (!name) continue;
    if (a.value?.type === 'Literal' && typeof a.value.value === 'string') {
      out.push({ name, literal: a.value.value });
    } else if (a.value?.type === 'JSXExpressionContainer') {
      out.push({ name, expression: a.value.expression });
    } else out.push({ name });
  }
  return out;
}

/** Every JSX element written as real JSX inside an estree program, depth first. */
function expressionElements(
  value: unknown,
  inParagraph: boolean,
  headingOffset: number | undefined,
  out: ElementView[],
): void {
  if (!value || typeof value !== 'object') return;
  const node = value as ExpressionNode;
  if (node.type === 'JSXElement' && node.openingElement) {
    const opening = node.openingElement;
    const name = typeof opening.name === 'object' ? jsxName(opening.name) : undefined;
    if (name && opening.start !== undefined) {
      out.push({
        name,
        offset: opening.start,
        attributes: estreeAttributes(opening),
        inParagraph,
        headingOffset,
      });
    }
  }
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) expressionElements(item, inParagraph, headingOffset, out);
    } else expressionElements(child, inParagraph, headingOffset, out);
  }
}

function mdastAttributes(
  attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[],
): AttributeView[] {
  const out: AttributeView[] = [];
  for (const a of attributes) {
    if (a.type !== 'mdxJsxAttribute') continue;
    if (typeof a.value === 'string') out.push({ name: a.name, literal: a.value });
    else if (a.value && typeof a.value === 'object') {
      const program = a.value.data?.estree as ExpressionNode | undefined;
      out.push({ name: a.name, expression: program?.body?.[0]?.expression });
    } else out.push({ name: a.name });
  }
  return out;
}

/**
 * Fumadocs' remark-unravel removes a paragraph only if every child is JSX, an expression or
 * whitespace, and at least one is JSX/an expression. Anything else preserves the <p> wrapper.
 */
function unravels(node: Parent): boolean {
  return (
    node.children.some((c) => c.type === 'mdxJsxTextElement' || c.type === 'mdxTextExpression') &&
    node.children.every(
      (c) =>
        c.type === 'mdxJsxTextElement' ||
        c.type === 'mdxTextExpression' ||
        (c.type === 'text' && c.value.trim() === ''),
    )
  );
}

/** Every JSX element in the file, in source order, with its paragraph and heading context. */
export function jsxElements(sourceCode: MdxSourceCode): ElementView[] {
  let list = elements.get(sourceCode);
  if (list) return list;
  const out: ElementView[] = [];
  const visit = (node: Node, inParagraph: boolean, headingOffset: number | undefined): void => {
    if (node.type === 'paragraph') inParagraph = !unravels(node as Parent);
    if (node.type === 'heading') headingOffset = node.position?.start.offset;
    if (node.type === 'mdxJsxFlowElement') inParagraph = false;
    if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
      const element = node as Node & {
        name: string | null;
        attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
      };
      const offset = element.position?.start.offset;
      if (element.name && offset !== undefined) {
        out.push({
          name: element.name,
          offset,
          attributes: mdastAttributes(element.attributes),
          inParagraph,
          headingOffset,
        });
      }
      for (const attribute of element.attributes) {
        if (attribute.type === 'mdxJsxAttribute') {
          if (attribute.value && typeof attribute.value === 'object')
            expressionElements(attribute.value.data?.estree, false, headingOffset, out);
        } else expressionElements(attribute.data?.estree, false, headingOffset, out);
      }
    }
    expressionElements((node as WithEstree).data?.estree, inParagraph, headingOffset, out);
    for (const child of (node as Parent).children ?? []) visit(child, inParagraph, headingOffset);
  };
  visit(sourceCode.ast, false, undefined);
  list = out.sort((a, b) => a.offset - b.offset);
  elements.set(sourceCode, list);
  return list;
}

function attributeExpression(element: ElementView, name: string): ExpressionNode | undefined {
  return element.attributes.find((a) => a.name === name)?.expression;
}

/** Literal attribute text, including a quoted expression or a static template literal. */
export function stringAttribute(element: ElementView, name: string): string | undefined {
  const attribute = element.attributes.find((a) => a.name === name);
  if (attribute?.literal !== undefined) return attribute.literal;
  const expression = attribute?.expression;
  if (expression?.type === 'Literal' && typeof expression.value === 'string')
    return expression.value;
  if (expression?.type === 'TemplateLiteral' && expression.expressions?.length === 0)
    return expression.quasis?.[0]?.value.cooked ?? undefined;
  return undefined;
}

/** True when the attribute is the expression `{null}`. */
export function isNullAttribute(element: ElementView, name: string): boolean {
  const expression = attributeExpression(element, name);
  return expression?.type === 'Literal' && expression.value === null;
}

/**
 * Components every page gets from `fumadocs-ui/mdx`'s default export, which `components/mdx.tsx`
 * spreads first. `rules.test.ts` checks this list against the installed package.
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

/** The capitalised keys of the component map in a `components/mdx.tsx` source. */
export function registeredComponents(registrySource: string): Set<string> {
  const names = new Set<string>();
  const body = /const merged = \{([\s\S]*?)\n\s*\};/.exec(registrySource)?.[1] ?? '';
  for (const m of body.matchAll(/^\s*([A-Z]\w*)\s*[,:]/gm)) names.add(m[1]);
  return names;
}

const REGISTRY = path.join(REPO_ROOT, 'components', 'mdx.tsx');
let knownComponents: Set<string> | undefined;

/** Every component a page can use without importing it: the registry plus Fumadocs' defaults. */
export function defaultKnownComponents(): Set<string> {
  knownComponents ??= new Set([
    ...FUMADOCS_DEFAULT_COMPONENTS,
    ...(existsSync(REGISTRY) ? registeredComponents(readFileSync(REGISTRY, 'utf8')) : []),
  ]);
  return knownComponents;
}
