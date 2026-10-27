/**
 * mdx-comments: drop `{/* … *\/}` comments from the compiled tree and from the markdown mirrors
 * (`/<slug>.md`, `/llms.mdx/**`, `/llms-full.txt`). They render as nothing in the HTML, but the
 * mirrors are sliced from the authored source, which prints an expression verbatim unless a plugin
 * records its removal with `replaceSource` (`lib/llms-markdown.ts` explains the mechanism). Every
 * comment in `content/` is maintainer-facing, and every generator reads its marker from the raw
 * `.mdx`.
 *
 * Listed in `lib/mdx-options.ts` rather than scoped to the markdown output, because the fork
 * between the two outputs happens after every user plugin. Removing a node is safe in both
 * positions (`scripts/lib/mdx-comments.test.ts`). A removed comment takes the whitespace up to its
 * next sibling with it, so two paragraphs around it stay one blank line apart. A comment inside a
 * fence or an inline code span is not an expression node and is kept.
 *
 * Import-free apart from `unist-util-visit` and the stringifier, so the test exercises this module
 * directly; the tree types are local because the `mdast` type packages are transitive dependencies
 * only.
 */
import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';
import { visit } from 'unist-util-visit';

/** A unist position; the source slicer reads the offsets. */
interface Position {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

export interface MdxCommentsLeaf {
  type: string;
  value?: unknown;
  data?: Record<string, unknown>;
  position?: Position;
}

/** A node whose children the plugin may splice. */
export interface MdxCommentsParent extends MdxCommentsLeaf {
  children: MdxCommentsNode[];
}

export type MdxCommentsNode = MdxCommentsLeaf | MdxCommentsParent;

/** The two node types MDX parses `{ … }` into: block level and inside a paragraph. */
const EXPRESSION_NODES: ReadonlySet<string> = new Set(['mdxFlowExpression', 'mdxTextExpression']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** `value.length` when `value` is an array, else `undefined`. */
const arrayLength = (value: unknown): number | undefined =>
  Array.isArray(value) ? value.length : undefined;

/**
 * A comment-only expression: an empty `Program` body with at least one attached comment, read from
 * the `data.estree` the acorn pass attaches, or from the source when no estree is present.
 */
export function isMdxComment(node: unknown): boolean {
  if (!isRecord(node) || typeof node.type !== 'string' || !EXPRESSION_NODES.has(node.type)) {
    return false;
  }
  const estree = isRecord(node.data) ? node.data.estree : undefined;
  if (estree) {
    if (!isRecord(estree)) return false;
    return arrayLength(estree.body) === 0 && (arrayLength(estree.comments) ?? 0) > 0;
  }
  return isCommentOnlySource(node.value);
}

/** Only JavaScript comments and whitespace? A literal like `{"/*"}` keeps its quotes. */
export function isCommentOnlySource(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const stripped = value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return stripped.trim() === '' && value.trim() !== '';
}

type SourceFile = Parameters<typeof replaceSource>[0];
type SourceNode = Parameters<typeof replaceSource>[1];

/** The remark plugin. Removes every comment-only expression node; attributes are never visited. */
export function remarkStripMdxComments(): (tree: MdxCommentsParent, file: SourceFile) => void {
  return (tree, file) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined || !isMdxComment(node)) return;
      // Stretch the node over the whitespace before its next sibling: the node leaves the tree, so
      // nothing else reads its position, and the slicer drops the gap with the comment.
      const next = parent.children[index + 1]?.position?.start.offset;
      if (node.position && next !== undefined) node.position.end.offset = next;
      replaceSource(file, node as SourceNode, '');
      parent.children.splice(index, 1);
      // Tell unist-util-visit to revisit this index: the next sibling has shifted into it, and a
      // run of consecutive comments would otherwise keep every second one.
      return index;
    });
  };
}
