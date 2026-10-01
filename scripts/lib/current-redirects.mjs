/**
 * current-redirects — map the URLs docs.arbitrum.io serves *today* onto this site's `/docs` paths.
 *
 * Distinct from lib/tree-compare's job and from generate-legacy-redirects':
 *   - `redirects.legacy.mjs` ports arbitrum-docs' own `vercel.json`, i.e. URLs that were already
 *     dead upstream before this migration. Those entries carry pre-restructure paths (`/anytrust`).
 *   - This module covers the live corpus: every page arbitrum-docs routes right now. Docusaurus
 *     serves `docs/**` at the site root (`routeBasePath: '/'`), this site serves the same pages
 *     under `/docs`, so without these entries 100% of current organic traffic 404s on cutover.
 *
 * Same evidence bar as the legacy generator: emit only destinations proven to exist, park the rest.
 * The bar is raised in one place — a bare-slug match is only accepted when the two pages also share
 * a frontmatter title. Slug alone mispairs four upstream how-tos onto same-named concept pages
 * (`gas-optimization`, `arbos`, `stf`, `batch-poster`), which is exactly the confidently-wrong
 * redirect no checker can detect.
 */
import { buildTreeIndex, mapSectionPath, normalizeSlug } from './tree-compare.mjs';

/** Docusaurus' default `numberPrefixParser`: `01-`, `1.5 - ` are ordering hints, not URL segments. */
const NUMBER_PREFIX = /^\d+\s*[-_.]\s*/;

/**
 * Pages under `docs/**` that Docusaurus routes but nobody links to or indexes.
 *
 * `api/**` is in the plugin's own `exclude`. The rest are routed but listed as non-canonical in
 * docusaurus.config.js' `nonCanonicalRoutePatterns`, so they are absent from the sitemap and from
 * llms.txt — they carry no inbound traffic to preserve.
 */
export function isRoutablePage(relPath) {
  const segments = relPath.split('/');
  const base = segments[segments.length - 1];
  if (!/\.mdx?$/.test(base)) return false;
  if (base.startsWith('_')) return false;
  if (segments.includes('api') || segments.includes('partials')) return false;
  if (segments[0] === 'hosted-pdfs') return false;
  return true;
}

/** Frontmatter fields that move a page's URL, plus the title used as pairing evidence. */
export function parseFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return {};
  const out = {};
  for (const line of block[1].split('\n')) {
    const field = line.match(/^(title|slug|id):\s*(.*)$/);
    if (field) out[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

/**
 * The URL Docusaurus serves for `docs/<relPath>`, as a root-level path.
 *
 * Four rules, all verified against the checked-in build's sitemap.xml rather than assumed:
 * number prefixes are stripped from every segment; `id:` replaces the last segment; a doc named
 * `index`, `README`, or the same as its parent folder *is* that folder's route (case-insensitively —
 * `oracles/DIA/dia.mdx` serves at `/for-devs/oracles/DIA`); and `slug:` overrides the lot.
 */
export function docusaurusRoute(relPath, front = {}) {
  const parts = relPath
    .replace(/\.mdx?$/, '')
    .split('/')
    .map((segment) => segment.replace(NUMBER_PREFIX, ''));
  if (front.id) parts[parts.length - 1] = front.id;

  const last = parts[parts.length - 1].toLowerCase();
  const parent = (parts[parts.length - 2] ?? '').toLowerCase();
  if (parts.length > 1 && (last === 'index' || last === 'readme' || last === parent)) parts.pop();

  if (front.slug) {
    const base = front.slug.startsWith('/')
      ? front.slug
      : `/${[...parts.slice(0, -1), front.slug].join('/')}`;
    return base.replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
  }
  return `/${parts.join('/')}`;
}

/** A `content/docs` relative path as the URL this site serves it at. */
export function destinationUrl(relPath) {
  const base = relPath.replace(/\.mdx$/, '');
  return `/docs/${base.endsWith('/index') ? base.slice(0, -'/index'.length) : base}`;
}

/** Titles are compared for equality only, so punctuation and casing are noise. */
export const normalizeTitle = (title) => (title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Upstream routes whose destination no mechanical rule can pick, confirmed by hand.
 *
 * All five are the same failure: upstream's path disambiguates two same-named pages and this site's
 * path does not, so slug matching finds the concept page when the reader wanted the how-to. The
 * first four are the title mismatches the bare-slug guard rejects; `stf-gentle-intro` has no
 * same-named page here at all because the port folded it into `deep-dives/stf`.
 */
export const MANUAL_DESTINATIONS = new Map([
  // "Configure and optimize gas" (chain), not Stylus' "Gas optimization best practices".
  [
    '/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
  ],
  // "How to customize ArbOS on your Arbitrum chain", not the ArbOS concept page.
  [
    '/launch-arbitrum-chain/extend-the-protocol/arbos',
    '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
  ],
  // "How to customize your Arbitrum chain's behavior", not the State Transition Function concept.
  [
    '/launch-arbitrum-chain/extend-the-protocol/stf',
    '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
  ],
  // "Run a batch poster" (how-to), not "The batch poster" (concept).
  [
    '/launch-arbitrum-chain/run-a-node/batch-poster',
    '/docs/launch-arbitrum-chain/run-a-node/batch-poster',
  ],
  // Folded into the STF page here; see the GUTTED entry in `pnpm drift`.
  ['/how-arbitrum-works/deep-dives/stf-gentle-intro', '/docs/how-arbitrum-works/deep-dives/stf'],
]);

/**
 * Indexed URLs with no file behind them: sidebar categories whose `link` is a `generated-index`
 * carrying an explicit `slug`. They are in the sitemap and they carry traffic, but `docs/**` has
 * nothing to derive them from, so they are listed here and their destinations still proven.
 */
export const SIDEBAR_INDEX_ROUTES = new Map([
  ['/arbitrum-essentials', '/docs/arbitrum-essentials'],
  ['/stylus', '/docs/stylus'],
]);

/**
 * Upstream routes that must never be redirected, with the reason reported rather than dropped.
 *
 * `/` is the site root. `docs/get-started/overview.mdx` carries `slug: /`, so deriving it produces
 * a source that would hijack this site's own landing page. A reader arriving at the old root belongs
 * on the new root; that is a DNS/domain concern, not a redirect.
 */
export const EXCLUDED_ROUTES = new Map([
  ['/', 'site root; served by this site’s own landing page'],
]);

/**
 * Resolve one upstream page to a destination on this site.
 *
 * Rules run most-trustworthy first and stop at the first hit:
 *   manual        hand-confirmed override
 *   mapped        tree-compare's directory+slug pairing (includes RENAME_MAP and SECTION_MAP)
 *   bare-slug     tree-compare's cross-directory fallback, only when the titles also agree
 *   title         exactly one page on this site carries the same frontmatter title
 * Anything else returns null and the caller parks it.
 */
export function resolveDestination(page, ctx) {
  const manual = MANUAL_DESTINATIONS.get(page.route);
  if (manual) return { destination: manual, rule: 'manual' };

  const mapped = mapSectionPath(page.rel);
  const dir = mapped.split('/').slice(0, -1).join('/');
  const slug = normalizeSlug(mapped);

  const exact = ctx.index.byDirSlug.get(`${dir}\0${slug}`);
  if (exact) return { destination: destinationUrl(exact), rule: 'mapped', destRel: exact };

  const bare = ctx.index.bareSlug.get(slug);
  if (bare) {
    const same = normalizeTitle(ctx.destTitles.get(bare)) === normalizeTitle(page.title);
    if (same) return { destination: destinationUrl(bare), rule: 'bare-slug', destRel: bare };
    return {
      destination: null,
      reason: 'bare-slug-title-mismatch',
      wouldMatch: destinationUrl(bare),
    };
  }

  const byTitle = ctx.byTitle.get(normalizeTitle(page.title)) ?? [];
  if (byTitle.length === 1) {
    return { destination: destinationUrl(byTitle[0]), rule: 'title', destRel: byTitle[0] };
  }

  return {
    destination: null,
    reason: byTitle.length ? 'ambiguous-title' : 'no-counterpart',
    ...(byTitle.length ? { candidates: byTitle.map(destinationUrl) } : {}),
  };
}

/**
 * Build the whole set.
 *
 * `pages` is every routable upstream page as `{ rel, title }` (rel relative to `docs/`); `destPages`
 * is this site's `content/docs` as `Map<relPath, title>`; `existing` is `Map<source, destination>`
 * for the redirects already in the final array. Returns the emitted entries plus the worklist, so
 * the caller can write both and report the split.
 *
 * A source `existing` already claims is deferred, never re-emitted: the generated set spreads last
 * and Next keeps the first match, so emitting it again would be a silent duplicate that changes
 * nothing. A deferred entry whose existing destination differs from the one derived here is flagged
 * `conflict` — one of the two is wrong and only a human can say which.
 */
export function buildCurrentRedirects({ pages, destPages, existing = new Map() }) {
  const ctx = {
    index: buildTreeIndex([...destPages.keys()]),
    destTitles: destPages,
    byTitle: new Map(),
  };
  for (const [rel, title] of destPages) {
    const key = normalizeTitle(title);
    if (!key) continue;
    ctx.byTitle.set(key, [...(ctx.byTitle.get(key) ?? []), rel]);
  }

  const validUrls = new Set([...destPages.keys()].map(destinationUrl));
  const redirects = [];
  const todo = [];
  const excluded = [];
  const deferred = [];
  const byRule = { 'manual': [], 'mapped': [], 'bare-slug': [], 'title': [] };
  const seen = new Map();

  const emit = (source, destination, rule) => {
    if (seen.has(source)) return;
    seen.set(source, destination);
    if (existing.has(source)) {
      const already = existing.get(source);
      deferred.push({ source, destination, existing: already, conflict: already !== destination });
      return;
    }
    redirects.push({ source, destination, permanent: true });
    byRule[rule]?.push({ source, destination });
  };

  for (const [source, reason] of EXCLUDED_ROUTES) excluded.push({ source, reason });

  for (const page of pages) {
    if (EXCLUDED_ROUTES.has(page.route)) continue;
    const result = resolveDestination(page, ctx);
    if (!result.destination) {
      todo.push({ source: page.route, upstream: `docs/${page.rel}`, ...stripDestination(result) });
      continue;
    }
    if (!validUrls.has(result.destination)) {
      throw new Error(
        `current-redirects: ${result.rule} destination does not exist: ${result.destination} ` +
          `(from docs/${page.rel})`,
      );
    }
    emit(page.route, result.destination, result.rule);
  }

  for (const [source, destination] of SIDEBAR_INDEX_ROUTES) {
    if (!validUrls.has(destination)) {
      throw new Error(
        `current-redirects: SIDEBAR_INDEX_ROUTES points at a missing page: ${destination}`,
      );
    }
    emit(source, destination, 'manual');
  }

  redirects.sort((a, b) => a.source.localeCompare(b.source));
  todo.sort((a, b) => a.source.localeCompare(b.source));
  deferred.sort((a, b) => a.source.localeCompare(b.source));
  return { redirects, todo, excluded, deferred, byRule };
}

const stripDestination = ({ destination, rule, ...rest }) => rest;

/** Sources listed more than once. Next keeps the first match silently, so a duplicate is a bug. */
export function findCollisions(entries) {
  const counts = new Map();
  for (const entry of entries) counts.set(entry.source, (counts.get(entry.source) ?? 0) + 1);
  return [...counts].filter(([, n]) => n > 1).map(([source, count]) => ({ source, count }));
}

/**
 * Redirects that send a reader back into the redirect table.
 *
 * `self` is a source pointing at itself — an infinite loop. `chain` is a destination that is also a
 * source: not fatal, because Next resolves one hop per request and the browser follows, but it costs
 * a round trip and usually means one of the two entries is stale.
 */
export function findLoops(entries) {
  const bySource = new Map(entries.map((entry) => [entry.source, entry.destination]));
  const out = [];
  for (const { source, destination } of entries) {
    const page = destination.split('#')[0];
    if (page === source) out.push({ kind: 'self', source, destination });
    else if (bySource.has(page))
      out.push({ kind: 'chain', source, destination, next: bySource.get(page) });
  }
  return out;
}
