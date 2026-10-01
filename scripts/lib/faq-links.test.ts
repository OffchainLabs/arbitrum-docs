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
  byUrl: new Map([['/docs/run-a-node/faq', '/repo/content/docs/run-a-node/faq.mdx']]),
};

describe('findUnresolvedLinks', () => {
  it('returns only the site-relative links that do not resolve', () => {
    const answer =
      'See [a](/docs/run-a-node/faq), [b](/docs/missing#x), [c](https://x.y), [d](/docs/run-a-node/faq#frag).';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), ['/docs/missing#x']);
  });

  it('ignores links inside code', () => {
    const answer = 'Run `curl /docs/nope` and:\n\n```bash\ncurl /docs/nope\n```';
    assert.deepEqual(findUnresolvedLinks(answer, index, '/repo'), []);
  });
});
