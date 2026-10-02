/**
 * No client component may reach `lib/source.ts` or `collections/server`, directly or through any
 * module it imports. Either pulls the compiled content collection into the browser bundle, and the
 * build still succeeds, so nothing else notices (CLAUDE.md, INTERNALS.md#what-nothing-catches).
 *
 * This walks every module under `app/`, `components/` and `lib/` whose first statement is a
 * `'use client'` directive, follows its relative and `@/` imports (the `tsconfig.json` alias)
 * transitively, and fails on a path that ends at a forbidden module.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { toPosix, walk } from './partials.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_FILE = /\.(?:tsx?|jsx?|mjs|cjs)$/;
const EXTENSIONS = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '/index.ts',
  '/index.tsx',
  '/index.js',
];
const FORBIDDEN_FILE = path.join(repoRoot, 'lib', 'source.ts');
const FORBIDDEN_SPECIFIER = /^collections\/server$/;

/** `'use client'` as the first statement, after comments. */
export function isClientModule(source: string): boolean {
  const code = source.replace(/^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, '');
  return /^['"]use client['"]/.test(code);
}

/** Every static, re-exported and dynamic import specifier in a module. */
export function importSpecifiers(source: string): string[] {
  // Blank string and comment contents would also hide real specifiers, so only comments go.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  const out: string[] = [];
  for (const m of code.matchAll(
    /(?:\bimport\s+(?:type\s+)?(?:[^'"()]*?\s+from\s+)?|\bexport\s+(?:type\s+)?[^'"()]*?\s+from\s+|\bimport\s*\(\s*)['"]([^'"]+)['"]/g,
  )) {
    out.push(m[1]);
  }
  return out;
}

function resolveImport(specifier: string, fromAbs: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) base = path.join(repoRoot, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromAbs), specifier);
  else return null;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** A chain of repo-relative modules from `entry` to a forbidden import, or `null`. */
function forbiddenChain(entry: string): string[] | null {
  const seen = new Set<string>();
  const stack: { file: string; chain: string[] }[] = [{ file: entry, chain: [entry] }];
  while (stack.length) {
    const { file, chain } = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of importSpecifiers(readFileSync(file, 'utf8'))) {
      if (FORBIDDEN_SPECIFIER.test(specifier)) return [...chain, specifier];
      const target = resolveImport(specifier, file);
      if (target === null) continue;
      if (target === FORBIDDEN_FILE) return [...chain, target];
      if (SOURCE_FILE.test(target)) stack.push({ file: target, chain: [...chain, target] });
    }
  }
  return null;
}

const rel = (abs: string): string =>
  path.isAbsolute(abs) ? toPosix(path.relative(repoRoot, abs)) : abs;

test('the import scanner sees every import form and the client directive', () => {
  assert.deepEqual(
    importSpecifiers(
      [
        "import a from './a';",
        "import type { B } from '@/b';",
        "import './side-effect.css';",
        "export { c } from '../c';",
        "const d = await import('./d');",
        "// import nope from './commented';",
        "import {\n  e,\n  f,\n} from 'collections/server';",
      ].join('\n'),
    ),
    ['./a', '@/b', './side-effect.css', '../c', './d', 'collections/server'],
  );
  assert.equal(isClientModule("// note\n'use client';\nimport x from 'y';"), true);
  assert.equal(isClientModule("import x from 'y';\n'use client';"), false);
});

test("no 'use client' module reaches lib/source or collections/server", () => {
  const clients = ['app', 'components', 'lib']
    .flatMap((dir) => walk(path.join(repoRoot, dir), (p) => SOURCE_FILE.test(p)))
    .filter((abs) => isClientModule(readFileSync(abs, 'utf8')));
  assert.ok(clients.length > 0, "found no 'use client' module; the walk is broken");
  const leaks = clients
    .map((abs) => forbiddenChain(abs))
    .filter((chain) => chain !== null)
    .map((chain) => chain.map(rel).join(' -> '));
  assert.deepEqual(leaks, []);
});
