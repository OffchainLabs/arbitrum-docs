/**
 * nitro-upstream-paths: the paths into the Nitro repository that the docs depend on.
 *
 * Two sources: the `nitroPathTo*` pins in `content/vars.json`, and every content link under
 * `github.com/OffchainLabs/<nitroRepositorySlug>/blob/<nitroVersionTag>/`. `check-links` skips
 * external URLs, so nothing else sees these; `check-nitro-release` verifies them against the
 * target tag before it writes anything. Pure, so `nitro-upstream-paths.test.ts` runs offline;
 * the runner supplies the `exists` lookup.
 */
import { expandVarPlaceholders } from '../../lib/var-links.ts';
import { extractRefs, lineAt } from './doc-links.ts';

/** One `nitroPathTo*` pin from `content/vars.json`. */
export interface PathPin {
  key: string;
  path: string;
}

/** One Nitro source link in content, with where it was first written. */
export interface SourcePath {
  path: string;
  rel: string;
  line: number;
}

/** A path to verify, and the text to report when it is missing. */
export interface LabeledPath {
  path: string;
  label: string;
}

const PIN_PREFIX = 'nitroPathTo';

/** A string field of a parsed JSON object, throwing naming the key otherwise. */
function requireString(vars: Record<string, unknown>, key: string): string {
  const value = vars[key];
  if (typeof value !== 'string') {
    throw new Error(`content/vars.json needs a string "${key}"`);
  }
  return value;
}

/**
 * Every `nitroPathTo*` key of `vars`, in file order. The prefix is the registration mechanism: a
 * future `nitroPathToX` key is verified without a code change, so name a Nitro path pin that way.
 */
export function nitroPathPins(vars: Record<string, unknown>): PathPin[] {
  const pins: PathPin[] = [];
  for (const key of Object.keys(vars)) {
    if (!key.startsWith(PIN_PREFIX)) continue;
    pins.push({ key, path: requireString(vars, key) });
  }
  return pins;
}

/**
 * Every repository-relative path linked from `files` under the pinned Nitro tag, deduped by path
 * with the first occurrence kept. `#fragment`, `?query` and a trailing `/` are dropped. A link
 * still carrying an unknown `{var:` placeholder is skipped: `vars:check` owns that failure.
 * `<include>` directives are not links.
 */
export function nitroSourcePaths(
  files: Array<{ rel: string; source: string }>,
  vars: Record<string, unknown>,
): SourcePath[] {
  const slug = requireString(vars, 'nitroRepositorySlug');
  const tag = requireString(vars, 'nitroVersionTag');
  const prefix = `https://github.com/OffchainLabs/${slug}/blob/${tag}/`;
  const seen = new Map<string, SourcePath>();
  for (const file of files) {
    // `extractRefs` groups by surface, so sort by offset to keep the first occurrence in the source.
    // A null range has no offset; the raw URL's first occurrence is the best line available.
    const refs = extractRefs(file.source)
      .filter((ref) => ref.surface !== 'include')
      .map((ref) => ({
        rawUrl: ref.rawUrl,
        offset: ref.range === null ? Math.max(file.source.indexOf(ref.rawUrl), 0) : ref.range[0],
      }))
      .sort((a, b) => a.offset - b.offset);
    for (const { rawUrl, offset } of refs) {
      const url = expandVarPlaceholders(rawUrl, vars);
      if (url.includes('{var:') || !url.startsWith(prefix)) continue;
      const path = url
        .slice(prefix.length)
        .replace(/[#?].*$/, '')
        .replace(/\/$/, '');
      if (path === '' || seen.has(path)) continue;
      seen.set(path, { path, rel: file.rel, line: lineAt(file.source, offset) });
    }
  }
  return [...seen.values()];
}

/**
 * The labels of every entry whose path `exists` reports absent, in input order. Each distinct
 * path is looked up once, sequentially, so a rate-limited run fails on its first error instead of
 * fanning out.
 */
export async function findMissingUpstreamPaths(
  paths: LabeledPath[],
  exists: (path: string) => Promise<boolean>,
): Promise<string[]> {
  const known = new Map<string, boolean>();
  const missing: string[] = [];
  for (const { path, label } of paths) {
    let present = known.get(path);
    if (present === undefined) {
      present = await exists(path);
      known.set(path, present);
    }
    if (!present) missing.push(label);
  }
  return missing;
}
