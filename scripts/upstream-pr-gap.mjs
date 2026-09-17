/**
 * upstream-pr-gap — what has merged upstream since the port window that is not here yet.
 *
 * Usage:
 *   pnpm pr:gap                      # human report; exits 1 if anything is missing or stale
 *   pnpm pr:gap --json               # JSON to stdout; exits 0
 *   pnpm pr:gap --since 2026-08-17   # window start (default: 30 days ago)
 *   pnpm pr:gap --tree-a <path>      # override the legacy clone location
 *
 * `drift` answers "which legacy pages have no counterpart here" by diffing whole trees. That misses
 * the other half of the gap: a page can exist on both sides and still be months behind, because the
 * upstream edit landed after the snapshot. This script works from merged PRs instead, so it reports
 * both:
 *
 *   MISSING          a file the PR touched that resolves to no destination here
 *   STALE            a file that resolves to a destination whose text predates the PR
 *   DELETED-UPSTREAM a file the PR touched that upstream has since deleted, and we still carry
 *   NAV-GAP          a sidebars.js change with no matching meta.json entry
 *   REDIRECT-GAP     a vercel.json redirect added or removed upstream but not here
 *   UNBOUND          a legacy variable with no content/vars.json key
 *
 * DELETED-UPSTREAM is separated from MISSING because the two read identically from the content tree
 * and mean opposite things: one is work to port, the other is work already done here that upstream
 * has dropped. Collapsing them lets a deletion inflate the backlog — and lets an accidental upstream
 * revert look like a month of unported work.
 *
 * STALE is decided by searching the destination for distinctive prose the PR added, with markup
 * stripped first — the dialect transforms rewrite links, admonitions and variables, so a raw
 * substring match would report every file stale. A file whose added lines carry no prose at all
 * (pure code fences, frontmatter, table rules) is reported `unverifiable`, not clean: absence of a
 * probe is not evidence of sync.
 *
 * The last three exist because a doc change is not confined to `docs/`. A new page also edits
 * `sidebars.js`, often `vercel.json`, and sometimes `src/resources/globalVars.js` — none of which a
 * content-tree comparison can see, and each of which maps to a different file here. See
 * lib/config-surfaces.mjs.
 *
 * Reaches the network (`gh pr list`, `gh pr diff`). Not a CI gate — run it by hand before landing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import {
  CONFIG_SURFACES,
  changedLinesByFile,
  collectVarMarkers,
  isDroppedRedirect,
  normalizeRedirectSource,
  parseNavIds,
  parseRedirectEntries,
} from './lib/config-surfaces.mjs';
import { baselineVerdict, readBaseline } from './lib/git-freshness.mjs';
import { buildTreeIndex, mapSectionPath, resolveLegacyPath } from './lib/tree-compare.mjs';

const DEFAULT_REPO = 'OffchainLabs/arbitrum-docs';
const DEFAULT_TREE_A = '/Users/allup/OCL/arbitrum-docs';
const DEFAULT_WINDOW_DAYS = 30;
/** Shortest run of words specific enough that finding it proves the edit landed. */
const MIN_PROBE_LENGTH = 45;
/** Probes sampled per file. Enough to distinguish a whole-file miss from a partial port. */
const MAX_PROBES = 12;
const LEGACY_GLOSSARY_DIR = 'docs/partials/glossary/';

/**
 * Reduce one added diff line to its longest distinctive plain-text run.
 *
 * Markup is stripped rather than matched because the same sentence is spelled differently on each
 * side: `[text](/a/b.mdx)` here is `[text](/docs/a/b)` there, `:::note` is `<VanillaAdmonition>`,
 * `@@var@@` is `<Var name="var" />`. What survives both dialects is the prose between the markup.
 *
 * @param {string} line An added line, without its leading `+`.
 * @returns {string|null} The probe, or null when the line carries no prose worth searching for.
 */
export function proseProbe(line) {
  const clean = line
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_#|>{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    clean
      .split(/[.;:]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= MIN_PROBE_LENGTH)
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}

function listFiles(root, rel = '') {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const d of readdirSync(abs, { withFileTypes: true })) {
    const next = rel ? `${rel}/${d.name}` : d.name;
    if (d.isDirectory()) out.push(...listFiles(root, next));
    else out.push(next);
  }
  return out;
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

/**
 * The content a legacy file had immediately before it was deleted.
 *
 * Glossary terms resolve by their `key` frontmatter, which lives inside the file — so a deleted term
 * cannot be resolved from the working tree at all, and reports as a missing key rather than as a
 * deletion. Reading the last version before the delete recovers the key, which is what identifies
 * our counterpart.
 *
 * @returns {string|null} The file's content, or null when git cannot find a deletion for it.
 */
function lastContentBeforeDeletion(treeA, relPath) {
  try {
    const sha = execFileSync(
      'git',
      ['-C', treeA, 'log', '--diff-filter=D', '-1', '--format=%H', '--', relPath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    if (!sha) return null;
    return execFileSync('git', ['-C', treeA, 'show', `${sha}^:${relPath}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function mergedSince(repo, since) {
  const raw = gh([
    'pr',
    'list',
    '--repo',
    repo,
    '--state',
    'merged',
    '--limit',
    '200',
    '--json',
    'number,title,mergedAt,author,files',
  ]);
  return JSON.parse(raw)
    .filter((pr) => pr.mergedAt.slice(0, 10) >= since)
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      merged: pr.mergedAt.slice(0, 10),
      author: pr.author.login,
      files: pr.files.map((f) => f.path),
    }))
    .sort((a, b) => a.merged.localeCompare(b.merged) || a.number - b.number);
}

/**
 * Check one `sidebars.js` change against this repo's `meta.json` nav.
 *
 * A nav entry for a page that does not exist here needs no separate report — the page itself is
 * already MISSING, and porting it brings the nav slot with it. What only this surface can catch is
 * a page that exists here but never got its nav entry, or one upstream removed from the sidebar
 * while we still list it.
 */
function checkNav(pr, changed, destRoot, upstreamNav) {
  const rows = [];
  const { added, removed } = parseNavIds(changed);

  const navState = (id) => {
    const rel = mapSectionPath(`${id}.mdx`);
    const page = path.join(destRoot, 'content/docs', rel);
    if (!existsSync(page)) return { exists: false, inNav: false, rel };
    const meta = path.join(path.dirname(page), 'meta.json');
    const slug = path.basename(rel, '.mdx');
    const inNav =
      existsSync(meta) && new RegExp(`"(${slug}|\\.\\.\\.)"`).test(readFileSync(meta, 'utf8'));
    return { exists: true, inNav, rel };
  };

  for (const id of added) {
    const { exists, inNav, rel } = navState(id);
    if (!exists) continue;
    if (!inNav) {
      rows.push({
        pr: pr.number,
        file: 'sidebars.js',
        kind: 'nav',
        dest: `content/docs/${rel}`,
        reason: 'page is here but absent from its meta.json',
        verdict: 'NAV-GAP',
      });
    }
  }

  for (const id of removed) {
    // A PR diff records that an entry was dropped, not that it is still gone. A later PR can put it
    // back -- #3585 restored everything #3536's revert removed -- and then the diff-based finding is
    // permanently stale. Only report what is absent from the sidebar as it stands now.
    if (upstreamNav.includes(`'${id}'`) || upstreamNav.includes(`"${id}"`)) continue;
    const { exists, inNav, rel } = navState(id);
    if (exists && inNav) {
      rows.push({
        pr: pr.number,
        file: 'sidebars.js',
        kind: 'nav',
        dest: `content/docs/${rel}`,
        reason: 'dropped from the upstream sidebar but still in our meta.json',
        verdict: 'NAV-GAP',
      });
    }
  }

  return rows;
}

/** Check one `vercel.json` change against the generated legacy redirect map. */
function checkRedirects(pr, changed, ourSources) {
  const rows = [];
  const { added, removed } = parseRedirectEntries(changed);
  const row = (source, reason) => ({
    pr: pr.number,
    file: 'vercel.json',
    kind: 'redirect',
    dest: null,
    reason: `${reason}: ${normalizeRedirectSource(source)}`,
    verdict: 'REDIRECT-GAP',
  });
  const has = (s) => ourSources.has(normalizeRedirectSource(s));

  for (const e of added) {
    if (isDroppedRedirect(e.destination)) continue;
    if (!has(e.source)) rows.push(row(e.source, 'added upstream, absent here'));
  }

  for (const e of removed) {
    if (isDroppedRedirect(e.destination)) continue;
    if (has(e.source)) rows.push(row(e.source, 'removed upstream, still served here'));
  }

  return rows;
}

function classify(pr, ctx, treeA, destRoot) {
  const rows = [];
  let diff = null;
  const getDiff = () =>
    (diff ??= changedLinesByFile(gh(['pr', 'diff', String(pr.number), '--repo', ctx.repo])));

  for (const file of pr.files) {
    if (file === 'sidebars.js') {
      rows.push(
        ...checkNav(
          pr,
          getDiff().get(file) ?? { added: [], removed: [] },
          destRoot,
          ctx.upstreamNav,
        ),
      );
      continue;
    }
    if (file === 'vercel.json') {
      rows.push(
        ...checkRedirects(pr, getDiff().get(file) ?? { added: [], removed: [] }, ctx.ourRedirects),
      );
      continue;
    }
    // globalVars.js is not diffable against ours: T5 inlined the markers, so there is nothing to
    // compare per PR. The standing binding check in `main` covers it.
    if (file in CONFIG_SURFACES) continue;

    const absA = path.join(treeA, file);
    const gone = !existsSync(absA);
    const source = file.startsWith(LEGACY_GLOSSARY_DIR)
      ? ((gone ? lastContentBeforeDeletion(treeA, file) : readFileSync(absA, 'utf8')) ?? undefined)
      : undefined;
    const { dest, kind, reason } = resolveLegacyPath(file, { ...ctx, source });

    if (kind === 'drop') continue;

    // A file the PR touched and a later commit deleted is not a gap: there is nothing left to port.
    // It is the opposite question — whether our counterpart should go too — so it must never be
    // counted as MISSING, or a deletion upstream reads as unported work here.
    if (gone) {
      if (dest && ctx.destFiles.has(dest)) {
        rows.push({
          pr: pr.number,
          file,
          kind,
          dest,
          reason: 'deleted upstream; we still carry it',
          verdict: 'DELETED-UPSTREAM',
        });
      }
      continue;
    }

    if (!dest) {
      rows.push({ pr: pr.number, file, kind, dest: null, reason, verdict: 'MISSING' });
      continue;
    }

    const added = getDiff().get(file)?.added ?? [];
    const probes = added.map(proseProbe).filter(Boolean).slice(0, MAX_PROBES);
    const absB = path.join(destRoot, dest);

    if (!probes.length) {
      rows.push({
        pr: pr.number,
        file,
        kind,
        dest,
        reason,
        verdict: 'unverifiable',
        hits: 0,
        probes: 0,
      });
      continue;
    }

    const text = readFileSync(absB, 'utf8').replace(/\s+/g, ' ');
    const hits = probes.filter((p) => text.includes(p)).length;
    const verdict = hits === 0 ? 'STALE' : hits === probes.length ? 'current' : 'STALE';
    rows.push({ pr: pr.number, file, kind, dest, reason, verdict, hits, probes: probes.length });
  }

  return rows;
}

/**
 * Every variable the legacy tree interpolates that has no key in `content/vars.json`.
 *
 * `T5` kept the value half of `@@name=value@@` and dropped the name, so those pages now hold a bare
 * literal. Upstream corrects such a value once in `globalVars.js`; here the same correction is a
 * manual hunt, and nothing detects the staleness — `vars:check` only validates references that
 * exist, so a hardcoded wrong version passes every gate.
 */
function unboundVars(treeA, destRoot) {
  const docsRoot = path.join(treeA, 'docs');
  const used = new Map();

  for (const rel of listFiles(docsRoot)) {
    if (!/\.mdx?$/.test(rel)) continue;
    for (const name of collectVarMarkers(readFileSync(path.join(docsRoot, rel), 'utf8'))) {
      used.set(name, (used.get(name) ?? 0) + 1);
    }
  }

  const ours = JSON.parse(readFileSync(path.join(destRoot, 'content/vars.json'), 'utf8'));
  const unbound = [...used.entries()]
    .filter(([name]) => !(name in ours))
    .map(([name, files]) => ({ name, files }))
    .sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));

  return { used: used.size, bound: used.size - unbound.length, unbound };
}

function main() {
  const argv = process.argv.slice(2);
  const flag = (name, fallback) => {
    const i = argv.indexOf(name);
    return i !== -1 ? argv[i + 1] : fallback;
  };

  const json = argv.includes('--json');
  const treeA = flag('--tree-a', DEFAULT_TREE_A);
  const repo = flag('--repo', DEFAULT_REPO);
  const since = flag(
    '--since',
    new Date(Date.now() - DEFAULT_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10),
  );

  if (!existsSync(path.join(treeA, 'docs'))) {
    console.error(`upstream-pr-gap: legacy tree not found at ${treeA}. Pass --tree-a <path>.`);
    process.exitCode = 1;
    return;
  }

  const verdict = baselineVerdict(readBaseline(treeA));
  for (const w of verdict.warnings) console.error(`upstream-pr-gap: warning: ${treeA} ${w}`);
  if (!verdict.ok) {
    console.error(`upstream-pr-gap: refusing to run — ${treeA} is not a trustworthy baseline:`);
    for (const b of verdict.blockers) console.error(`  - ${b}`);
    console.error(`Fix: git -C ${treeA} pull`);
    console.error('A stale baseline under-reports the gap; it does not fail loudly on its own.');
    process.exitCode = 1;
    return;
  }

  const destRoot = process.cwd();
  const destFiles = [...listFiles(destRoot, 'content'), ...listFiles(destRoot, 'public')];
  const strip = (prefix) =>
    destFiles.filter((p) => p.startsWith(`${prefix}/`)).map((p) => p.slice(prefix.length + 1));

  const redirectSources = new Set();
  for (const file of ['redirects.legacy.mjs', 'redirects.config.mjs']) {
    const abs = path.join(destRoot, file);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf8');
    for (const m of text.matchAll(/\b(?:source|from):\s*'([^']*)'/g)) {
      redirectSources.add(normalizeRedirectSource(m[1]));
    }
  }

  const ctx = {
    repo,
    docsIndex: buildTreeIndex(strip('content/docs')),
    partialsIndex: buildTreeIndex(strip('content/partials')),
    destFiles: new Set(destFiles),
    ourRedirects: redirectSources,
    upstreamNav: existsSync(path.join(treeA, 'sidebars.js'))
      ? readFileSync(path.join(treeA, 'sidebars.js'), 'utf8')
      : '',
  };

  const prs = mergedSince(repo, since);
  const rows = prs.flatMap((pr) => classify(pr, ctx, treeA, destRoot));
  const vars = unboundVars(treeA, destRoot);

  const missing = rows.filter((r) => r.verdict === 'MISSING');
  const stale = rows.filter((r) => r.verdict === 'STALE');
  const unverifiable = rows.filter((r) => r.verdict === 'unverifiable');
  const config = rows.filter((r) => r.verdict === 'NAV-GAP' || r.verdict === 'REDIRECT-GAP');
  const deleted = rows.filter((r) => r.verdict === 'DELETED-UPSTREAM');

  if (json) {
    console.log(JSON.stringify({ since, repo, prs, rows, vars }, null, 2));
    return;
  }

  const uniq = (list) => [...new Set(list.map((r) => r.file))];
  console.log(
    `upstream-pr-gap: ${prs.length} PRs merged since ${since}; ` +
      `${uniq(missing).length} files missing, ${uniq(stale).length} stale, ` +
      `${uniq(unverifiable).length} unverifiable, ${uniq(deleted).length} deleted upstream, ` +
      `${config.length} config gap(s), ${vars.unbound.length} unbound variable(s)\n`,
  );

  for (const kind of ['doc', 'partial', 'glossary', 'asset']) {
    const group = missing.filter((r) => r.kind === kind);
    if (!group.length) continue;
    console.log(`  MISSING ${kind} (${uniq(group).length})`);
    for (const f of uniq(group).sort()) {
      const prsFor = group
        .filter((r) => r.file === f)
        .map((r) => `#${r.pr}`)
        .join(' ');
      console.log(`    ${f}  ${prsFor}`);
    }
    console.log('');
  }

  for (const pr of prs) {
    const group = stale.filter((r) => r.pr === pr.number);
    if (!group.length) continue;
    console.log(`  STALE  #${pr.number}  ${pr.merged}  ${pr.title}  (${group.length} files)`);
    for (const r of group.sort((a, b) => a.file.localeCompare(b.file))) {
      console.log(`    ${r.hits}/${r.probes} probes  ${r.file}  ->  ${r.dest}`);
    }
    console.log('');
  }

  if (deleted.length) {
    console.log(`  DELETED UPSTREAM (${uniq(deleted).length}) — we still carry these`);
    for (const f of uniq(deleted).sort()) {
      const r = deleted.find((x) => x.file === f);
      const prsFor = deleted
        .filter((x) => x.file === f)
        .map((x) => `#${x.pr}`)
        .join(' ');
      console.log(`    ${r.dest}  ${prsFor}`);
    }
    console.log('');
  }

  if (config.length) {
    console.log(`  CONFIG (${config.length})`);
    for (const r of config) {
      console.log(`    ${r.verdict}  #${r.pr}  ${r.dest ?? r.file}  ${r.reason}`);
    }
    console.log('');
  }

  if (vars.unbound.length) {
    console.log(
      `  UNBOUND VARIABLES  ${vars.bound}/${vars.used} legacy variables have a content/vars.json key`,
    );
    console.log('    T5 inlined the rest, so no gate can see their values go stale:');
    for (const v of vars.unbound) console.log(`    ${String(v.files).padStart(4)} uses  ${v.name}`);
    console.log('');
  }

  if (missing.length || stale.length || config.length || vars.unbound.length) process.exitCode = 1;
}

// Guarded so the test file can import the pure helpers without running the report.
if (process.argv[1]?.endsWith('upstream-pr-gap.mjs')) main();
