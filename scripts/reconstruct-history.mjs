/**
 * reconstruct-history — rebuild this repo's history on top of the legacy arbitrum-docs history, so
 * `git blame` and `git log --follow` reach the original authors of every ported line.
 *
 * Usage:
 *   pnpm reconstruct                 # build refs/heads/reconstruct; human report on stderr
 *   pnpm reconstruct --json          # the commit SHAs as JSON on stdout
 *   pnpm reconstruct --branch <name> # write a different branch
 *   pnpm reconstruct --base <ref>    # rebuild against a ref other than `main`
 *   pnpm reconstruct --dry-run       # build every commit object but do not move any ref
 *
 * The working tree is never touched: every commit is assembled with plumbing against a temporary
 * index, and file content is read from and written to the object database directly. That matters —
 * round-tripping a blob through a checkout would run smudge/clean filters and CRLF conversion, and
 * the rename commit's whole value rests on the blob OIDs coming out bit-identical.
 *
 * The sequence, parented to `legacy/master`:
 *   S   the Next.js/Fumadocs scaffold from `main`, excluding everything under content/
 *   M   the migration map applied as pure renames — zero content change, every file R100
 *   D   removal of the Docusaurus scaffold the map does not carry over
 *   T1a frontmatter to the Fumadocs schema
 *   T1b author/sme recorded for every migrated page
 *   T2  internal links to /docs URLs
 *   T3  quicklook anchors to <Term>
 *   T4  admonitions and <details> to components
 *   T5  partial imports to <include>, inline @@vars@@
 *   E   the editorial delta: force the tree to equal `main` exactly
 *   G   .git-blame-ignore-revs listing T1a and T2–T5
 *
 * T1a and T2–T5 are mechanical by construction (see scripts/lib/pr-dialect.mjs) and are the commits
 * G tells blame to skip. Everything they cannot reproduce mechanically lands in E, which is *not*
 * skipped.
 *
 * T1b is split out of T1 and excluded from G for one reason: the Zod schema requires `author` and
 * `sme`, the legacy frontmatter has neither, so those values are invented. `--ignore-revs-file` does
 * not drop a commit's lines, it reassigns them to the previous commit that touched them — so listing
 * T1b would make `git blame` report a real arbitrum-docs author as the source of a claim about a
 * person that they never made. Reshaping form is safe to hide; asserting a fact is not.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  admonitionsToComponents,
  inlineVars,
  partialImportsToIncludes,
  quicklooksToTerms,
  remapFrontmatter,
  rewriteInternalLinks,
} from './lib/pr-dialect.mjs';

const LEGACY_REF = 'legacy/master';
const DEFAULT_BASE_REF = 'main';

/** The ref whose tree the rebuild must end up equalling; overridden by `--base`. */
let BASE_REF = DEFAULT_BASE_REF;
const SCAFFOLD_EXCLUDE = [/^content\//, /^public\/img\//, /^public\/audit-reports\//];

const MESSAGES = {
  S: 'build: Next.js 16 + Fumadocs scaffold',
  M: 'refactor: relocate Docusaurus tree to Fumadocs layout',
  D: 'chore: remove Docusaurus scaffold',
  T1a: 'refactor(content): frontmatter to Fumadocs schema',
  T1b: 'content: record author and sme for every migrated page',
  T2: 'refactor(content): rewrite internal links',
  T3: 'refactor(content): quicklook anchors to <Term>',
  T4: 'refactor(content): admonitions and details to components',
  T5: 'refactor(content): partial imports to <include>, inline @@vars@@',
  E: 'content: editorial delta from migration',
  G: 'chore: ignore mechanical transforms in blame',
};

const IGNORE_HEADER = [
  '# Mechanical dialect transforms from the Docusaurus -> Fumadocs migration.',
  '# Each rewrote form, never substance; blame should credit the line before them.',
  '#   git config blame.ignoreRevsFile .git-blame-ignore-revs',
  '',
];

// Only these are listed in `.git-blame-ignore-revs`. `T1b` is deliberately absent: it synthesises
// `author`/`sme`, which is a claim about a person, and an ignored commit hands its lines to the
// previous commit that touched them — crediting that claim to whoever last edited the frontmatter.
const TRANSFORM_NOTES = {
  T1a: 'frontmatter remapped to the Fumadocs Zod schema',
  T2: 'internal links rewritten to /docs URLs',
  T3: 'quicklook anchors converted to <Term>',
  T4: 'admonitions and <details> converted to components',
  T5: 'partial imports converted to <include>, @@vars@@ inlined',
};

// ---------------------------------------------------------------------------- git plumbing

const repoRoot = process.cwd();

function git(args, { input, encoding = 'utf8', env } = {}) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    input,
    encoding,
    maxBuffer: 1 << 29,
    env: env ? { ...process.env, ...env } : process.env,
  });
}

/** Every blob in a tree as `{ mode, oid, path }`, plus a path->entry index. */
function lsTree(treeish) {
  const entries = [];
  for (const line of git(['ls-tree', '-r', '-z', treeish]).split('\0')) {
    if (!line) continue;
    const tab = line.indexOf('\t');
    const [mode, , oid] = line.slice(0, tab).split(/\s+/);
    entries.push({ mode, oid, path: line.slice(tab + 1) });
  }
  return entries;
}

function indexOf(entries) {
  return new Map(entries.map((e) => [e.path, e]));
}

const NULL_OID = '0'.repeat(40);

/**
 * Build a tree from `base` plus the given `{ path, mode, oid }` additions and `paths` removals.
 * Removals are applied in their own pass so a file can be replaced by a directory of the same name.
 */
function buildTree(indexFile, base, { remove = [], add = [] }) {
  const env = { GIT_INDEX_FILE: indexFile };
  rmSync(indexFile, { force: true });
  git(['read-tree', base], { env });
  if (remove.length) {
    const input = remove.map((p) => `0 ${NULL_OID}\t${p}\n`).join('');
    git(['update-index', '--index-info'], { input, env });
  }
  if (add.length) {
    const input = add.map((e) => `${e.mode} ${e.oid}\t${e.path}\n`).join('');
    git(['update-index', '--index-info'], { input, env });
  }
  return git(['write-tree'], { env }).trim();
}

function commitTree(tree, parent, message) {
  return git(['commit-tree', tree, '-p', parent, '-m', message]).trim();
}

function readBlob(oid) {
  return git(['cat-file', 'blob', oid], { encoding: 'utf8' });
}

function writeBlob(text) {
  return git(['hash-object', '-w', '-t', 'blob', '--stdin'], { input: text }).trim();
}

// ---------------------------------------------------------------------------- the map

function loadMap() {
  const json = execFileSync('node', ['scripts/tree-map-report.mjs', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(json);
}

/** Destination URL for a migrated doc page: content/docs/a/b.mdx -> /docs/a/b, index -> the dir. */
function destUrl(destPath) {
  const rel = destPath.slice('content/docs/'.length).replace(/\.mdx?$/i, '');
  const trimmed = rel === 'index' ? '' : rel.replace(/\/index$/, '');
  return trimmed ? `/docs/${trimmed}` : '/docs';
}

/**
 * Index from an extension-less legacy path to its destination URL. Each page is registered under
 * both its literal path and the path with Docusaurus' `NN-` ordering prefixes stripped, because
 * legacy links use the two forms interchangeably.
 */
function buildUrlIndex(entries) {
  const index = new Map();
  const put = (key, url) => {
    if (!index.has(key)) index.set(key, url);
  };
  for (const e of entries) {
    if (!e.dest || !e.dest.startsWith('content/docs/')) continue;
    const bare = e.legacy.replace(/\.mdx?$/i, '');
    const url = destUrl(e.dest);
    put(bare, url);
    put(stripOrderPrefixes(bare), url);
  }
  return index;
}

function stripOrderPrefixes(p) {
  return p
    .split('/')
    .map((s) => s.replace(/^\d+-/, ''))
    .join('/');
}

/** Lookup used by rewriteInternalLinks: literal first, then the de-numbered form. */
function makeResolveUrl(index) {
  return (key) => index.get(key) ?? index.get(stripOrderPrefixes(key)) ?? null;
}

// ---------------------------------------------------------------------------- transforms

const TEXT_ROOTS = ['content/docs/', 'content/glossary/', 'content/partials/'];

function isMdx(p) {
  return /\.mdx?$/i.test(p) && TEXT_ROOTS.some((r) => p.startsWith(r));
}

function kindOf(destPath) {
  if (destPath.startsWith('content/glossary/')) return 'glossary';
  if (destPath.startsWith('content/partials/')) return 'partial';
  return 'doc';
}

/**
 * Apply `fn(text, ctx)` to every migrated MDX file in `tree`, returning the additions needed to
 * build the next tree. `ctx` carries the file's legacy and destination paths so a transform can
 * resolve paths relative to where the file used to live.
 */
function transformTree(tree, destToLegacy, fn) {
  const add = [];
  let changed = 0;
  for (const entry of lsTree(tree)) {
    if (!isMdx(entry.path)) continue;
    const legacy = destToLegacy.get(entry.path);
    if (!legacy) continue;
    const text = readBlob(entry.oid);
    const out = fn(text, { dest: entry.path, legacy, kind: kindOf(entry.path) });
    if (out === text) continue;
    add.push({ path: entry.path, mode: entry.mode, oid: writeBlob(out) });
    changed++;
  }
  return { add, changed };
}

// ---------------------------------------------------------------------------- driver

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const dryRun = argv.includes('--dry-run');
  const branch = argv.includes('--branch') ? argv[argv.indexOf('--branch') + 1] : 'reconstruct';
  BASE_REF = argv.includes('--base') ? argv[argv.indexOf('--base') + 1] : DEFAULT_BASE_REF;

  const map = loadMap();
  if (map.collisions.length) {
    console.error(`reconstruct: ${map.collisions.length} map collision(s) — refusing to run.`);
    process.exitCode = 1;
    return;
  }
  const mapped = map.entries.filter((e) => e.dest);
  const destToLegacy = new Map(mapped.map((e) => [e.dest, e.legacy]));
  const legacyToDest = new Map(mapped.map((e) => [e.legacy, e.dest]));
  const resolveUrl = makeResolveUrl(buildUrlIndex(map.entries));
  const knownVars = new Set(Object.keys(JSON.parse(readBlob(`${BASE_REF}:content/vars.json`))));

  const legacyTree = lsTree(LEGACY_REF);
  const legacyIndex = indexOf(legacyTree);
  const mainTree = lsTree(BASE_REF);
  const mainPaths = new Set(mainTree.map((e) => e.path));

  const tmp = mkdtempSync(path.join(tmpdir(), 'reconstruct-'));
  const indexFile = path.join(tmp, 'index');
  const shas = {};
  const stats = {};

  try {
    // -- S: the scaffold, on top of the untouched legacy tree.
    const scaffold = mainTree.filter((e) => !SCAFFOLD_EXCLUDE.some((re) => re.test(e.path)));
    const scaffoldPaths = new Set(scaffold.map((e) => e.path));
    const conflicts = new Set();
    for (const e of scaffold) {
      for (const prefix of prefixes(e.path)) if (legacyIndex.has(prefix)) conflicts.add(prefix);
    }
    for (const e of legacyTree) {
      for (const prefix of prefixes(e.path)) if (scaffoldPaths.has(prefix)) conflicts.add(e.path);
    }
    const sTree = buildTree(indexFile, LEGACY_REF, { remove: [...conflicts], add: scaffold });
    shas.S = commitTree(sTree, git(['rev-parse', LEGACY_REF]).trim(), MESSAGES.S);
    stats.S = { files: scaffold.length, pathConflictsRemoved: conflicts.size };

    // -- M: the map as pure renames. Mode and OID are carried over verbatim.
    const renames = [];
    const missing = [];
    for (const e of mapped) {
      const src = legacyIndex.get(e.legacy);
      if (!src) missing.push(e.legacy);
      else renames.push({ from: e.legacy, to: { path: e.dest, mode: src.mode, oid: src.oid } });
    }
    if (missing.length) {
      console.error(`reconstruct: ${missing.length} mapped path(s) absent from ${LEGACY_REF}:`);
      for (const p of missing.slice(0, 10)) console.error(`  ${p}`);
      process.exitCode = 1;
      return;
    }
    const mTree = buildTree(indexFile, sTree, {
      remove: renames.map((r) => r.from),
      add: renames.map((r) => r.to),
    });
    shas.M = commitTree(mTree, shas.S, MESSAGES.M);
    stats.M = { renames: renames.length };

    // -- D: drop everything the map left behind.
    const leftovers = lsTree(mTree)
      .map((e) => e.path)
      .filter((p) => !mainPaths.has(p));
    const dTree = buildTree(indexFile, mTree, { remove: leftovers });
    shas.D = commitTree(dTree, shas.M, MESSAGES.D);
    stats.D = { deleted: leftovers.length };

    // -- T1a..T5: the mechanical dialect shift.
    const steps = [
      [
        'T1a',
        (t, c) =>
          c.kind === 'partial'
            ? t
            : remapFrontmatter(t, { kind: c.kind, synthesizeAuthorship: false }),
      ],
      ['T1b', (t, c) => (c.kind === 'partial' ? t : remapFrontmatter(t, { kind: c.kind }))],
      ['T2', (t, c) => rewriteInternalLinks(t, { fromLegacyPath: c.legacy, resolveUrl })],
      ['T3', (t, c) => quicklooksToTerms(t, { unwrap: c.kind === 'partial' })],
      ['T4', (t) => admonitionsToComponents(t)],
      [
        'T5',
        (t, c) =>
          inlineVars(
            partialImportsToIncludes(t, {
              fromLegacyPath: c.legacy,
              toDestPath: c.dest,
              resolvePartial: (p) => legacyToDest.get(p) ?? null,
            }),
            { knownVars },
          ),
      ],
    ];
    let prevTree = dTree;
    let prevSha = shas.D;
    for (const [id, fn] of steps) {
      const { add, changed } = transformTree(prevTree, destToLegacy, fn);
      prevTree = buildTree(indexFile, prevTree, { add });
      prevSha = commitTree(prevTree, prevSha, MESSAGES[id]);
      shas[id] = prevSha;
      stats[id] = { filesChanged: changed };
    }

    // -- E: force the tree to `main` exactly. Anything T1a..T5 missed is absorbed here.
    const eTree = git(['rev-parse', `${BASE_REF}^{tree}`]).trim();
    shas.E = commitTree(eTree, prevSha, MESSAGES.E);

    // -- G: the blame ignore file. Last, because it names commits that must already exist.
    const ignoreText =
      IGNORE_HEADER.join('\n') +
      Object.keys(TRANSFORM_NOTES)
        .map((id) => `# ${id}  ${TRANSFORM_NOTES[id]}\n${shas[id]}\n`)
        .join('');
    const gTree = buildTree(indexFile, eTree, {
      add: [{ path: '.git-blame-ignore-revs', mode: '100644', oid: writeBlob(ignoreText) }],
    });
    shas.G = commitTree(gTree, shas.E, MESSAGES.G);

    if (!dryRun) {
      git(['update-ref', `refs/heads/${branch}`, shas.G]);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (json) {
    console.log(JSON.stringify({ branch, commits: shas, stats }, null, 2));
  } else {
    console.error(`reconstruct: ${dryRun ? 'built (dry run)' : `wrote refs/heads/${branch}`}`);
    for (const [id, sha] of Object.entries(shas)) {
      const s = stats[id] ? `  ${JSON.stringify(stats[id])}` : '';
      console.error(`  ${id.padEnd(3)} ${sha.slice(0, 12)}  ${MESSAGES[id]}${s}`);
    }
  }
}

/** Every proper directory prefix of a path, longest first. */
function prefixes(p) {
  const segs = p.split('/');
  const out = [];
  for (let i = segs.length - 1; i > 0; i--) out.push(segs.slice(0, i).join('/'));
  return out;
}

main();
