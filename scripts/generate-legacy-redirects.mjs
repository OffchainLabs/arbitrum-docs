#!/usr/bin/env node
/**
 * Ports the legacy Docusaurus redirect map (docs.arbitrum.io) into this site.
 *
 * Legacy URLs were served at the site root (`/stylus/using-cli`); this site
 * serves docs under `/docs`. So sources stay root-level — that is what real
 * inbound links look like — and destinations are rewritten to `/docs/...`.
 *
 * Only redirects whose destination provably exists in `content/docs` are
 * emitted. Everything else lands in the `.todo.json` worklist rather than being
 * guessed at, because a redirect to a merely-plausible page is worse than a 404:
 * it silently sends readers somewhere wrong.
 *
 * The output is committed, so builds never need the sibling arbitrum-docs repo —
 * only regeneration does. `git diff` after a run shows whether it was stale.
 *
 * Usage:
 *   node scripts/generate-legacy-redirects.mjs [--source <vercel.json>]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

import { isDroppedRedirect } from './lib/config-surfaces.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SOURCE = resolve(ROOT, '../arbitrum-docs/vercel.json');
const OUT_REDIRECTS = join(ROOT, 'redirects.legacy.mjs');
const OUT_TODO = join(ROOT, 'redirects.legacy.todo.json');
const CONTENT_DIR = join(ROOT, 'content/docs');

/**
 * Legacy arbitrum-docs section -> this site's section.
 *
 * Only renames where the whole section moved wholesale and the target section
 * exists. Deep restructures (launch-arbitrum-chain, build-decentralized-apps)
 * are deliberately absent: their pages moved individually, so a section-level
 * rename would produce confidently-wrong destinations.
 */
const SECTION_RENAMES = [
  ['/run-arbitrum-node', '/run-a-node'],
  ['/node-running', '/run-a-node'],
  ['/for-devs', '/build-decentralized-apps'],
  ['/intro', '/get-started'],
  ['/learn-more', '/get-started'],
  ['/faqs', '/get-started'],
];

/**
 * Legacy destination -> this site's page, where no mechanical rule can pick the right one.
 *
 * Two situations land here. The basename fallback matches on basename, so when a how-to was
 * renamed on the way over it can only see a same-named concept page and sends the reader there
 * instead. And upstream has restructured `launch-arbitrum-chain` more than once. This site now
 * mirrors upstream's current `chain-config/…` shape (2026-09-24), so most entries below map a path
 * to the same path here. The explicit entries still matter: they stop the basename fallback from
 * picking a same-named page in another section, and they catch old-shape paths that no prefix rule
 * describes, because the sections were re-cut, not renamed.
 *
 * Every entry was confirmed by comparing the upstream page's frontmatter title against this
 * site's candidates; where the titles are verbatim-identical that is noted as `=`. A value may
 * carry an `#anchor`; the page part must resolve or the build throws.
 */
const MANUAL_DESTINATIONS = new Map([
  ['/get-started/overview', '/docs/get-started'],
  [
    '/launch-arbitrum-chain/extend-the-protocol/stf',
    '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
  ],
  [
    '/launch-arbitrum-chain/extend-the-protocol/precompiles',
    '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
  ],
  [
    '/launch-arbitrum-chain/run-a-node/batch-poster',
    '/docs/launch-arbitrum-chain/run-a-node/batch-poster',
  ],

  // --- upstream `launch-arbitrum-chain/chain-config/*`, mirrored here at the same paths ---
  [
    '/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    '/docs/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
  ],
  [
    '/launch-arbitrum-chain/chain-config/batch-poster/fee-tuning',
    '/docs/launch-arbitrum-chain/chain-config/batch-poster/fee-tuning',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/aep-overview',
    '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    '/docs/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
  ],
  [
    '/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
    '/docs/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
  ],
  // Without this the basename sends chain gas-optimization to stylus/best-practices/gas-optimization.
  [
    '/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
  ],
  [
    '/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
  ],
  [
    '/launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit',
    '/docs/launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit',
  ],
  [
    '/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
  ],
  [
    '//launch-arbitrum-chain/chain-config/sequencer/timeboost',
    '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
  ],
  [
    '/launch-arbitrum-chain/chain-config/validation/assertion-control',
    '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
  ],
  [
    '/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
  ],
  [
    '/launch-arbitrum-chain/chain-config/validation/challenge-period',
    '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
  ],
  // `arbos` = "How to customize ArbOS on your Arbitrum chain", a how-to. Without this the basename
  // sends it to how-arbitrum-works/deep-dives/arbos, which is the ArbOS concept page.
  [
    '/launch-arbitrum-chain/extend-the-protocol/arbos',
    '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
  ],
  [
    '/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
  ],

  // --- upstream `configure-your-chain/*` (an earlier shape) still referenced by old entries ---
  [
    '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-a-das',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-a-mirror-das',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
  ],

  // --- deploy / quickstart / operate. Titles are verbatim-identical across both sites. ---
  [
    '/launch-arbitrum-chain/deploy-an-arbitrum-chain/customize-deployment-configuration',
    '/docs/launch-arbitrum-chain/deploy/deploy-chain',
  ],
  // Upstream typo, kept verbatim so the lookup matches: "arbiturm".
  [
    '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-an-arbiturm-chain',
    '/docs/launch-arbitrum-chain/deploy/deploy-chain',
  ],
  // = "How to configure your Arbitrum chain's node using the Chain SDK"
  [
    '/launch-arbitrum-chain/deploy/configure-node',
    '/docs/launch-arbitrum-chain/deploy/configure-node',
  ],
  // = "How to deploy an Arbitrum chain using the Chain SDK"
  ['/launch-arbitrum-chain/deploy/deploy-chain', '/docs/launch-arbitrum-chain/deploy/deploy-chain'],
  ['/launch-arbitrum-chain/deploy/token-bridge', '/docs/launch-arbitrum-chain/deploy/token-bridge'],
  // = "Run an L3 rollup from scratch"
  [
    '/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
    '/docs/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
  ],
  // = "Run testnet infrastructure on your first rollup (product-level testnet)"
  [
    '/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
    '/docs/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
  ],
  [
    '/launch-arbitrum-chain/quickstart/sdk-introduction',
    '/docs/launch-arbitrum-chain/quickstart/sdk-introduction',
  ],
  ['/launch-arbitrum-chain/operate/monitoring', '/docs/launch-arbitrum-chain/operate/monitoring'],
  // = "Ownership structure and access control"
  [
    '/launch-arbitrum-chain/operate/ownership-and-access',
    '/docs/launch-arbitrum-chain/operate/ownership-and-access',
  ],
  [
    '/launch-arbitrum-chain/operate/post-launch-deployments',
    '/docs/launch-arbitrum-chain/operate/post-launch-deployments',
  ],
  [
    '/launch-arbitrum-chain/migrate/between-raases',
    '/docs/launch-arbitrum-chain/migrate/between-raases',
  ],
  [
    '/launch-arbitrum-chain/migrate/from-another-stack',
    '/docs/launch-arbitrum-chain/migrate/from-another-stack',
  ],
  [
    '/launch-arbitrum-chain/integrations/bridged-usdc',
    '/docs/launch-arbitrum-chain/integrations/bridged-usdc',
  ],
  [
    '/launch-arbitrum-chain/integrations/infrastructure-providers',
    '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
  ],
  // = "Overview of Arbitrum chains". overview/index.mdx is a different page, titled "Concepts".
  [
    '/launch-arbitrum-chain/overview/introduction',
    '/docs/launch-arbitrum-chain/overview/introduction',
  ],
  ['/launch-arbitrum-chain/overview/license', '/docs/launch-arbitrum-chain/overview/license'],
  [
    '/launch-arbitrum-chain/overview/public-preview',
    '/docs/launch-arbitrum-chain/overview/public-preview',
  ],
  ['/launch-arbitrum-chain/overview/faq', '/docs/launch-arbitrum-chain/overview/faq'],
  // The node how-tos live under run-a-node here, not under launch-arbitrum-chain.
  [
    '/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
  ],
  [
    '/launch-arbitrum-chain/run-a-node/split-validator-node',
    '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
  ],
  [
    '/run-arbitrum-node/data-availability-committees/get-started',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
  ],
  // --- older upstream shapes (`configure-your-chain/common/*`, `…/advanced/*`) ---
  // Each maps to the page that replaced it upstream, now mirrored here.
  [
    '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/aep-fee-router-introduction',
    '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/reporting-on-fees',
    '/docs/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/set-up-aep-fee-router',
    '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/advanced/da-api-integration-guide',
    '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/ux/fast-withdrawals',
    '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-anytrust',
    '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-rollup',
    '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/additional-configuration-parameters',
    '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/configure-dac',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-das',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
  ],
  [
    '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-mirror-das',
    '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
  ],
  [
    '/launch-arbitrum-chain/arbitrum-node-runners/run-split-validator-node',
    '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
  ],
  [
    '/launch-arbitrum-chain/arbitrum-node-runners/high-availability-sequencer-docs',
    '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
  ],

  // --- upstream wrote these with a stray leading slash (`//launch-…`); keyed verbatim ---
  [
    '//launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    '/docs/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
  ],
  [
    '//launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
  ],
  [
    '//launch-arbitrum-chain/chain-config/validation/bold',
    '/docs/launch-arbitrum-chain/chain-config/validation/bold',
  ],
  [
    '//launch-arbitrum-chain/chain-config/validation/challenge-period',
    '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
  ],
  [
    '//launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
  ],

  // --- upstream moved these; the page here is unchanged. `=` titles confirmed 2026-09-24. ---
  // = "Oracles"
  ['/arbitrum-essentials/oracles/overview-oracles', '/docs/oracles/overview-oracles'],
  // = "Arbitrum chain information"
  ['/for-devs/dev-tools-and-resources/chain-info', '/docs/chain-info'],
  // = "How to debug Stylus transactions"
  ['/stylus/how-tos/debugging-tx', '/docs/stylus/cli-tools/debugging-tx'],

  // --- outside launch-arbitrum-chain ---
  [
    '/build-decentralized-apps/token-bridging/overview',
    '/docs/arbitrum-essentials/bridging/overview',
  ],
  [
    '/build-decentralized-apps/precompiles/reference#arbsys',
    '/docs/arbitrum-essentials/precompiles/reference#arbsys',
  ],
  [
    '/how-arbitrum-works/deep-dives/arbos#stylus-specific-differences',
    '/docs/how-arbitrum-works/deep-dives/arbos#stylus-specific-differences',
  ],
  [
    '/how-arbitrum-works/deep-dives/gas-and-fees#parent-chain-gas-pricing',
    '/docs/how-arbitrum-works/deep-dives/gas-and-fees#parent-chain-gas-pricing',
  ],
  // The gentle intro was folded into the STF page here; see the GUTTED entry in `pnpm drift`.
  ['/how-arbitrum-works/deep-dives/stf-gentle-intro', '/docs/how-arbitrum-works/deep-dives/stf'],
  ['/for-devs/contribute', '/docs/contribute'],
  ['/stylus/cli-tools-overview', '/docs/stylus/cli-tools/overview'],
  // = "How to verify Stylus contracts". The Arbiscan how-to is a different page.
  ['/stylus/how-tos/verifying-contracts', '/docs/stylus/cli-tools/verify-contracts'],
  // Upstream has no /stylus/overview page either; the section landing is the honest target.
  ['/stylus/overview', '/docs/stylus'],
  // `/faqs/protocol-faqs` does not exist upstream — these three anchors 404 on the live site
  // today. Each question has a page here that actually answers it, so route to that page.
  [
    '/faqs/protocol-faqs#q-rollup-vs-anytrust',
    '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
  ],
  ['/faqs/protocol-faqs#q-seq-vs-val', '/docs/how-arbitrum-works/deep-dives/sequencer'],
  ['/faqs/protocol-faqs#q-dispute-reorg', '/docs/how-arbitrum-works/bold/gentle-introduction'],
]);

/**
 * Every routable doc URL on this site, derived from the content tree, keyed by lowercased URL.
 *
 * The legacy corpus has casing drift (`/sdk/assetbridger` next to `/sdk/assetBridger`), and this
 * tree has mixed-case directories (`oracles/DIA`, `third-party-docs/Circle`). Matching
 * case-sensitively would report a destination that exists as "not in tree". The map value is the
 * real casing, which is what must be emitted — a redirect to the wrong case still 404s.
 */
function collectValidUrls() {
  const urls = new Map();
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full, `${prefix}/${entry}`);
      } else if (entry.endsWith('.mdx') && !entry.startsWith('_')) {
        const base = entry.slice(0, -'.mdx'.length);
        const url = base === 'index' ? `/docs${prefix}` : `/docs${prefix}/${base}`;
        const key = url.toLowerCase();
        const clash = urls.get(key);
        if (clash && clash !== url) {
          throw new Error(
            `generate-legacy-redirects: two pages differ only by case (${clash} vs ${url}); ` +
              `case-insensitive matching cannot pick between them.`,
          );
        }
        urls.set(key, url);
      }
    }
  };
  walk(CONTENT_DIR, '');
  return urls;
}

/** Resolve a URL to its real casing on this site, or undefined when no page serves it. */
const resolveUrl = (valid, url) => valid.get(url.toLowerCase());

/** `/(a/b/?)` and `/a/b/` both normalise to `/a/b`. */
function normaliseSource(source) {
  const group = source.match(/^\/\((.*)\)$/);
  const bare = group ? `/${group[1]}` : source;
  return bare.replace(/\/\?$/, '').replace(/\/+$/, '') || '/';
}

const isAbsolute = (value) => /^https?:\/\//.test(value);

/**
 * Destinations the legacy corpus records as paths but that are not paths: an absolute URL with a
 * stray leading slash (`/https://…`) or a doubled root (`//launch-…`). Slug-matching these would
 * find a real page and emit a confidently-wrong redirect, so they are rejected outright.
 */
const isMalformed = (value) => value.startsWith('//') || /^\/https?:/.test(value);

/**
 * Page basename, reduced for comparison: lowercase, punctuation dropped. `Gas-Fees.mdx` and
 * `gas_fees.mdx` collapse to the same key.
 */
const slugKey = (url) =>
  url
    .replace(/\/+$/, '')
    .split('/')
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** slug -> every routable URL ending in that slug. Built once from the same page inventory. */
function indexBySlug(valid) {
  const bySlug = new Map();
  for (const url of valid.values()) {
    const key = slugKey(url);
    if (!bySlug.has(key)) bySlug.set(key, []);
    bySlug.get(key).push(url);
  }
  return bySlug;
}

/**
 * How many legacy pages carried each slug, read from the sibling repo's `docs/` tree.
 *
 * The slug fallback assumes a basename identifies a page. That holds only if the basename was
 * unique upstream too. It was not always: upstream had both
 * `launch-arbitrum-chain/chain-config/costs/gas-optimization` and
 * `stylus/best-practices/gas-optimization`, and only the Stylus one was ported — so matching on
 * basename alone sends a chain-config page to a Stylus page. Where the legacy path was doing the
 * disambiguating, the fallback cannot, and must decline.
 *
 * Returns null when the tree is unavailable, which makes the fallback decline everything rather
 * than match unverified.
 */
function countUpstreamSlugs(sourcePath) {
  const docsDir = join(dirname(sourcePath), 'docs');
  const counts = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.mdx?$/.test(entry) && !entry.startsWith('_')) {
        const key = slugKey(entry.replace(/\.mdx?$/, ''));
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  };
  try {
    walk(docsDir);
  } catch {
    return null;
  }
  return counts;
}

/**
 * Follow the legacy corpus's own redirect chain to its terminal destination.
 *
 * 219 of the upstream redirects point at a URL that is itself a redirect source, up to three hops
 * deep — upstream restructured after those entries were written and never collapsed them, relying
 * on the browser to follow. So a `destination` is often not where a reader ends up. Resolving the
 * chain first turns a guess into upstream's own answer, and is far stronger evidence than matching
 * a basename.
 */
function followChain(destination, bySource) {
  const seen = new Set();
  let current = destination;
  while (bySource.has(current) && !seen.has(current)) {
    seen.add(current);
    current = bySource.get(current);
  }
  return current;
}

/** Candidate destinations, most-literal first. */
function candidateDestinations(destination) {
  const base = destination.replace(/\/+$/, '');
  const out = [`/docs${base}`];
  for (const [from, to] of SECTION_RENAMES) {
    if (base === from || base.startsWith(`${from}/`)) {
      out.push(`/docs${to}${base.slice(from.length)}`);
    }
  }
  return out;
}

function build(sourcePath) {
  const legacy = JSON.parse(readFileSync(sourcePath, 'utf8'));
  const valid = collectValidUrls();
  const bySlug = indexBySlug(valid);
  const upstreamSlugs = countUpstreamSlugs(sourcePath);
  const bySource = new Map();
  for (const entry of legacy.redirects ?? []) {
    const key = normaliseSource(entry.source);
    if (!bySource.has(key)) bySource.set(key, entry.destination);
  }

  const redirects = [];
  const todo = [];
  const renamed = [];
  const slugMatched = [];
  const seen = new Set();
  let duplicates = 0;

  for (const entry of legacy.redirects ?? []) {
    if (entry.source.includes('__redirects-autogen')) continue;
    // The SDK reference was never ported and has no on-site home: arbitrum-docs deleted its
    // /sdk section and links readers to the GitHub repo from the sidebar. These legacy entries
    // are not a gap to close, so drop them instead of parking them in the worklist forever.
    // Shared with `pr:gap`, which must not report them as missing redirects.
    if (isDroppedRedirect(entry.destination)) continue;

    const source = normaliseSource(entry.source);
    if (seen.has(source)) {
      duplicates += 1;
      continue;
    }
    seen.add(source);

    // A legacy source that is already a live URL here must never be redirected.
    if (resolveUrl(valid, source)) {
      todo.push({ source, legacyDestination: entry.destination, reason: 'source-is-live-url' });
      continue;
    }

    if (isAbsolute(entry.destination)) {
      redirects.push({ source, destination: entry.destination, permanent: !!entry.permanent });
      continue;
    }

    const target = followChain(entry.destination, bySource);

    const manual = MANUAL_DESTINATIONS.get(target.replace(/\/+$/, ''));
    if (manual) {
      const [manualPage, anchor] = manual.split('#');
      const resolved = resolveUrl(valid, manualPage);
      if (!resolved) {
        throw new Error(
          `generate-legacy-redirects: MANUAL_DESTINATIONS points at a missing page: ${manual}`,
        );
      }
      redirects.push({
        source,
        destination: anchor ? `${resolved}#${anchor}` : resolved,
        permanent: !!entry.permanent,
      });
      continue;
    }

    // The legacy path still names a live page here, only under the `/docs` prefix: upstream moved
    // the page and we did not. Serving our own copy beats following upstream's chain to a path
    // that exists only over there. Checked after MANUAL_DESTINATIONS so an override still wins.
    const self = resolveUrl(valid, `/docs${source}`);
    if (self) {
      redirects.push({ source, destination: self, permanent: !!entry.permanent });
      continue;
    }

    if (isMalformed(target)) {
      todo.push({ source, legacyDestination: target, reason: 'malformed-destination' });
      continue;
    }

    const candidates = candidateDestinations(target);
    const index = candidates.findIndex((candidate) => resolveUrl(valid, candidate));

    if (index === -1) {
      // No prefix rule resolved it. The page may still exist under a path SECTION_RENAMES does
      // not describe — the deep restructures moved pages individually, so no prefix rule can.
      // Fall back to the basename, and accept it only when exactly one page carries that slug:
      // two candidates means the generator would be picking, and a plausible-but-wrong redirect
      // is worse than none.
      const key = slugKey(target);
      const hits = bySlug.get(key) ?? [];
      if (hits.length !== 1) {
        todo.push({
          source,
          legacyDestination: target,
          reason: hits.length === 0 ? 'destination-not-in-tree' : 'ambiguous-slug',
          ...(hits.length > 1 ? { candidates: hits } : {}),
        });
        continue;
      }
      // The basename only identifies a page if it was unique upstream too.
      if (!upstreamSlugs || (upstreamSlugs.get(key) ?? 0) > 1) {
        todo.push({
          source,
          legacyDestination: target,
          reason: upstreamSlugs ? 'ambiguous-upstream-slug' : 'slug-fallback-unverifiable',
          ...(upstreamSlugs ? { wouldMatch: hits[0] } : {}),
        });
        continue;
      }
      slugMatched.push({ source, from: target, to: hits[0] });
      redirects.push({ source, destination: hits[0], permanent: !!entry.permanent });
      continue;
    }

    // Emit the tree's real casing, not the legacy corpus's.
    const destination = resolveUrl(valid, candidates[index]);
    if (index > 0) renamed.push({ source, from: target, to: destination });

    redirects.push({ source, destination, permanent: !!entry.permanent });
  }

  redirects.sort((a, b) => a.source.localeCompare(b.source));
  todo.sort((a, b) => a.source.localeCompare(b.source));
  return { redirects, todo, renamed, slugMatched, duplicates, validCount: valid.size };
}

function render(redirects) {
  const body = redirects
    .map(
      (r) =>
        `  {\n    source: '${r.source}',\n    destination: '${r.destination}',\n` +
        `    permanent: ${r.permanent},\n  },`,
    )
    .join('\n');
  return (
    `// GENERATED by scripts/generate-legacy-redirects.mjs — do not edit by hand.\n` +
    `// Regenerate with \`pnpm redirects:legacy\`.\n` +
    `//\n` +
    `// Legacy docs.arbitrum.io URLs (root-level) -> this site's /docs paths.\n` +
    `// Unportable entries are listed in redirects.legacy.todo.json.\n` +
    `/** @type {{ source: string, destination: string, permanent: boolean }[]} */\n` +
    `export const legacyRedirects = [\n${body}\n];\n`
  );
}

const args = process.argv.slice(2);
const sourceArg = args.indexOf('--source');
const sourcePath = sourceArg === -1 ? DEFAULT_SOURCE : resolve(args[sourceArg + 1]);

const { redirects, todo, renamed, slugMatched, duplicates, validCount } = build(sourcePath);

/** Write through Prettier so generated output never trips `pnpm format:check`. */
async function writeFormatted(filePath, contents) {
  const config = await resolveConfig(filePath);
  writeFileSync(filePath, await format(contents, { ...config, filepath: filePath }));
}

await writeFormatted(OUT_REDIRECTS, render(redirects));
await writeFormatted(OUT_TODO, JSON.stringify(todo, null, 2));

console.log(`source        : ${sourcePath}`);
console.log(`routable urls : ${validCount}`);
console.log(`emitted       : ${redirects.length}  -> redirects.legacy.mjs`);
console.log(`unported      : ${todo.length}  -> redirects.legacy.todo.json`);
console.log(`duplicates    : ${duplicates} (first occurrence kept)`);
console.log(`slug fallback : ${slugMatched.length} (basename matched exactly one page)`);
console.log(`\nvia section rename (${renamed.length}) — review these:`);
for (const r of renamed) console.log(`  ${r.source}\n    ${r.from} => ${r.to}`);
