import type { Redirect } from '../redirects.config.ts';

/** Path-to-regexp syntax: these sources must keep their original position and parameters. */
const PATTERN_SYNTAX = /[:()*+?{}\\]/;
/** Leave room for Next's regex wrapper under its 4096-character compiled source limit. */
const MAX_ALTERNATIVES_LENGTH = 3000;
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Combine literal aliases with the same destination and status into exact regex alternatives.
 * The caller supplies distinct sources. Pattern routes are barriers: grouping never moves a
 * literal across one, so a pattern's priority and named destination parameters stay intact.
 * HTML and markdown URLs are grouped separately because their destinations differ.
 */
export function compactRedirects(redirects: readonly Redirect[]): Redirect[] {
  const result: Redirect[] = [];
  let groups = new Map<string, { entry: Redirect; alternatives: string[]; length: number }>();

  for (const entry of redirects) {
    if (
      !entry.source.startsWith('/') ||
      entry.source.endsWith('/') ||
      PATTERN_SYNTAX.test(entry.source) ||
      /:[A-Za-z_]/.test(entry.destination)
    ) {
      groups = new Map();
      result.push(entry);
      continue;
    }

    const key = JSON.stringify([entry.destination, entry.permanent]);
    const alternative = escapeRegex(entry.source.slice(1));
    const group = groups.get(key);
    if (!group || group.length + 1 + alternative.length > MAX_ALTERNATIVES_LENGTH) {
      const copy = { ...entry };
      result.push(copy);
      groups.set(key, { entry: copy, alternatives: [alternative], length: alternative.length });
      continue;
    }

    group.alternatives.push(alternative);
    group.length += 1 + alternative.length;
    group.entry.source = `/:legacy(${group.alternatives.join('|')})`;
  }

  return result;
}
