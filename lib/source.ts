import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { docsNavigationTransformer } from './docs-navigation';
import navigation from './docs-navigation.json';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { archiveParams, resolveArchiveSlug } from './versions';
import type { ResolvedArchive } from './versions';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  pageTree: {
    transformers: [docsNavigationTransformer(navigation.sections)],
  },
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return llmText(page.data.title, page.url, processed);
}

function llmText(title: string, url: string, processed: string): string {
  return `# ${title} (${url})

${processed}`;
}

/**
 * A `/docs/**` path resolved to the thing that answers it: a live page, or an archived version of
 * one (FS-2698 put archives at `/docs/<slug>/<id>`).
 *
 * `page` is always the live page, even for an archive. The archive borrows its URL for the
 * canonical, its OG image, and its relative-link base; only the body, the title, the description
 * and the markdown mirror come from the archive itself.
 */
export interface ResolvedDocsPath {
  page: (typeof source)['$inferPage'];
  /** The archived version to answer with, or `undefined` for the live page. */
  archive: ResolvedArchive | undefined;
}

/**
 * Resolves a routed docs slug, page first.
 *
 * **A real page always wins.** `/docs/a/b` is only reinterpreted as archive `b` of page `a` when no
 * page exists at `a/b`, so an archive id can never shadow a child page;
 * `scripts/versions-routing.test.ts` separately asserts that no such collision exists.
 *
 * It lives here rather than in either consumer because the docs page and the markdown route both
 * answer the same URL space and have to agree about what a path means. Returns `undefined` for a
 * path that is neither, which only `notFound()` can answer.
 */
export function resolveDocsPath(slug: string[] | undefined): ResolvedDocsPath | undefined {
  const page = source.getPage(slug);
  if (page) return { page, archive: undefined };

  const archive = resolveArchiveSlug(slug);
  if (!archive) return undefined;

  const livePage = source.getPage(archive.pageSlug);
  return livePage ? { page: livePage, archive } : undefined;
}

/** Routed URL of an archived version: the live page's URL plus the version id (FS-2698). */
export function getArchiveUrl(page: (typeof source)['$inferPage'], id: string): string {
  return `${page.url}/${id}`;
}

/**
 * The archive's markdown mirror, the same shape `getPageMarkdownUrl` gives a live page with the
 * version id in the middle: `/llms.mdx/docs/<slug>/<id>/content.md`.
 *
 * That path is not a separate URL family. It is what `proxy.ts` already rewrites
 * `/docs/<slug>/<id>.md` and an `Accept: text/markdown` request for `/docs/<slug>/<id>` onto, since
 * both rewrite patterns are written over the whole path under `/docs`.
 */
export function getArchiveMarkdownUrl(page: (typeof source)['$inferPage'], id: string) {
  const segments = [...page.slugs, id, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

/**
 * Markdown-mirror params for every registered archive, for the markdown route's
 * `generateStaticParams`. The docs route enumerates the same archives without the `content.md`
 * segment; both read one registry, so an archive cannot have a page and no markdown or the reverse.
 */
export function archiveMarkdownParams(): { slug: string[] }[] {
  return archiveParams().map(({ slug }) => ({ slug: [...slug, 'content.md'] }));
}

/**
 * The archive's own markdown, titled and addressed as the archive rather than as its live page.
 *
 * Serving the live text here is the failure this exists to prevent: it is what `/docs/<slug>.md?v=v1`
 * did before FS-2698, silently answering a request for one version with another.
 */
export async function getArchiveLLMText(
  page: (typeof source)['$inferPage'],
  archive: ResolvedArchive,
): Promise<string> {
  const processed = await archive.entry.getText('processed');

  return llmText(archive.entry.title, getArchiveUrl(page, archive.id), processed);
}
