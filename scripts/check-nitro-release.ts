/**
 * check-nitro-release: bump the pinned Nitro version in content/vars.json.
 *
 * Usage:
 *   pnpm nitro:check-release
 *
 * Reads the latest published Nitro release, and if it is newer than the pinned
 * `nitroVersionTag`, updates the release values in content/vars.json:
 *
 *   nitroVersionTag       the git tag, which also drives the precompile source links
 *   latestNitroNodeImage  the published node Docker image, read from Docker Hub
 *   goEthereumCommit      the go-ethereum submodule commit at nitroVersionTag
 *
 * The submodule pin is also repaired when Nitro is already current. All pins are resolved before
 * anything is written. It then rewrites the outgoing image tag in files that opt in with a
 * `sync-with-var: latestNitroNodeImage` marker (see scripts/lib/nitro-node-image.ts).
 *
 * Run `pnpm precompiles:generate` afterwards: the precompile tables embed `nitroVersionTag`.
 * `.github/workflows/upstream-refresh.yml` runs both in one job.
 */
import fs from 'node:fs';
import path from 'node:path';

import { runScript, setOutput, writeOrCheck } from './lib/generated-partial.ts';
import { syncImageInContent } from './lib/nitro-node-image.ts';

const VARS_PATH = path.join('content', 'vars.json');
const NITRO_REPO = 'OffchainLabs/nitro';

/** Narrows a parsed JSON value (vars.json, an API response) to an object whose fields can be read. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** A string field of a parsed JSON object, or `undefined` when it is absent or not a string. */
const stringField = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
};

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'fumadocs-docs-bot',
    'Accept': 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function githubJson(endpoint: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.github.com/repos/${NITRO_REPO}/${endpoint}`, {
    headers: githubHeaders(),
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${endpoint} failed with status ${response.status}`);
  }
  const body: unknown = await response.json();
  if (!isRecord(body)) throw new Error(`GitHub API ${endpoint} returned a non-object body`);
  return body;
}

/**
 * Compare `vX.Y.Z` tags numerically (`releases/latest` excludes prereleases). True only when
 * `candidate` is strictly newer, so a deleted release never triggers a downgrade.
 */
function isNewer(candidate: string, current: string): boolean {
  const parse = (tag: string): number[] | null => {
    const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(tag);
    return match ? match.slice(1, 4).map(Number) : null;
  };
  const [next, base] = [parse(candidate), parse(current)];
  if (!next || !base) throw new Error(`Cannot compare versions "${candidate}" and "${current}"`);

  for (let i = 0; i < 3; i++) {
    if (next[i] !== base[i]) return next[i] > base[i];
  }
  return false;
}

/**
 * The published node image for a release, read from Docker Hub. The image suffix is the commit
 * the release pipeline built, which need not be the tag's commit, so the registry is the only
 * authority. Matches `<tag>-<7 hex>` exactly, excluding the -arm64/-amd64/-slim/-validator/-dev/
 * -stripped variants of the same build.
 */
async function resolvePublishedNodeImage(tag: string): Promise<string> {
  const url = `https://hub.docker.com/v2/repositories/offchainlabs/nitro-node/tags?name=${tag}&page_size=100`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Docker Hub tag lookup failed with status ${response.status}`);
  }

  const body: unknown = await response.json();
  const results = isRecord(body) && Array.isArray(body.results) ? body.results : [];
  const exact = new RegExp(`^${tag.replace(/[.]/g, '\\.')}-[0-9a-f]{7}$`);
  const matches = results
    .filter(isRecord)
    .flatMap((result) => {
      const name = stringField(result, 'name');
      return name !== undefined && exact.test(name)
        ? [{ name, last_updated: result.last_updated }]
        : [];
    })
    .sort((a, b) => String(b.last_updated).localeCompare(String(a.last_updated)));

  if (matches.length === 0) {
    throw new Error(
      `No published offchainlabs/nitro-node image for ${tag}. The release may predate its ` +
        `image build; rerun once the image is pushed.`,
    );
  }
  if (matches.length > 1) {
    console.warn(`warning: ${matches.length} images match ${tag}; using the newest.`);
  }

  return `offchainlabs/nitro-node:${matches[0].name}`;
}

async function main(): Promise<void> {
  const vars: unknown = JSON.parse(fs.readFileSync(VARS_PATH, 'utf-8'));
  if (!isRecord(vars)) throw new Error(`${VARS_PATH} is not a JSON object`);
  // Every key is spread back into the rewritten file below, so only the ones read here are narrowed.
  const pinnedTag = stringField(vars, 'nitroVersionTag');
  const pinnedImage = stringField(vars, 'latestNitroNodeImage');
  if (pinnedTag === undefined || pinnedImage === undefined) {
    throw new Error(`${VARS_PATH} needs string nitroVersionTag and latestNitroNodeImage values`);
  }

  const release = await githubJson('releases/latest');
  const latest = stringField(release, 'tag_name');
  if (latest === undefined) throw new Error('GitHub API releases/latest returned no tag_name');
  const publishedAt = stringField(release, 'published_at');

  console.log(`pinned:  ${pinnedTag}`);
  console.log(`latest:  ${latest} (published ${publishedAt?.slice(0, 10) ?? 'unknown'})`);

  const bumpRelease = isNewer(latest, pinnedTag);
  const targetTag = bumpRelease ? latest : pinnedTag;
  const submodule = await githubJson(`contents/go-ethereum?ref=${encodeURIComponent(targetTag)}`);
  const submoduleSha = stringField(submodule, 'sha');
  if (
    submodule.type !== 'submodule' ||
    submodule.submodule_git_url !== 'https://github.com/OffchainLabs/go-ethereum.git' ||
    submoduleSha === undefined ||
    !/^[0-9a-f]{40}$/.test(submoduleSha)
  ) {
    throw new Error(`Invalid go-ethereum submodule at Nitro ${targetTag}`);
  }

  if (!bumpRelease && vars.goEthereumCommit === submoduleSha) {
    console.log('nitro and go-ethereum pins are up to date.');
    setOutput('updates_made', 'false');
    return;
  }

  const updated = {
    ...vars,
    nitroVersionTag: targetTag,
    latestNitroNodeImage: bumpRelease ? await resolvePublishedNodeImage(targetTag) : pinnedImage,
    goEthereumCommit: submoduleSha,
  };

  await writeOrCheck(VARS_PATH, JSON.stringify(updated, null, 2), { check: false });

  console.log(`updated nitroVersionTag      → ${updated.nitroVersionTag}`);
  console.log(`updated latestNitroNodeImage → ${updated.latestNitroNodeImage}`);
  console.log(`updated goEthereumCommit    → ${updated.goEthereumCommit}`);

  const synced = syncImageInContent(process.cwd(), pinnedImage, updated.latestNitroNodeImage);
  const total = synced.reduce((n, f) => n + f.count, 0);
  console.log(
    total === 0
      ? 'no hardcoded copies of the old image in content/'
      : `rewrote ${total} hardcoded copies of the old image across ${synced.length} file(s):`,
  );
  for (const f of synced) console.log(`  ${f.rel} (${f.count})`);

  console.log('Regenerate the precompile tables: pnpm precompiles:generate');

  setOutput('updates_made', 'true');
  setOutput('updated_version', targetTag);
}

runScript(main);
