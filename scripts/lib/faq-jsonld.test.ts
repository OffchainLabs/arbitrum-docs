/**
 * The FAQPage structured data emitted on the six FAQ pages. `stripMarkdown` is pinned on the
 * constructs the renderer produces; `faqJsonLd` is checked against the committed snapshots.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { faqJsonLd, stripMarkdown } from '../../lib/faq.ts';

describe('stripMarkdown', () => {
  it('keeps text, drops markup', () => {
    const md = [
      '#### Head',
      '',
      'Use **bold**, _it_, `code`, [label](/x) and \\<esc>.',
      '',
      '- a',
      '1. b',
      '',
      '```bash',
      'run me',
      '```',
      '',
      '<Callout type="info">',
      '',
      'note',
      '',
      '</Callout>',
      '',
      '| h |',
      '| --- |',
      '| c |',
    ].join('\n');
    assert.equal(
      stripMarkdown(md),
      'Head Use bold, it, code, label and <esc>. a b run me note h c',
    );
  });

  it('keeps underscores and asterisks inside words', () => {
    assert.equal(
      stripMarkdown(
        'Set `VALIDATOR_AFK_BLOCKS`, call `__init__` and `eth_call`, then *a*b*c* x*y*z.',
      ),
      'Set VALIDATOR_AFK_BLOCKS, call __init__ and eth_call, then a*b*c x*y*z.',
    );
  });
});

describe('faqJsonLd', () => {
  it('returns FAQPage data for a mapped page and nothing for any other', () => {
    const data = faqJsonLd(['run-a-node', 'faq']);
    assert.equal(data?.['@type'], 'FAQPage');
    assert.ok((data?.mainEntity.length ?? 0) > 0);
    assert.equal(data?.mainEntity[0]?.['@type'], 'Question');
    assert.equal(data?.mainEntity[0]?.acceptedAnswer['@type'], 'Answer');
    assert.equal(faqJsonLd(['run-a-node', 'overview']), undefined);
    assert.equal(faqJsonLd(undefined), undefined);
  });
});
