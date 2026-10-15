/** `buildLinkPreview` turns a page's structured data into the JSON a hover card renders. */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLinkPreview } from '../../lib/link-preview.ts';

const base = { title: 'Gas', url: '/gas' };

test('lead joins the paragraphs that come before the first heading', () => {
  const out = buildLinkPreview({
    ...base,
    description: 'About gas.',
    structuredData: {
      headings: [{ id: 'fees', content: 'Fees' }],
      contents: [
        { heading: undefined, content: 'First.' },
        { heading: undefined, content: 'Second.' },
        { heading: 'fees', content: 'Under fees.' },
      ],
    },
  });
  assert.equal(out.lead, 'First. Second.');
  assert.equal(out.title, 'Gas');
  assert.equal(out.url, '/gas');
  assert.equal(out.description, 'About gas.');
});

test('sections are keyed by heading id and carry the heading text', () => {
  const out = buildLinkPreview({
    ...base,
    structuredData: {
      headings: [
        { id: 'fees', content: 'Fees' },
        { id: 'limits', content: 'Limits' },
      ],
      contents: [
        { heading: 'fees', content: 'A.' },
        { heading: 'fees', content: 'B.' },
        { heading: 'limits', content: 'C.' },
      ],
    },
  });
  assert.deepEqual(out.sections, {
    fees: { heading: 'Fees', text: 'A. B.' },
    limits: { heading: 'Limits', text: 'C.' },
  });
});

test('a page with no contents has an empty lead and no sections', () => {
  const out = buildLinkPreview({ ...base, structuredData: { headings: [], contents: [] } });
  assert.equal(out.lead, '');
  assert.deepEqual(out.sections, {});
});

test('a page with a description only keeps the description', () => {
  const out = buildLinkPreview({
    ...base,
    description: 'Only this.',
    structuredData: { headings: [], contents: [] },
  });
  assert.equal(out.description, 'Only this.');
  assert.equal(out.lead, '');
});

test('a page without a description has no description key', () => {
  const out = buildLinkPreview({ ...base, structuredData: { headings: [], contents: [] } });
  assert.equal('description' in out, false);
});

test('a lead equal to the description passes through unchanged', () => {
  const out = buildLinkPreview({
    ...base,
    description: 'Same text.',
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Same text.' }] },
  });
  assert.equal(out.lead, 'Same text.');
  assert.equal(out.description, 'Same text.');
});

test('a long lead is cut at a sentence boundary and ends with an ellipsis', () => {
  const sentence = 'This sentence has some words in it. ';
  const content = sentence.repeat(20).trim();
  const out = buildLinkPreview({
    ...base,
    structuredData: { headings: [], contents: [{ heading: undefined, content }] },
  });
  assert.ok(out.lead.length <= 351, `length ${out.lead.length}`);
  assert.match(out.lead, /in it\.…$/);
});

test('a long sentence with no boundary is cut at a space', () => {
  const content = 'word '.repeat(200).trim();
  const out = buildLinkPreview({
    ...base,
    structuredData: { headings: [], contents: [{ heading: undefined, content }] },
  });
  assert.match(out.lead, /word…$/);
  assert.ok(out.lead.length <= 351);
});

test('whitespace is collapsed', () => {
  const out = buildLinkPreview({
    ...base,
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'a \n  b\tc' }] },
  });
  assert.equal(out.lead, 'a b c');
});

test('a heading with no paragraphs gets an empty section', () => {
  const out = buildLinkPreview({
    ...base,
    structuredData: { headings: [{ id: 'empty', content: 'Empty' }], contents: [] },
  });
  assert.deepEqual(out.sections, { empty: { heading: 'Empty', text: '' } });
});

test('a sentence boundary before two thirds of the cap is ignored', () => {
  const content = `Hi. ${'word '.repeat(200)}`.trim();
  const out = buildLinkPreview({
    ...base,
    structuredData: { headings: [], contents: [{ heading: undefined, content }] },
  });
  assert.ok(out.lead.length > 200, `length ${out.lead.length}`);
});
