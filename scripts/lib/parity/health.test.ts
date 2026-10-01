import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareBlocks } from './compare.ts';
import { WEIGHTS, needsTriage, runHealth, scorePage } from './health.ts';
import type { Block, PageReport, ResolutionCategory } from './schema.ts';

const prod: Block[] = [
  { kind: 'heading', level: 1, text: 'Title' },
  { kind: 'paragraph', text: 'The chain reads messages one at a time.' },
  { kind: 'link', text: '/docs/a' },
  { kind: 'code', text: 'git clone x' },
  { kind: 'image', text: 'diagram.png' },
];

const score = (target: Block[], category: ResolutionCategory = 'same-slug', works = () => true) =>
  scorePage({
    category,
    prod,
    target,
    comparison: compareBlocks(prod, target),
    isInternal: (link) => link.startsWith('/'),
    works,
  });

test('an identical page scores 1 on every parameter', () => {
  const { scores, items } = score(prod);
  assert.deepEqual(scores, {
    resolves: 1,
    text: 1,
    headings: 1,
    code: 1,
    images: 1,
    links: 1,
    overall: 1,
  });
  assert.equal(needsTriage(scores, 0.97), false);
  assert.deepEqual(items, { headings: [], code: [], images: [], links: [], text: [] });
});

test('weights sum to 1', () => {
  const total = Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  assert.equal(Math.round(total * 1000) / 1000, 1);
});

test('a not-found page scores 0', () => {
  const { scores } = score([], 'not-found');
  assert.equal(scores.overall, 0);
  assert.equal(scores.resolves, 0);
});

test('missing code, images and headings are listed and scored', () => {
  const { scores, items } = score([prod[1], prod[2]]);
  assert.equal(scores.headings, 0);
  assert.equal(scores.code, 0);
  assert.equal(scores.images, 0);
  assert.ok(scores.overall > 0 && scores.overall < 0.97);
  assert.equal(needsTriage(scores, 0.97), true);
  assert.deepEqual(items.headings, ['Title']);
  assert.deepEqual(items.code, ['git clone x']);
  assert.deepEqual(items.images, ['diagram.png']);
});

test('a link present but broken on the target costs the links score', () => {
  const { scores, items } = score(prod, 'same-slug', () => false);
  assert.equal(scores.links, 0);
  assert.deepEqual(items.links, [{ href: '/docs/a', reason: 'broken' }]);
});

test('a changed paragraph is listed old next to new', () => {
  const target = [...prod];
  target[1] = { kind: 'paragraph', text: 'The chain processes messages one at a time.' };
  const { scores, items } = score(target);
  assert.ok(scores.text < 1);
  assert.equal(items.text.length, 1);
  assert.equal(items.text[0].old, 'The chain reads messages one at a time.');
  assert.equal(items.text[0].new, 'The chain processes messages one at a time.');
});

test('run health is the mean overall page score, with unresolved pages at 0', () => {
  const pages = [
    { scores: { overall: 1 } },
    { scores: { overall: 0 } },
    { scores: { overall: 0.5 } },
  ] as PageReport[];
  assert.equal(runHealth(pages), 50);
});
