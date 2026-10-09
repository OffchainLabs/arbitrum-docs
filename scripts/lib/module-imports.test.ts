import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importSpecifiers, isClientModule } from './module-imports.ts';

test('the scanner recognizes runtime dependencies across ESM and CommonJS syntax', () => {
  assert.deepEqual(
    importSpecifiers(
      [
        "import a from './a';",
        "import './side-effect.css';",
        "export { c } from '../c';",
        "export * from './all';",
        "export * as ns from './namespace';",
        "const d = await import('./d');",
        "const common = require('./common.cjs');",
        'function load() { return require(`./literal.cjs`); }',
        "import equals = require('./equals');",
        "import {\n  e,\n  f,\n} from 'collections/server';",
      ].join('\n'),
    ),
    [
      './a',
      './side-effect.css',
      '../c',
      './all',
      './namespace',
      './d',
      './common.cjs',
      './literal.cjs',
      './equals',
      'collections/server',
    ],
  );
});

test('comments and source examples are not dependencies', () => {
  assert.deepEqual(
    importSpecifiers(
      [
        "// import a from './line-comment';",
        "/* export * from './block-comment'; require('./comment'); */",
        'const example = "import a from \'./string\';";',
        "const example2 = `require('./template'); import('./template');`;",
        'const slash = "/*"; // string contents cannot hide the next import',
        "import a from './real';",
        'const expression = `value: ${require("./expression")}`;',
        'const element = <div>import a from "./jsx-text";</div>;',
      ].join('\n'),
    ),
    ['./real', './expression'],
  );
});

test('declaration-level type dependencies are erased; inline types retain side effects', () => {
  assert.deepEqual(
    importSpecifiers(
      [
        "import type { A } from './type';",
        "import { type B } from './inline-type';",
        "export type { C } from './export-type';",
        "export type * from './all-types';",
        "export { type D } from './inline-export-type';",
        "type Page = import('./type-expression').Page;",
        "import { type E, value } from './mixed-import';",
        "export { type F, value } from './mixed-export';",
      ].join('\n'),
    ),
    ['./inline-type', './inline-export-type', './mixed-import', './mixed-export'],
  );
  assert.deepEqual(importSpecifiers("import {} from './import'; export {} from './export';"), [
    './import',
    './export',
  ]);
});

test('the client directive can follow other leading directives, but not code', () => {
  for (const source of [
    "// note\n'use client';\nimport x from 'y';",
    "'use strict';\n/* note */\n'use client';\nimport x from 'y';",
    '#!/usr/bin/env node\n"use strict"\n"use client"\nexport const value = 1;',
  ])
    assert.equal(isClientModule(source), true, source);
  for (const source of [
    "import x from 'y';\n'use client';",
    "const value = 1;\n'use client';",
    "function f() { 'use client'; }",
    "// 'use client';\nexport const value = 1;",
    "'use client-side';",
    "('use client');",
  ])
    assert.equal(isClientModule(source), false, source);
});
