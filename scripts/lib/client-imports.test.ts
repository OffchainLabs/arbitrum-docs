/**
 * No client component may reach `lib/source.ts` or `collections/server`, directly or through any
 * module it imports. Either pulls the compiled content collection into the browser bundle, and the
 * build still succeeds, so nothing else notices (CLAUDE.md, INTERNALS.md#what-nothing-catches).
 *
 * This walks every module under `app/`, `components/` and `lib/` whose directive prologue contains
 * `'use client'`, follows its relative and `@/` runtime dependencies (the `tsconfig.json` alias)
 * transitively, and fails on a path that ends at a forbidden module.
 */
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { importSpecifiers, isClientModule } from './module-imports.ts';
import { toPosix, walk } from './partials.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_FILE = /\.(?:[cm]?tsx?|jsx?|mjs|cjs)$/;
const EXTENSIONS = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
  '/index.ts',
  '/index.tsx',
  '/index.js',
  '/index.jsx',
  '/index.mjs',
  '/index.cjs',
];
const FORBIDDEN_SPECIFIER = /^collections\/server(?:\.[cm]?[jt]s)?$/;

function resolveImport(specifier: string, fromAbs: string, root: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) base = path.join(root, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromAbs), specifier);
  else return null;
  // TypeScript permits emitted .js/.mjs/.cjs specifiers to point at TS source files.
  const replacements = base.endsWith('.js')
    ? [base.slice(0, -3) + '.ts', base.slice(0, -3) + '.tsx']
    : /\.[cm]js$/.test(base)
      ? [base.slice(0, -2) + 'ts']
      : [];
  for (const candidate of [...replacements, ...EXTENSIONS.map((ext) => base + ext)]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** A chain of repo-relative modules from `entry` to a forbidden import, or `null`. */
function forbiddenChain(entry: string, root = repoRoot): string[] | null {
  const forbiddenFile = path.join(root, 'lib', 'source.ts');
  const generatedDir = path.join(root, '.source') + path.sep;
  const seen = new Set<string>();
  const stack: { file: string; chain: string[] }[] = [{ file: entry, chain: [entry] }];
  while (stack.length) {
    const { file, chain } = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of importSpecifiers(readFileSync(file, 'utf8'), file)) {
      if (FORBIDDEN_SPECIFIER.test(specifier)) return [...chain, specifier];
      const target = resolveImport(specifier, file, root);
      if (target === null) continue;
      if (target === forbiddenFile || target.startsWith(generatedDir)) return [...chain, target];
      if (SOURCE_FILE.test(target)) stack.push({ file: target, chain: [...chain, target] });
    }
  }
  return null;
}

const rel = (abs: string): string =>
  path.isAbsolute(abs) ? toPosix(path.relative(repoRoot, abs)) : abs;

test('the graph reports direct and transitive forbidden dependency chains', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'client-imports-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files: Record<string, string> = {
    'lib/source.ts': 'export const source = {};',
    '.source/server.ts': 'export const docs = {};',
    'components/direct.tsx': "'use client'; const { source } = require('@/lib/source');",
    'components/transitive.tsx': "'use client'; import './helper.cjs';",
    'components/helper.cjs': "module.exports = require('@/lib/source');",
    'components/directives.tsx':
      "'use strict'; 'use client'; import { source } from '@/lib/source';",
    'components/bare.tsx': "'use client'; const docs = require('collections/server');",
    'components/alias.tsx': "'use client'; import { docs } from '@/.source/server';",
    'components/relative.tsx': "'use client'; import { docs } from '../.source/server';",
    'components/js-specifier.tsx': "'use client'; import './helper.js';",
    'components/helper.ts': "export { source } from '@/lib/source';",
    'components/safe.tsx':
      "'use client'; import type { source } from '@/lib/source'; import './cycle.cjs';",
    'components/cycle.cjs': "require('./safe.tsx'); // require('@/lib/source')",
  };
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  for (const [entry, expected] of [
    ['direct.tsx', ['components/direct.tsx', 'lib/source.ts']],
    ['transitive.tsx', ['components/transitive.tsx', 'components/helper.cjs', 'lib/source.ts']],
    ['directives.tsx', ['components/directives.tsx', 'lib/source.ts']],
    ['bare.tsx', ['components/bare.tsx', 'collections/server']],
    ['alias.tsx', ['components/alias.tsx', '.source/server.ts']],
    ['relative.tsx', ['components/relative.tsx', '.source/server.ts']],
    ['js-specifier.tsx', ['components/js-specifier.tsx', 'components/helper.ts', 'lib/source.ts']],
  ] as const) {
    const file = path.join(root, 'components', entry);
    assert.ok(isClientModule(readFileSync(file, 'utf8'), file), entry);
    assert.deepEqual(
      forbiddenChain(file, root)?.map((part) =>
        path.isAbsolute(part) ? toPosix(path.relative(root, part)) : part,
      ),
      expected,
      entry,
    );
  }
  assert.equal(forbiddenChain(path.join(root, 'components/safe.tsx'), root), null);
});

test("no 'use client' module reaches lib/source or collections/server", () => {
  const clients = ['app', 'components', 'lib']
    .flatMap((dir) => walk(path.join(repoRoot, dir), (p) => SOURCE_FILE.test(p)))
    .filter((abs) => isClientModule(readFileSync(abs, 'utf8'), abs));
  assert.ok(clients.length > 0, "found no 'use client' module; the walk is broken");
  const leaks = clients
    .map((abs) => forbiddenChain(abs))
    .filter((chain) => chain !== null)
    .map((chain) => chain.map(rel).join(' -> '));
  assert.deepEqual(leaks, []);
});
