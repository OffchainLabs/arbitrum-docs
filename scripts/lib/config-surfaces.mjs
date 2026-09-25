/**
 * config-surfaces — parsers for the three legacy config files that carry doc changes.
 *
 * A PR that adds a page also edits config: `sidebars.js` for its nav slot, `vercel.json` for any
 * redirect, `src/resources/globalVars.js` for any value it interpolates. None of those live under
 * `docs/`, so a comparison that only walks the content tree cannot see them — and each has a
 * different counterpart here (`meta.json`, `redirects.legacy.mjs`, `content/vars.json`), so there is
 * no single mapping to apply.
 *
 * These are the parsers only. Resolving what they find against this repo is the caller's job.
 */

/** The legacy files that carry doc changes outside `docs/`, with the surface each maps to here. */
export const CONFIG_SURFACES = {
  'sidebars.js': 'meta.json',
  'vercel.json': 'redirects.legacy.mjs',
  'src/resources/globalVars.js': 'content/vars.json',
};

/**
 * Split a unified diff's changed lines by file.
 *
 * @param {string} diff Unified diff text.
 * @returns {Map<string, {added: string[], removed: string[]}>} Keyed by the `+++ b/` path, with
 *   leading `+`/`-` stripped.
 */
export function changedLinesByFile(diff) {
  const out = new Map();
  let current = null;

  for (const line of diff.split('\n')) {
    const header = /^\+\+\+ b\/(.+)$/.exec(line);
    if (header) {
      current = header[1];
      out.set(current, { added: [], removed: [] });
      continue;
    }
    if (!current) continue;
    if (line.startsWith('---')) continue;
    if (line.startsWith('+')) out.get(current).added.push(line.slice(1));
    else if (line.startsWith('-')) out.get(current).removed.push(line.slice(1));
  }

  return out;
}

/**
 * Legacy redirects this site deliberately does not carry.
 *
 * arbitrum-docs deleted its `/sdk` reference section and points readers at the GitHub repo instead,
 * so a redirect landing there has no on-site destination. Dropping those is a decision, not a gap —
 * shared with `generate-legacy-redirects.mjs` so the generator and the gap report cannot disagree
 * about which redirects are missing.
 *
 * @param {string} destination The legacy destination URL.
 * @returns {boolean} True when the redirect is intentionally absent here.
 */
export function isDroppedRedirect(destination) {
  return destination === '/sdk' || destination.startsWith('/sdk/');
}

/**
 * Redirect entries a `vercel.json` hunk added or removed.
 *
 * `vercel.json` is pretty-printed one key per line, so a source and its destination arrive as
 * separate diff lines; they are paired here because the destination decides whether the redirect is
 * one this site carries at all. An entry appearing on both sides is dropped — reformatting or
 * reordering the file rewrites lines without changing any redirect.
 *
 * @param {{added: string[], removed: string[]}} changed
 * @returns {{added: {source: string, destination: string}[], removed: {source: string, destination: string}[]}}
 */
export function parseRedirectEntries(changed) {
  const entries = (lines) => {
    const out = [];
    let source = null;
    for (const line of lines) {
      const s = /"source"\s*:\s*"([^"]*)"/.exec(line);
      if (s) {
        source = s[1];
        continue;
      }
      const d = /"destination"\s*:\s*"([^"]*)"/.exec(line);
      if (d && source !== null) {
        out.push({ source, destination: d[1] });
        source = null;
      }
    }
    return out;
  };

  const added = entries(changed.added);
  const removed = entries(changed.removed);
  const key = (e) => `${e.source}\0${e.destination}`;
  const removedKeys = new Set(removed.map(key));
  const addedKeys = new Set(added.map(key));

  return {
    added: added.filter((e) => !removedKeys.has(key(e))),
    removed: removed.filter((e) => !addedKeys.has(key(e))),
  };
}

/**
 * Doc ids a `sidebars.js` hunk added or removed.
 *
 * An id that appears on both sides is dropped: the Docusaurus sidebar is one nested literal, so
 * re-indenting a block or changing a sibling's label rewrites unrelated lines. Only a true
 * appearance or disappearance is a nav change.
 *
 * @param {{added: string[], removed: string[]}} changed
 * @returns {{added: string[], removed: string[]}} Docusaurus doc ids.
 */
export function parseNavIds(changed) {
  const ids = (lines) => {
    const out = new Set();
    for (const line of lines) {
      const m = /\bid:\s*'([^']+)'/.exec(line) ?? /\bid:\s*"([^"]+)"/.exec(line);
      if (m) out.add(m[1]);
    }
    return out;
  };

  const added = ids(changed.added);
  const removed = ids(changed.removed);
  for (const id of [...added]) {
    if (removed.has(id)) {
      added.delete(id);
      removed.delete(id);
    }
  }

  return { added: [...added], removed: [...removed] };
}

/**
 * Reduce a Vercel redirect source to a plain path, so it can be compared with ours.
 *
 * Most legacy sources are plain (`/stylus/using-cli`), but a minority are path-to-regexp groups
 * (`/(sdk-docs/assetBridger/?)`) that our generator emits in plain form. Comparing the raw strings
 * would report every one of those as absent.
 *
 * @param {string} source A `vercel.json` redirect source.
 * @returns {string} The comparable path, always leading-slashed.
 */
export function normalizeRedirectSource(source) {
  let s = source.trim();
  if (s.startsWith('/(') && s.endsWith(')')) s = `/${s.slice(2, -1)}`;
  s = s.replace(/\/\?$/, '').replace(/\?$/, '');
  if (!s.startsWith('/')) s = `/${s}`;
  return s.length > 1 ? s.replace(/\/$/, '') : s;
}

/**
 * Variable names a legacy page interpolates.
 *
 * The legacy marker carries the name and its last-rendered value together — `@@stylusSdkVersion=
 * 0.10.7@@` — and `yarn update-variable-refs` rewrites the value half when `globalVars.js` changes.
 * The migration's `T5` transform kept the value and dropped the name, so a page here holds a bare
 * literal with nothing recording where it came from. Collecting the names upstream is the only way
 * to find which bindings were lost.
 *
 * @param {string} text MDX source from the legacy tree.
 * @returns {string[]} Variable names, in first-seen order, without duplicates.
 */
export function collectVarMarkers(text) {
  const out = new Set();
  for (const m of text.matchAll(/@@([A-Za-z0-9_]+)(?:=[^@]*)?@@/g)) out.add(m[1]);
  return [...out];
}
