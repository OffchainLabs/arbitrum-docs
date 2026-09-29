/**
 * markdown-redirects: the `.md` twin of every redirect that lands under /docs.
 *
 * Master served a markdown mirror at `<url>.md` for every page and told readers to append `.md`
 * to any URL. This site serves mirrors at `/docs/<slug>.md` (a rewrite in next.config.ts), so an
 * old `/<slug>.md` needs its own redirect to `/docs/<slug>.md`. Deriving the twins here keeps
 * `redirects.config.ts` the one hand-maintained list: next.config.ts appends `markdownTwins()` to
 * it, and `scripts/lib/redirects-config.test.ts` checks the combined list. Next compiles the
 * result into the routes manifest, so the twins cost nothing at request time.
 *
 * Import-free, so scripts import it under `node --test`.
 */

/** One entry as Next takes it; the same shape `redirects.config.ts` exports. */
export interface MarkdownRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

/** Characters path-to-regexp treats as syntax. A source holding one is a pattern, not a path. */
const PATTERN_SYNTAX = /[:()*+?{}\\]/;

/** The markdown URL of a `/docs` page URL, fragment dropped: a markdown response has no anchors. */
export function markdownUrl(docsUrl: string): string {
  const path = docsUrl.split('#')[0].replace(/\/+$/, '');
  return `${path}.md`;
}

/** True for `/docs`, `/docs/…` and `/docs#…`, not for `/docsfoo`. */
function isDocsUrl(url: string): boolean {
  return url === '/docs' || url.startsWith('/docs/') || url.startsWith('/docs#');
}

/**
 * One twin per entry whose destination is a /docs page, with the entry's permanence, plus
 * `/index.md` to `/docs.md` (master's mirror of its home page). Pattern sources, sources that
 * already end in `.md` and `/` itself are skipped.
 */
export function markdownTwins<T extends MarkdownRedirect>(
  redirects: readonly T[],
): MarkdownRedirect[] {
  const twins: MarkdownRedirect[] = [];
  for (const { source, destination, permanent } of redirects) {
    if (!isDocsUrl(destination)) continue;
    if (source === '/' || source.endsWith('.md') || PATTERN_SYNTAX.test(source)) continue;
    twins.push({
      source: `${source.replace(/\/+$/, '')}.md`,
      destination: markdownUrl(destination),
      permanent,
    });
  }
  twins.push({ source: '/index.md', destination: '/docs.md', permanent: true });
  return twins;
}
