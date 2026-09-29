import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkVarReferences, varReferences } from './vars-check.ts';

const vars = { nitroVersionTag: 'v3.11.4', docsRepositoryUrl: 'https://github.com/x/y' };

test('a known <Var> and {var:} placeholder pass', () => {
  const source =
    'Run <Var name="nitroVersionTag" />, see [repo]({var:docsRepositoryUrl}/issues).\n';
  assert.deepEqual(checkVarReferences('a.mdx', source, vars), []);
  assert.deepEqual(
    varReferences(source).map((r) => r.name),
    ['nitroVersionTag', 'docsRepositoryUrl'],
  );
});

test('an unknown name is reported with its file and line', () => {
  assert.deepEqual(
    checkVarReferences(
      'a.mdx',
      'Intro.\n\nRun <Var name="noSuchKey" /> and {var:alsoMissing}.\n',
      vars,
    ),
    [
      'a.mdx:3  "noSuchKey" is not a key in content/vars.json',
      'a.mdx:3  "alsoMissing" is not a key in content/vars.json',
    ],
  );
});

test('a <Var> tag split across lines is read, and reported on the line it opens', () => {
  const source = ['Intro.', '', 'Run <Var', '  name="noSuchKeyAnywhere"', '/> now.', ''].join('\n');
  assert.deepEqual(checkVarReferences('a.mdx', source, vars), [
    'a.mdx:3  "noSuchKeyAnywhere" is not a key in content/vars.json',
  ]);
  const known = ['<Var', "  name='nitroVersionTag'", '/>'].join('\n');
  assert.deepEqual(checkVarReferences('a.mdx', known, vars), []);
});

test('a <Var> with no static name is reported', () => {
  assert.deepEqual(checkVarReferences('a.mdx', '<Var name={key} />\n', vars), [
    'a.mdx:1  <Var> without a static name',
  ]);
});
