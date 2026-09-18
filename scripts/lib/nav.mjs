/**
 * nav — detect meta.json navigation defects.
 *
 * Fumadocs treats `pages` as an allowlist: when present, on-disk siblings that are not listed are
 * excluded from the sidebar unless the `"..."` rest operator appears. Entries naming a page that does
 * not exist are silently ignored. Both failure modes are invisible at build time, so we check them here.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Classify a single `pages` entry. */
export function classifyEntry(entry) {
  if (typeof entry !== 'string') return { kind: 'unknown', name: String(entry) };
  if (entry === '...' || entry === 'z...a') return { kind: 'rest', name: entry };
  if (entry.startsWith('[')) return { kind: 'link', name: entry };
  if (entry.startsWith('---')) return { kind: 'separator', name: entry };
  if (entry.startsWith('!')) return { kind: 'exclude', name: entry.slice(1) };
  return { kind: 'page', name: entry };
}

/** Compare one directory's meta.json against its on-disk entries. */
export function checkDir({ dir, meta, entries }) {
  const pages = Array.isArray(meta?.pages) ? meta.pages : null;
  if (!pages) return { dir, ghosts: [], hidden: [], hasRest: true };

  const classified = pages.map(classifyEntry);
  const hasRest = classified.some((c) => c.kind === 'rest');

  // `index.mdx` may legally be listed in `pages`, so it counts as on-disk for the ghost check —
  // but it is attached as the folder's own index regardless, so it can never be "hidden".
  const onDisk = new Set();
  const hideable = new Set();
  for (const e of entries) {
    if (e.isDir) {
      onDisk.add(e.name);
      hideable.add(e.name);
    } else if (e.name.endsWith('.mdx')) {
      const slug = e.name.replace(/\.mdx$/, '');
      onDisk.add(slug);
      if (e.name !== 'index.mdx') hideable.add(slug);
    }
  }

  const listed = new Set(
    classified.filter((c) => c.kind === 'page' || c.kind === 'exclude').map((c) => c.name),
  );

  const ghosts = [...listed].filter((name) => !onDisk.has(name) && !name.includes('/'));
  const hidden = hasRest ? [] : [...hideable].filter((name) => !listed.has(name));

  return { dir, ghosts: ghosts.sort(), hidden: hidden.sort(), hasRest };
}

/** Walk a content tree and check every directory that has a meta.json. */
export function checkTree(root) {
  const results = [];
  const walk = (abs) => {
    const entries = readdirSync(abs, { withFileTypes: true }).map((d) => ({
      name: d.name,
      isDir: d.isDirectory(),
    }));
    const metaPath = path.join(abs, 'meta.json');
    if (entries.some((e) => e.name === 'meta.json')) {
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      const result = checkDir({ dir: abs, meta, entries });
      if (result.ghosts.length || result.hidden.length) results.push(result);
    }
    for (const e of entries) if (e.isDir) walk(path.join(abs, e.name));
  };
  walk(root);
  return results;
}
