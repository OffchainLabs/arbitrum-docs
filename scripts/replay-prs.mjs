/**
 * replay-prs — open, here, the equivalent of an open pull request against the legacy Docusaurus repo.
 *
 * Usage:
 *   pnpm pr:replay --wave 1 --no-push     # classify, merge, run gates, commit locally; no PR
 *   pnpm pr:replay --pr 3536,3563         # named PRs, end to end (branch, push, draft PR)
 *   pnpm pr:replay --wave 3 --dry-run     # classify and merge only; no worktree, no gates
 *   pnpm pr:replay --wave 1 --json        # the full run as JSON on stdout
 *   pnpm pr:replay --wave 1 --draft       # force every PR to open as a draft, whatever the verdict
 *
 * What it does *not* do is rewrite the upstream diff and `git apply --3way` it. Upstream hunk
 * context lines are precisely the links, quicklook anchors and `:::note` blocks the migration
 * rewrote, so a patch rejects on fuzz for essentially every file. Instead both sides of the upstream
 * change go through the same six dialect transforms the migration used, and the merge is a plain
 * `git merge-file --diff3` against this repo's copy — see lib/pr-replay.mjs for why that cancels.
 *
 * Tier 3 PRs are declined outright: a clean merge onto a page that shares only a title with its
 * upstream counterpart is a false positive, and a plausible-looking wrong page is worse than none.
 *
 * Writes to `.pr-replay/<runId>/`. Reads `OffchainLabs/arbitrum-docs` and writes only to
 * `OffchainLabs/docs-migration-destination`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  GLOSSARY_JSON,
  addedGlossaryTerms,
  insertIntoPages,
  mapPrPath,
  navInsertFor,
  navRemoveFor,
  removeFromPages,
  stripOrderPrefixes,
} from './lib/pr-map.mjs';
import {
  classifyTier,
  collectNeedsHuman,
  countConflicts,
  divergence,
  renderPrBody,
  renderRunMarkdown,
  replayFile,
  summarizeDeclined,
  tally,
  toFumadocs,
  verdictFor,
} from './lib/pr-replay.mjs';
import {
  DOCS_ROOT,
  PARTIALS_ROOT,
  buildTreeIndex,
  resolveLegacyPath,
} from './lib/tree-compare.mjs';

const UPSTREAM_REPO = 'OffchainLabs/arbitrum-docs';
const UPSTREAM_URL = `https://github.com/${UPSTREAM_REPO}.git`;
const DEST_REPO = 'OffchainLabs/docs-migration-destination';
const UPSTREAM_MASTER = 'refs/upstream/master';
const BASE_REF = 'main';
const TOOL = 'scripts/replay-prs.mjs';

export const WAVES = {
  1: [2644, 3536, 3500, 3561, 3563],
  2: [3538, 3564, 3533, 3472],
  3: [3569, 3573],
};

/** Upstream PRs whose author is not an Offchain Labs employee: always draft, always labelled. */
const EXTERNAL_AUTHORS = new Set(['Rjected']);

const repoRoot = process.cwd();

/** Where worktrees and merge scratch files go. `--scratch` moves them off the repo volume. */
let scratch = path.join(repoRoot, '.pr-replay', '.scratch');

// ------------------------------------------------------------------------------------ git helpers

function git(args, { encoding = 'utf8', cwd = repoRoot, input, env } = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding,
    input,
    maxBuffer: 1 << 29,
    env: env ? { ...process.env, ...env } : process.env,
  });
}

function tryGit(args, opts) {
  try {
    return { ok: true, out: git(args, opts) };
  } catch (err) {
    return { ok: false, out: String(err.stdout ?? '') + String(err.stderr ?? '') };
  }
}

/** path -> {mode, oid} for every blob in a treeish. */
function treeIndex(treeish) {
  const map = new Map();
  for (const line of git(['ls-tree', '-r', '-z', treeish]).split('\0')) {
    if (!line) continue;
    const tab = line.indexOf('\t');
    const [mode, , oid] = line.slice(0, tab).split(/\s+/);
    map.set(line.slice(tab + 1), { mode, oid });
  }
  return map;
}

function blobText(oid) {
  return git(['cat-file', 'blob', oid]);
}

function blobBytes(oid) {
  return git(['cat-file', 'blob', oid], { encoding: 'buffer' });
}

/** Three-way merge driver over `git merge-file --diff3`; the exit code is the conflict count. */
function mergeThreeWay(tmpDir, labels) {
  return (ours, base, theirs) => {
    const files = ['ours', 'base', 'theirs'].map((n) => path.join(tmpDir, `merge-${n}`));
    writeFileSync(files[0], ours);
    writeFileSync(files[1], base);
    writeFileSync(files[2], theirs);
    const args = ['merge-file', '-p', '--diff3'];
    for (const l of labels) args.push('-L', l);
    args.push(...files);
    const r = tryGit(args);
    const text = r.out;
    return { text, conflicts: countConflicts(text) };
  };
}

// ------------------------------------------------------------------------------------ the map

function loadTreeMap() {
  const json = execFileSync('node', ['scripts/tree-map-report.mjs', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(json);
}

function destUrl(destPath) {
  const rel = destPath.slice(`${DOCS_ROOT}/`.length).replace(/\.mdx?$/i, '');
  const trimmed = rel === 'index' ? '' : rel.replace(/\/index$/, '');
  return trimmed ? `/docs/${trimmed}` : '/docs';
}

/** Legacy extension-less path -> destination URL, under both the literal and de-numbered spelling. */
function buildUrlIndex(pairs) {
  const index = new Map();
  const put = (key, url) => {
    if (!index.has(key)) index.set(key, url);
  };
  for (const [legacy, dest] of pairs) {
    if (!dest.startsWith(`${DOCS_ROOT}/`)) continue;
    const bare = legacy.replace(/\.mdx?$/i, '');
    const url = destUrl(dest);
    put(bare, url);
    put(stripOrderPrefixes(bare), url);
  }
  return index;
}

/**
 * Legacy asset path -> its served URL. Docusaurus kept audit PDFs inside `docs/`, so a page links to
 * one with a plain relative path; here they are static files under `public/`. Without this the link
 * is left alone (it is not a page) and `check-links` fails on the branch.
 */
function buildAssetUrlIndex(pairs) {
  const index = new Map();
  for (const [legacy, dest] of pairs) {
    if (!dest.startsWith('public/')) continue;
    index.set(legacy, `/${dest.slice('public/'.length)}`);
  }
  return index;
}

function makeResolveUrl(index) {
  return (key) => index.get(key) ?? index.get(stripOrderPrefixes(key)) ?? null;
}

/**
 * A URL index over the tree as it stood at the PR's merge base, not as it stands at master today.
 *
 * An old PR links to pages by the path they had when it was written, and upstream has since moved
 * several of them; the master-derived index has no entry under the old path, so `rewriteInternalLinks`
 * leaves the link alone and `check-links` fails on the branch. Resolving the merge-base tree through
 * the same `resolveLegacyPath` the migration used recovers those. It is a fallback: where master and
 * the merge base disagree about a path, master wins.
 */
function historicUrlIndex(baseTree, ctx) {
  const pairs = [];
  for (const rel of baseTree.keys()) {
    if (!rel.startsWith('docs/') || rel.includes('/partials/') || !/\.mdx?$/i.test(rel)) continue;
    const r = resolveLegacyPath(rel, ctx);
    if (r.dest?.startsWith(`${DOCS_ROOT}/`)) pairs.push([rel, r.dest]);
  }
  return buildUrlIndex(pairs);
}

// ------------------------------------------------------------------------------------ upstream

function ghJson(args) {
  return JSON.parse(
    execFileSync('gh', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 26 }),
  );
}

function fetchPrRefs(numbers) {
  const specs = numbers.map((n) => `+refs/pull/${n}/head:refs/upstream-pr/${n}`);
  specs.push(`+refs/heads/master:${UPSTREAM_MASTER}`);
  git(['fetch', '--no-tags', '--quiet', UPSTREAM_URL, ...specs]);
}

function prMeta(n) {
  const p = ghJson([
    'api',
    `repos/${UPSTREAM_REPO}/pulls/${n}`,
    '--jq',
    '{number,title,draft,body,user:.user.login,head:.head.sha}',
  ]);
  return p;
}

/** Deduped `Co-authored-by:` trailers from the upstream PR's commits. */
function coAuthors(n) {
  const rows = ghJson([
    'api',
    '--paginate',
    `repos/${UPSTREAM_REPO}/pulls/${n}/commits`,
    '--jq',
    '[.[].commit.author | {name, email}]',
  ]);
  const seen = new Map();
  for (const a of rows) {
    if (!a?.email || !a?.name) continue;
    const key = a.email.toLowerCase();
    if (!seen.has(key)) seen.set(key, `Co-authored-by: ${a.name} <${a.email}>`);
  }
  return [...seen.values()];
}

/** `git diff --name-status -M` between two commits, as structured entries. */
function upstreamDiff(mergeBase, head) {
  const out = git(['diff', '--name-status', '--find-renames', '-z', mergeBase, head]);
  const parts = out.split('\0').filter((s) => s !== '');
  const entries = [];
  for (let i = 0; i < parts.length;) {
    const code = parts[i++];
    if (code.startsWith('R') || code.startsWith('C')) {
      entries.push({ status: 'R', from: parts[i++], path: parts[i++] });
    } else {
      entries.push({ status: code[0], path: parts[i++] });
    }
  }
  return entries;
}

// ------------------------------------------------------------------------------------ one PR

function replayOne(n, env) {
  const meta = prMeta(n);
  const head = git(['rev-parse', `refs/upstream-pr/${n}`]).trim();
  const mergeBase = git(['merge-base', UPSTREAM_MASTER, `refs/upstream-pr/${n}`]).trim();
  const baseTree = treeIndex(mergeBase);
  const headTree = treeIndex(head);
  const entries = upstreamDiff(mergeBase, head);

  const outDir = path.join(env.runDir, `pr-${n}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, 'upstream.diff'),
    tryGit(['diff', '--find-renames', mergeBase, head]).out,
  );

  // -- classify every path, and register the PR's own new pages so intra-PR links resolve.
  const classified = [];
  for (const e of entries) {
    const legacy = e.path;
    const src =
      e.status === 'D'
        ? textOf(baseTree, legacy)
        : (textOf(headTree, legacy) ?? textOf(baseTree, legacy) ?? '');
    const m = mapPrPath({ legacy, status: e.status, source: src ?? '', ctx: env.ctx });
    if (e.status === 'R') {
      const fromMap = mapPrPath({
        legacy: e.from,
        status: 'D',
        source: textOf(baseTree, e.from) ?? '',
        ctx: env.ctx,
      });
      m.from = e.from;
      m.destFrom = fromMap.dest;
    }
    classified.push(m);
  }

  const localPairs = classified
    .filter((f) => f.role === 'content' && f.dest && f.kind === 'doc')
    .map((f) => [f.legacy, f.dest]);
  // Later entries win, so: merge-base fallback < today's master < pages this PR adds.
  const resolveUrl = makeResolveUrl(
    new Map([
      ...historicUrlIndex(baseTree, env.ctx),
      ...env.assetUrlIndex,
      ...env.urlIndex,
      ...buildUrlIndex(localPairs),
    ]),
  );
  const resolvePartial = (p) =>
    env.partialMap.get(p) ??
    classified.find((f) => f.legacy === p && f.kind === 'partial')?.dest ??
    null;

  const transform = (text, f, legacyPath) =>
    toFumadocs(text, {
      legacy: legacyPath,
      dest: f.dest,
      kind: f.kind === 'glossary' ? 'glossary' : f.kind === 'partial' ? 'partial' : 'doc',
      resolveUrl,
      resolvePartial,
      knownVars: env.knownVars,
    });

  const merge = mergeThreeWay(env.tmpDir, [
    `${DEST_REPO} (this repo)`,
    `arbitrum-docs merge base ${mergeBase.slice(0, 9)} (transformed)`,
    `arbitrum-docs #${n} ${head.slice(0, 9)} (transformed)`,
  ]);

  // -- replay each file.
  const files = [];
  const writes = [];
  const removals = [];
  const renames = [];
  for (const f of classified) {
    const entry = { ...f, divergence: undefined, conflicts: 0, status: f.status };

    if (f.role === 'content') {
      const legacyBase = f.from ?? f.legacy;
      const destPath = f.dest;
      const destFrom = f.destFrom ?? destPath;
      const baseRaw = textOf(baseTree, legacyBase);
      const headRaw = textOf(headTree, f.legacy);
      const destRaw = textOf(env.destTree, destFrom);

      const baseText = baseRaw === null ? null : transform(baseRaw, f, legacyBase);
      const headText = headRaw === null ? null : transform(headRaw, f, f.legacy);
      if (baseText !== null && destRaw !== null) entry.divergence = divergence(baseText, destRaw);

      const r = replayFile({ baseText, headText, destText: destRaw, merge });
      entry.status = f.status === 'R' && r.status !== 'absent' ? 'rename' : r.status;
      entry.conflicts = r.conflicts;
      entry.note = r.note;
      // A rename is handed to `pnpm move-doc`, which rewrites inbound links and records the redirect
      // — the two things a plain delete-and-write leaves broken. The merged text is therefore written
      // at the *old* path and moved afterwards, so move-doc's link rewrite is not overwritten by it.
      const isMove = f.status === 'R' && destFrom !== destPath && destRaw !== null;
      if (isMove) renames.push({ from: destFrom, to: destPath });
      if (r.text !== null && r.status !== 'identical') {
        writes.push({ path: isMove ? destFrom : destPath, text: r.text, finalPath: destPath });
      }
      if (r.status === 'delete') removals.push(destFrom);
      if (r.conflicts > 0) {
        writeFileSync(path.join(outDir, conflictName(destPath)), r.text);
      }
    } else if (f.role === 'asset') {
      const headBlob = headTree.get(f.legacy);
      if (!headBlob) {
        entry.status = 'delete';
        if (env.destTree.has(f.dest)) removals.push(f.dest);
      } else {
        const bytes = blobBytes(headBlob.oid);
        const current = env.destTree.get(f.dest);
        const same = current && blobBytes(current.oid).equals(bytes);
        entry.status = same ? 'identical' : current ? 'overwrite' : 'new';
        if (!same) writes.push({ path: f.dest, bytes });
      }
    }
    files.push(entry);
  }

  // -- glossary.json fan-out: added terms become candidates in the report, never files in the branch.
  let glossaryCandidates = [];
  if (classified.some((f) => f.legacy === GLOSSARY_JSON)) {
    const covered = new Set([...env.destTree.keys(), ...writes.map((w) => w.path)]);
    glossaryCandidates = addedGlossaryTerms(
      textOf(baseTree, GLOSSARY_JSON) ?? '',
      textOf(headTree, GLOSSARY_JSON) ?? '',
    ).filter((g) => !covered.has(g.dest));
    if (glossaryCandidates.length) {
      const dir = path.join(outDir, 'glossary-candidates');
      mkdirSync(dir, { recursive: true });
      for (const g of glossaryCandidates) {
        writeFileSync(
          path.join(dir, `${g.id}.mdx`),
          `---\nid: ${g.id}\ntitle: '${g.title.replace(/'/g, "''")}'\n---\n\n${g.text}\n`,
        );
      }
    }
  }

  // -- navigation: driven off the pages the PR adds, not off sidebars.js.
  // Pages this replay creates. A move is excluded: `move-doc` updates its meta.json entry itself.
  const navInserts = writes
    .filter((w) => typeof w.text === 'string' && w.finalPath === w.path)
    .filter((w) => w.path.startsWith(`${DOCS_ROOT}/`) && !env.destTree.has(w.path))
    .map((w) => navInsertFor(w.path, (dir) => readMeta(env.destTree, dir)));
  // `move-doc` updates the meta.json entry for a rename itself; only plain deletions need this.
  const navRemoves = removals
    .filter((rel) => rel.startsWith(`${DOCS_ROOT}/`))
    .map((rel) => navRemoveFor(rel, (dir) => readMeta(env.destTree, dir)));

  const { tier, reasons, maxDivergence } = classifyTier({ files, changedFiles: entries.length });
  const needsHuman = collectNeedsHuman({ files, navInserts, glossaryCandidates });
  const verdict = verdictFor({ tier, files, needsHuman });

  const result = {
    pr: n,
    title: meta.title,
    author: meta.user,
    upstreamDraft: meta.draft,
    head,
    mergeBase,
    tier,
    tierReasons: reasons,
    maxDivergence,
    verdict,
    files,
    navInserts,
    navRemoves,
    glossaryCandidates: glossaryCandidates.map((g) => ({ id: g.id, dest: g.dest })),
    conflicts: files
      .filter((f) => f.conflicts > 0)
      .map((f) => ({ dest: f.dest, conflicts: f.conflicts })),
    needsHuman,
    gates: [],
    branch: null,
    prUrl: null,
    summary: null,
  };

  if (tier === 3) {
    result.summary = summarizeDeclined(result);
    writeFileSync(path.join(outDir, 'DECLINED.md'), result.summary + '\n');
    return result;
  }
  if (env.dryRun) return result;

  // -- build the branch.
  const branch = `replay/upstream-${n}`;
  result.branch = branch;
  const wt = path.join(scratch, 'pr-replay', `wt-${n}`);
  rmSync(wt, { recursive: true, force: true });
  tryGit(['worktree', 'prune']);
  git(['worktree', 'add', '--quiet', '-B', branch, wt, BASE_REF]);
  try {
    linkNodeModules(wt);
    for (const w of writes) {
      const abs = path.join(wt, w.path);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, w.bytes ?? w.text);
    }
    for (const mv of renames) {
      const r = tryExec2('pnpm', ['move-doc', mv.from, mv.to], wt);
      if (!r.ok) {
        result.needsHuman.push({
          blocking: true,
          text: `\`pnpm move-doc ${mv.from} ${mv.to}\` failed — inbound links and the redirect are unhandled.`,
        });
      }
    }
    for (const rel of new Set(removals)) rmSync(path.join(wt, rel), { force: true });
    for (const nav of navRemoves) {
      if (nav.action !== 'remove') continue;
      const metaPath = path.join(wt, nav.dir, 'meta.json');
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      writeFileSync(metaPath, JSON.stringify(removeFromPages(meta, nav.slug), null, 2) + '\n');
    }
    for (const nav of navInserts) {
      if (nav.action !== 'insert') continue;
      const metaPath = path.join(wt, nav.dir, 'meta.json');
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      writeFileSync(metaPath, JSON.stringify(insertIntoPages(meta, nav.slug), null, 2) + '\n');
    }

    // CATALOG.md and manifest.json are generated from partial *usage*, so a page that includes a
    // partial changes them. Regenerating is a derived-artifact refresh, not content authoring —
    // without it `partials:check` fails on a stale catalog for a page the replay legitimately added.
    if (writes.some((w) => typeof w.text === 'string')) {
      tryExec2('pnpm', ['partials:catalog'], wt);
    }

    result.gates = runGates(wt, writes);
    const gateFailed = result.gates.some((g) => !g.ok);
    writeFileSync(
      path.join(outDir, 'gates.txt'),
      result.gates
        .map((g) => `=== ${g.name} — ${g.ok ? 'pass' : 'FAIL'} ===\n${g.output}`)
        .join('\n'),
    );

    git(['add', '-A'], { cwd: wt });
    const staged = git(['diff', '--cached', '--name-only'], { cwd: wt }).trim();
    if (!staged) {
      result.needsHuman.push({
        blocking: true,
        text: 'the replay produced no change against `main` — nothing to land.',
      });
    } else {
      // Both dates are pinned to the upstream head's commit date so an unchanged replay produces the
      // same SHA twice. Without this, re-running force-pushes a no-op commit that differs only in its
      // timestamp — which re-triggers CI and detaches every review comment anchored to the old SHA.
      const when = git(['show', '-s', '--format=%aI', head]).trim();
      git(['commit', '--quiet', '-m', commitMessage(n, meta, head)], {
        cwd: wt,
        env: { GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when },
      });
      result.commit = git(['rev-parse', 'HEAD'], { cwd: wt }).trim();
    }

    // Re-derive the verdict: move-doc failures and an empty diff are only known once the branch exists.
    result.verdict = verdictFor({ tier, files, needsHuman: result.needsHuman });
    const isExternal = EXTERNAL_AUTHORS.has(meta.user);
    result.draft =
      env.draftAll || meta.draft || result.verdict !== 'clean' || gateFailed || isExternal;
    result.labels = [
      'pr-replay',
      ...(gateFailed ? ['gate-failed'] : []),
      ...(isExternal ? ['external-contributor'] : []),
    ];
    result.body = renderPrBody(result, { tool: TOOL });
    writeFileSync(path.join(outDir, 'pr-body.md'), result.body);
    writeFileSync(
      path.join(outDir, 'merged-files.txt'),
      writes.map((w) => w.finalPath ?? w.path).join('\n') + '\n',
    );

    if (!env.noPush && staged) {
      // Push only when the *tree* differs from what the branch already carries. The commit SHA is
      // not a usable idempotency key: commits here are GPG-signed, and a signature carries a nonce,
      // so re-running produces a different SHA for byte-identical content. Force-pushing that no-op
      // re-triggers CI and detaches every review comment anchored to the old SHA.
      const remoteSha = remoteBranchSha(branch);
      if (remoteSha && sameTree(wt, remoteSha)) {
        result.pushed = false;
        result.commit = remoteSha;
      } else {
        git(['push', '--force-with-lease', 'origin', `${branch}:${branch}`], { cwd: wt });
        result.pushed = true;
      }
      result.prUrl = openOrUpdatePr(result, outDir);
    }
  } finally {
    tryGit(['worktree', 'remove', '--force', wt]);
  }
  return result;
}

/** The SHA the replay branch currently points at on `origin`, or null when it is not there. */
function remoteBranchSha(branch) {
  const r = tryGit(['ls-remote', 'origin', `refs/heads/${branch}`]);
  if (!r.ok) return null;
  const sha = r.out.split(/\s/)[0]?.trim();
  return sha && /^[0-9a-f]{40}$/.test(sha) ? sha : null;
}

/** True when the worktree's HEAD commit has the same tree as `sha`, fetching `sha` if need be. */
function sameTree(wt, sha) {
  if (!tryGit(['cat-file', '-e', `${sha}^{commit}`]).ok) {
    tryGit(['fetch', '--quiet', '--no-tags', 'origin', sha]);
  }
  const remote = tryGit(['rev-parse', `${sha}^{tree}`]);
  if (!remote.ok) return false;
  const local = git(['rev-parse', 'HEAD^{tree}'], { cwd: wt }).trim();
  return remote.out.trim() === local;
}

function conflictName(destPath) {
  return `conflicts--${destPath.replace(/[^\w.-]/g, '_')}.txt`;
}

function textOf(tree, rel) {
  const e = tree.get(rel);
  if (!e) return null;
  if (e.mode === '160000' || e.mode === '120000') return null;
  return blobText(e.oid);
}

function readMeta(tree, dir) {
  const text = textOf(tree, `${dir}/meta.json`);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function linkNodeModules(wt) {
  const target = path.join(repoRoot, 'node_modules');
  if (!existsSync(target)) return;
  const link = path.join(wt, 'node_modules');
  if (!existsSync(link)) symlinkSync(target, link, 'dir');
}

// ------------------------------------------------------------------------------------ gates

const ALWAYS_GATES = ['types:check', 'partials:check', 'nav:check', 'check-links'];

/** `vars:check` and `references:check` only matter when the replay wrote text that could break them. */
function gatesFor(writes) {
  const text = writes
    .filter((w) => typeof w.text === 'string')
    .map((w) => w.text)
    .join('\n');
  const gates = [...ALWAYS_GATES];
  if (/<Var\b/.test(text)) gates.push('vars:check');
  if (
    /<Term\b|<Reference\b|<ReferenceList\b/.test(text) ||
    writes.some((w) => w.path.startsWith('content/glossary/'))
  )
    gates.push('references:check');
  return gates;
}

function runGates(wt, writes) {
  const out = [];
  for (const name of gatesFor(writes)) {
    try {
      const output = execFileSync('pnpm', [name], {
        cwd: wt,
        encoding: 'utf8',
        maxBuffer: 1 << 26,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 600_000,
      });
      out.push({ name, ok: true, output });
    } catch (err) {
      out.push({ name, ok: false, output: String(err.stdout ?? '') + String(err.stderr ?? '') });
    }
  }
  return out;
}

// ------------------------------------------------------------------------------------ PR creation

function commitMessage(n, meta, head) {
  const trailers = [
    `Upstream-PR: https://github.com/${UPSTREAM_REPO}/pull/${n}`,
    `Upstream-SHA: ${head}`,
    `Replay-Tool: ${TOOL}`,
    ...coAuthors(n),
  ];
  return `replay: ${meta.title} (arbitrum-docs#${n})\n\n${trailers.join('\n')}\n`;
}

function ensureLabels(labels) {
  for (const l of labels) {
    tryExec('gh', ['label', 'create', l, '--repo', DEST_REPO, '--color', 'ededed', '--force']);
  }
}

function tryExec(cmd, args) {
  return tryExec2(cmd, args, repoRoot);
}

function tryExec2(cmd, args, cwd) {
  try {
    return {
      ok: true,
      out: execFileSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26 }),
    };
  } catch (err) {
    return { ok: false, out: String(err.stdout ?? '') + String(err.stderr ?? '') };
  }
}

/** Open the replay PR, or update the one a previous run already opened for this branch. */
function openOrUpdatePr(result, outDir) {
  const bodyFile = path.join(outDir, 'pr-body.md');
  ensureLabels(result.labels);
  const existing = JSON.parse(
    tryExec('gh', [
      'pr',
      'list',
      '--repo',
      DEST_REPO,
      '--head',
      result.branch,
      '--state',
      'all',
      '--json',
      'number,url,state',
    ]).out || '[]',
  ).filter((p) => p.state !== 'CLOSED');

  if (existing.length) {
    const num = String(existing[0].number);
    tryExec('gh', [
      'pr',
      'edit',
      num,
      '--repo',
      DEST_REPO,
      '--title',
      prTitle(result),
      '--body-file',
      bodyFile,
    ]);
    tryExec('gh', ['pr', 'edit', num, '--repo', DEST_REPO, '--add-label', result.labels.join(',')]);
    return existing[0].url;
  }

  const args = [
    'pr',
    'create',
    '--repo',
    DEST_REPO,
    '--base',
    BASE_REF,
    '--head',
    result.branch,
    '--title',
    prTitle(result),
    '--body-file',
    bodyFile,
  ];
  if (result.draft) args.push('--draft');
  const created = tryExec('gh', args);
  const url = (created.out.match(/https:\/\/\S+/) ?? [null])[0];
  if (url)
    tryExec('gh', ['pr', 'edit', url, '--repo', DEST_REPO, '--add-label', result.labels.join(',')]);
  return url ?? `create failed: ${created.out.trim()}`;
}

function prTitle(r) {
  return `replay: ${r.title} (arbitrum-docs#${r.pr})`;
}

// ------------------------------------------------------------------------------------ driver

function parseArgs(argv) {
  const flag = (name) => argv.includes(name);
  const value = (name) => {
    const i = argv.indexOf(name);
    return i === -1 ? null : argv[i + 1];
  };
  const prs = value('--pr');
  const wave = value('--wave');
  let numbers = [];
  if (prs)
    numbers = prs
      .split(',')
      .map((s) => Number(s.trim()))
      .filter(Boolean);
  else if (wave) numbers = WAVES[wave] ?? [];
  return {
    numbers,
    wave,
    json: flag('--json'),
    dryRun: flag('--dry-run'),
    draftAll: flag('--draft'),
    noPush: flag('--no-push') || flag('--dry-run'),
    runId: value('--run-id'),
    scratch: value('--scratch'),
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.numbers.length === 0) {
    console.error('replay-prs: pass --pr <n,...> or --wave <1|2|3>.');
    process.exitCode = 1;
    return;
  }

  if (opts.scratch) scratch = opts.scratch;
  const runId = opts.runId ?? new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(repoRoot, '.pr-replay', runId);
  mkdirSync(runDir, { recursive: true });
  const tmpDir = path.join(scratch, 'pr-replay', 'tmp');
  mkdirSync(tmpDir, { recursive: true });

  fetchPrRefs(opts.numbers);

  const map = loadTreeMap();
  const mapped = map.entries.filter((e) => e.dest);
  const destTree = treeIndex(BASE_REF);
  const destFiles = [...destTree.keys()];
  const strip = (prefix) =>
    destFiles.filter((p) => p.startsWith(`${prefix}/`)).map((p) => p.slice(prefix.length + 1));

  const env = {
    runDir,
    tmpDir,
    dryRun: opts.dryRun,
    noPush: opts.noPush,
    draftAll: opts.draftAll,
    destTree,
    ctx: {
      docsIndex: buildTreeIndex(strip(DOCS_ROOT)),
      partialsIndex: buildTreeIndex(strip(PARTIALS_ROOT)),
      destFiles: new Set(destFiles),
    },
    urlIndex: buildUrlIndex(mapped.map((e) => [e.legacy, e.dest])),
    assetUrlIndex: buildAssetUrlIndex(mapped.map((e) => [e.legacy, e.dest])),
    partialMap: new Map(mapped.filter((e) => e.kind === 'partial').map((e) => [e.legacy, e.dest])),
    knownVars: new Set(Object.keys(JSON.parse(blobText(destTree.get('content/vars.json').oid)))),
  };

  const results = [];
  for (const n of opts.numbers) {
    console.error(`replay-prs: #${n} …`);
    try {
      const r = replayOne(n, env);
      results.push(r);
      console.error(
        `  tier ${r.tier}  ${r.verdict}  ${r.files.length} file(s)  ` +
          `${r.gates.filter((g) => g.ok).length}/${r.gates.length} gate(s)` +
          (r.prUrl ? `  ${r.prUrl}` : ''),
      );
    } catch (err) {
      console.error(`  failed: ${err.message}`);
      results.push({
        pr: n,
        title: '(failed)',
        author: '?',
        tier: 0,
        tierReasons: [],
        maxDivergence: 0,
        verdict: 'failed',
        files: [],
        gates: [],
        needsHuman: [String(err.stack ?? err)],
        conflicts: [],
        branch: null,
        prUrl: null,
        summary: null,
        error: String(err.message),
      });
    }
  }

  const run = { runId, tool: TOOL, wave: opts.wave, results };
  writeFileSync(path.join(runDir, 'report.json'), JSON.stringify(run, null, 2));
  writeFileSync(path.join(runDir, 'report.md'), renderRunMarkdown(run));

  if (opts.json) console.log(JSON.stringify(run, null, 2));
  const counts = tally(results);
  console.error(
    `\nreplay-prs: ${counts.clean} clean, ${counts.partial} partial, ` +
      `${counts.declined} declined, ${counts.failed} failed  ->  ${path.relative(repoRoot, runDir)}`,
  );
  if (counts.failed) process.exitCode = 1;
}

main();
