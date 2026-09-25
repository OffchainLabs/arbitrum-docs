/**
 * mdx-comments: drop `{/* … *\/}` comments from the compiled tree, so they cannot reach the
 * markdown mirrors.
 *
 * An MDX comment is an expression holding nothing but a JavaScript comment. It renders as nothing,
 * which is why it has always been absent from the HTML. The **markdown** a reader gets at
 * `/docs/<slug>.md`, `/llms.mdx/docs/<slug>/content.md` and inside `/llms-full.txt` was a different
 * story: `postprocess.includeProcessedMarkdown` makes fumadocs-mdx run `remarkLLMs` over the same
 * mdast the page compile uses, and its stringifier writes an expression node back out verbatim. So
 * every comment in `content/` was served to the one audience that cannot see the source file it
 * talks about: 100 of them in `llms-full.txt` alone (FS-2732).
 *
 * They are maintainer-facing without exception. The do-not-edit banners name a `pnpm` script in a
 * checkout the mirror's reader does not have; the `todo:` notes are open questions about the page,
 * which a reader has no way to tell apart from the page's own content. Nothing reads a marker back
 * out of a mirror: `cli:generate`, `stylus:generate`, `precompiles:generate` and
 * `nitro:check-release` all read the raw `.mdx` off disk.
 *
 * The plugin is listed in `lib/mdx-options.ts` rather than scoped to the markdown output, because
 * the fork between the two outputs happens *downstream* of every user plugin (fumadocs-mdx appends
 * its own postprocess plugin last), and because deleting these nodes changes nothing a reader of
 * the page can see: the compile rendered each one as an empty JSX expression plus a `"\n"` string
 * child, so the served HTML loses only that whitespace (measured on the 44 pages that carry a
 * comment). Being in that module also means `check-links` compiles the same
 * tree the site does, and it covers both doc collections at once, where
 * `postprocess.includeProcessedMarkdown` would have to be restated per collection.
 *
 * Removing a node is safe in both positions, verified against the real processor in
 * `scripts/lib/mdx-comments.test.ts`. A flow comment is a block-level sibling, so its neighbours
 * stay separate blocks and are still joined by a blank line; an inline comment sits between two
 * text nodes that carry their own spacing. A comment written inside a fenced block or an inline
 * code span is never an expression node at all, so it is left exactly as written.
 *
 * The one visible artifact is inline only: `word {/* … *\/} word` leaves the spaces from both text
 * nodes behind, so the mirror gets two spaces, and a comment at the end of a line leaves a trailing
 * space that `mdast-util-to-markdown` escapes as `&#x20;`. Nothing is normalized for it, because
 * collapsing whitespace would mean editing text rather than deleting a node, and no page in
 * `content/` writes a comment mid-line: all 99 of them start their line.
 *
 * Deliberately import-free apart from `unist-util-visit`, the same rule `lib/var-links.ts`
 * follows, so the test exercises this module rather than a copy of it.
 *
 * The tree types below are local and structural rather than imported from `mdast` and
 * `mdast-util-mdx-expression`, because neither type package is resolvable from the repo root (they
 * are transitive dependencies only). `unist-util-visit` needs only `type` and `children` to type its
 * visitor, and every real mdast tree fits them.
 */
import { visit } from 'unist-util-visit';

/** A node with no children, as far as this plugin is concerned. */
export interface MdxCommentsLeaf {
  type: string;
  value?: unknown;
  data?: Record<string, unknown>;
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

/** `value.length`, when `value` is an array, else `undefined`: the `?.length` the JSDoc era read. */
const arrayLength = (value: unknown): number | undefined =>
  Array.isArray(value) ? value.length : undefined;

/**
 * A comment-only expression, decided from the parsed JavaScript: an empty `Program` body with at
 * least one attached comment. That is exactly `{/* … *\/}` and `{// …}`, and it cannot mistake a
 * real expression for one, however it is written.
 *
 * `data.estree` is attached by the acorn pass that `@mdx-js/mdx` always runs, so this is the branch
 * that fires in the site build and in `check-links`. `isCommentOnlySource` is the fallback for a
 * tree parsed without it.
 *
 * Takes `unknown` because it is a predicate over whatever a visitor hands it, `undefined` included.
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

/**
 * Whether a string is nothing but JavaScript comments and whitespace, used only when no estree is
 * attached. It strips block and line comments and asks whether anything is left, so a string
 * literal that merely contains comment punctuation (`{"/*"}`) keeps its quotes and is not matched.
 */
export function isCommentOnlySource(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const stripped = value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return stripped.trim() === '' && value.trim() !== '';
}

/**
 * The remark plugin. Removes every comment-only expression node, wherever it sits: at the top
 * level, inside a list item or table cell, inside a JSX element's children (`<Tabs>{/* … *\/}`), or
 * inline in a paragraph.
 *
 * A JSX *attribute* expression is not a child and is never visited, which is the right call: a
 * comment written inside `prop={…}` is part of an expression the MDX compiler owns.
 */
export function remarkStripMdxComments(): (tree: MdxCommentsParent) => void {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined || !isMdxComment(node)) return;
      parent.children.splice(index, 1);
      // Tell unist-util-visit to revisit this index: the next sibling has shifted into it, and a
      // run of consecutive comments would otherwise keep every second one.
      return index;
    });
  };
}
