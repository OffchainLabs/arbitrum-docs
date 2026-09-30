import { createProcessor } from '@mdx-js/mdx';
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { applyMdxPreset, remarkInclude } from 'fumadocs-mdx/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';

import { mdxOptions } from '../../lib/mdx-options.ts';
import {
  type DocIndex,
  expandRefUrl,
  extractRefs,
  findMissingIncludes,
  lineAt,
} from './doc-links.ts';

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

/**
 * A fragment link whose target page renders no element with that id. `page` is the page the link
 * was checked on; a glossary entry renders on every page that uses the term, so it has none.
 */
export interface BrokenAnchor extends AnchorLink {
  page?: string;
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
        // Code blocks never produce an id, so the slow syntax highlighter is skipped. A rename of
        // the plugin only un-matches this filter and slows the run; it cannot change the answer.
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

/**
 * The `id` frontmatter of every entry in each reference collection under `content/<collection>/`,
 * keyed by collection name. Only `glossary` exists today (`lib/references.ts`).
 */
function referenceCollectionIds(index: Pick<DocIndex, 'sharedFiles'>): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const file of index.sharedFiles) {
    const collection = /^content\/([^/]+)\//.exec(file.rel)?.[1];
    if (collection === undefined || collection === 'partials') continue;
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(file.content)?.[1] ?? '';
    const id = /^id:[ \t]*['"]?([^'"\n]+?)['"]?[ \t]*$/m.exec(fm)?.[1];
    if (id === undefined) continue;
    if (!out.has(collection)) out.set(collection, new Set());
    out.get(collection)?.add(id);
  }
  return out;
}

/**
 * Validate local fragments against compiled ids, in each including page's URL context. A page that
 * cannot compile because an `<include>` target is missing is skipped: `findMissingIncludes` reports
 * that include with its line, and the rest of the tree is still checked. Root-absolute fragment links
 * in glossary entries are checked against the target page's ids as well.
 */
export async function findBrokenAnchors(index: DocIndex): Promise<BrokenAnchor[]> {
  const compile = await createAnchorCompiler(index.repoRoot);
  const referenceIds = referenceCollectionIds(index);
  const missingIncludes = new Set(findMissingIncludes(index).map((m) => m.targetAbs));
  const pages = new Map<string, CompiledPage>();
  for (const file of index.files) {
    if (!file.url) continue;
    try {
      const page = await compile(file.abs);
      // `<ReferenceList collection="x" />` renders one section per entry, `id` = the entry's id, at
      // request time, so the compiled tree cannot show them.
      for (const m of file.content.matchAll(
        /<ReferenceList\b[^>]*\bcollection=["']([^"']+)["']/g,
      )) {
        for (const id of referenceIds.get(m[1]) ?? []) page.ids.add(id);
      }
      pages.set(file.url, page);
    } catch (error) {
      const unread = /failed to read file (.+)/.exec(String(messageOf(error)))?.[1]?.trim();
      if (unread !== undefined && missingIncludes.has(unread)) continue;
      throw new Error(`Cannot validate anchors in ${file.rel}: ${messageOf(error)}`, {
        cause: error,
      });
    }
  }

  const broken: BrokenAnchor[] = [];
  const origin = 'https://docs.invalid';
  const targetIds = (link: string, from: string): { id: string; target: CompiledPage } | null => {
    // Absolute and scheme-relative links belong to the external-link policy.
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link)) return null;
    const url = new URL(link, origin + from);
    if (!url.hash || url.hash === '#') return null;
    const target = pages.get(url.pathname.replace(/\/$/, '') || '/');
    // Missing pages remain the responsibility of the existing path checker; assets and
    // non-doc routes do not have MDX heading ids.
    if (!target) return null;
    let id: string;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch {
      id = url.hash.slice(1);
    }
    // Chromium text fragments can follow a normal element fragment, or stand alone.
    id = id.split(':~:')[0];
    if (!id || target.ids.has(id) || id.toLowerCase() === 'top') return null;
    return { id, target };
  };

  for (const [pageUrl, { links }] of pages) {
    for (const link of links) {
      if (targetIds(link.url, pageUrl))
        broken.push({ ...link, page: pageUrl, reason: 'missing anchor' });
    }
  }

  // Partials are checked above, once per including page. A glossary entry has no page of its own,
  // so only its root-absolute links can be resolved.
  for (const file of index.sharedFiles) {
    if (!file.rel.startsWith('content/glossary/')) continue;
    for (const ref of extractRefs(file.content)) {
      if (ref.range === null) continue;
      const url = expandRefUrl(ref.rawUrl);
      if (!url.startsWith('/') || !url.includes('#')) continue;
      if (targetIds(url, '/')) {
        broken.push({
          file: file.abs,
          rel: file.rel,
          line: lineAt(file.content, ref.range[0]),
          url: ref.rawUrl,
          reason: 'missing anchor',
        });
      }
    }
  }
  return broken;
}
