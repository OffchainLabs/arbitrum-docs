import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  bodyLineCount,
  buildTreeIndex,
  mapSectionPath,
  normalizeSlug,
  resolveTreeBMatch,
} from './lib/tree-compare.mjs';

test('normalizeSlug strips numeric prefixes, extension and case', () => {
  assert.equal(normalizeSlug('run-arbitrum-node/01-overview.mdx'), 'overview');
  assert.equal(normalizeSlug('a/b/Some-Page.md'), 'somepage');
  assert.equal(normalizeSlug('partials/_my-partial.mdx'), 'mypartial');
});

test('mapSectionPath applies the Tree A -> Tree B section renames', () => {
  assert.equal(mapSectionPath('run-arbitrum-node/overview.mdx'), 'run-a-node/overview.mdx');
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/chain-config/costs/x.mdx'),
    'launch-arbitrum-chain/configuration/costs/x.mdx',
  );
  assert.equal(mapSectionPath('for-devs/oracles/api3/api3.mdx'), 'oracles/api3/api3.mdx');
  assert.equal(mapSectionPath('stylus-by-example/x.mdx'), 'stylus/x.mdx');
});

test('mapSectionPath leaves unmapped sections untouched', () => {
  assert.equal(mapSectionPath('how-arbitrum-works/x.mdx'), 'how-arbitrum-works/x.mdx');
});

test('mapSectionPath applies whole-file renames, and they beat section prefixes', () => {
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/operate/monitoring.mdx'),
    'launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx',
  );
  // This one also matches the chain-config -> configuration section prefix; the rename must win.
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments.mdx'),
    'launch-arbitrum-chain/configuration/sequencer/config-sequencer-timing-adjustments.mdx',
  );
});

test('bodyLineCount excludes frontmatter', () => {
  const src = ['---', 'title: X', '---', '', 'line one', 'line two'].join('\n');
  assert.equal(bodyLineCount(src), 3);
});

test('bodyLineCount handles a file with no frontmatter', () => {
  assert.equal(bodyLineCount('just\ntwo lines'), 2);
});

test('bodyLineCount ignores the trailing empty element from a final newline', () => {
  assert.equal(bodyLineCount('just\ntwo lines\n'), 2);
  assert.equal(bodyLineCount(['---', 'title: X', '---', 'body one', 'body two', ''].join('\n')), 2);
});

test('resolveTreeBMatch does not let a bare-slug collision mispair a directory-qualified page', () => {
  // Two Tree B files share the same bare slug ("gentleintroduction") in different directories, the
  // exact shape of the real BoLD-vs-Stylus bug: bIndex keyed on bare slug alone let the second file
  // walked silently clobber the first, so the BoLD page paired against the Stylus page instead.
  const index = buildTreeIndex([
    'stylus/gentle-introduction.mdx',
    'how-arbitrum-works/bold/gentle-introduction.mdx',
  ]);
  assert.equal(
    resolveTreeBMatch(index, 'how-arbitrum-works/bold/gentle-introduction.mdx'),
    'how-arbitrum-works/bold/gentle-introduction.mdx',
  );
  assert.notEqual(
    resolveTreeBMatch(index, 'how-arbitrum-works/bold/gentle-introduction.mdx'),
    'stylus/gentle-introduction.mdx',
  );
});

test('resolveTreeBMatch falls back to a unique bare-slug match across renamed directories', () => {
  // A genuine cross-directory move: no directory-qualified key matches, but the bare slug is unique
  // in Tree B, so the fallback still pairs it instead of reporting it ABSENT.
  const index = buildTreeIndex(['new-section/unique-page-name.mdx']);
  assert.equal(
    resolveTreeBMatch(index, 'old-section/unique-page-name.mdx'),
    'new-section/unique-page-name.mdx',
  );
});

test('resolveTreeBMatch refuses an ambiguous bare-slug fallback', () => {
  // Same collision as above, but queried from a Tree A directory that has no directory-qualified
  // counterpart at all: the bare slug is ambiguous (two candidates), so it must not guess.
  const index = buildTreeIndex([
    'stylus/gentle-introduction.mdx',
    'how-arbitrum-works/bold/gentle-introduction.mdx',
  ]);
  assert.equal(resolveTreeBMatch(index, 'unmatched-dir/gentle-introduction.mdx'), null);
});

test('resolveTreeBMatch still applies whole-file renames via mapSectionPath', () => {
  const index = buildTreeIndex(['launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx']);
  assert.equal(
    resolveTreeBMatch(index, 'launch-arbitrum-chain/operate/monitoring.mdx'),
    'launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx',
  );
});
