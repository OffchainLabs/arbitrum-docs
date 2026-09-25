import { findCollisions, findLoops } from './current-redirects.mjs';

const isExternal = (value) => /^https?:\/\//.test(value);

/** Strip `#anchor` / `?query` and trailing slashes so a URL with a fragment still matches. */
export const bareUrl = (value) => value.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';

/**
 * Audit a redirect table against the set of routable page URLs.
 *
 * A destination that is another redirect's source is followed one hop: it is dead only when that
 * second destination is neither routable nor external. Chains are reported by `loops`.
 *
 * @param {{ source: string, destination: string }[]} redirects
 * @param {Set<string>} routable Bare routable URLs.
 * @returns {{
 *   dead: { source: string, destination: string }[],
 *   shadowed: { source: string, destination: string }[],
 *   skipped: number,
 *   collisions: { source: string, count: number }[],
 *   loops: { kind: 'self' | 'chain', source: string, destination: string, next?: string }[],
 * }}
 */
export function auditRedirects(redirects, routable) {
  const bySource = new Map(redirects.map((r) => [bareUrl(r.source), r.destination]));
  const resolves = (destination) => isExternal(destination) || routable.has(bareUrl(destination));

  const dead = [];
  const shadowed = [];
  let skipped = 0;

  for (const { source, destination } of redirects) {
    if (isExternal(destination)) {
      skipped += 1;
    } else if (!resolves(destination)) {
      const next = bySource.get(bareUrl(destination));
      if (next === undefined || !resolves(next)) dead.push({ source, destination });
    }
    if (routable.has(bareUrl(source))) shadowed.push({ source, destination });
  }

  return {
    dead,
    shadowed,
    skipped,
    collisions: findCollisions(redirects),
    loops: findLoops(redirects),
  };
}
