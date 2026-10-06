/**
 * Tripwire: no module Next compiles imports `next/font/google`.
 *
 * That loader makes every `next build` fetch the face's CSS and files from Google Fonts, so an
 * outage fails the build, and CI refetches on every run. Fonts are self-hosted under
 * `public/fonts/` and declared with `next/font/local` (CLAUDE.md, INTERNALS.md "Page weight and
 * what loads late"). The value of that rule is the absence of one import, and an absence is what
 * no other gate sees. The build succeeds while online, so CI would not notice.
 *
 * Scope is `app/`, `components/` and `lib/`, where such an import would have to live to take
 * effect. `scripts/` is excluded: nothing there is bundled, and this file names the module.
 *
 * Runtime dependencies are parsed as code, so a comment or string that explains the rule does
 * not trip it. If this fails, do not loosen it: commit the
 * face under `public/fonts/` with its licence and declare it with `next/font/local`.
 *
 * Restored from `e44535358^:scripts/lib/fonts.test.ts` (first two tests), review 10.11.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { importSpecifiers } from './module-imports.ts';
import { walk } from './partials.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Directories Next compiles into the app. An import anywhere else cannot reach a page. */
const SOURCE_DIRS = ['app', 'components', 'lib'];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

const isSource = (file: string): boolean => SOURCE_EXTENSIONS.has(path.extname(file));

function importsGoogleFont(source: string, filename?: string): boolean {
  return importSpecifiers(source, filename).includes('next/font/google');
}

function sourceFiles(): string[] {
  return SOURCE_DIRS.flatMap((dir) => walk(path.join(repoRoot, dir), isSource)).sort();
}

test('no source file imports next/font/google', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    if (importsGoogleFont(source, file)) offenders.push(path.relative(repoRoot, file));
  }

  assert.deepEqual(
    offenders,
    [],
    `next/font/google is back in ${offenders.join(', ')}. It makes \`next build\` fetch the face ` +
      'from Google Fonts, which puts a network dependency back into every build. Commit the face under public/fonts/ with its licence and ' +
      'declare it with next/font/local instead. See INTERNALS.md "Page weight and what loads late".',
  );
});

test('the font gate catches runtime imports while allowing comments and source examples', () => {
  for (const source of [
    "import { Inter } from 'next/font/google';",
    "import 'next/font/google';",
    "export { Inter } from 'next/font/google';",
    "const font = import('next/font/google');",
    "const font = require('next/font/google');",
  ])
    assert.equal(importsGoogleFont(source), true, source);
  for (const source of [
    "// Do not use: import { Inter } from 'next/font/google';\nexport const value = 1;",
    "/* import 'next/font/google'; require('next/font/google'); */",
    'const example = "import { Inter } from \'next/font/google\';";',
    "const example = `require('next/font/google');`;",
    "import { font } from 'next/font/local';",
  ])
    assert.equal(importsGoogleFont(source), false, source);
});

test('the walk actually reaches the layout that used to hold the import', () => {
  // Guards the assertion above against silently passing on an empty file list, which is how a
  // renamed directory or a broken filter turns a tripwire into a no-op.
  const files = sourceFiles().map((file) => path.relative(repoRoot, file));
  assert.ok(files.includes('app/layout.tsx'), 'app/layout.tsx was not walked');
  assert.ok(files.length > 50, `expected to walk the app, got ${files.length} files`);
});
