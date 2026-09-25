/**
 * tree-compare — normalize the legacy Docusaurus tree onto this repo's layout.
 *
 * A raw path diff between the two trees is meaningless: the legacy tree carries Docusaurus numeric
 * ordering prefixes, and several sections were renamed during the migration. These helpers apply
 * those corrections so paths can be compared.
 */

/** Tree A section prefix -> Tree B section prefix. Longest match wins. */
export const SECTION_MAP = {
  'launch-arbitrum-chain/chain-config': 'launch-arbitrum-chain/configuration',
  'for-devs/third-party-docs': 'third-party-docs',
  'for-devs/oracles': 'oracles',
  'run-arbitrum-node': 'run-a-node',
  'stylus-by-example': 'stylus',
};

/**
 * Whole-file renames, Tree A relative path -> Tree B relative path.
 *
 * Pairing is otherwise done on the normalized slug, which cannot match a page whose filename changed
 * during the migration. Without these entries the renamed pages below are reported ABSENT (looks like
 * a missing page) instead of GUTTED (a present page that lost content) — the wrong verdict for the
 * wrong reason. Add an entry here whenever a port renames a file.
 */
export const RENAME_MAP = {
  'for-devs/contribute.mdx': 'contribute.mdx',
  'for-devs/oracles/oracles-content-map.mdx': 'oracles/index.mdx',
  'get-started/overview.mdx': 'get-started/index.mdx',
  'launch-arbitrum-chain/chain-config/batch-poster/config-batch-poster.mdx':
    'launch-arbitrum-chain/configuration/sequencer/batch-posting-assertion-control.mdx',
  'launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs.mdx':
    'launch-arbitrum-chain/configuration/data-availability/enable-post-4844-blobs.mdx',
  'launch-arbitrum-chain/chain-config/batch-poster/fee-tuning.mdx':
    'launch-arbitrum-chain/configuration/sequencer/batch-poster-fee-tuning.mdx',
  'launch-arbitrum-chain/chain-config/costs/aep-overview.mdx':
    'launch-arbitrum-chain/configuration/costs/aep-fee-router-introduction.mdx',
  'launch-arbitrum-chain/chain-config/costs/aep-router-contracts.mdx':
    'launch-arbitrum-chain/configuration/costs/set-up-aep-fee-router.mdx',
  'launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn.mdx':
    'launch-arbitrum-chain/configuration/costs/configure-native-mint-burn-gas-token.mdx',
  'launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust.mdx':
    'launch-arbitrum-chain/configuration/costs/use-a-custom-gas-token-anytrust.mdx',
  'launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup.mdx':
    'launch-arbitrum-chain/configuration/costs/use-a-custom-gas-token-rollup.mdx',
  'launch-arbitrum-chain/chain-config/costs/dynamic-pricing.mdx':
    'launch-arbitrum-chain/configuration/costs/dynamic-pricing-for-arbitrum-chains.mdx',
  'launch-arbitrum-chain/chain-config/data-availability/dac-get-started.mdx':
    'launch-arbitrum-chain/configuration/data-availability/data-availability-committees/get-started.mdx',
  'launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit.mdx':
    'launch-arbitrum-chain/configuration/core/config-smart-contract-size-limit.mdx',
  'launch-arbitrum-chain/chain-config/sequencer/chain-finality.mdx':
    'launch-arbitrum-chain/configuration/validation/arbitrum-chain-finality.mdx',
  'launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments.mdx':
    'launch-arbitrum-chain/configuration/sequencer/config-sequencer-timing-adjustments.mdx',
  'launch-arbitrum-chain/chain-config/sequencer/timeboost.mdx':
    'launch-arbitrum-chain/configuration/sequencer/timeboost-for-arbitrum-chains.mdx',
  // Upstream split batch-poster and assertion config across two pages; the port merged them.
  'launch-arbitrum-chain/chain-config/validation/assertion-control.mdx':
    'launch-arbitrum-chain/configuration/sequencer/batch-posting-assertion-control.mdx',
  'launch-arbitrum-chain/chain-config/validation/bold.mdx':
    'launch-arbitrum-chain/configuration/sequencer/bold-adoption-for-arbitrum-chains.mdx',
  'launch-arbitrum-chain/chain-config/validation/bond-and-validator.mdx':
    'launch-arbitrum-chain/configuration/validation/stake-and-validator-configurations.mdx',
  'launch-arbitrum-chain/chain-config/validation/challenge-period.mdx':
    'launch-arbitrum-chain/configuration/validation/customizable-challenge-period.mdx',
  'launch-arbitrum-chain/deploy/configure-node.mdx':
    'launch-arbitrum-chain/arbitrum-chain-sdk-preparing-node-config.mdx',
  'launch-arbitrum-chain/deploy/deploy-chain.mdx':
    'launch-arbitrum-chain/deploy/deploying-an-arbitrum-chain.mdx',
  'launch-arbitrum-chain/deploy/token-bridge.mdx':
    'launch-arbitrum-chain/deploy/deploying-token-bridge.mdx',
  'launch-arbitrum-chain/integrations/bridged-usdc.mdx':
    'launch-arbitrum-chain/integrations/bridged-usdc-standard.mdx',
  'launch-arbitrum-chain/integrations/infrastructure-providers.mdx':
    'launch-arbitrum-chain/third-party-integrations/third-party-providers.mdx',
  'launch-arbitrum-chain/migrate/between-raases.mdx':
    'launch-arbitrum-chain/migrate/migrate-between-raases.mdx',
  'launch-arbitrum-chain/migrate/from-another-stack.mdx':
    'launch-arbitrum-chain/migrate/migrate-from-another-stack.mdx',
  'launch-arbitrum-chain/operate/monitoring.mdx':
    'launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx',
  'launch-arbitrum-chain/operate/ownership-and-access.mdx':
    'launch-arbitrum-chain/operate/ownership-access-control.mdx',
  'launch-arbitrum-chain/operate/post-launch-deployments.mdx':
    'launch-arbitrum-chain/operate/post-launch-contract-deployments.mdx',
  'launch-arbitrum-chain/overview/faq.mdx':
    'launch-arbitrum-chain/troubleshooting-building-arbitrum-chain.mdx',
  'launch-arbitrum-chain/overview/introduction.mdx':
    'launch-arbitrum-chain/overview/a-gentle-introduction.mdx',
  'launch-arbitrum-chain/overview/license.mdx': 'launch-arbitrum-chain/overview/aep-license.mdx',
  'launch-arbitrum-chain/overview/public-preview.mdx':
    'launch-arbitrum-chain/overview/public-preview-expectations.mdx',
  'launch-arbitrum-chain/quickstart/l3-rollup-from-scratch.mdx':
    'launch-arbitrum-chain/quickstart/deploy-your-first-rollup.mdx',
  'launch-arbitrum-chain/quickstart/l3-rollup-testnet.mdx':
    'launch-arbitrum-chain/quickstart/run-testnet-infrastructure-first-rollup.mdx',
  'launch-arbitrum-chain/quickstart/sdk-introduction.mdx':
    'launch-arbitrum-chain/overview/arbitrum-chain-sdk-introduction.mdx',
  'learn-more/faq.mdx': 'get-started/faq.mdx',
  'node-running/faq.mdx': 'run-a-node/faq.mdx',
  // The three below were added to break map collisions: each used to pair on its bare slug with an
  // unrelated page that owns that slug (see COLLISION NOTES in buildMigrationMap's section below).
  'launch-arbitrum-chain/chain-config/costs/gas-optimization.mdx':
    'launch-arbitrum-chain/configuration/costs/gas-optimization-tools.mdx',
  'launch-arbitrum-chain/extend-the-protocol/arbos.mdx':
    'launch-arbitrum-chain/configuration/core/customize-arbos.mdx',
  'launch-arbitrum-chain/extend-the-protocol/da-api-guide.mdx':
    'launch-arbitrum-chain/integrations/da-api-integration-guide.mdx',
  'launch-arbitrum-chain/extend-the-protocol/precompiles.mdx':
    'launch-arbitrum-chain/configuration/core/customize-precompile.mdx',
  'launch-arbitrum-chain/extend-the-protocol/stf.mdx':
    'launch-arbitrum-chain/configuration/core/customize-stf.mdx',
};

/** Reduce a path to a comparable slug: basename, no extension, no ordering prefix, alphanumeric only. */
export function normalizeSlug(filePath) {
  const base = filePath.split('/').pop() ?? '';
  return base
    .replace(/\.mdx?$/, '')
    .replace(/^_/, '')
    .replace(/^\d+-/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Rewrite a Tree A relative path onto Tree B's layout. Explicit renames win over section prefixes. */
export function mapSectionPath(relPath) {
  if (Object.hasOwn(RENAME_MAP, relPath)) return RENAME_MAP[relPath];

  const keys = Object.keys(SECTION_MAP).sort((a, b) => b.length - a.length);
  for (const from of keys) {
    if (relPath === from || relPath.startsWith(`${from}/`)) {
      return `${SECTION_MAP[from]}${relPath.slice(from.length)}`;
    }
  }
  return relPath;
}

/**
 * Build a Tree B lookup index from its relative file paths (posix-separated).
 *
 * Keys on directory + normalized slug so pages that share a bare slug (`index`, `overview`, …) in
 * different directories can't clobber each other. A bare-slug index is also kept as a fallback for
 * genuine cross-directory moves that a directory-qualified key can't find — but only for slugs that
 * are unique across Tree B, so an ambiguous bare slug is never guessed at.
 */
export function buildTreeIndex(relPaths) {
  const byDirSlug = new Map();
  const bareSlugCounts = new Map();
  const bareSlug = new Map();

  for (const rel of relPaths) {
    const dir = rel.split('/').slice(0, -1).join('/');
    const slug = normalizeSlug(rel);
    byDirSlug.set(`${dir}\0${slug}`, rel);

    const count = (bareSlugCounts.get(slug) ?? 0) + 1;
    bareSlugCounts.set(slug, count);
    if (count === 1) bareSlug.set(slug, rel);
    else bareSlug.delete(slug);
  }

  return { byDirSlug, bareSlug };
}

/**
 * Resolve a Tree A relative path to its Tree B counterpart, or `null` if none is found.
 *
 * Maps the Tree A path onto Tree B's layout first (section renames + whole-file renames), then
 * matches on directory + slug. Falls back to an unambiguous bare-slug match so a page that moved to
 * an unmapped directory can still pair, without letting a bare-slug collision mispair anything.
 */
export function resolveTreeBMatch(index, relA) {
  return lookupIndex(index, mapSectionPath(relA));
}

/** Directory-qualified lookup with an unambiguous bare-slug fallback. Shared by every rule family. */
function lookupIndex(index, relPath) {
  const dir = relPath.split('/').slice(0, -1).join('/');
  const slug = normalizeSlug(relPath);
  return index.byDirSlug.get(`${dir}\0${slug}`) ?? index.bareSlug.get(slug) ?? null;
}

/** Count body lines, excluding a leading YAML frontmatter block. */
export function bodyLineCount(source) {
  const lines = source.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  if (lines[0]?.trim() !== '---') return lines.length;
  const end = lines.indexOf('---', 1);
  if (end === -1) return lines.length;
  return lines.length - end - 1;
}

/* ------------------------------------------------------------------------------------------------
 * Whole-tree migration map.
 *
 * `resolveTreeBMatch` only answers "did this page survive?", which is all upstream-drift needs. A
 * `git mv` reconstruction needs more: every legacy file, a target that is a real file here, and no
 * two sources landing on one target. The rules below cover the three trees that `docs/**` pairing
 * misses (glossary terms, partials, binary assets) and `buildMigrationMap` enforces injectivity.
 * ---------------------------------------------------------------------------------------------- */

export const DOCS_ROOT = 'content/docs';
export const GLOSSARY_ROOT = 'content/glossary';
export const PARTIALS_ROOT = 'content/partials';

const LEGACY_GLOSSARY_DIR = 'docs/partials/glossary/';

/** Legacy subtree prefix -> destination prefix, for files moved verbatim (flat tree to flat tree). */
export const ASSET_MAP = {
  'static/img/': 'public/img/',
  'docs/hosted-pdfs/audit-reports/': 'public/audit-reports/',
};

/**
 * Legacy files deliberately not carried over; the value is the reason, surfaced in the report.
 *
 * Distinct from RENAME_MAP on purpose. RENAME_MAP answers upstream-drift's question ("where did this
 * page's content end up?") and may legitimately point two legacy pages at one merged page. This map
 * answers the `git mv` question ("which legacy file *becomes* that page?"), which admits one answer.
 */
export const NOT_MIGRATED = {
  // Rendered by <ReferenceList collection="glossary" /> off content/glossary, so the hand-maintained
  // term list has no file to move to.
  'docs/partials/_glossary-partial.mdx': 'superseded by <ReferenceList collection="glossary" />',
  // Internal editorial guide, never published. upstream-drift skips it for the same reason.
  'docs/Offchain-pattern-guide.md': 'internal editorial guide, not published',
  // COLLISION NOTE: the port merged this 31-line stub into assertion-control's page. Of the two,
  // assertion-control.mdx shares 51/63 body lines with the merged page and this one 4/20, so
  // assertion-control.mdx is the move source and this one is content folded in.
  'docs/launch-arbitrum-chain/chain-config/batch-poster/config-batch-poster.mdx':
    'merged into chain-config/validation/assertion-control.mdx during the port',
};

/** Docusaurus-only scaffolding: navigation and build files with no counterpart in a Fumadocs tree. */
const SCAFFOLDING = [
  /(^|\/)_category_\.yml$/,
  /(^|\/)sidebar\.js$/,
  /(^|\/)\.nojekyll$/,
  /(^|\/)DONT-EDIT-THIS-FOLDER$/,
];

/**
 * Parse a leading `---` block into a flat key→value map. Mirrors migrate-glossary's parser rather
 * than pulling in a YAML dependency: the legacy glossary frontmatter is flat scalars only, and the
 * map has to reproduce exactly what that script keyed its output filenames on.
 */
export function parseLegacyFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return data;
}

/**
 * Glossary term -> reference collection entry, named by the legacy `key` frontmatter field.
 *
 * `key`, not the filename: migrate-glossary named its output by `key` because several legacy
 * filenames disagree with the key they declare, and the reference registry resolves on `id`.
 *
 * @param {string} relA legacy repo-relative path
 * @param {string} source the legacy file's text
 * @returns {string|null} repo-relative destination, or null when the file is not a glossary term
 */
export function glossaryTarget(relA, source) {
  if (!relA.startsWith(LEGACY_GLOSSARY_DIR)) return null;
  const key = parseLegacyFrontmatter(source).key;
  return key ? `${GLOSSARY_ROOT}/${key}.mdx` : null;
}

/**
 * The path a legacy partial would take under `content/partials/`, before checking it exists.
 *
 * Mirrors migrate-partials' `newPartialAbs`: drop every `partials/` segment, keep the grouping around
 * it. The section prefix goes through `mapSectionPath` first because that codemod ran on an already
 * restructured tree (`run-arbitrum-node/` had become `run-a-node/` by then).
 */
export function partialTargetPath(relA) {
  const fromDocs = relA.slice('docs/'.length);
  return mapSectionPath(fromDocs)
    .split('/')
    .filter((s) => s !== 'partials')
    .join('/');
}

/**
 * Legacy partial -> `content/partials/…`, resolved against an index of the partials actually here.
 *
 * The structural path is a hint, not an answer: the port also regrouped several partials (the
 * `run-full-node/` grouping was flattened, `precompile-tables/` was hoisted to the root), so the
 * bare-slug fallback in `lookupIndex` does the real work for those.
 *
 * @param {ReturnType<typeof buildTreeIndex>} index over paths relative to `content/partials/`
 */
export function resolvePartialTarget(index, relA) {
  const hit = lookupIndex(index, partialTargetPath(relA));
  return hit ? `${PARTIALS_ROOT}/${hit}` : null;
}

/** Legacy asset -> its `public/` counterpart by prefix swap, or null when no prefix applies. */
export function assetTarget(relA) {
  for (const [from, to] of Object.entries(ASSET_MAP)) {
    if (relA.startsWith(from)) return `${to}${relA.slice(from.length)}`;
  }
  return null;
}

/**
 * Resolve any legacy repo-relative path to its destination here.
 *
 * @param {string} relA legacy repo-relative path (`docs/…`, `static/img/…`)
 * @param {{docsIndex: object, partialsIndex: object, destFiles: Set<string>, source?: string}} ctx
 *   `source` is the legacy file's text; only glossary terms need it.
 * @returns {{dest: string|null, kind: 'doc'|'glossary'|'partial'|'asset'|'drop', reason: string}}
 */
export function resolveLegacyPath(relA, ctx) {
  if (Object.hasOwn(NOT_MIGRATED, relA)) {
    return { dest: null, kind: 'drop', reason: NOT_MIGRATED[relA] };
  }
  if (SCAFFOLDING.some((re) => re.test(relA))) {
    return { dest: null, kind: 'drop', reason: 'Docusaurus scaffolding' };
  }

  if (relA.startsWith(LEGACY_GLOSSARY_DIR)) {
    const dest = glossaryTarget(relA, ctx.source ?? '');
    if (!dest) return { dest: null, kind: 'glossary', reason: 'no `key` frontmatter' };
    if (!ctx.destFiles.has(dest)) {
      return { dest: null, kind: 'glossary', reason: `no term at ${dest}` };
    }
    return { dest, kind: 'glossary', reason: 'glossary `key` -> reference id' };
  }

  const asset = assetTarget(relA);
  if (asset) {
    if (!ctx.destFiles.has(asset)) return { dest: null, kind: 'asset', reason: 'not carried over' };
    return { dest: asset, kind: 'asset', reason: 'prefix swap' };
  }

  if (!relA.startsWith('docs/')) {
    return { dest: null, kind: 'drop', reason: 'outside the migrated trees' };
  }

  if (relA.includes('/partials/')) {
    const dest = resolvePartialTarget(ctx.partialsIndex, relA);
    return dest
      ? { dest, kind: 'partial', reason: 'partials registry' }
      : { dest: null, kind: 'partial', reason: `no partial matching ${partialTargetPath(relA)}` };
  }

  if (!/\.mdx?$/.test(relA)) return { dest: null, kind: 'drop', reason: 'not a page' };

  const relB = resolveTreeBMatch(ctx.docsIndex, relA.slice('docs/'.length));
  return relB
    ? { dest: `${DOCS_ROOT}/${relB}`, kind: 'doc', reason: 'section map + slug' }
    : { dest: null, kind: 'doc', reason: 'no page with this slug' };
}

/** Thrown when the map is not injective. Carries the full map so a caller can still report on it. */
export class TreeMapCollisionError extends Error {
  constructor(collisions, result) {
    const detail = collisions
      .map((c) => `  ${c.dest}\n${c.sources.map((s) => `    <- ${s}`).join('\n')}`)
      .join('\n');
    super(
      `tree-compare: ${collisions.length} destination(s) claimed by more than one legacy file:\n${detail}`,
    );
    this.name = 'TreeMapCollisionError';
    this.collisions = collisions;
    this.result = result;
  }
}

/**
 * Build the whole-tree map. Throws `TreeMapCollisionError` when two legacy files claim one
 * destination — a duplicate target would silently drop a file during a `git mv` reconstruction, so
 * this is a hard failure rather than a reported statistic.
 *
 * @param {{legacyFiles: string[], destFiles: string[], readSource: (rel: string) => string}} input
 *   `readSource` is called only for glossary terms.
 * @returns {{entries: Array, byDest: Map<string, string[]>, orphans: string[]}}
 */
export function buildMigrationMap({ legacyFiles, destFiles, readSource }) {
  const destSet = new Set(destFiles);
  const strip = (prefix) =>
    destFiles.filter((p) => p.startsWith(`${prefix}/`)).map((p) => p.slice(prefix.length + 1));
  const ctx = {
    docsIndex: buildTreeIndex(strip(DOCS_ROOT)),
    partialsIndex: buildTreeIndex(strip(PARTIALS_ROOT)),
    destFiles: destSet,
  };

  const entries = [];
  const byDest = new Map();
  for (const relA of legacyFiles) {
    const source = relA.startsWith(LEGACY_GLOSSARY_DIR) ? readSource(relA) : undefined;
    const result = resolveLegacyPath(relA, { ...ctx, source });
    entries.push({ legacy: relA, ...result });
    if (!result.dest) continue;
    if (!byDest.has(result.dest)) byDest.set(result.dest, []);
    byDest.get(result.dest).push(relA);
  }

  const claimed = new Set(byDest.keys());
  const orphans = destFiles.filter((p) => !claimed.has(p));
  const result = { entries, byDest, orphans };

  const collisions = [...byDest]
    .filter(([, sources]) => sources.length > 1)
    .map(([dest, sources]) => ({ dest, sources }));
  if (collisions.length) throw new TreeMapCollisionError(collisions, result);

  return result;
}
