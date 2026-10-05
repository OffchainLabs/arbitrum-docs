/**
 * Grouping and ordering of Notion rows into per-page snapshots. Fixture rows stand in for the
 * query result; `rowFromPage` is tested against a page object shaped like the API response.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type FaqRow,
  buildSnapshot,
  groupRows,
  normalizeQuestion,
  rowFromPage,
} from './faq-snapshot.ts';

const row = (over: Partial<FaqRow>): FaqRow => ({
  id: 'id-1',
  url: 'https://www.notion.so/id-1',
  question: 'Q?',
  slugs: ['troubleshooting-running-nodes'],
  order: 10,
  shortAnswer: [],
  ...over,
});

describe('normalizeQuestion', () => {
  it('normalizes whitespace in the question', () => {
    assert.equal(normalizeQuestion('  How  to verify\tthe   DB? '), 'How to verify the DB?');
  });
});

describe('groupRows', () => {
  it('groups by mapped slug in ascending order index', () => {
    const g = groupRows([
      row({ id: 'b', order: 20, question: 'B' }),
      row({ id: 'a', order: 10, question: 'A' }),
    ]);
    assert.deepEqual(
      g.get('nodes')?.map((r) => r.id),
      ['a', 'b'],
    );
  });

  it('emits a row under every mapped slug', () => {
    const g = groupRows([
      row({ id: 'x', slugs: ['troubleshooting-running-nodes', 'troubleshooting-building'] }),
    ]);
    assert.equal(g.get('nodes')?.[0]?.id, 'x');
    assert.equal(g.get('building')?.[0]?.id, 'x');
  });

  it('ignores rows whose slugs are not mapped', () => {
    const g = groupRows([row({ slugs: ['dao-faq'] })]);
    assert.equal([...g.values()].flat().length, 0);
  });

  it('rejects a missing order index, a tie, and a duplicate question', () => {
    assert.throws(() => groupRows([row({ order: null })]), /order index/);
    assert.throws(
      () => groupRows([row({ id: 'a', order: 10 }), row({ id: 'b', order: 10, question: 'B' })]),
      /same order index/,
    );
    assert.throws(
      () =>
        groupRows([
          row({ id: 'a', order: 10, question: 'Same' }),
          row({ id: 'b', order: 20, question: 'Same ' }),
        ]),
      /duplicate question/,
    );
  });
});

describe('buildSnapshot', () => {
  it('pairs rows with their rendered answers and normalizes questions', () => {
    const rows = [row({ id: 'a', question: 'A  question?' })];
    const snap = buildSnapshot(rows, new Map([['a', 'answer']]));
    assert.deepEqual(snap, {
      source: 'https://www.notion.so/a8a9af20f33d4cc1b32bbd2be8459733',
      items: [{ id: 'a', question: 'A question?', answer: 'answer' }],
    });
  });
});

describe('rowFromPage', () => {
  it('reads the Notion property names', () => {
    const page = {
      object: 'page',
      id: 'p1',
      url: 'https://www.notion.so/p1',
      properties: {
        'Question': {
          type: 'title',
          title: [
            {
              type: 'text',
              plain_text: 'How?',
              href: null,
              annotations: {},
              text: { content: 'How?', link: null },
            },
          ],
        },
        'Target document slugs': {
          type: 'multi_select',
          multi_select: [{ id: 'x', name: 'troubleshooting-bridging', color: 'green' }],
        },
        'FAQ order index': { type: 'number', number: 30 },
        'Short answer (HTML)': { type: 'rich_text', rich_text: [] },
      },
    };
    assert.deepEqual(rowFromPage(page), {
      id: 'p1',
      url: 'https://www.notion.so/p1',
      question: 'How?',
      slugs: ['troubleshooting-bridging'],
      order: 30,
      shortAnswer: [],
    });
  });

  it('rejects a page without the Question property, and a link in the question', () => {
    assert.throws(
      () => rowFromPage({ object: 'page', id: 'p', url: 'u', properties: {} }),
      /Question/,
    );
    const linkedTitle = {
      object: 'page',
      id: 'p',
      url: 'u',
      properties: {
        Question: {
          type: 'title',
          title: [
            {
              type: 'text',
              plain_text: 'x',
              href: 'https://a.b',
              annotations: {},
              text: { content: 'x', link: { url: 'https://a.b' } },
            },
          ],
        },
      },
    };
    assert.throws(() => rowFromPage(linkedTitle), /link in its title/);
  });
});
