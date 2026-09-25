/**
 * Tripwire for the build's last network dependency staying gone (FS-2750).
 *
 * `app/layout.tsx` used to declare `--font-code` with `JetBrains_Mono` from `next/font/google`,
 * which made every `next build` fetch that face's CSS from `fonts.googleapis.com` and six `woff2`
 * slices from `fonts.gstatic.com`. The loader retries three times and falls back to a local face
 * only in dev, so in a production build an outage throws, and CI caches only the pnpm store, so
 * every run refetched. That sat inside `Build`, which blocks merges since FS-2746, and inside the
 * `stylus` job in `upstream-refresh.yml`, where a Monday outage fails the run before its pull
 * request opens.
 *
 * The whole value of that change is the absence of one import, and an absence is exactly what no
 * other gate can see. Three files now carry an instruction not to write it back (the `build` job's
 * comment in `ci.yml`, the CLAUDE.md page-weight bullet, the INTERNALS.md CI paragraph), and an
 * instruction is not a gate. This is the gate. It costs milliseconds, needs no network and no
 * running site, so it runs in `pnpm test` and therefore in CI's blocking `Gates` job.
 *
 * Modelled on `scripts/lib/contribute-repo-links.test.ts`, which walks the content tree for the
 * same reason: a hand-maintained invariant that no other check can reach.
 *
 * Scope is every source directory that Next can compile into the app, which is where such an import
 * would have to live to take effect. `scripts/` is excluded on purpose: nothing there is bundled,
 * and this file names the module itself.
 *
 * It matches the module specifier only where it is quoted after `from`, `import` or `require`, not
 * anywhere the string appears. A plain substring search flags the comment in `app/layout.tsx` that
 * explains why the import is gone, which would make the tripwire unmaintainable. The cost is that a
 * comment quoting a real import line would false-positive, which is the harmless direction.
 *
 * The fix, if this ever fails, is never to loosen the assertion. Commit the face under
 * `public/fonts/` with its licence beside it and declare it with `next/font/local`. See INTERNALS.md
 * "Page weight and what loads late".
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { walk } from './partials.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Directories Next compiles into the app. An import anywhere else cannot reach a page. */
const SOURCE_DIRS = ['app', 'components', 'lib'];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);

const isSource = (file: string): boolean => SOURCE_EXTENSIONS.has(path.extname(file));

/** `from 'next/font/google'`, `import 'next/font/google'`, `require('next/font/google')`. */
const IMPORTS_GOOGLE_FONT = /(?:from|import|require)\s*\(?\s*['"`]next\/font\/google['"`]/;

function sourceFiles(): string[] {
  return SOURCE_DIRS.flatMap((dir) => walk(path.join(repoRoot, dir), isSource)).sort();
}

test('no source file imports next/font/google', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    if (IMPORTS_GOOGLE_FONT.test(source)) offenders.push(path.relative(repoRoot, file));
  }

  assert.deepEqual(
    offenders,
    [],
    `next/font/google is back in ${offenders.join(', ')}. It makes \`next build\` fetch the face ` +
      'from Google Fonts, which reintroduces a network dependency into the blocking `Build` job ' +
      'and into the weekly `stylus` job. Commit the face under public/fonts/ with its licence and ' +
      'declare it with next/font/local instead. See INTERNALS.md "Page weight and what loads late".',
  );
});

test('the walk actually reaches the layout that used to hold the import', () => {
  // Guards the assertion above against silently passing on an empty file list, which is how a
  // renamed directory or a broken filter turns a tripwire into a no-op.
  const files = sourceFiles().map((file) => path.relative(repoRoot, file));
  assert.ok(files.includes('app/layout.tsx'), 'app/layout.tsx was not walked');
  assert.ok(files.length > 50, `expected to walk the app, got ${files.length} files`);
});

test('the self-hosted code face and its licence are committed', () => {
  for (const asset of [
    'public/fonts/jetbrains-mono-latin.woff2',
    'public/fonts/jetbrains-mono-OFL.txt',
  ]) {
    assert.ok(
      readFileSync(path.join(repoRoot, asset)).length > 0,
      `${asset} is missing or empty; --font-code has nothing to load.`,
    );
  }
});
