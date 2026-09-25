import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { localSiteUrl, resolveSiteUrl } from '../../lib/site-url.ts';

/**
 * Covers the site-URL rule in `lib/site-url.ts`, whose whole job is to fail loudly.
 *
 * `NEXT_PUBLIC_SITE_URL` is inlined at build time, so a production build without it would bake
 * `http://localhost:3000` into every canonical and social image URL in the deployed output. That
 * failure is invisible on the running site and only visible to crawlers, so the rule throws
 * instead, and this file is what keeps the throw from being softened into a fallback later.
 *
 * The rule takes its environment as an argument, so most cases call it directly. Two things wrap it and each gets a case of its own, because the wrappers are where it
 * is actually applied: `getSiteUrl()` in lib/shared.ts, which binds it to `process.env` for app
 * code, and `next.config.ts`, which is the only one of the two that runs during a build.
 */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('resolveSiteUrl returns the configured site URL', () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://docs.example.com' }),
    'https://docs.example.com',
  );
});

test('resolveSiteUrl prefers the configured URL even in a production deployment', () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://docs.example.com', VERCEL_ENV: 'production' }),
    'https://docs.example.com',
  );
});

test('resolveSiteUrl falls back to localhost when unset outside production', () => {
  assert.equal(resolveSiteUrl({}), localSiteUrl);
  assert.equal(resolveSiteUrl({ VERCEL_ENV: 'preview' }), localSiteUrl);
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_VERCEL_ENV: 'development' }), localSiteUrl);
});

test('resolveSiteUrl throws when unset in a production build', () => {
  assert.throws(
    () => resolveSiteUrl({ VERCEL_ENV: 'production' }),
    /NEXT_PUBLIC_SITE_URL is not set in a production build/,
  );
});

test('resolveSiteUrl also throws on the build-inlined production flag alone', () => {
  assert.throws(
    () => resolveSiteUrl({ NEXT_PUBLIC_VERCEL_ENV: 'production' }),
    /NEXT_PUBLIC_SITE_URL is not set in a production build/,
  );
});

test('resolveSiteUrl treats an empty string as unset', () => {
  assert.throws(
    () => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '', VERCEL_ENV: 'production' }),
    /NEXT_PUBLIC_SITE_URL is not set in a production build/,
  );
});

/**
 * An origin pasted without a scheme is the realistic way to get this wrong, and it used to satisfy
 * every check here and then throw inside `new URL()` at the root layout's module scope, taking down
 * every route on the first request after promotion.
 */
test('resolveSiteUrl rejects a value that is not an absolute URL', () => {
  for (const value of ['docs.arbitrum.io', '/docs', 'not a url']) {
    assert.throws(
      () => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: value }),
      /NEXT_PUBLIC_SITE_URL is not a valid absolute URL/,
      `expected ${JSON.stringify(value)} to be rejected`,
    );
  }
});

test('resolveSiteUrl rejects a malformed value outside production too', () => {
  // Nothing about a bad value gets better in preview, and the same string is what gets promoted.
  assert.throws(
    () => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'docs.arbitrum.io', VERCEL_ENV: 'preview' }),
    /NEXT_PUBLIC_SITE_URL is not a valid absolute URL/,
  );
});

/**
 * Runs `script` in a fresh Node. Both cases import a `.ts` file, which Node type-strips on its own
 * from 22.18, the floor `engines` sets; this test file is itself `.ts`, so an older Node never gets
 * this far.
 */
function runInSubprocess(script: string, env: Record<string, string | undefined>): string {
  return execFileSync(
    process.execPath,
    ['--no-warnings', '--input-type=module', '--eval', script],
    {
      encoding: 'utf8',
      cwd: repoRoot,
      // A bare object, not a spread of process.env, so a NEXT_PUBLIC_SITE_URL that happens to be
      // exported in the developer's shell cannot mask a failure here. `NODE_ENV` is named because
      // Next's global types make it a required key of `ProcessEnv`; nothing either case imports
      // reads it.
      env: { PATH: process.env.PATH, NODE_ENV: 'test', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

test('getSiteUrl binds the rule to process.env', () => {
  const script = `
    const { getSiteUrl } = await import(${JSON.stringify(path.join(repoRoot, 'lib/shared.ts'))});
    process.stdout.write(getSiteUrl());
  `;

  assert.equal(
    runInSubprocess(script, { NEXT_PUBLIC_SITE_URL: 'https://docs.example.com' }),
    'https://docs.example.com',
  );
  assert.throws(
    () => runInSubprocess(script, { VERCEL_ENV: 'production' }),
    /NEXT_PUBLIC_SITE_URL is not set in a production build/,
  );
});

/**
 * The case that matters most, and the one nothing covered before the rule was extracted.
 *
 * `next.config.ts` is the copy that always runs during a build, because it is the first thing the
 * build evaluates, and the only one a build whose prerendered routes never reach `getSiteUrl()`
 * has. If it stops throwing, a misconfigured production deploy ships and fails on its first
 * request instead of failing the build. Next evaluates the file through its own transpiler; this
 * case imports it under Node's type stripping, which runs the same statements.
 */
test('next.config.ts fails the build on a missing or malformed site URL', () => {
  const script = `await import(${JSON.stringify(path.join(repoRoot, 'next.config.ts'))});`;

  assert.throws(
    () => runInSubprocess(script, { VERCEL_ENV: 'production' }),
    /NEXT_PUBLIC_SITE_URL is not set in a production build/,
  );
  assert.throws(
    () => runInSubprocess(script, { NEXT_PUBLIC_SITE_URL: 'docs.arbitrum.io' }),
    /NEXT_PUBLIC_SITE_URL is not a valid absolute URL/,
  );
  assert.doesNotThrow(() =>
    runInSubprocess(script, {
      NEXT_PUBLIC_SITE_URL: 'https://docs.example.com',
      VERCEL_ENV: 'production',
    }),
  );
});
