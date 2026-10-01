/**
 * How a production URL lands on the target: the redirect chain, and what kind of landing it is.
 */
import type { Hop, ResolutionCategory } from './schema.ts';

export interface Resolution {
  path: string;
  chain: Hop[];
  /** Status of the last hop; null when the request failed outright. */
  status: number | null;
  finalPath: string | null;
  loop: boolean;
}

export const MAX_REDIRECTS = 10;

/** A path without a trailing slash, the form both sites are compared in. */
export function canonicalPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** A Fumadocs path with its `/docs` prefix removed, so it lines up with the production slug. */
export function withoutDocsPrefix(pathname: string): string {
  return canonicalPath(pathname.replace(/^\/docs(?=\/|$)/, ''));
}

/** The first path segment, which names a top-level section; the home page is `home`. */
export function sectionOf(pathname: string): string {
  return canonicalPath(pathname).split('/')[1] || 'home';
}

const lastSegment = (pathname: string): string => canonicalPath(pathname).split('/').pop() ?? '';

/**
 * Categorize a resolution. The slug is the last path segment, compared exactly. A redirect is
 * `unrelated` when it lands on the home page, or on a landing page (a path with pages below it,
 * per `isLanding`) whose slug differs: the reader asked for a page and got a table of contents.
 */
export function categorize(
  resolution: Resolution,
  isLanding: (pathname: string) => boolean = () => false,
): ResolutionCategory {
  if (resolution.loop) return 'loop';
  if (resolution.status === null || resolution.status >= 400 || resolution.finalPath === null) {
    return 'not-found';
  }
  if (resolution.chain.length <= 1) return 'direct';

  const to = withoutDocsPrefix(resolution.finalPath);
  if (to === '/') return canonicalPath(resolution.path) === '/' ? 'same-slug' : 'unrelated';
  if (lastSegment(resolution.path) === lastSegment(to)) return 'same-slug';
  if (isLanding(resolution.finalPath)) return 'unrelated';
  return 'changed-slug';
}

/**
 * Follow redirects by hand, recording each hop. `fetchHop` performs one request with redirects
 * disabled and returns its status and Location header.
 */
export async function resolvePath(
  base: string,
  path: string,
  fetchHop: (url: string) => Promise<{ status: number; location: string | null } | null>,
): Promise<Resolution> {
  const chain: Hop[] = [];
  const seen = new Set<string>();
  let url = new URL(path, base).toString();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (seen.has(url))
      return { path, chain, status: chain.at(-1)?.status ?? null, finalPath: null, loop: true };
    seen.add(url);
    const response = await fetchHop(url);
    if (response === null) {
      chain.push({ url, status: 0 });
      return { path, chain, status: null, finalPath: null, loop: false };
    }
    const entry: Hop = { url, status: response.status };
    if (response.location) entry.location = response.location;
    chain.push(entry);
    if (response.status >= 300 && response.status < 400 && response.location) {
      url = new URL(response.location, url).toString();
      continue;
    }
    return {
      path,
      chain,
      status: response.status,
      finalPath: canonicalPath(new URL(url).pathname),
      loop: false,
    };
  }
  return { path, chain, status: chain.at(-1)?.status ?? null, finalPath: null, loop: true };
}
