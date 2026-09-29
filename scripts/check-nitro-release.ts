/**
 * check-nitro-release: report on the Nitro pins in content/vars.json, and bump them on request.
 *
 * Usage:
 *   pnpm nitro:check-release              # report only; writes nothing
 *   pnpm nitro:check-release --to v3.11.5 # bump to that published release
 *
 * Default mode is read-only. It prints the pinned and the latest published release, reports when
 * `goEthereumCommit` (the go-ethereum submodule commit at the pinned `nitroVersionTag`) is stale
 * or missing and sets the `stale_pins` step output, and verifies every `nitroPathTo*` pin and
 * every content link under `github.com/OffchainLabs/<nitroRepositorySlug>/blob/<nitroVersionTag>/`
 * against the GitHub contents API at the pinned tag (see scripts/lib/nitro-upstream-paths.ts;
 * `check-links` skips external URLs). When a newer release exists it says so and sets the
 * `newer_release` step output, which the weekly workflow turns into an issue. It never writes:
 * which release the docs describe, and every pin under it, is a human decision, taken after
 * reading the release notes and updating the support policy page.
 *
 * `--to <tag>` is that decision and the only writer. It confirms the release is published, then
 * at that tag resolves the submodule commit, verifies the same pins and links, reads the node
 * image from Docker Hub, writes `nitroVersionTag`, `latestNitroNodeImage` and `goEthereumCommit`,
 * and rewrites the outgoing image tag in files that opt in with a
 * `sync-with-var: latestNitroNodeImage` marker (see scripts/lib/nitro-node-image.ts). `--to` at
 * the pinned tag repairs a stale submodule pin and skips the Docker Hub lookup. Every pin is
 * resolved before anything is written. An older tag is accepted with a warning: a rollback is
 * also a decision.
 *
 * Run `pnpm precompiles:generate` and `pnpm cli:generate` after a bump: both embed
 * `nitroVersionTag`. `.github/workflows/nitro-bump.yml` runs all three in one job.
 */
import fs from 'node:fs';
import path from 'node:path';

import { runScript, setOutput, writeOrCheck } from './lib/generated-partial.ts';
import { syncImageInContent } from './lib/nitro-node-image.ts';
import {
  findMissingUpstreamPaths,
  nitroPathPins,
  nitroSourcePaths,
} from './lib/nitro-upstream-paths.ts';
import { toPosix, walk } from './lib/partials.ts';

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

/** A GitHub API response body. `notFound` replaces the generic message when the status is 404. */
async function githubJson(endpoint: string, notFound?: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.github.com/repos/${NITRO_REPO}/${endpoint}`, {
    headers: githubHeaders(),
  });
  if (response.status === 404 && notFound !== undefined) throw new Error(notFound);
  if (!response.ok) {
    throw new Error(`GitHub API ${endpoint} failed with status ${response.status}`);
  }
  const body: unknown = await response.json();
  if (!isRecord(body)) throw new Error(`GitHub API ${endpoint} returned a non-object body`);
  return body;
}

/** A Nitro release tag, exactly: `v` and three numbers, anchored at both ends. */
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;

/**
 * The `--to <tag>` argument, or `undefined` in default mode. Parsed before any request so a typo
 * fails at once. The tag shape is exact: `releases/tags/<tag>` looks it up verbatim.
 */
function targetFromArgs(argv: string[]): string | undefined {
  const index = argv.findIndex((arg) => arg === '--to' || arg.startsWith('--to='));
  if (index === -1) return undefined;
  const value = argv[index] === '--to' ? argv[index + 1] : argv[index].slice('--to='.length);
  if (value === undefined || !RELEASE_TAG.test(value)) {
    throw new Error(
      `--to needs a release tag like v3.11.5, got ${value === undefined ? 'nothing' : JSON.stringify(value)}`,
    );
  }
  return value;
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
  const exact = new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[0-9a-f]{7}$`);
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

/** Whether Nitro has `repoPath` at `ref`. Only a 404 is absence; a rate-limit 403 must throw. */
async function upstreamPathExists(repoPath: string, ref: string): Promise<boolean> {
  const endpoint = `contents/${repoPath}?ref=${encodeURIComponent(ref)}`;
  const response = await fetch(`https://api.github.com/repos/${NITRO_REPO}/${endpoint}`, {
    headers: githubHeaders(),
  });
  if (response.ok) return true;
  if (response.status === 404) return false;
  throw new Error(`GitHub API ${endpoint} failed with status ${response.status}`);
}

/**
 * Fail before anything is written when a `nitroPathTo*` pin or a content link into Nitro does not
 * resolve at `targetTag`. Links are read at the target tag, not the pinned one, so a bump checks
 * where the docs are about to point.
 */
async function verifyUpstreamPaths(
  vars: Record<string, unknown>,
  targetTag: string,
): Promise<void> {
  const pins = nitroPathPins(vars).map(({ key, path: pinned }) => ({
    path: pinned,
    label: `${key} = "${pinned}" (${toPosix(VARS_PATH)})`,
  }));
  const files = walk(path.join(process.cwd(), 'content'), (p) => /\.mdx?$/i.test(p)).map((abs) => ({
    rel: toPosix(path.relative(process.cwd(), abs)),
    source: fs.readFileSync(abs, 'utf8'),
  }));
  const links = nitroSourcePaths(files, { ...vars, nitroVersionTag: targetTag }).map(
    ({ path: linked, rel, line }) => ({ path: linked, label: `${linked} (${rel}:${line})` }),
  );

  const paths = [...pins, ...links];
  const missing = await findMissingUpstreamPaths(paths, (p) => upstreamPathExists(p, targetTag));
  if (missing.length > 0) {
    throw new Error(
      [
        `Nitro ${targetTag} no longer has ${missing.length} path(s) the docs pin or link:`,
        ...missing.map((label) => `  - ${label}`),
      ].join('\n'),
    );
  }
  console.log(`verified ${new Set(paths.map((p) => p.path)).size} upstream paths at ${targetTag}`);
}

/** The go-ethereum submodule commit Nitro pins at `tag`. */
async function submoduleCommitAt(tag: string): Promise<string> {
  const submodule = await githubJson(`contents/go-ethereum?ref=${encodeURIComponent(tag)}`);
  const sha = stringField(submodule, 'sha');
  if (
    submodule.type !== 'submodule' ||
    submodule.submodule_git_url !== 'https://github.com/OffchainLabs/go-ethereum.git' ||
    sha === undefined ||
    !/^[0-9a-f]{40}$/.test(sha)
  ) {
    throw new Error(`Invalid go-ethereum submodule at Nitro ${tag}`);
  }
  return sha;
}

/**
 * Resolve the submodule commit at the target tag and verify every pin and link there. Default
 * mode then only reports: `updates_made=false`, plus `stale_pins=true` when `goEthereumCommit`
 * differs from the submodule commit at the pinned tag. `--to <tag>` is the only writer.
 */
async function syncPins(
  vars: Record<string, unknown>,
  pinnedTag: string,
  target: string | undefined,
): Promise<void> {
  const tag = target ?? pinnedTag;
  const submoduleSha = await submoduleCommitAt(tag);
  await verifyUpstreamPaths(vars, tag);

  if (target === undefined) {
    setOutput('updates_made', 'false');
    if (vars.goEthereumCommit === submoduleSha) {
      console.log('nitro and go-ethereum pins are up to date.');
      return;
    }
    console.log(
      `goEthereumCommit is stale for ${pinnedTag}: run pnpm nitro:check-release --to ${pinnedTag}`,
    );
    setOutput('stale_pins', 'true');
    return;
  }

  const changed = await writePins(vars, pinnedTag, target, submoduleSha);
  setOutput('updates_made', String(changed));
  if (changed) setOutput('updated_version', target);
}

/**
 * Write vars.json and the opted-in image copies when anything differs at `tag`. The node image is
 * read only on a bump: at the pinned tag it is already right.
 */
async function writePins(
  vars: Record<string, unknown>,
  pinnedTag: string,
  tag: string,
  submoduleSha: string,
): Promise<boolean> {
  // Every key is spread back into the rewritten file below, so only the ones read here are narrowed.
  const pinnedImage = stringField(vars, 'latestNitroNodeImage');
  if (pinnedImage === undefined) {
    throw new Error(`${VARS_PATH} needs a string latestNitroNodeImage`);
  }
  const bump = tag !== pinnedTag;

  if (!bump && vars.goEthereumCommit === submoduleSha) {
    console.log('nitro and go-ethereum pins are up to date.');
    return false;
  }

  const updated = {
    ...vars,
    nitroVersionTag: tag,
    latestNitroNodeImage: bump ? await resolvePublishedNodeImage(tag) : pinnedImage,
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
  if (bump)
    console.log(
      'Regenerate the tables and the CLI page: pnpm precompiles:generate && pnpm cli:generate',
    );
  return true;
}

async function main(): Promise<void> {
  const target = targetFromArgs(process.argv.slice(2));
  const vars: unknown = JSON.parse(fs.readFileSync(VARS_PATH, 'utf-8'));
  if (!isRecord(vars)) throw new Error(`${VARS_PATH} is not a JSON object`);
  const pinnedTag = stringField(vars, 'nitroVersionTag');
  if (pinnedTag === undefined) throw new Error(`${VARS_PATH} needs a string nitroVersionTag`);
  console.log(`pinned:  ${pinnedTag}`);

  // The release the run is about: the target on a bump, else the latest, reported but not applied.
  const release = await githubJson(
    target === undefined ? 'releases/latest' : `releases/tags/${target}`,
    target === undefined ? undefined : `No published Nitro release ${target}`,
  );
  const releaseTag = stringField(release, 'tag_name');
  if (releaseTag === undefined) throw new Error('GitHub API release lookup returned no tag_name');
  const publishedAt = stringField(release, 'published_at')?.slice(0, 10) ?? 'unknown';
  console.log(
    `${target === undefined ? 'latest' : 'target'}:  ${releaseTag} (published ${publishedAt})`,
  );
  if (target !== undefined && isNewer(pinnedTag, target)) {
    console.warn(`warning: ${target} is older than the pinned ${pinnedTag}`);
  }

  await syncPins(vars, pinnedTag, target);

  if (target === undefined && isNewer(releaseTag, pinnedTag)) {
    console.log(
      `newer release available: ${releaseTag} (run: pnpm nitro:check-release --to ${releaseTag})`,
    );
    // The tag becomes a step output that later workflow steps read, so it must be exactly a
    // release tag, the shape `--to` accepts, and not whatever the API returned.
    if (!RELEASE_TAG.test(releaseTag)) {
      throw new Error(
        `GitHub API returned the release tag ${JSON.stringify(releaseTag)}, which is not vX.Y.Z; ` +
          `refusing to pass it on as newer_release`,
      );
    }
    setOutput('newer_release', releaseTag);
  }
}

runScript(main);
