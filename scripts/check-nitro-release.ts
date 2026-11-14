/**
 * check-nitro-release: report on the Nitro pins in content/vars.json, and bump them on request.
 *
 * Usage:
 *   pnpm nitro:check-release              # report only; writes nothing
 *   pnpm nitro:check-release --to v3.11.5 # bump to that published release
 *
 * Default mode is read-only. It prints the pinned and the latest published release, reports when
 * `goEthereumCommit` or `nitroContractsCommit` (the go-ethereum and contracts submodule commits at
 * the pinned `nitroVersionTag`) is stale or missing and sets the `stale_pins` step output, and
 * verifies every `nitroPathTo*` pin and every content link under
 * `github.com/OffchainLabs/<nitroRepositorySlug>/blob/<nitroVersionTag>/` against the GitHub
 * contents API at the pinned tag (see scripts/lib/nitro-upstream-paths.ts; `check-links` skips
 * external URLs). It also verifies the code paths the Nitro flow widget links
 * (components/widgets/NitroTxFlow/model.ts): `nitro` paths at the tag, `nitro-contracts` paths at
 * the resolved contracts commit. When a newer release exists it says so and sets the
 * `newer_release` step output, which the weekly workflow turns into an issue. It never writes:
 * which release the docs describe, and every pin under it, is a human decision, taken after
 * reading the release notes and updating the support policy page.
 *
 * `--to <tag>` is that decision and the only writer. It confirms the release is published, then
 * at that tag resolves the submodule commit, verifies the same pins and links, reads the node
 * image from Docker Hub, writes `nitroVersionTag`, `latestNitroNodeImage`, `goEthereumCommit` and
 * `nitroContractsCommit`,
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

import { codeRefs, transactionLifecycle } from '../components/widgets/NitroTxFlow/model.ts';
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
const CONTRACTS_REPO = 'OffchainLabs/nitro-contracts';
const MODEL_PATH = 'components/widgets/NitroTxFlow/model.ts';

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
async function githubJson(
  endpoint: string,
  notFound?: string,
  repo = NITRO_REPO,
): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, {
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

/** Whether `repo` has `repoPath` at `ref`. Only a 404 is absence; a rate-limit 403 must throw. */
async function upstreamPathExists(repo: string, repoPath: string, ref: string): Promise<boolean> {
  const endpoint = `contents/${repoPath}?ref=${encodeURIComponent(ref)}`;
  const response = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, {
    headers: githubHeaders(),
  });
  if (response.ok) return true;
  if (response.status === 404) return false;
  throw new Error(`GitHub API ${endpoint} failed with status ${response.status}`);
}

/** The Nitro flow widget's code refs for `repo`, each labelled with its first citing step. */
function modelPaths(repo: 'nitro' | 'nitro-contracts'): Array<{ path: string; label: string }> {
  return codeRefs(transactionLifecycle)
    .filter((ref) => ref.repo === repo)
    .map((ref) => {
      const step = transactionLifecycle.steps.find((s) =>
        [s.code, ...s.citations].some((r) => r?.repo === ref.repo && r.path === ref.path),
      );
      return { path: ref.path, label: `${ref.path} (${MODEL_PATH}, step ${step?.id})` };
    });
}

/**
 * Fail before anything is written when a `nitroPathTo*` pin, a content link into Nitro or a path
 * the Nitro flow widget links does not resolve at `targetTag` (Nitro) or `contractsCommit`
 * (nitro-contracts). Links are read at the target tag, not the pinned one, so a bump checks where
 * the docs are about to point.
 */
async function verifyUpstreamPaths(
  vars: Record<string, unknown>,
  targetTag: string,
  contractsCommit: string,
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

  const paths = [...pins, ...links, ...modelPaths('nitro')];
  const missing = await findMissingUpstreamPaths(paths, (p) =>
    upstreamPathExists(NITRO_REPO, p, targetTag),
  );
  const contractsPaths = modelPaths('nitro-contracts');
  const contractsMissing = await findMissingUpstreamPaths(contractsPaths, (p) =>
    upstreamPathExists(CONTRACTS_REPO, p, contractsCommit),
  );
  const failures = [
    ...(missing.length > 0
      ? [`Nitro ${targetTag} no longer has ${missing.length} path(s) the docs pin or link:`]
      : []),
    ...missing.map((label) => `  - ${label}`),
    ...(contractsMissing.length > 0
      ? [
          `nitro-contracts ${contractsCommit} no longer has ${contractsMissing.length} path(s) ` +
            `the docs link:`,
        ]
      : []),
    ...contractsMissing.map((label) => `  - ${label}`),
  ];
  if (failures.length > 0) throw new Error(failures.join('\n'));
  console.log(`verified ${new Set(paths.map((p) => p.path)).size} upstream paths at ${targetTag}`);
  console.log(
    `verified ${new Set(contractsPaths.map((p) => p.path)).size} nitro-contracts paths at ` +
      contractsCommit,
  );
}

/** The commit of the Nitro submodule `name` (cloned from `gitUrl`) at `tag`. */
async function submoduleCommitAt(tag: string, name: string, gitUrl: string): Promise<string> {
  const submodule = await githubJson(`contents/${name}?ref=${encodeURIComponent(tag)}`);
  const sha = stringField(submodule, 'sha');
  if (
    submodule.type !== 'submodule' ||
    submodule.submodule_git_url !== gitUrl ||
    sha === undefined ||
    !/^[0-9a-f]{40}$/.test(sha)
  ) {
    throw new Error(`Invalid ${name} submodule at Nitro ${tag}`);
  }
  return sha;
}

/** The submodule commits Nitro pins at one tag, as stored in vars.json. */
interface SubmoduleCommits {
  goEthereumCommit: string;
  nitroContractsCommit: string;
}

/** The names of the pins in `commits` that differ from `vars`. */
const stalePins = (vars: Record<string, unknown>, commits: SubmoduleCommits): string[] =>
  Object.entries(commits)
    .filter(([key, sha]) => vars[key] !== sha)
    .map(([key]) => key);

/**
 * Resolve the submodule commit at the target tag and verify every pin and link there. Default
 * mode then only reports: `updates_made=false`, plus `stale_pins=true` when `goEthereumCommit` or
 * `nitroContractsCommit` differs from the submodule commit at the pinned tag. `--to <tag>` is the
 * only writer.
 */
async function syncPins(
  vars: Record<string, unknown>,
  pinnedTag: string,
  target: string | undefined,
): Promise<void> {
  const tag = target ?? pinnedTag;
  const commits = {
    goEthereumCommit: await submoduleCommitAt(
      tag,
      'go-ethereum',
      'https://github.com/OffchainLabs/go-ethereum.git',
    ),
    nitroContractsCommit: await submoduleCommitAt(
      tag,
      'contracts',
      'https://github.com/OffchainLabs/nitro-contracts.git',
    ),
  };
  // Links point at the pinned contracts commit in default mode, at the resolved one on a bump.
  const linkedContractsCommit =
    target === undefined
      ? (stringField(vars, 'nitroContractsCommit') ?? commits.nitroContractsCommit)
      : commits.nitroContractsCommit;
  await verifyUpstreamPaths(vars, tag, linkedContractsCommit);

  if (target === undefined) {
    setOutput('updates_made', 'false');
    const stale = stalePins(vars, commits);
    if (stale.length === 0) {
      console.log('nitro, go-ethereum and nitro-contracts pins are up to date.');
      return;
    }
    console.log(
      `${stale.join(' and ')} ${stale.length > 1 ? 'are' : 'is'} stale for ${pinnedTag}: ` +
        `run pnpm nitro:check-release --to ${pinnedTag}`,
    );
    setOutput('stale_pins', 'true');
    return;
  }

  const changed = await writePins(vars, pinnedTag, target, commits);
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
  commits: SubmoduleCommits,
): Promise<boolean> {
  // Every key is spread back into the rewritten file below, so only the ones read here are narrowed.
  const pinnedImage = stringField(vars, 'latestNitroNodeImage');
  if (pinnedImage === undefined) {
    throw new Error(`${VARS_PATH} needs a string latestNitroNodeImage`);
  }
  const bump = tag !== pinnedTag;

  if (!bump && stalePins(vars, commits).length === 0) {
    console.log('nitro, go-ethereum and nitro-contracts pins are up to date.');
    return false;
  }

  const updated = {
    ...vars,
    nitroVersionTag: tag,
    latestNitroNodeImage: bump ? await resolvePublishedNodeImage(tag) : pinnedImage,
    ...commits,
  };
  await writeOrCheck(VARS_PATH, JSON.stringify(updated, null, 2), { check: false });

  console.log(`updated nitroVersionTag      → ${updated.nitroVersionTag}`);
  console.log(`updated latestNitroNodeImage → ${updated.latestNitroNodeImage}`);
  console.log(`updated goEthereumCommit    → ${updated.goEthereumCommit}`);
  console.log(`updated nitroContractsCommit → ${updated.nitroContractsCommit}`);

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
    // release tag, the shape `--to` accepts, and not whatever the API returned. A warning rather
    // than a failure: Nitro has published non-prerelease tags such as v3.6.0-rc.4, and the weekly
    // job's precompile refresh should still run when the latest tag has that shape.
    if (!RELEASE_TAG.test(releaseTag)) {
      console.warn(
        `::warning::GitHub API returned the release tag ${JSON.stringify(releaseTag)}, which is ` +
          `not vX.Y.Z; refusing to pass it on as newer_release`,
      );
      return;
    }
    setOutput('newer_release', releaseTag);
  }
}

runScript(main);
