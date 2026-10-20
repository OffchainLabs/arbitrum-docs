/**
 * preview-text: the plain text `remarkStructure` stores for the link previews
 * (`lib/link-preview.ts`).
 *
 * Fumadocs' `remarkStructure` (`remarkStructureOptions` in `lib/mdx-options.ts`) slices each
 * heading and paragraph from the authored source, so an entry would carry `<Var>` tags, `**`
 * markers, escapes and `<Term>` wrappers. This plugin runs before it and hands it plain text. A
 * paragraph gets `node.data.structuredData = { contents: [{ heading, content }] }`, which it
 * stores in place of the node under the current heading id, without an empty check, so the hook
 * is only set when the text is not empty. A heading has no hook: `remarkStructure` reads it with
 * `s.inner(heading)` and replaces each JSX, link and image node itself, overriding a plugin's edit
 * on that node. So the plugin recurses through JSX elements and links and records a `'search'`
 * `replaceSource` on every other child, which the markdown mirrors never see. A `<Var>` inside a
 * heading is blanked by `remarkStructure` (no children); no content heading uses one.
 *
 * Plain text: `text`, inline code and inline maths are their value, a hard break a space, an image
 * nothing, a string-literal expression (`{' '}`) its text and any other expression nothing. A
 * `<Var name>` is its value from content/vars.json, or the tag itself when the name is unknown, so
 * a typo stays visible as in `lib/llms-markdown.ts`. Any other node is its children's text.
 * Covered by `scripts/lib/link-preview-structure.test.ts`.
 */
import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';

import { VARS_PATH, compilerOf, readVars } from './var-links.ts';

type SourceFile = Parameters<typeof replaceSource>[0];
type SourceNode = Parameters<typeof replaceSource>[1];
type Values = Readonly<Record<string, unknown>>;

/** The slice of an mdast node this module reads. */
interface Node {
  type: string;
  value?: unknown;
  data?: object;
  children?: Node[];
}

/** The slice of an `mdxJsxFlowElement` / `mdxJsxTextElement` this module reads. */
interface JsxElement extends Node {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
  children: Node[];
}

/** The remark plugin. Without `vars`, it reads content/vars.json on every compile. */
export function remarkPreviewText({ vars }: { vars?: Values } = {}): (
  tree: Node,
  file: SourceFile,
) => void {
  return (tree, file) => {
    // Read per compile and registered as a dependency, as `lib/var-links.ts` does.
    const values = vars ?? readVars();
    if (vars === undefined) compilerOf(file)?.addDependency(VARS_PATH);
    const walk = (node: Node): void => {
      if (node.type === 'heading') {
        for (const child of node.children ?? []) editHeadingChild(child, file, values);
        return;
      }
      const content = node.type === 'paragraph' ? plain(node, values).trim() : '';
      if (content !== '') {
        const structuredData = { contents: [{ heading: undefined, content }] };
        node.data = { ...node.data, structuredData };
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

/** `remarkStructure` replaces a JSX, link or image node itself, so only their children are edited. */
function editHeadingChild(node: Node, file: SourceFile, values: Values): void {
  if (isJsxElement(node) || node.type === 'link' || node.type === 'linkReference') {
    for (const child of node.children ?? []) editHeadingChild(child, file, values);
    return;
  }
  // The stringifier only reads a node's position, so the local shape is enough.
  replaceSource(file, node as SourceNode, plain(node, values), 'search');
}

function plain(node: Node, values: Values): string {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
    case 'inlineMath':
      return String(node.value);
    case 'break':
      return ' ';
    case 'image':
    case 'imageReference':
      return '';
    case 'mdxTextExpression':
    case 'mdxFlowExpression': {
      // `{' '}` and other string literals read as their text; any other expression is code.
      const literal = /^\s*(['"])((?:(?!\1)[^\\\n])*)\1\s*$/.exec(String(node.value));
      return literal ? literal[2] : '';
    }
    default:
      if (isJsxElement(node) && node.name === 'Var') return varText(node, values);
      return (node.children ?? []).map((child) => plain(child, values)).join('');
  }
}

/** The value of a `<Var name>`, or the tag itself when the name is unknown. */
function varText(element: JsxElement, values: Values): string {
  const attr = element.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'name');
  const key = String(attr?.value ?? '');
  return Object.hasOwn(values, key) ? String(values[key]) : `<Var name="${key}" />`;
}

function isJsxElement(node: Node): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}
