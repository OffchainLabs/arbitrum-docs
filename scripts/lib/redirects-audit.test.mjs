import assert from 'node:assert/strict';
import { test } from 'node:test';

import { auditRedirects, bareUrl } from './redirects-audit.mjs';

const routable = new Set(['/docs/a', '/docs/b']);
const redirect = (source, destination) => ({ source, destination, permanent: true });

test('bareUrl strips anchor, query and trailing slashes; empty becomes /', () => {
  assert.equal(bareUrl('/docs/a#x'), '/docs/a');
  assert.equal(bareUrl('/docs/a?y=1'), '/docs/a');
  assert.equal(bareUrl('/docs/a/'), '/docs/a');
  assert.equal(bareUrl('/docs/a//#x'), '/docs/a');
  assert.equal(bareUrl('/'), '/');
  assert.equal(bareUrl(''), '/');
});

test('a dead destination is reported; a live one is not', () => {
  const { dead } = auditRedirects(
    [redirect('/old/x', '/docs/missing'), redirect('/old/y', '/docs/a')],
    routable,
  );
  assert.deepEqual(dead, [{ source: '/old/x', destination: '/docs/missing' }]);
});

test('a source that is itself a routable page is shadowed', () => {
  const { shadowed, dead } = auditRedirects([redirect('/docs/a', '/docs/b')], routable);
  assert.deepEqual(shadowed, [{ source: '/docs/a', destination: '/docs/b' }]);
  assert.deepEqual(dead, []);
});

test('anchor and query on a destination are stripped before matching', () => {
  const { dead } = auditRedirects(
    [redirect('/old/x', '/docs/a#section'), redirect('/old/y', '/docs/b?ref=1')],
    routable,
  );
  assert.deepEqual(dead, []);
});

test('an external destination is skipped and never dead', () => {
  const { dead, skipped } = auditRedirects(
    [redirect('/old/x', 'https://example.com/page'), redirect('/old/y', 'http://example.com')],
    routable,
  );
  assert.deepEqual(dead, []);
  assert.equal(skipped, 2);
});

test('a chain whose second hop is routable or external is not dead', () => {
  const { dead, loops } = auditRedirects(
    [
      redirect('/old/x', '/old/y'),
      redirect('/old/y', '/docs/a'),
      redirect('/old/p', '/old/q#frag'),
      redirect('/old/q', 'https://example.com'),
    ],
    routable,
  );
  assert.deepEqual(dead, []);
  assert.deepEqual(
    loops.map((l) => l.kind),
    ['chain', 'chain'],
  );
});

test('a chain whose second hop is missing is dead', () => {
  const { dead } = auditRedirects(
    [redirect('/old/x', '/old/y'), redirect('/old/y', '/docs/missing')],
    routable,
  );
  assert.deepEqual(dead, [
    { source: '/old/x', destination: '/old/y' },
    { source: '/old/y', destination: '/docs/missing' },
  ]);
});

test('a self loop and a duplicate source are reported', () => {
  const { loops, collisions } = auditRedirects(
    [redirect('/old/x', '/old/x'), redirect('/old/y', '/docs/a'), redirect('/old/y', '/docs/b')],
    routable,
  );
  assert.deepEqual(loops, [{ kind: 'self', source: '/old/x', destination: '/old/x' }]);
  assert.deepEqual(collisions, [{ source: '/old/y', count: 2 }]);
});

test('permanent is ignored', () => {
  const entries = [
    { source: '/old/x', destination: '/docs/a', permanent: false },
    { source: '/old/y', destination: '/docs/b' },
  ];
  const { dead, shadowed, skipped } = auditRedirects(entries, routable);
  assert.deepEqual(dead, []);
  assert.deepEqual(shadowed, []);
  assert.equal(skipped, 0);
});
