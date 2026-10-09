/** Derive markdown mirrors only for redirects to real documentation pages. */
export interface MarkdownRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

/** Characters path-to-regexp treats as syntax rather than a literal URL. */
const PATTERN_SYNTAX = /[:()*+?{}\\]/;

/** Markdown responses omit fragments; the site's root overview is `/index.md`. */
export function markdownUrl(docsUrl: string): string {
  const path = docsUrl.split('#')[0].replace(/\/+$/, '');
  return path === '' ? '/index.md' : `${path}.md`;
}

/** Public files and external destinations must never acquire markdown redirect twins. */
export function markdownTwins<T extends MarkdownRedirect>(
  redirects: readonly T[],
  docsUrls: ReadonlySet<string>,
): MarkdownRedirect[] {
  const twins: MarkdownRedirect[] = [];
  for (const { source, destination, permanent } of redirects) {
    if (!docsUrls.has(destination.split('#')[0])) continue;
    if (source === '/' || source.endsWith('.md') || PATTERN_SYNTAX.test(source)) continue;
    twins.push({
      source: `${source.replace(/\/+$/, '')}.md`,
      destination: markdownUrl(destination),
      permanent,
    });
  }
  return twins;
}
