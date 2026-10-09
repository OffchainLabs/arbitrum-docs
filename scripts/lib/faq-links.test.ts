/**
 * Site-relative links in a rendered answer must point at a real page. A fake index stands in for
 * `buildIndex`, so the test is offline and independent of the content tree.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findUnresolvedLinks } from './faq-links.ts';

const index = {
  byAbs: new Set<string>(),
  urlByAbs: new Map<string, string>(),
  byUrl: new Map([['/run-a-node/faq', '/repo/content/run-a-node/faq.mdx']]),
};

describe('findUnresolvedLinks', () => {
  it('returns only the site-relative links that do not resolve', () => {
    const answer =
      'See [a](/run-a-node/faq), [b](/missing#x), [c](https://x.y), [d](/run-a-node/faq#frag).';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), ['/missing#x']);
  });

  it('ignores links inside code', () => {
    const answer = 'Run `curl /nope` and:\n\n```bash\ncurl /nope\n```';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), []);
  });
});
