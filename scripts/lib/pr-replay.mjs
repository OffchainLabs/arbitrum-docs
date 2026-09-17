/**
 * pr-replay — transformed three-way merge, divergence measurement, tiering and report building.
 *
 * The core idea, and the reason this is not a patch rewriter: an upstream diff's *context* lines are
 * the links, quicklook anchors and `:::note` blocks the migration rewrote, so `git apply --3way`
 * rejects on fuzz for essentially every file. Instead both sides of the upstream change are pushed
 * through the same dialect transforms before the merge:
 *
 *   ours   = this repo's file, as it stands
 *   base   = toFumadocs(upstream file at the merge base)
 *   theirs = toFumadocs(upstream file at the PR head)
 *
 * base and theirs are now in the same dialect as ours, so the migration's rewrites cancel out of the
 * base↔ours delta and what is left is the PR's real change against this repo's real divergence.
 * Where the two overlap, `git merge-file --diff3` emits a conflict hunk. That is the point: a silent
 * overwrite of an edit made here is the one failure mode that would poison the real migration.
 */
import {
  admonitionsToComponents,
  inlineVars,
  partialImportsToIncludes,
  quicklooksToTerms,
  remapFrontmatter,
  rewriteInternalLinks,
} from './pr-dialect.mjs';

/** Divergence at or under this is a Tier 1 file: the port barely touched the page. */
export const TIER1_DIVERGENCE = 0.15;
/** Divergence over this means the two documents are not the same document any more. */
export const TIER3_DIVERGENCE = 0.6;
/** More changed files than this and the PR is a restructure, not an edit. */
export const TIER3_FILES = 25;
/** Tier 1 also requires a small PR. */
export const TIER1_FILES = 5;

/**
 * The six transforms, composed in the order `reconstruct-history` applies them.
 *
 * Kept in one place so the replay and the history reconstruction can never drift: if a PR's text is
 * transformed differently from the way the same text was transformed during the migration, the
 * base↔ours delta stops cancelling and every file conflicts.
 *
 * @param {string} text legacy MDX source
 * @param {object} ctx
 * @param {string} ctx.legacy legacy repo-relative path (transforms resolve relative paths from it)
 * @param {string} ctx.dest destination repo-relative path
 * @param {'doc'|'glossary'|'partial'} ctx.kind
 * @param {(key: string) => string|null} ctx.resolveUrl legacy page key -> destination URL
 * @param {(legacy: string) => string|null} ctx.resolvePartial legacy partial -> destination path
 * @param {Set<string>} ctx.knownVars names still carried by content/vars.json
 */
export function toFumadocs(text, { legacy, dest, kind, resolveUrl, resolvePartial, knownVars }) {
  let out = text;
  if (kind !== 'partial') out = remapFrontmatter(out, { kind });
  out = rewriteInternalLinks(out, { fromLegacyPath: legacy, resolveUrl });
  out = quicklooksToTerms(out, { unwrap: kind === 'partial' });
  out = admonitionsToComponents(out);
  out = partialImportsToIncludes(out, {
    fromLegacyPath: legacy,
    toDestPath: dest,
    resolvePartial,
  });
  return inlineVars(out, { knownVars });
}

/** Length of the longest common subsequence of two line arrays, in O(min(n,m)) memory. */
export function lcsLength(a, b) {
  if (a.length === 0 || b.length === 0) return 0;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let prev = new Int32Array(short.length + 1);
  let cur = new Int32Array(short.length + 1);
  for (const line of long) {
    for (let j = 1; j <= short.length; j++) {
      cur[j] = short[j - 1] === line ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  return prev[short.length];
}

/**
 * How far apart two texts are, on 0 (identical) to 1 (nothing in common).
 *
 * Line-based rather than character-based on purpose: the question tiering asks is "is this still the
 * same document?", and a reflowed paragraph should not read as a rewrite.
 */
export function divergence(aText, bText) {
  const a = splitLines(aText);
  const b = splitLines(bText);
  if (a.length === 0 && b.length === 0) return 0;
  const common = lcsLength(a, b);
  return 1 - common / Math.max(a.length, b.length);
}

function splitLines(text) {
  const lines = (text ?? '').split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/** Number of `<<<<<<<` conflict markers in merged output. */
export function countConflicts(text) {
  return (text.match(/^<{7} /gm) ?? []).length;
}

/**
 * Replay one file's upstream change onto this repo's copy.
 *
 * @param {object} input
 * @param {string|null} input.baseText transformed legacy text at the merge base, null when added
 * @param {string|null} input.headText transformed legacy text at the PR head, null when deleted
 * @param {string|null} input.destText this repo's current text, null when the page does not exist
 * @param {(ours: string, base: string, theirs: string) => {text: string, conflicts: number}}
 *   input.merge three-way merge driver; injected so the pure logic here stays testable
 * @returns {{status: string, text: string|null, conflicts: number, note: string}}
 *   status: identical | clean | conflict | new | delete | collision | absent
 */
export function replayFile({ baseText, headText, destText, merge }) {
  if (headText === null) {
    if (destText === null) {
      return { status: 'absent', text: null, conflicts: 0, note: 'deleted upstream, absent here' };
    }
    return { status: 'delete', text: null, conflicts: 0, note: 'deleted upstream' };
  }

  if (destText === null) {
    return { status: 'new', text: headText, conflicts: 0, note: 'new page' };
  }

  if (baseText === null) {
    // Upstream added a file whose destination already exists here — a restructure collision. Merging
    // against an empty base makes the whole file a conflict, which is the honest representation.
    const merged = merge(destText, '', headText);
    return {
      status: 'collision',
      text: merged.text,
      conflicts: merged.conflicts,
      note: 'added upstream but the destination already exists here',
    };
  }

  if (baseText === headText) {
    return { status: 'identical', text: destText, conflicts: 0, note: 'no upstream change' };
  }

  const merged = merge(destText, baseText, headText);
  if (merged.conflicts === 0) {
    return {
      status: merged.text === destText ? 'identical' : 'clean',
      text: merged.text,
      conflicts: 0,
      note: merged.text === destText ? 'change already present here' : 'merged cleanly',
    };
  }
  return { status: 'conflict', text: merged.text, conflicts: merged.conflicts, note: 'conflicted' };
}

/**
 * Tier a PR from its classified, measured files.
 *
 * Tier 3 declines. That is the whole point of the tier: a clean merge onto a page that shares only a
 * title with its upstream counterpart is a false positive, and a plausible-looking wrong page is
 * worse than no PR at all.
 *
 * @param {object} input
 * @param {Array} input.files entries carrying `role`, `divergence` and `status`
 * @param {number} input.changedFiles the upstream diff's file count
 * @returns {{tier: 1|2|3, reasons: string[], maxDivergence: number}}
 */
export function classifyTier({ files, changedFiles }) {
  const content = files.filter((f) => f.role === 'content');
  const measured = content.filter((f) => typeof f.divergence === 'number');
  const maxDivergence = measured.length ? Math.max(...measured.map((f) => f.divergence)) : 0;

  const reasons = [];
  if (changedFiles > TIER3_FILES) {
    reasons.push(`${changedFiles} changed files (> ${TIER3_FILES})`);
  }
  for (const f of measured) {
    if (f.divergence > TIER3_DIVERGENCE) {
      reasons.push(
        `${f.legacy} diverged ${pct(f.divergence)} from ${f.dest} (> ${pct(TIER3_DIVERGENCE)})`,
      );
    }
  }
  for (const f of files) {
    if (f.status === 'collision') reasons.push(`restructure collision at ${f.dest}`);
  }
  if (reasons.length) return { tier: 3, reasons, maxDivergence };

  const unmapped = files.filter((f) => f.role === 'unmapped');
  if (unmapped.length === 0 && changedFiles <= TIER1_FILES && maxDivergence <= TIER1_DIVERGENCE) {
    return { tier: 1, reasons: [], maxDivergence };
  }
  return { tier: 2, reasons: [], maxDivergence };
}

export function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * Overall verdict for a replayed PR.
 *
 * `clean` means the replay carried the whole upstream change across without losing anything and
 * without a conflict. It does *not* mean nothing needs looking at: a new page landing at a
 * synthesised destination is a successful replay that still wants a path sanity check, and saying
 * "clean" there is accurate about the merge. What blocks `clean` is loss — a conflict, a file with
 * no destination, or a change to site plumbing this tree does not have.
 */
export function verdictFor({ tier, files, needsHuman }) {
  if (tier === 3) return 'declined';
  const conflicts = files.reduce((n, f) => n + (f.conflicts ?? 0), 0);
  if (conflicts > 0) return 'partial';
  if (needsHuman.some((n) => n.blocking)) return 'partial';
  return 'clean';
}

/**
 * Items a human must look at before this PR can be trusted, each a one-line checkable claim.
 *
 * `blocking: true` marks something the replay could not carry over. `blocking: false` marks
 * something it did carry over but cannot verify — above all a synthesised destination path, which
 * is the one failure class no gate downstream catches.
 */
export function collectNeedsHuman({ files, navInserts, glossaryCandidates }) {
  const out = [];
  const add = (blocking, text) => out.push({ blocking, text });
  for (const f of files) {
    if (f.role === 'out-of-scope') {
      add(
        true,
        `\`${f.legacy}\` is site plumbing with no counterpart here — the change was not carried over.`,
      );
    } else if (f.role === 'unmapped') {
      add(
        true,
        `\`${f.legacy}\` has no destination in this tree (${f.reason}) — the change was dropped.`,
      );
    } else if (f.status === 'conflict' || f.status === 'collision') {
      add(true, `\`${f.dest}\` has ${f.conflicts} conflict hunk(s) to resolve.`);
    } else if (f.status === 'delete') {
      add(
        true,
        `\`${f.dest}\` was deleted upstream and is deleted here — a redirect is probably needed.`,
      );
    } else if (f.status === 'rename') {
      add(true, `\`${f.destFrom}\` was renamed to \`${f.dest}\` — a redirect is probably needed.`);
    } else if (f.role === 'nav') {
      add(
        false,
        `\`${f.legacy}\` changed upstream; navigation here lives in \`meta.json\` — confirm sidebar order.`,
      );
    } else if (f.synthetic && f.role === 'content') {
      add(
        false,
        `\`${f.dest}\` is a synthesised destination for a page upstream added — check the path and its section.`,
      );
    }
  }
  for (const n of navInserts) {
    if (n.action === 'insert')
      add(false, `\`${n.dir}/meta.json\` gained \`${n.slug}\` — check its position.`);
  }
  for (const g of glossaryCandidates) {
    add(
      false,
      `upstream added glossary term \`${g.id}\` — a \`${g.dest}\` candidate is in the report, not in this branch.`,
    );
  }
  return out;
}

/** The machine marker that makes a re-run idempotent: find the PR, update it rather than duplicate. */
export function replayMarker({ pr, sha, tool }) {
  return `<!-- pr-replay ${JSON.stringify({ pr, sha, tool })} -->`;
}

/** Render one replayed PR as the body of the pull request that carries it. */
export function renderPrBody(r, { tool }) {
  const L = [];
  L.push(replayMarker({ pr: r.pr, sha: r.head, tool }));
  L.push('');
  L.push(
    `Replay of [OffchainLabs/arbitrum-docs#${r.pr}](https://github.com/OffchainLabs/arbitrum-docs/pull/${r.pr}) — **${r.title}**, by @${r.author}.`,
  );
  L.push('');
  L.push(
    `Upstream head \`${r.head.slice(0, 12)}\`, merge base \`${r.mergeBase.slice(0, 12)}\`. ` +
      `Tier ${r.tier}, verdict **${r.verdict}**, max page divergence ${pct(r.maxDivergence)}.`,
  );
  L.push('');
  L.push('This branch was produced mechanically. Nothing in it was written by hand.');
  L.push('');

  L.push('## File mapping');
  L.push('');
  L.push('| upstream path | → | destination | role | status | divergence |');
  L.push('| --- | --- | --- | --- | --- | --- |');
  for (const f of r.files) {
    const dest = f.dest ? `\`${f.dest}\`` : '—';
    const div = typeof f.divergence === 'number' ? pct(f.divergence) : '—';
    L.push(
      `| \`${f.legacy}\` | ${f.status === 'rename' ? '⇢' : '→'} | ${dest} | ${f.role} | ${f.status} | ${div} |`,
    );
  }
  L.push('');

  L.push('## Transforms applied');
  L.push('');
  L.push(
    'Both sides of the upstream change were run through the six migration transforms before a',
  );
  L.push(
    '`--diff3` three-way merge, so the dialect shift cancels out and only the semantic change lands:',
  );
  L.push('');
  for (const t of TRANSFORM_LIST) L.push(`- ${t}`);
  L.push('');

  if (r.conflicts.length) {
    L.push('## Conflicts to resolve');
    L.push('');
    for (const c of r.conflicts) L.push(`- \`${c.dest}\` — ${c.conflicts} hunk(s)`);
    L.push('');
  }

  L.push('## Gates');
  L.push('');
  L.push('| gate | result |');
  L.push('| --- | --- |');
  for (const g of r.gates) L.push(`| \`${g.name}\` | ${g.ok ? 'pass' : '**fail**'} |`);
  L.push('');

  L.push('## Needs human review');
  L.push('');
  if (r.needsHuman.length === 0) L.push('- [x] nothing outstanding');
  else
    for (const n of r.needsHuman) L.push(`- [ ] ${n.blocking ? '**blocking** — ' : ''}${n.text}`);
  L.push('');
  return L.join('\n');
}

const TRANSFORM_LIST = [
  '`remapFrontmatter` — legacy frontmatter to the Zod contract in `source.config.ts`',
  '`rewriteInternalLinks` — `](/x/y.mdx)` to `](/docs/x/y)`',
  '`quicklooksToTerms` — `<a data-quicklook-from>` to `<Term>`',
  '`admonitionsToComponents` — `:::note` to `<VanillaAdmonition>`, `<details>` to `<Accordions>`',
  '`partialImportsToIncludes` — ESM partial imports to `<include>`',
  '`inlineVars` — `@@name=value@@` to `<Var name>` or the literal value',
];

/** Render the whole run as a human report. */
export function renderRunMarkdown(run) {
  const L = [];
  L.push(`# PR replay — run ${run.runId}`);
  L.push('');
  L.push(`Tool \`${run.tool}\`. ${run.results.length} upstream PR(s).`);
  L.push('');
  L.push('| PR | title | author | tier | verdict | files | max divergence | conflicts | gates |');
  L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of run.results) {
    const gates = r.gates.length ? `${r.gates.filter((g) => g.ok).length}/${r.gates.length}` : '—';
    const conf = r.files.reduce((n, f) => n + (f.conflicts ?? 0), 0);
    L.push(
      `| [#${r.pr}](https://github.com/OffchainLabs/arbitrum-docs/pull/${r.pr}) | ${r.title} | ${r.author} | ${r.tier} | ${r.verdict} | ${r.files.length} | ${pct(r.maxDivergence)} | ${conf} | ${gates} |`,
    );
  }
  L.push('');
  const counts = tally(run.results);
  L.push(
    `**${counts.clean} clean, ${counts.partial} partial, ${counts.declined} declined, ${counts.failed} failed.**`,
  );
  L.push('');

  for (const r of run.results) {
    L.push(`## #${r.pr} — ${r.title}`);
    L.push('');
    L.push(
      `Author @${r.author}. Tier ${r.tier}. Verdict **${r.verdict}**.${r.branch ? ` Branch \`${r.branch}\`.` : ''}`,
    );
    if (r.tierReasons.length) {
      L.push('');
      L.push('Declined because:');
      for (const reason of r.tierReasons) L.push(`- ${reason}`);
    }
    L.push('');
    L.push('| upstream path | destination | role | kind | status | divergence | reason |');
    L.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const f of r.files) {
      const div = typeof f.divergence === 'number' ? pct(f.divergence) : '—';
      L.push(
        `| \`${f.legacy}\` | ${f.dest ? `\`${f.dest}\`` : '—'} | ${f.role} | ${f.kind} | ${f.status} | ${div} | ${f.reason} |`,
      );
    }
    L.push('');
    if (r.summary) {
      L.push('**Semantic summary** (no PR was opened):');
      L.push('');
      L.push(r.summary);
      L.push('');
    }
    if (r.gates.length) {
      L.push('Gates:');
      L.push('');
      for (const g of r.gates) L.push(`- \`${g.name}\` — ${g.ok ? 'pass' : 'FAIL'}`);
      L.push('');
    }
    if (r.needsHuman.length) {
      L.push('Needs human review:');
      L.push('');
      for (const n of r.needsHuman) L.push(`- ${n.blocking ? '**blocking** — ' : ''}${n.text}`);
      L.push('');
    }
  }
  return L.join('\n');
}

export function tally(results) {
  const counts = { clean: 0, partial: 0, declined: 0, failed: 0 };
  for (const r of results) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
  return counts;
}

/**
 * A semantic summary of a declined PR: what it changed, in terms a human can act on, without any
 * claim about how it would land here.
 */
export function summarizeDeclined(r) {
  const L = [];
  const byRole = new Map();
  for (const f of r.files) byRole.set(f.role, (byRole.get(f.role) ?? 0) + 1);
  L.push(
    `Upstream #${r.pr} touches ${r.files.length} file(s): ` +
      [...byRole].map(([role, n]) => `${n} ${role}`).join(', ') +
      '.',
  );
  const heavy = r.files
    .filter((f) => typeof f.divergence === 'number' && f.divergence > TIER3_DIVERGENCE)
    .sort((a, b) => b.divergence - a.divergence);
  if (heavy.length) {
    L.push('');
    L.push('Pages whose local counterpart is no longer the same document:');
    for (const f of heavy) {
      L.push(`- \`${f.legacy}\` vs \`${f.dest}\` — ${pct(f.divergence)} divergent`);
    }
  }
  const collisions = r.files.filter((f) => f.status === 'collision');
  if (collisions.length) {
    L.push('');
    L.push('Destinations upstream adds that already exist here:');
    for (const f of collisions) L.push(`- \`${f.dest}\` (from \`${f.legacy}\`)`);
  }
  const adds = r.files.filter((f) => f.status === 'new');
  if (adds.length) {
    L.push('');
    L.push(
      `New pages upstream adds (${adds.length}): ` + adds.map((f) => `\`${f.dest}\``).join(', '),
    );
  }
  L.push('');
  L.push('Port these by hand against the current tree, or split the upstream PR.');
  return L.join('\n');
}
