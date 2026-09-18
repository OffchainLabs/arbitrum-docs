/**
 * pr-map — the PR-specific path mapping, layered on `resolveLegacyPath`.
 *
 * `resolveLegacyPath` answers "where did this legacy file end up?", which only has an answer for a
 * file that exists in both trees. An upstream PR also carries files that exist in neither: pages it
 * adds, Docusaurus build files this repo does not have, and navigation state that lives in a
 * different format here. This module classifies every path in an upstream diff into one of a small
 * number of roles, and synthesises a destination for the files that are new.
 *
 * The roles:
 *   content        an MDX page, partial or glossary term to merge, create or delete
 *   asset          an image or video, copied verbatim (no dialect applies)
 *   nav            `sidebars.js` — navigation lives in `meta.json` here
 *   glossary-json  `static/glossary.json` — dropped, but added terms are fanned out as candidates
 *   out-of-scope   Docusaurus/site plumbing with no counterpart; counted, never blocking
 *   drop           deliberately not carried over (see NOT_MIGRATED in tree-compare)
 *   unmapped       a legacy page that should map and does not — the one role that must block
 */
import path from 'node:path';

import {
  DOCS_ROOT,
  GLOSSARY_ROOT,
  PARTIALS_ROOT,
  assetTarget,
  mapSectionPath,
  parseLegacyFrontmatter,
  partialTargetPath,
  resolveLegacyPath,
} from './tree-compare.mjs';

export const SIDEBARS_FILE = 'sidebars.js';
export const GLOSSARY_JSON = 'static/glossary.json';

/**
 * Site plumbing that has no counterpart here. A PR touching one of these is not broken — the file
 * simply does not exist in a Fumadocs tree, or is generated from a different source. Each entry is
 * reported as needs-human so the replay never silently claims to have carried the change over.
 */
export const OUT_OF_SCOPE = [
  /^src\//,
  /^scripts\//,
  /^packages\//,
  /^\.github\//,
  /^\.vscode\//,
  /^docusaurus\.config\.js$/,
  /^package(-lock)?\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /^tsconfig(\..+)?\.json$/,
  /^babel\.config\.js$/,
  /^vercel\.json$/,
  /^redirects\.config\.js$/,
  /^README\.md$/,
  /^CHANGELOG\.md$/,
];

/** Legacy assets that are not images but still ship verbatim (the PRs carry .mp4 alongside .svg). */
const ASSET_EXT = /\.(svg|png|jpe?g|gif|webp|mp4|webm|pdf|ico)$/i;

/** Strip Docusaurus `NN-` ordering prefixes from every segment of a path. */
export function stripOrderPrefixes(p) {
  return p
    .split('/')
    .map((s) => s.replace(/^(\d+)-/, ''))
    .join('/');
}

/**
 * The destination a legacy path *would* take if it were migrated today, without requiring that the
 * destination already exists. Used only for files an upstream PR adds, where there is nothing in
 * this tree to pair with.
 *
 * @param {string} relA legacy repo-relative path
 * @param {string} [source] the file's text; only glossary terms need it
 * @returns {{dest: string, kind: string}|null}
 */
export function syntheticDest(relA, source = '') {
  if (relA.startsWith('docs/partials/glossary/')) {
    const key = parseLegacyFrontmatter(source).key;
    if (!key) return null;
    return { dest: `${GLOSSARY_ROOT}/${key}.mdx`, kind: 'glossary' };
  }

  const asset = assetTarget(relA);
  if (asset) return { dest: asset, kind: 'asset' };

  if (!relA.startsWith('docs/')) return null;

  if (relA.includes('/partials/')) {
    return {
      dest: `${PARTIALS_ROOT}/${stripOrderPrefixes(partialTargetPath(relA))}`,
      kind: 'partial',
    };
  }

  if (!/\.mdx?$/i.test(relA)) return null;
  const rel = stripOrderPrefixes(mapSectionPath(relA.slice('docs/'.length))).replace(
    /\.mdx?$/i,
    '.mdx',
  );
  return { dest: `${DOCS_ROOT}/${rel}`, kind: 'doc' };
}

/** True when a legacy path is a binary/media asset rather than something with an MDX dialect. */
export function isAssetPath(relA) {
  return ASSET_EXT.test(relA);
}

/**
 * Classify one path out of an upstream diff.
 *
 * @param {object} input
 * @param {string} input.legacy legacy repo-relative path
 * @param {'A'|'M'|'D'|'R'} input.status
 * @param {string} input.source the file's text at whichever side defines it (head for A, base else)
 * @param {object} input.ctx the `resolveLegacyPath` context ({docsIndex, partialsIndex, destFiles})
 * @returns {{legacy: string, status: string, role: string, dest: string|null, kind: string,
 *            reason: string, synthetic: boolean}}
 */
export function mapPrPath({ legacy, status, source = '', ctx }) {
  const base = { legacy, status, synthetic: false };

  if (legacy === SIDEBARS_FILE) {
    return {
      ...base,
      role: 'nav',
      dest: null,
      kind: 'nav',
      reason: 'navigation lives in meta.json',
    };
  }
  if (legacy === GLOSSARY_JSON) {
    return {
      ...base,
      role: 'glossary-json',
      dest: null,
      kind: 'glossary',
      reason: 'superseded by content/glossary; added terms fanned out as candidates',
    };
  }
  if (OUT_OF_SCOPE.some((re) => re.test(legacy))) {
    return { ...base, role: 'out-of-scope', dest: null, kind: 'site', reason: 'site plumbing' };
  }

  const resolved = resolveLegacyPath(legacy, { ...ctx, source });
  if (resolved.dest) {
    const role = resolved.kind === 'asset' ? 'asset' : 'content';
    return { ...base, role, dest: resolved.dest, kind: resolved.kind, reason: resolved.reason };
  }
  if (resolved.kind === 'drop') {
    return { ...base, role: 'drop', dest: null, kind: 'drop', reason: resolved.reason };
  }

  // No counterpart here. For a file the PR adds that is expected; for one it edits it is a gap.
  const synth = syntheticDest(legacy, source);
  if (synth) {
    const role = synth.kind === 'asset' ? 'asset' : 'content';
    return {
      ...base,
      role,
      dest: synth.dest,
      kind: synth.kind,
      reason: `synthesised (${resolved.reason})`,
      synthetic: true,
    };
  }
  return { ...base, role: 'unmapped', dest: null, kind: resolved.kind, reason: resolved.reason };
}

/**
 * Terms present in the head `static/glossary.json` and absent from the base one.
 *
 * Each becomes a `content/glossary/<id>.mdx` *candidate*, never a written file: the legacy value is
 * a blob of HTML with `/intro/glossary#…` anchors in it, and turning that into a reference page is a
 * judgement call, not a mechanical rewrite. The candidate is written to the report directory so a
 * human can see exactly what upstream added.
 */
export function addedGlossaryTerms(baseJson, headJson) {
  const base = safeJson(baseJson) ?? {};
  const head = safeJson(headJson) ?? {};
  return Object.keys(head)
    .filter((id) => !Object.hasOwn(base, id))
    .sort()
    .map((id) => ({
      id,
      title: head[id]?.title ?? id,
      text: head[id]?.text ?? '',
      dest: `${GLOSSARY_ROOT}/${id}.mdx`,
    }));
}

function safeJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Decide whether a new page needs an insert into its destination directory's `meta.json`.
 *
 * Fumadocs treats `pages` as an allowlist only when the `"..."` rest operator is absent; with it,
 * an unlisted sibling still appears and ordering around it is unaffected, so the insert is a no-op.
 * Navigation is driven off the pages the PR adds rather than off `sidebars.js`: the two describe the
 * same fact, and the page list is data while the sidebar is a JavaScript module.
 *
 * @param {string} destPath the new page's destination path
 * @param {(dir: string) => object|null} readMeta returns the parsed meta.json for a directory
 * @returns {{dir: string, slug: string, action: 'none'|'insert', reason: string}}
 */
export function navInsertFor(destPath, readMeta) {
  const dir = path.posix.dirname(destPath);
  const slug = path.posix.basename(destPath).replace(/\.mdx?$/i, '');
  const meta = readMeta(dir);
  if (!meta)
    return { dir, slug, action: 'none', reason: 'no meta.json; Fumadocs lists all siblings' };
  if (!Array.isArray(meta.pages)) {
    return { dir, slug, action: 'none', reason: 'meta.json has no pages allowlist' };
  }
  if (meta.pages.includes(slug)) return { dir, slug, action: 'none', reason: 'already listed' };
  if (meta.pages.includes('...') || meta.pages.includes('z...a')) {
    return { dir, slug, action: 'none', reason: 'rest operator present; ordering unaffected' };
  }
  return { dir, slug, action: 'insert', reason: 'closed allowlist would hide the new page' };
}

/**
 * Decide whether a page the replay removes leaves a ghost entry behind in its directory's meta.json.
 *
 * Fumadocs silently ignores a `pages` entry naming a file that is not there, so a rename upstream
 * handled with a redirect leaves the old slug listed and invisible. `nav:check` is the only thing
 * that sees it.
 */
export function navRemoveFor(destPath, readMeta) {
  const dir = path.posix.dirname(destPath);
  const slug = path.posix.basename(destPath).replace(/\.mdx?$/i, '');
  const meta = readMeta(dir);
  if (!meta || !Array.isArray(meta.pages) || !meta.pages.includes(slug)) {
    return { dir, slug, action: 'none', reason: 'not listed' };
  }
  return { dir, slug, action: 'remove', reason: 'would be a ghost entry' };
}

/** Drop `slug` from a meta.json `pages` allowlist. */
export function removeFromPages(meta, slug) {
  return { ...meta, pages: meta.pages.filter((p) => p !== slug) };
}

/** Insert `slug` into a meta.json `pages` allowlist, before any link/separator tail. */
export function insertIntoPages(meta, slug) {
  const pages = [...meta.pages];
  let at = pages.length;
  while (at > 0 && /^[[-]/.test(String(pages[at - 1]))) at--;
  pages.splice(at, 0, slug);
  return { ...meta, pages };
}
