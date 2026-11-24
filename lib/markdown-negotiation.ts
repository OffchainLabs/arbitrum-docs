/**
 * `Accept` negotiation for page URLs: the `.md` twin a page is rewritten to when the client prefers
 * markdown. `proxy.ts` applies it. No imports, so `node --test` loads it as is.
 */

/**
 * The `.md` twin a page path is rewritten to when the client prefers markdown, or `null` when the
 * path is not one of `pages` (every page URL, `/` included). The rewrites in `next.config.ts` take
 * the twin on to the mirror route. Any other path, such as the home page's
 * `/opengraph-image-<hash>` or an unknown slug, keeps its own response.
 */
export function markdownTwinPath(pathname: string, pages: ReadonlySet<string>): string | null {
  if (!pages.has(pathname)) return null;
  return pathname === '/' ? '/index.md' : `${pathname}.md`;
}
