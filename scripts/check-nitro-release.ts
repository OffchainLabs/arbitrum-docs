/**
 * check-nitro-release — bump the pinned Nitro version in content/vars.json.
 *
 * Usage:
 *   pnpm nitro:check-release
 *
 * Reads the latest published Nitro release, and if it is newer than the pinned
 * `nitroVersionTag`, updates the release values in content/vars.json:
 *
 *   nitroVersionTag       the git tag, which also drives the precompile source links
 *   latestNitroNodeImage  the published node Docker image, read from Docker Hub
 *   goEthereumCommit     the go-ethereum submodule commit at nitroVersionTag
 *
 * The submodule pin is also repaired when Nitro is already current, so a stale or missing
 * goEthereumCommit does not have to wait for another release. Resolve all pins before writing.
 *
 * It then rewrites hardcoded copies of the **outgoing** image tag, but only in the files that opt in
 * with a `sync-with-var: latestNitroNodeImage` marker. Those copies exist because `<Var>` does not
 * evaluate inside a code fence (content-lint rule A6), so a copy-pasteable `docker run` command has
 * to spell the tag out. See scripts/lib/nitro-node-image.ts for why matching the outgoing value is
 * not safe on its own: the ArbOS release notes pin the same string as a fact about the past.
 *
 * Callers must regenerate the precompile tables afterwards — their implementation links
 * embed `nitroVersionTag`, so a bump leaves them stale. `.github/workflows/upstream-refresh.yml`
 * runs `precompiles:generate` in the same job for exactly this reason.
 *
 * Slimmed from arbitrum-docs `scripts/check-releases.ts`, which also maintains a
 * dependencies.json ledger for four other repositories. Nothing in this repo reads those
 * entries — they exist upstream so a commit message can tell a human "a new SDK shipped".
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
 * Compare `vX.Y.Z` tags numerically. `releases/latest` already excludes prereleases, so a
 * three-part compare is enough and avoids taking on a semver dependency. Returns true when
 * `candidate` is strictly newer, so a deleted release can never trigger a downgrade.
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
 * The published node image for a release, read from Docker Hub.
 *
 * Deliberately NOT derived from the git tag's commit sha, which is what arbitrum-docs'
 * check-releases.ts does. That approach is unsound: `v3.11.3` is a lightweight tag on
 * commit 4130f4c, but the published image is `v3.11.3-beb2108`, and
 * `offchainlabs/nitro-node:v3.11.3-4130f4c` returns 404 on Docker Hub. The image tag tracks
 * whichever commit the release pipeline built, so the registry is the only authority.
 *
 * Matches `<tag>-<7 hex>` exactly, excluding the -arm64/-amd64/-slim/-validator/-dev/
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
        `image build — rerun once the image is pushed.`,
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
  // Every key is spread back into the rewritten file below, so only the ones read here are
  // narrowed. content/vars.ts requires both to be strings; a missing one fails here by name.
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

  // A `docker run` line a reader copies has to carry the image tag literally, because `<Var>` does
  // not evaluate inside a code fence (content-lint A6). Those copies would otherwise keep the old
  // tag while the prose beside them advertises the new one, with no gate to catch it. Only files
  // that opted in are rewritten; a page stating a Nitro version historically carries no marker.
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
