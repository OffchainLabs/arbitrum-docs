import { createProcessor } from '@mdx-js/mdx';
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { applyMdxPreset, remarkInclude } from 'fumadocs-mdx/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';

import { mdxOptions } from '../../lib/mdx-options.ts';
import type { DocIndex } from './doc-links.ts';

/** Where a node was written: the file it came from (a partial, for an included node) and its line. */
export interface AnchorSource {
  file: string;
  rel: string;
  line: number;
}

/** A link carrying a `#fragment`, stamped with where it was written. */
export interface AnchorLink extends AnchorSource {
  url: string;
}

/** What compiling one page yields: every id it renders and every fragment link it holds. */
export interface CompiledPage {
  ids: Set<string>;
  links: AnchorLink[];
}

/** A fragment link whose target page renders no element with that id. */
export interface BrokenAnchor extends AnchorLink {
  page: string;
  reason: 'missing anchor';
}

declare module 'vfile' {
  interface DataMap {
    anchorLinks: AnchorLink[];
    anchorIds: Set<string>;
  }
}

/**
 * A minimal structural node, local because `mdast`, `hast` and `unist` are not direct dependencies
 * and so cannot be imported as types from here. The same walk runs over the mdast tree (links) and
 * the hast tree (ids), so the node-specific fields are `unknown` and narrowed where they are read.
 */
interface TreeNode {
  type: string;
  data?: object;
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
  children?: TreeNode[];
  url?: unknown;
  identifier?: unknown;
  name?: unknown;
  attributes?: unknown;
  properties?: unknown;
}

type Format = 'md' | 'mdx';
type Processor = ReturnType<typeof createProcessor>;
type ProcessorOptions = NonNullable<Parameters<typeof createProcessor>[0]>;
type Pluggable = NonNullable<ProcessorOptions['rehypePlugins']>[number];

function pluginName(plugin: Pluggable): string | undefined {
  const fn = Array.isArray(plugin) ? plugin[0] : plugin;
  // A preset object has no name, which is what reading `.name` off one returned before.
  return typeof fn === 'function' ? fn.name : undefined;
}

function isAnchorSource(value: unknown): value is AnchorSource {
  return (
    typeof value === 'object' &&
    value !== null &&
    'file' in value &&
    typeof value.file === 'string' &&
    'rel' in value &&
    typeof value.rel === 'string' &&
    'line' in value &&
    typeof value.line === 'number'
  );
}

/** The source stamp `parser` left on a node, if any. */
function anchorSourceOf(node: TreeNode): AnchorSource | undefined {
  const stamp = node.data && 'anchorSource' in node.data ? node.data.anchorSource : undefined;
  return isAnchorSource(stamp) ? stamp : undefined;
}

/** The value of the first attribute on an MDX JSX element whose name is in `names`. */
function jsxAttributeValue(node: TreeNode, names: readonly string[]): unknown {
  if (!Array.isArray(node.attributes)) return undefined;
  const attributes: unknown[] = node.attributes;
  const found = attributes.find(
    (attr) =>
      typeof attr === 'object' &&
      attr !== null &&
      'name' in attr &&
      typeof attr.name === 'string' &&
      names.includes(attr.name),
  );
  return typeof found === 'object' && found !== null && 'value' in found ? found.value : undefined;
}

/** Compile with the site's preset, plus the include pass Fumadocs MDX adds before it. */
export async function createAnchorCompiler(
  repoRoot: string,
): Promise<(filePath: string) => Promise<CompiledPage>> {
  const options = await applyMdxPreset(mdxOptions)('bundler');
  const processors = new Map<Format, Processor>();
  const sources = new Map<string, ReturnType<typeof frontmatter> & { lineOffset: number }>();

  function source(filePath: string): ReturnType<typeof frontmatter> & { lineOffset: number } {
    let cached = sources.get(filePath);
    if (!cached) {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = frontmatter(raw);
      cached = {
        ...parsed,
        lineOffset: raw.slice(0, raw.length - parsed.content.length).split('\n').length - 1,
      };
      sources.set(filePath, cached);
    }
    return cached;
  }

  // The include plugin calls this parser for every partial, including nested and selected
  // sections. Preserve its original location before splicing it into the containing page.
  function parser(format: Format): { parse(file: VFile): ReturnType<Processor['parse']> } {
    return {
      parse(file) {
        const tree = processor(format).parse(file);
        // Walked through the structural view; the typed tree is what `run` is handed.
        const nodes: TreeNode = tree;
        const { lineOffset } = source(file.path);
        visit(nodes, (node) => {
          node.data ??= {};
          Object.assign(node.data, {
            anchorSource: {
              file: file.path,
              rel: path.relative(repoRoot, file.path).split(path.sep).join('/'),
              line: (node.position?.start.line ?? 1) + lineOffset,
            },
          });
        });
        return tree;
      },
    };
  }

  function collectLinks() {
    return (tree: TreeNode, file: VFile): void => {
      const definitions = new Map<unknown, unknown>();
      visit(tree, (node) => {
        if (node.type !== 'definition') return;
        // Markdown resolves duplicate reference definitions to the first occurrence.
        if (!definitions.has(node.identifier)) definitions.set(node.identifier, node.url);
      });
      const links: AnchorLink[] = [];
      visit(tree, (node) => {
        let url: unknown;
        if (node.type === 'link') url = node.url;
        if (node.type === 'linkReference') url = definitions.get(node.identifier);
        if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
          url = jsxAttributeValue(node, ['href', 'to']);
        }
        if (typeof url === 'string' && url.includes('#')) {
          // Nodes a transform synthesises after parsing carry no source stamp; fall back to the
          // containing page so the report still names a file instead of the run crashing.
          const fallback = {
            file: file.path,
            rel: path.relative(repoRoot, file.path).split(path.sep).join('/'),
            line: (node.position?.start.line ?? 1) + source(file.path).lineOffset,
          };
          links.push({ ...(anchorSourceOf(node) ?? fallback), url });
        }
      });
      file.data.anchorLinks = links;
    };
  }

  function collectIds() {
    return (tree: TreeNode, file: VFile): void => {
      const ids = new Set<string>();
      visit(tree, (node) => {
        const { properties } = node;
        if (
          node.type === 'element' &&
          typeof properties === 'object' &&
          properties !== null &&
          'id' in properties &&
          typeof properties.id === 'string'
        ) {
          ids.add(properties.id);
        }
        // A component's `id` prop (e.g. <Term id="gas">) need not be a DOM id.
        if (/^[a-z]/.test(String(node.name ?? '')) && node.attributes) {
          const id = jsxAttributeValue(node, ['id']);
          if (typeof id === 'string') ids.add(id);
        }
      });
      file.data.anchorIds = ids;
    };
  }

  function processor(format: Format): Processor {
    let cached = processors.get(format);
    if (!cached) {
      cached = createProcessor({
        ...options,
        format,
        remarkPlugins: [remarkInclude, ...(options.remarkPlugins ?? []), collectLinks],
        // Code blocks never produce an id, and shiki plus the twoslash transformer were two thirds
        // of the run (15.5 s -> 5.1 s on 348 pages, same findings). A fumadocs-core rename of the
        // plugin only un-matches this filter and slows the run; it cannot change the answer.
        rehypePlugins: [
          ...(options.rehypePlugins ?? []).filter((plugin) => pluginName(plugin) !== 'rehypeCode'),
          collectIds,
        ],
      });
      processors.set(format, cached);
    }
    return cached;
  }

  return async (filePath) => {
    const parsed = source(filePath);
    const format: Format = filePath.endsWith('.mdx') ? 'mdx' : 'md';
    const file = new VFile({
      path: filePath,
      cwd: repoRoot,
      value: parsed.content,
      // `_getProcessor` is the private hook fumadocs-mdx's include plugin reads from `file.data`
      // (node_modules/fumadocs-mdx/dist/remark-include-*.js, `const { _getProcessor = () => this`).
      // If a fumadocs-mdx bump renames it, partial links lose their source stamp and the
      // "partial links are checked per containing page" test fails; look there first.
      data: { frontmatter: parsed.data, _getProcessor: parser },
    });
    // Run the real remark -> rehype transforms; JavaScript output is unnecessary for checking.
    //
    // The cast is sound and forced by `@mdx-js/mdx`'s types: its `Processor` names the estree
    // `Program` its recma stage emits as `run`'s input, but unified hands `run`'s tree to the first
    // transformer, and every one here (remark, then remark-rehype, then rehype) takes the parsed
    // mdast root, which is exactly what this passes.
    const tree = parser(format).parse(file) as unknown as Parameters<Processor['run']>[0];
    await processor(format).run(tree, file);
    const { anchorIds: ids, anchorLinks: links } = file.data;
    // Both plugins run on every compile, so neither is ever missing; reading an absent field used
    // to hand an `undefined` to the caller, which then threw on first use.
    if (!ids || !links) throw new Error(`anchor collectors did not run on ${filePath}`);
    return { ids, links };
  };
}

/** `error.message` for anything thrown, the way reading the property off it would answer. */
function messageOf(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'message' in error
    ? error.message
    : undefined;
}

/** Validate local fragments against compiled ids, in each including page's URL context. */
export async function findBrokenAnchors(index: DocIndex): Promise<BrokenAnchor[]> {
  const compile = await createAnchorCompiler(index.repoRoot);
  const pages = new Map<string, CompiledPage>();
  for (const file of index.files) {
    if (!file.url) continue;
    try {
      pages.set(file.url, await compile(file.abs));
    } catch (error) {
      throw new Error(`Cannot validate anchors in ${file.rel}: ${messageOf(error)}`, {
        cause: error,
      });
    }
  }

  const broken: BrokenAnchor[] = [];
  const origin = 'https://docs.invalid';
  for (const [pageUrl, { links }] of pages) {
    for (const link of links) {
      // Absolute and scheme-relative links belong to the external-link policy.
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link.url)) continue;
      const url = new URL(link.url, origin + pageUrl);
      if (!url.hash || url.hash === '#') continue;
      const target = pages.get(url.pathname.replace(/\/$/, '') || '/');
      // Missing pages remain the responsibility of the existing path checker; assets and
      // non-doc routes do not have MDX heading ids.
      if (!target) continue;
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        id = url.hash.slice(1);
      }
      // Chromium text fragments can follow a normal element fragment, or stand alone.
      id = id.split(':~:')[0];
      if (!id || target.ids.has(id) || id.toLowerCase() === 'top') continue;
      broken.push({ ...link, page: pageUrl, reason: 'missing anchor' });
    }
  }
  return broken;
}
