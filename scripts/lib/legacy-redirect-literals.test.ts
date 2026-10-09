import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { isDroppedRedirect, renderRedirectEntries } from './legacy-redirect-literals.ts';

test('legacy SDK exclusion matches the preserved policy exactly', () => {
  for (const destination of ['/sdk', '/sdk/', '/sdk/reference']) {
    assert.equal(isDroppedRedirect(destination), true, destination);
  }
  for (const destination of ['/sdk-docs', '/sdks', '/SDK', '/sdk?x=1', 'https://example.com/sdk']) {
    assert.equal(isDroppedRedirect(destination), false, destination);
  }
});

test('legacy redirect quotes, expressions and newlines remain literal data', async () => {
  const redirects = [
    {
      source: "/x', destination: globalThis.__legacyRedirectInjection = 'injected",
      destination: 'https://example.com/"\\\n${globalThis.__legacyRedirectInjection = true}',
      permanent: true,
    },
  ];
  const source = `export default [${renderRedirectEntries(redirects)}];`;
  const result = await import(`data:text/javascript,${encodeURIComponent(source)}`);
  assert.deepEqual(result.default, redirects);
  assert.equal('__legacyRedirectInjection' in globalThis, false);
});

test('legacy generator runs in a fixture and serializes external redirects safely', async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'legacy-redirect-security-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
  mkdirSync(path.join(root, 'scripts/lib'), { recursive: true });
  mkdirSync(path.join(root, 'content/docs'), { recursive: true });
  writeFileSync(path.join(root, 'package.json'), '{"type":"module"}');
  writeFileSync(path.join(root, 'content/docs/index.mdx'), '# Fixture\n');
  symlinkSync(path.join(repoRoot, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  for (const relative of [
    'scripts/generate-legacy-redirects.mjs',
    'scripts/lib/legacy-redirect-literals.ts',
  ]) {
    copyFileSync(path.join(repoRoot, relative), path.join(root, relative));
  }
  const redirect = {
    source: "/legacy', destination: globalThis.__legacyRedirectInjection = 'injected",
    destination: "https://example.com/' + (globalThis.__legacyRedirectInjection = true) + '",
    permanent: true,
  };
  const source = path.join(root, 'vercel.json');
  writeFileSync(
    source,
    JSON.stringify({
      redirects: [redirect, { source: '/old-sdk', destination: '/sdk/reference' }],
    }),
  );
  const run = spawnSync(
    process.execPath,
    ['scripts/generate-legacy-redirects.mjs', '--source', source],
    { cwd: root, encoding: 'utf8', timeout: 15_000 },
  );
  assert.equal(run.status, 0, run.stderr);
  const result = await import(pathToFileURL(path.join(root, 'redirects.legacy.mjs')).href);
  assert.deepEqual(result.legacyRedirects, [redirect]);
  assert.equal('__legacyRedirectInjection' in globalThis, false);
});
