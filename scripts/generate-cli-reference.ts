/**
 * generate-cli-reference: regenerate content/docs/run-a-node/nitro/cli-flags-reference.mdx.
 *
 * Usage:
 *   pnpm cli:generate                        # clone the pinned Nitro tag and write the page
 *   pnpm cli:generate --nitro-path ../nitro  # read an existing Nitro clone instead
 *   pnpm cli:generate --verbose              # also name every flag the exclusion rules dropped
 *   pnpm cli:check                           # exit 1 with a diff summary when the page is stale
 *
 * `--nitro-path` also reads from `NITRO_REPO_PATH`, so a shell that always has a Nitro clone
 * around can export it once; the flag wins when both are set.
 *
 * The flags come from the Nitro source at the tag pinned as `nitroVersionTag` in
 * content/vars.json, read straight from the Go that registers them. Two alternatives were
 * rejected:
 *
 * - Running `nitro --help`, which is what the flag list really is, needs a Go toolchain plus the
 *   Rust arbitrator artifacts. That is a heavy CI job for a documentation refresh, and it is the
 *   reason the workflow step added for this generator needs no toolchain at all.
 * - Committing a JSON dump of the flags, which is what arbitrum-docs does. Nothing regenerates
 *   that file, so it is only ever as fresh as the last person who remembered.
 *
 * `--nitro-path` still reads the tree at the pinned tag (via `git archive`), not the checkout's
 * working state, so a local run and a CI run see the same source.
 *
 * Ported from arbitrum-docs `scripts/generate-cli-reference.ts`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Options as PrettierOptions } from 'prettier';

import {
  customFlagTypes,
  defaultNamespaceLink,
  defaultOverrides,
  entryPoint,
  exclusions,
  introLinks,
  namespaceLinks,
} from './data/nitro-cli-reference.data.ts';
import type { ExclusionRule } from './data/nitro-cli-reference.data.ts';
import { renderGeneratedRegion, splicePage } from './lib/cli-reference-page.ts';
import {
  StaleFileError,
  type WriteOrCheckOptions,
  isCheckMode,
  runScript,
  writeOrCheck,
} from './lib/generated-partial.ts';
import { indexGoTree } from './lib/go-source.ts';
import { diffSummary } from './lib/line-diff.ts';
import { type CliFlag, extractFlags } from './lib/nitro-cli-flags.ts';

const OUTPUT_PATH = path.join('content', 'docs', 'run-a-node', 'nitro', 'cli-flags-reference.mdx');
const VARS_PATH = path.join('content', 'vars.json');
const NITRO_URL = 'https://github.com/OffchainLabs/nitro.git';

/** Go module paths of the two trees the flags live in. */
const NITRO_MODULE = 'github.com/offchainlabs/nitro';
const GETH_MODULE = 'github.com/ethereum/go-ethereum';

/** See MDX_FORMAT in generate-precompile-tables.ts: the generator owns this file's shape. */
const MDX_FORMAT: PrettierOptions = {
  parser: 'mdx',
  printWidth: 9999,
  proseWrap: 'preserve',
  plugins: [],
};

interface Args {
  check: boolean;
  nitroPath: string | null;
  verbose: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    check: isCheckMode(),
    nitroPath: process.env.NITRO_REPO_PATH ?? null,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1];
    if (argv[i] === '--nitro-path' && value) {
      args.nitroPath = value;
      i++;
    } else if (argv[i] === '--verbose') args.verbose = true;
  }
  return args;
}

function git(args: string[], cwd?: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
}

/** Extract `ref`'s tree from `repo` into `dest` without touching the repo's working state. */
function extractTree(repo: string, ref: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const archive = execFileSync('git', ['archive', ref], {
    cwd: repo,
    maxBuffer: 512 * 1024 * 1024,
  });
  execFileSync('tar', ['-x', '-C', dest], { input: archive, maxBuffer: 512 * 1024 * 1024 });
}

/**
 * Put the Nitro tree at `tag`, plus its pinned go-ethereum submodule, under `workDir`.
 *
 * go-ethereum is not optional: Nitro registers the whole `execution.rpc.*` namespace by calling
 * into go-ethereum's `arbitrum` package, so without the submodule those flags vanish from the
 * page with no error.
 */
function materializeNitro({
  tag,
  nitroPath,
  workDir,
}: {
  tag: string;
  nitroPath: string | null;
  workDir: string;
}): string {
  const treeDir = path.join(workDir, 'nitro');

  if (nitroPath) {
    const repo = path.resolve(nitroPath);
    try {
      git(['rev-parse', '--verify', `${tag}^{commit}`], repo);
    } catch {
      throw new Error(
        `${repo} has no tag ${tag}. Run \`git -C ${repo} fetch --tags\`, or drop ` +
          `--nitro-path to clone the tag instead.`,
      );
    }
    extractTree(repo, tag, treeDir);

    const gitlink = git(['ls-tree', tag, 'go-ethereum'], repo).trim();
    const sha = /^\d+\s+commit\s+([0-9a-f]{40})/.exec(gitlink)?.[1];
    if (!sha) throw new Error(`cannot read the go-ethereum submodule pin of ${tag} in ${repo}`);
    const gethRepo = path.join(repo, 'go-ethereum');
    try {
      git(['cat-file', '-e', `${sha}^{commit}`], gethRepo);
    } catch {
      throw new Error(
        `${gethRepo} does not have commit ${sha}, the go-ethereum pin of ${tag}. Run ` +
          `\`git -C ${gethRepo} fetch\`, or drop --nitro-path to clone the tag instead.`,
      );
    }
    extractTree(gethRepo, sha, path.join(treeDir, 'go-ethereum'));
  } else {
    console.log(`cloning ${NITRO_URL} at ${tag} (shallow)`);
    // Cloning a tag lands on a detached HEAD, and git's advice about it is several lines of
    // workflow guidance aimed at someone about to commit. Nothing here commits.
    const quiet = ['-c', 'advice.detachedHead=false'];
    git([...quiet, 'clone', '--depth', '1', '--branch', tag, '--quiet', NITRO_URL, treeDir]);
    git(['submodule', 'update', '--init', '--depth', '1', '--quiet', 'go-ethereum'], treeDir);
  }

  if (!fs.existsSync(path.join(treeDir, 'go-ethereum', 'arbitrum'))) {
    throw new Error(
      `the go-ethereum submodule is missing from the extracted ${tag} tree; the ` +
        `execution.rpc.* flags are registered there and would be silently dropped`,
    );
  }
  return treeDir;
}

/** The pinned Nitro tag, read off content/vars.json (whose Zod schema lives in content/vars.ts). */
function readNitroVersionTag(): string {
  const vars: unknown = JSON.parse(fs.readFileSync(VARS_PATH, 'utf-8'));
  const tag =
    typeof vars === 'object' && vars !== null && 'nitroVersionTag' in vars
      ? vars.nitroVersionTag
      : undefined;
  if (typeof tag !== 'string') {
    throw new Error(`${VARS_PATH} has no string nitroVersionTag`);
  }
  return tag;
}

async function main(): Promise<void> {
  const { check, nitroPath, verbose } = parseArgs(process.argv.slice(2));
  const tag = readNitroVersionTag();

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-cli-'));
  let content: string;
  try {
    const treeDir = materializeNitro({ tag, nitroPath, workDir });

    const { dirs, fileImports } = indexGoTree([
      { modulePath: NITRO_MODULE, dir: '', absDir: treeDir },
      {
        modulePath: GETH_MODULE,
        dir: 'go-ethereum',
        absDir: path.join(treeDir, 'go-ethereum'),
      },
    ]);

    const { flags, problems } = extractFlags({
      dirs,
      fileImports,
      entryPoint,
      customTypes: customFlagTypes,
      defaultOverrides,
    });
    if (problems.length > 0) {
      throw new Error(
        `generate-cli-reference: ${problems.length} flag(s) could not be read from Nitro ${tag}.\n` +
          problems.map((p) => `  - ${p}`).join('\n'),
      );
    }
    if (flags.length === 0) {
      throw new Error(
        `generate-cli-reference: no flags found in Nitro ${tag}; the walk entry ` +
          `point ${entryPoint.dir}.${entryPoint.func} has probably moved`,
      );
    }

    // Group the dropped flags by the first rule that matched, rather than filtering in one pass,
    // so the log can say *why* each one left. One rule matches on the flag's description
    // (`/experimental/i`), so a Nitro release that reworks a docstring can drop a flag off the
    // page with nothing in the diff to explain it, and a missing flag reads to a node operator as
    // "Nitro does not have this". First-match grouping keeps the per-rule counts summing to the
    // total, which a "matches any rule" grouping would not.
    const excludedBy = new Map<ExclusionRule, string[]>(exclusions.map((rule) => [rule, []]));
    const published: CliFlag[] = [];
    for (const flag of flags) {
      const rule = exclusions.find((candidate) => candidate.matches(flag));
      if (rule) excludedBy.get(rule)?.push(flag.flag);
      else published.push(flag);
    }

    const generated = renderGeneratedRegion(published, {
      introLinks,
      namespaceLinks,
      defaultNamespaceLink,
      nitroVersionTag: tag,
    });
    const existing = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf-8') : '';
    content = splicePage(existing, generated);

    console.log(
      `nitro ${tag}: ${flags.length} flag(s) read, ` +
        `${flags.length - published.length} excluded, ${published.length} published.`,
    );
    for (const rule of exclusions) {
      const names = excludedBy.get(rule) ?? [];
      console.log(`  ${String(names.length).padStart(3)} excluded -- ${rule.reason}`);
      if (verbose) for (const name of names) console.log(`        ${name}`);
    }
    if (!verbose && flags.length > published.length) {
      console.log('  (re-run with --verbose to name them)');
    }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  try {
    await writeOrCheck(OUTPUT_PATH, content, { check, overrides: MDX_FORMAT });
  } catch (error) {
    // "The page is stale" does not say whether a flag or a default moved or only whitespace did,
    // which is what a reviewer of the weekly upstream-refresh PR needs to know. `writeOrCheck`
    // hands back the text it formatted, so this prints the diff without formatting it again.
    // `formatted` is optional on the error's type but always set in check mode, the only mode
    // that throws it.
    if (error instanceof StaleFileError && error.formatted !== undefined) {
      const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf-8') : '';
      console.error(diffSummary(current, error.formatted));
    }
    throw error;
  }

  console.log(check ? 'cli flags reference: up to date.' : 'cli flags reference: written.');
}

runScript(main);
