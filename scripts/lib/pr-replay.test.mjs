import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TIER3_DIVERGENCE,
  classifyTier,
  collectNeedsHuman,
  countConflicts,
  divergence,
  lcsLength,
  replayFile,
  summarizeDeclined,
  toFumadocs,
  verdictFor,
} from './pr-replay.mjs';

/** A merge driver that is deterministic and pure, so the engine can be tested without git. */
function fakeMerge(ours, base, theirs) {
  if (ours === base) return { text: theirs, conflicts: 0 };
  if (theirs === base) return { text: ours, conflicts: 0 };
  if (ours === theirs) return { text: ours, conflicts: 0 };
  return {
    text: `<<<<<<< ours\n${ours}||||||| base\n${base}=======\n${theirs}>>>>>>> theirs\n`,
    conflicts: 1,
  };
}

const NO_OP = {
  resolveUrl: () => null,
  resolvePartial: () => null,
  knownVars: new Set(),
};

test('toFumadocs composes the six transforms in the migration order', () => {
  const src = [
    '---',
    'title: A page',
    'id: a-page',
    'sidebar_position: 3',
    'content_type: gentle-introduction',
    '---',
    '',
    'See <a data-quicklook-from="arbos">ArbOS</a> and [gas](/build-decentralized-apps/gas.mdx).',
    '',
    ':::note Heads up',
    'Careful.',
    ':::',
    '',
    'Version @@nitroVersionTag=v3.2.1@@ and @@gone=literal@@.',
    '',
  ].join('\n');

  const out = toFumadocs(src, {
    legacy: 'docs/x/a-page.mdx',
    dest: 'content/docs/x/a-page.mdx',
    kind: 'doc',
    resolveUrl: (key) =>
      key === 'docs/build-decentralized-apps/gas' ? '/docs/essentials/gas' : null,
    resolvePartial: () => null,
    knownVars: new Set(['nitroVersionTag']),
  });

  assert.match(out, /content_type: 'concept'/);
  assert.doesNotMatch(out, /sidebar_position/);
  assert.match(out, /author: /);
  assert.match(out, /sme: /);
  assert.match(out, /<Term id="arbos">ArbOS<\/Term>/);
  assert.match(out, /\]\(\/docs\/essentials\/gas\)/);
  assert.match(out, /<VanillaAdmonition type="note" title="Heads up">/);
  assert.match(out, /<Var name="nitroVersionTag" \/>/);
  assert.match(out, /and literal\./);
});

test('toFumadocs leaves a partial frontmatter-free and unwraps quicklooks', () => {
  const src = 'Text with <a data-quicklook-from="arbos">ArbOS</a>.\n';
  const out = toFumadocs(src, {
    legacy: 'docs/partials/_x.mdx',
    dest: 'content/partials/_x.mdx',
    kind: 'partial',
    ...NO_OP,
  });
  assert.equal(out, 'Text with ArbOS.\n');
});

test('lcsLength is symmetric and exact on small inputs', () => {
  assert.equal(lcsLength(['a', 'b', 'c'], ['a', 'c']), 2);
  assert.equal(lcsLength(['a', 'c'], ['a', 'b', 'c']), 2);
  assert.equal(lcsLength([], ['a']), 0);
  assert.equal(lcsLength(['a', 'b'], ['b', 'a']), 1);
});

test('divergence is 0 for identical text and 1 for disjoint text', () => {
  assert.equal(divergence('a\nb\nc\n', 'a\nb\nc\n'), 0);
  assert.equal(divergence('a\nb\n', 'x\ny\n'), 1);
  assert.equal(divergence('', ''), 0);
});

test('divergence grows with the fraction of lines that differ', () => {
  const a = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
  const b = a
    .split('\n')
    .map((l, i) => (i < 2 ? 'changed' : l))
    .join('\n');
  const d = divergence(a, b);
  assert.ok(d > 0.15 && d < 0.35, `expected ~0.2, got ${d}`);
});

test('countConflicts counts only real merge markers', () => {
  assert.equal(countConflicts('<<<<<<< ours\na\n=======\nb\n>>>>>>> theirs\n'), 1);
  assert.equal(countConflicts('a line mentioning <<<<<<< inline\n'), 0);
  assert.equal(countConflicts('plain\n'), 0);
});

test('replayFile creates a page upstream added that does not exist here', () => {
  const r = replayFile({ baseText: null, headText: 'new\n', destText: null, merge: fakeMerge });
  assert.equal(r.status, 'new');
  assert.equal(r.text, 'new\n');
});

test('replayFile reports a collision when upstream adds a page that already exists here', () => {
  const r = replayFile({
    baseText: null,
    headText: 'theirs\n',
    destText: 'ours\n',
    merge: fakeMerge,
  });
  assert.equal(r.status, 'collision');
  assert.equal(r.conflicts, 1);
});

test('replayFile takes the upstream change when this repo has not diverged', () => {
  const r = replayFile({
    baseText: 'a\nb\n',
    headText: 'a\nB\n',
    destText: 'a\nb\n',
    merge: fakeMerge,
  });
  assert.equal(r.status, 'clean');
  assert.equal(r.text, 'a\nB\n');
});

test('replayFile conflicts rather than clobbering a local edit to the same place', () => {
  const r = replayFile({
    baseText: 'a\nb\n',
    headText: 'a\nB\n',
    destText: 'a\nlocal\n',
    merge: fakeMerge,
  });
  assert.equal(r.status, 'conflict');
  assert.equal(r.conflicts, 1);
});

test('replayFile reports identical when the change is already present here', () => {
  const r = replayFile({
    baseText: 'a\nb\n',
    headText: 'a\nB\n',
    destText: 'a\nB\n',
    merge: fakeMerge,
  });
  assert.equal(r.status, 'identical');
});

test('replayFile handles a deletion, present or absent here', () => {
  assert.equal(
    replayFile({ baseText: 'a\n', headText: null, destText: 'a\n', merge: fakeMerge }).status,
    'delete',
  );
  assert.equal(
    replayFile({ baseText: 'a\n', headText: null, destText: null, merge: fakeMerge }).status,
    'absent',
  );
});

test('tier 1 needs every file mapped, a small PR and a barely-diverged page', () => {
  const files = [{ role: 'content', divergence: 0.05, status: 'clean' }];
  assert.equal(classifyTier({ files, changedFiles: 2 }).tier, 1);
});

test('a mid-divergence page is tier 2, not tier 1', () => {
  const files = [{ role: 'content', divergence: 0.4, status: 'clean' }];
  const t = classifyTier({ files, changedFiles: 2 });
  assert.equal(t.tier, 2);
  assert.equal(t.maxDivergence, 0.4);
});

test('a heavily diverged page declines the whole PR', () => {
  const files = [
    { role: 'content', divergence: 0.02, status: 'clean', legacy: 'a', dest: 'A' },
    { role: 'content', divergence: 0.81, status: 'clean', legacy: 'b', dest: 'B' },
  ];
  const t = classifyTier({ files, changedFiles: 2 });
  assert.equal(t.tier, 3);
  assert.match(t.reasons.join(' '), /b diverged 81\.0%/);
});

test('a restructure collision declines the whole PR', () => {
  const files = [{ role: 'content', divergence: 0.01, status: 'collision', dest: 'X' }];
  assert.equal(classifyTier({ files, changedFiles: 1 }).tier, 3);
});

test('a very large PR declines regardless of divergence', () => {
  const files = [{ role: 'content', divergence: 0, status: 'clean' }];
  assert.equal(classifyTier({ files, changedFiles: 52 }).tier, 3);
});

test('an unmapped file keeps a small clean PR out of tier 1', () => {
  const files = [
    { role: 'content', divergence: 0, status: 'clean' },
    { role: 'unmapped', status: 'M' },
  ];
  assert.equal(classifyTier({ files, changedFiles: 2 }).tier, 2);
});

test('verdict is clean only with no conflicts and nothing lost', () => {
  assert.equal(verdictFor({ tier: 1, files: [{ conflicts: 0 }], needsHuman: [] }), 'clean');
  assert.equal(verdictFor({ tier: 1, files: [{ conflicts: 1 }], needsHuman: [] }), 'partial');
  assert.equal(
    verdictFor({ tier: 2, files: [{ conflicts: 0 }], needsHuman: [{ blocking: true, text: 'x' }] }),
    'partial',
  );
  assert.equal(verdictFor({ tier: 3, files: [], needsHuman: [] }), 'declined');
});

test('an advisory item does not stop a verdict being clean', () => {
  assert.equal(
    verdictFor({
      tier: 1,
      files: [{ conflicts: 0 }],
      needsHuman: [{ blocking: false, text: 'x' }],
    }),
    'clean',
  );
});

test('collectNeedsHuman names every class of leftover, marking what was lost', () => {
  const items = collectNeedsHuman({
    files: [
      { role: 'out-of-scope', legacy: 'package.json', status: 'M' },
      { role: 'unmapped', legacy: 'docs/gone.mdx', status: 'M', reason: 'no page with this slug' },
      { role: 'nav', legacy: 'sidebars.js', status: 'M' },
      { role: 'content', status: 'conflict', conflicts: 2, dest: 'content/docs/a.mdx' },
      { role: 'content', status: 'new', synthetic: true, dest: 'content/docs/new.mdx' },
      { role: 'content', status: 'delete', dest: 'content/docs/old.mdx' },
      { role: 'asset', status: 'new', synthetic: true, dest: 'public/img/a.svg' },
    ],
    navInserts: [{ action: 'insert', dir: 'content/docs/x', slug: 'c' }],
    glossaryCandidates: [{ id: 'searcher', dest: 'content/glossary/searcher.mdx' }],
  });
  const text = items.map((i) => i.text).join('\n');
  assert.equal(items.length, 8, 'the asset prefix swap is deterministic and must not be listed');
  assert.equal(items.filter((i) => i.blocking).length, 4);
  assert.match(text, /package\.json/);
  assert.match(text, /2 conflict hunk/);
  assert.match(text, /searcher/);
  assert.doesNotMatch(text, /public\/img/);
});

test('a declined PR still produces an actionable semantic summary', () => {
  const s = summarizeDeclined({
    pr: 3569,
    files: [
      {
        role: 'content',
        legacy: 'docs/a.mdx',
        dest: 'content/docs/a.mdx',
        divergence: 0.9,
        status: 'clean',
      },
      { role: 'content', legacy: 'docs/b.mdx', dest: 'content/docs/b.mdx', status: 'new' },
      { role: 'content', legacy: 'docs/c.mdx', dest: 'content/docs/c.mdx', status: 'collision' },
    ],
  });
  assert.match(s, /3 file\(s\)/);
  assert.match(s, /90\.0% divergent/);
  assert.match(s, /already exist here/);
  assert.match(s, /New pages upstream adds \(1\)/);
  assert.ok(TIER3_DIVERGENCE < 0.9);
});
