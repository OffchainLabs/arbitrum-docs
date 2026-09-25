import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseArgs } from './lib/redirects-check.ts';

const defaults = { defaultBaseUrl: 'http://localhost:3000' };

test('parseArgs falls back to the default base URL', () => {
  assert.equal(parseArgs([], defaults).baseUrl, 'http://localhost:3000');
});

test('parseArgs names the caller bug when there is no flag and no default to fall back on', () => {
  assert.throws(() => parseArgs([]), /no --base-url and no defaultBaseUrl/);
});

test('parseArgs reads --base-url and strips a trailing slash', () => {
  const result = parseArgs(['--base-url', 'http://localhost:3399/'], defaults);
  assert.equal(result.baseUrl, 'http://localhost:3399');
});

test('parseArgs rejects --base-url with no value instead of throwing on .replace later', () => {
  assert.throws(() => parseArgs(['--base-url'], defaults), /--base-url requires a value/);
});

test('parseArgs rejects --base-url immediately followed by another flag', () => {
  assert.throws(
    () => parseArgs(['--base-url', '--verbose'], defaults),
    /--base-url requires a value/,
  );
});

// The check carries no Vercel protection-bypass secret on purpose (INTERNALS.md#redirects). This
// pins that: if `--bypass-header` or a VERCEL_AUTOMATION_BYPASS_SECRET fallback reappears, the
// reasoning went with it.
test('parseArgs accepts no bypass option and returns only a base URL', () => {
  const result = parseArgs(['--bypass-header', 'nope'], defaults);
  assert.deepEqual(result, { baseUrl: 'http://localhost:3000' });
});
