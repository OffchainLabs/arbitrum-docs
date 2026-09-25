import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildCurrentRedirects,
  destinationUrl,
  docusaurusRoute,
  findCollisions,
  findLoops,
  isRoutablePage,
  parseFrontmatter,
  resolveDestination,
} from './current-redirects.mjs';
import { buildTreeIndex } from './tree-compare.mjs';

test('docusaurusRoute strips number prefixes from every segment', () => {
  assert.equal(docusaurusRoute('arbitrum-bridge/01-quickstart.mdx'), '/arbitrum-bridge/quickstart');
  assert.equal(docusaurusRoute('10-a/02-b/03-c.mdx'), '/a/b/c');
});

test('docusaurusRoute treats index, README and a folder-named doc as the folder route', () => {
  assert.equal(docusaurusRoute('stylus/index.mdx'), '/stylus');
  assert.equal(docusaurusRoute('stylus/README.md'), '/stylus');
  // Verified against the built sitemap: docs/for-devs/oracles/DIA/dia.mdx serves at .../DIA.
  assert.equal(docusaurusRoute('for-devs/oracles/DIA/dia.mdx'), '/for-devs/oracles/DIA');
});

test('docusaurusRoute keeps a top-level doc at the root rather than collapsing it away', () => {
  assert.equal(docusaurusRoute('glossary.mdx'), '/glossary');
});

test('docusaurusRoute applies id: to the last segment only', () => {
  const route = docusaurusRoute('for-devs/oracles/supra/use-supras-price-feed-oracle.mdx', {
    id: 'supras-price-feed',
  });
  assert.equal(route, '/for-devs/oracles/supra/supras-price-feed');
});

test('docusaurusRoute lets slug: win, absolute or relative', () => {
  assert.equal(docusaurusRoute('get-started/overview.mdx', { slug: '/' }), '/');
  assert.equal(docusaurusRoute('a/b.mdx', { slug: '/c/d' }), '/c/d');
  assert.equal(docusaurusRoute('a/b.mdx', { slug: 'renamed' }), '/a/renamed');
});

test('isRoutablePage drops what the site never indexes', () => {
  assert.equal(isRoutablePage('stylus/quickstart.mdx'), true);
  assert.equal(isRoutablePage('stylus/_fragment.mdx'), false);
  assert.equal(isRoutablePage('bridging/partials/_x.mdx'), false);
  assert.equal(isRoutablePage('sdk/api/thing.mdx'), false);
  assert.equal(isRoutablePage('hosted-pdfs/audit-reports/index.mdx'), false);
  assert.equal(isRoutablePage('stylus/_category_.yml'), false);
});

test('parseFrontmatter reads only the fields that move a URL, unquoted', () => {
  const front = parseFrontmatter(
    `---\ntitle: 'A title'\nid: "an-id"\nslug: /x\nauthor: nobody\n---\nbody`,
  );
  assert.deepEqual(front, { title: 'A title', id: 'an-id', slug: '/x' });
  assert.deepEqual(parseFrontmatter('no frontmatter here'), {});
});

test('destinationUrl folds index.mdx into its directory', () => {
  assert.equal(destinationUrl('stylus/quickstart.mdx'), '/docs/stylus/quickstart');
  assert.equal(destinationUrl('stylus/index.mdx'), '/docs/stylus');
});

const destPages = new Map([
  ['stylus/quickstart.mdx', 'Stylus quickstart'],
  ['stylus/best-practices/gas-optimization.mdx', 'Gas optimization best practices'],
  [
    'launch-arbitrum-chain/configuration/costs/gas-optimization-tools.mdx',
    'Configure and optimize gas',
  ],
  ['glossary.mdx', 'Arbitrum glossary'],
  [
    'launch-arbitrum-chain/integrations/da-api-integration-guide.mdx',
    'How to integrate with the DA API',
  ],
  ['arbitrum-essentials/index.mdx', 'Arbitrum essentials'],
  ['stylus/index.mdx', 'Build apps with Stylus'],
]);

const ctx = () => {
  const byTitle = new Map();
  for (const [rel, title] of destPages) {
    byTitle.set(title.toLowerCase().replace(/[^a-z0-9]/g, ''), [
      ...(byTitle.get(title.toLowerCase().replace(/[^a-z0-9]/g, '')) ?? []),
      rel,
    ]);
  }
  return { index: buildTreeIndex([...destPages.keys()]), destTitles: destPages, byTitle };
};

test('resolveDestination prefers the directory+slug pairing tree-compare already solves', () => {
  const page = {
    rel: 'stylus/quickstart.mdx',
    route: '/stylus/quickstart',
    title: 'Stylus quickstart',
  };
  assert.deepEqual(resolveDestination(page, ctx()), {
    destination: '/docs/stylus/quickstart',
    rule: 'mapped',
    destRel: 'stylus/quickstart.mdx',
  });
});

test('resolveDestination accepts a cross-directory slug match when the titles agree', () => {
  // No section or rename rule covers intro/ -> root, so this can only pair on the bare slug.
  const page = { rel: 'intro/glossary.mdx', route: '/intro/glossary', title: 'Arbitrum glossary' };
  const result = resolveDestination(page, ctx());
  assert.equal(result.rule, 'bare-slug');
  assert.equal(result.destination, '/docs/glossary');
});

test('resolveDestination refuses a slug match whose titles disagree', () => {
  // The real mispairing this guard exists for: a chain how-to onto a Stylus best-practices page.
  const page = {
    rel: 'some-section/gas-optimization.mdx',
    route: '/some-section/gas-optimization',
    title: 'Configure and optimize gas',
  };
  const result = resolveDestination(page, ctx());
  assert.equal(result.destination, null);
  assert.equal(result.reason, 'bare-slug-title-mismatch');
  assert.equal(result.wouldMatch, '/docs/stylus/best-practices/gas-optimization');
});

test('resolveDestination falls back to a unique exact title match', () => {
  // The slug matches nothing and the directory pairing fails, so only the title can resolve it.
  const page = {
    rel: 'for-devs/concepts/vocabulary.mdx',
    route: '/for-devs/concepts/vocabulary',
    title: 'Arbitrum glossary',
  };
  const result = resolveDestination(page, ctx());
  assert.equal(result.rule, 'title');
  assert.equal(result.destination, '/docs/glossary');
});

test('resolveDestination gives up rather than guessing', () => {
  const page = { rel: 'a/brand-new-page.mdx', route: '/a/brand-new-page', title: 'Brand new page' };
  const result = resolveDestination(page, ctx());
  assert.equal(result.destination, null);
  assert.equal(result.reason, 'no-counterpart');
});

test('resolveDestination lets a hand-confirmed override win over every rule', () => {
  const page = {
    rel: 'launch-arbitrum-chain/chain-config/costs/gas-optimization.mdx',
    route: '/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    title: 'Configure and optimize gas',
  };
  const result = resolveDestination(page, ctx());
  assert.equal(result.rule, 'manual');
  assert.equal(
    result.destination,
    '/docs/launch-arbitrum-chain/configuration/costs/gas-optimization-tools',
  );
});

test('buildCurrentRedirects emits, parks and excludes', () => {
  const pages = [
    { rel: 'stylus/quickstart.mdx', route: '/stylus/quickstart', title: 'Stylus quickstart' },
    { rel: 'a/brand-new-page.mdx', route: '/a/brand-new-page', title: 'Brand new page' },
    { rel: 'get-started/overview.mdx', route: '/', title: 'Get started' },
  ];
  const { redirects, todo, excluded, deferred } = buildCurrentRedirects({ pages, destPages });

  assert.deepEqual(
    redirects.filter((r) => r.source === '/stylus/quickstart'),
    [{ source: '/stylus/quickstart', destination: '/docs/stylus/quickstart', permanent: true }],
  );
  assert.equal(
    redirects.every((r) => r.permanent === true),
    true,
  );
  assert.deepEqual(
    todo.map((t) => t.source),
    ['/a/brand-new-page'],
  );
  assert.equal(todo[0].upstream, 'docs/a/brand-new-page.mdx');
  // slug: / would otherwise emit a redirect that hijacks this site's own landing page.
  assert.deepEqual(excluded, [{ source: '/', reason: expectedRootReason() }]);
  assert.equal(
    redirects.some((r) => r.source === '/'),
    false,
  );
  assert.deepEqual(deferred, []);
  // The two sidebar generated-index routes always come along.
  assert.equal(
    redirects.some((r) => r.source === '/stylus'),
    true,
  );
  assert.equal(
    redirects.some((r) => r.source === '/arbitrum-essentials'),
    true,
  );
});

const expectedRootReason = () => 'site root; served by this site’s own landing page';

test('buildCurrentRedirects defers to a source that is already redirected', () => {
  const pages = [
    { rel: 'stylus/quickstart.mdx', route: '/stylus/quickstart', title: 'Stylus quickstart' },
  ];
  const existing = new Map([['/stylus/quickstart', '/docs/somewhere-else']]);
  const { redirects, deferred } = buildCurrentRedirects({ pages, destPages, existing });

  assert.equal(
    redirects.some((r) => r.source === '/stylus/quickstart'),
    false,
  );
  assert.deepEqual(deferred[0], {
    source: '/stylus/quickstart',
    destination: '/docs/stylus/quickstart',
    existing: '/docs/somewhere-else',
    conflict: true,
  });
});

test('buildCurrentRedirects throws rather than emitting a destination that is not a page', () => {
  // A stale MANUAL_DESTINATIONS entry must fail the run, not ship a 404.
  const pages = [
    {
      rel: 'launch-arbitrum-chain/run-a-node/batch-poster.mdx',
      route: '/launch-arbitrum-chain/run-a-node/batch-poster',
      title: 'Run a batch poster',
    },
  ];
  assert.throws(
    () => buildCurrentRedirects({ pages, destPages }),
    /destination does not exist: \/docs\/run-a-node\/run-batch-poster/,
  );
});

test('findCollisions reports a source Next would silently resolve to the first match', () => {
  const entries = [
    { source: '/a', destination: '/docs/a' },
    { source: '/b', destination: '/docs/b' },
    { source: '/a', destination: '/docs/other' },
  ];
  assert.deepEqual(findCollisions(entries), [{ source: '/a', count: 2 }]);
  assert.deepEqual(findCollisions(entries.slice(0, 2)), []);
});

test('findLoops reports a self-redirect and a second hop, ignoring anchors', () => {
  assert.deepEqual(findLoops([{ source: '/a', destination: '/a' }]), [
    { kind: 'self', source: '/a', destination: '/a' },
  ]);
  assert.deepEqual(findLoops([{ source: '/a', destination: '/a#top' }]), [
    { kind: 'self', source: '/a', destination: '/a#top' },
  ]);
  assert.deepEqual(
    findLoops([
      { source: '/a', destination: '/b' },
      { source: '/b', destination: '/docs/b' },
    ]),
    [{ kind: 'chain', source: '/a', destination: '/b', next: '/docs/b' }],
  );
  assert.deepEqual(findLoops([{ source: '/a', destination: '/docs/a' }]), []);
});
