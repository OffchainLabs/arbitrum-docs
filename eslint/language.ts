/**
 * The ESLint language for this repo's content: the same mdast tree the site compiles, offered to
 * ESLint rules as node visitors.
 *
 * `parse` runs micromark with the MDX, GFM, math and YAML-frontmatter extensions, which is what
 * `@mdx-js/mdx` plus `remark-gfm` and `remark-math` give the build (`lib/mdx-options.ts`). A rule
 * then visits `heading`, `mdxJsxFlowElement`, `code`, `yaml` and the other mdast types with their
 * `position`, and `context.sourceCode.getParent(node)` answers where a node sits. ESLint reports a
 * file that does not parse as a fatal problem, the same file `next build` refuses. The `markdown`
 * language is the same parser without MDX, for the few plain `.md` files under `content/`.
 *
 * Built the way `@eslint/markdown` builds its `commonmark` and `gfm` languages, with MDX added.
 */
import type {
  File,
  FileError,
  Language,
  LanguageContext,
  OkParseResult,
  ParseResult,
  TraversalStep,
} from '@eslint/core';
import { TextSourceCodeBase, VisitNodeStep } from '@eslint/plugin-kit';
import type { Node, Parent, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mathFromMarkdown } from 'mdast-util-math';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';
import { mdxjs } from 'micromark-extension-mdxjs';

/** Every node type in the tree may hold children; this is the shape the traversal reads. */
const hasChildren = (node: Node): node is Parent => Array.isArray((node as Parent).children);

export class MdxSourceCode extends TextSourceCodeBase {
  declare ast: Root;
  #steps: TraversalStep[] | undefined;
  #parents = new WeakMap<Node, Node>();

  constructor({ text, ast }: { text: string; ast: Root }) {
    super({ text, ast, lineEndingPattern: /\r\n|[\r\n]/u });
    this.traverse();
  }

  getParent(node: object): Node | undefined {
    return this.#parents.get(node as Node);
  }

  /** Every node, depth first, entered (phase 1) and left (phase 2), as ESLint's traversal wants. */
  traverse(): Iterable<TraversalStep> {
    if (this.#steps) return this.#steps.values();
    const steps: TraversalStep[] = (this.#steps = []);
    const visit = (node: Node, parent?: Node): void => {
      if (parent) this.#parents.set(node, parent);
      steps.push(new VisitNodeStep({ target: node, phase: 1, args: [node, parent] }));
      if (hasChildren(node)) for (const child of node.children) visit(child, node);
      steps.push(new VisitNodeStep({ target: node, phase: 2, args: [node, parent] }));
    };
    visit(this.ast);
    return steps.values();
  }
}

export interface ParseOptions {
  /** Parse JSX, expressions and ESM. Off for a plain `.md` file. */
  mdx?: boolean;
}

/** The mdast tree of a source, parsed the way the site parses it. Throws on a syntax error. */
export function parseContent(text: string, { mdx = true }: ParseOptions = {}): Root {
  return fromMarkdown(text, {
    extensions: [...(mdx ? [mdxjs()] : []), gfm(), math(), frontmatter(['yaml'])],
    mdastExtensions: [
      ...(mdx ? [mdxFromMarkdown()] : []),
      gfmFromMarkdown(),
      mathFromMarkdown(),
      frontmatterFromMarkdown(['yaml']),
    ],
  });
}

type LangOptions = Record<string, unknown>;

/**
 * The thrown error as ESLint's fatal finding. micromark's message names the place only in its
 * text, as `(line:column-line:column)`, so that is where the line comes from.
 */
function fileError(error: unknown): FileError {
  const message = error instanceof Error ? error.message : String(error);
  const place = /\((\d+):(\d+)(?:-\d+:\d+)?\)\s*$/.exec(message);
  return {
    message: place ? message.slice(0, place.index).trimEnd() : message,
    line: place ? Number(place[1]) : 1,
    column: place ? Number(place[2]) : 1,
  };
}

export class ContentLanguage implements Language<{
  LangOptions: LangOptions;
  RootNode: Root;
  Code: MdxSourceCode;
  Node: Node;
}> {
  fileType = 'text' as const;
  lineStart = 1 as const;
  columnStart = 1 as const;
  nodeTypeKey = 'type';
  readonly #options: ParseOptions;

  constructor(options: ParseOptions = {}) {
    this.#options = options;
  }

  validateLanguageOptions(): void {}

  parse(file: File): ParseResult<Root> {
    try {
      return { ok: true, ast: parseContent(String(file.body), this.#options) };
    } catch (error) {
      return { ok: false, errors: [fileError(error)] };
    }
  }

  createSourceCode(
    file: File,
    input: OkParseResult<Root>,
    _context?: LanguageContext<LangOptions>,
  ): MdxSourceCode {
    return new MdxSourceCode({ text: String(file.body), ast: input.ast });
  }
}
