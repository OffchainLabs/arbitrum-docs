/**
 * pinned-image — find Nitro node image tags in content that contradict `content/vars.json`.
 *
 * `<Var>` is a React component, so it renders nowhere a code fence reaches, and `remarkVarUrls`
 * only resolves `@@name@@` inside link destinations. Every `docker run offchainlabs/nitro-node:…`
 * in the docs is therefore a hardcoded literal with nothing binding it to the pinned value, and a
 * release bump has to rewrite each one by hand. On 2026-09-21 that half-succeeded: five pages had
 * been moved to v3.11.4 while thirteen still read v3.11.3, and no gate noticed the contradiction.
 *
 * This finds the literals that disagree with the pin. It is deliberately narrow — one image repo,
 * matched exactly — because the other `vars.json` values (`nitro`, `arbos`, `precompiles`) are
 * ordinary English words whose literal occurrences cannot be told apart from prose.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const IMAGE_REPO = 'offchainlabs/nitro-node';
const TAG_PATTERN = new RegExp(`${IMAGE_REPO.replace('/', '\\/')}:([A-Za-z0-9._-]+)`, 'g');

/**
 * Tags that are correct whatever the pin says.
 *
 * `latest` is a deliberate floating tag; `...` is an elision inside an abbreviated command.
 */
const TAG_ALLOWLIST = new Set(['latest', '...']);

/**
 * Directories whose pages describe a specific past release, where the pinned tag would be wrong.
 */
const HISTORICAL_DIRS = ['content/docs/run-a-node/arbos-releases/', 'content/docs/notices/'];

/**
 * Individual lines that name an older release on purpose. Keyed by file, valued with the reason,
 * so an entry has to be justified rather than silently added.
 */
const EXCEPTIONS = new Map([
  [
    'content/docs/launch-arbitrum-chain/operate/arbos-upgrade.mdx',
    'worked example: "if your upgrade targets ArbOS 51, you\'d use Nitro v3.9.6"',
  ],
]);

/** The image pinned in `content/vars.json`, split into its repo and tag. */
export function pinnedImage(repoRoot = process.cwd()) {
  const varsPath = path.join(repoRoot, 'content', 'vars.json');
  const image = JSON.parse(readFileSync(varsPath, 'utf8')).latestNitroNodeImage;
  if (typeof image !== 'string' || !image.startsWith(`${IMAGE_REPO}:`)) {
    throw new Error(
      `content/vars.json: latestNitroNodeImage should start with "${IMAGE_REPO}:", got ${image}`,
    );
  }
  return { image, tag: image.slice(IMAGE_REPO.length + 1) };
}

/** True when `rel` is a page whose image tags are pinned to a past release by design. */
export function isHistorical(rel) {
  return HISTORICAL_DIRS.some((dir) => rel.startsWith(dir)) || EXCEPTIONS.has(rel);
}

/**
 * Every image tag in `source` that contradicts `pinnedTag`.
 *
 * A `-validator` (or any other) suffix on the pinned tag is accepted: those are real published
 * variants of the same build, and they move with it.
 */
export function staleTags(source, pinnedTag, rel = '') {
  if (isHistorical(rel)) return [];
  const found = [];
  const lines = source.split('\n');
  for (const [index, line] of lines.entries()) {
    for (const match of line.matchAll(TAG_PATTERN)) {
      const tag = match[1];
      if (tag === pinnedTag || tag.startsWith(`${pinnedTag}-`)) continue;
      if (TAG_ALLOWLIST.has(tag)) continue;
      found.push({ line: index + 1, tag });
    }
  }
  return found;
}

export { EXCEPTIONS, HISTORICAL_DIRS, IMAGE_REPO, TAG_ALLOWLIST };
