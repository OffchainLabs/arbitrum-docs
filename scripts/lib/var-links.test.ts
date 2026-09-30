import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  MALFORMED_VAR_PLACEHOLDER,
  VAR_PLACEHOLDER,
  type VarLinksNode,
  type VarValues,
  expandVarPlaceholders,
  readVars,
  remarkVarLinks,
  varPlaceholderNames,
} from '../../lib/var-links.ts';

const VARS = { nitroRepositorySlug: 'nitro', nitroVersionTag: 'v3.11.3', arbOneChainId: 42161 };

const link = (url: string) => ({ type: 'link', url, children: [] });
const run = <T extends VarLinksNode>(tree: T, vars: VarValues = VARS): T => {
  remarkVarLinks({ vars })(tree);
  return tree;
};

test('expandVarPlaceholders substitutes every placeholder in one destination', () => {
  assert.equal(
    expandVarPlaceholders(
      'https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/x.go#L1',
      VARS,
    ),
    'https://github.com/OffchainLabs/nitro/blob/v3.11.3/x.go#L1',
  );
});

test('expandVarPlaceholders stringifies a non-string value', () => {
  assert.equal(expandVarPlaceholders('/chain/{var:arbOneChainId}', VARS), '/chain/42161');
});

test('expandVarPlaceholders leaves an unknown name alone for vars:check to report', () => {
  // Matches what `<Var>` does with an unknown name: the defect reaches the page and the gate fails,
  // rather than one typo throwing during a build that has not rendered anything yet.
  assert.equal(expandVarPlaceholders('/x/{var:nope}', VARS), '/x/{var:nope}');
});

test('expandVarPlaceholders leaves a URL whose braces are not placeholders alone', () => {
  const url = 'https://api.example.com/v1/{chainId}/blocks/{blockNumber}';
  assert.equal(expandVarPlaceholders(url, VARS), url);
});

test('expandVarPlaceholders ignores an inherited property name', () => {
  // `{var:toString}` must not resolve to Object.prototype.toString.
  assert.equal(expandVarPlaceholders('/x/{var:toString}', VARS), '/x/{var:toString}');
});

test('expandVarPlaceholders passes a non-string url straight through', () => {
  assert.equal(expandVarPlaceholders(undefined, VARS), undefined);
});

test('varPlaceholderNames lists names in source order, duplicates kept', () => {
  assert.deepEqual(
    varPlaceholderNames('{var:nitroRepositorySlug}/{var:nitroVersionTag}/{var:nitroVersionTag}'),
    ['nitroRepositorySlug', 'nitroVersionTag', 'nitroVersionTag'],
  );
});

test('MALFORMED_VAR_PLACEHOLDER matches only a placeholder that can never expand', () => {
  const malformed = (s: string): string[] =>
    [...s.matchAll(MALFORMED_VAR_PLACEHOLDER)].map((m) => m[0]);
  assert.deepEqual(malformed('{var:} and {var:two words} and {var:9lives}'), [
    '{var:}',
    '{var:two words}',
    '{var:9lives}',
  ]);
  assert.deepEqual(malformed('{var:nitroVersionTag} {chainId}'), []);
});

test('the placeholder pattern is anchored to the var: prefix', () => {
  assert.deepEqual([...'{nitroVersionTag}'.matchAll(VAR_PLACEHOLDER)], []);
});

test('remarkVarLinks rewrites link urls', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [link('https://x/{var:nitroRepositorySlug}/y')] }],
  };
  assert.equal(run(tree).children[0].children[0].url, 'https://x/nitro/y');
});

test('remarkVarLinks rewrites a definition url too', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'definition', identifier: 'r', url: 'https://x/{var:nitroVersionTag}' }],
  };
  assert.equal(run(tree).children[0].url, 'https://x/v3.11.3');
});

test('remarkVarLinks rewrites href, to and src on a JSX element', () => {
  const attrs = ['href', 'to', 'src'].map((name) => ({
    type: 'mdxJsxAttribute',
    name,
    value: 'https://x/{var:nitroVersionTag}',
  }));
  const tree = {
    type: 'root',
    children: [{ type: 'mdxJsxFlowElement', name: 'ImageZoom', attributes: attrs, children: [] }],
  };
  for (const a of run(tree).children[0].attributes) assert.equal(a.value, 'https://x/v3.11.3');
});

test('remarkVarLinks leaves other attributes and expression attributes alone', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'mdxJsxTextElement',
        name: 'Thing',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'title', value: 'v{var:nitroVersionTag}' },
          {
            type: 'mdxJsxAttribute',
            name: 'href',
            value: { type: 'mdxJsxAttributeValueExpression', value: 'url' },
          },
          { type: 'mdxJsxExpressionAttribute', value: '...rest' },
        ],
        children: [],
      },
    ],
  };
  const [title, href, spread] = run(tree).children[0].attributes;
  assert.equal(title.value, 'v{var:nitroVersionTag}');
  assert.ok(typeof href.value === 'object', 'the expression attribute value is still an object');
  assert.equal(href.value.value, 'url');
  assert.equal(spread.value, '...rest');
});

test('remarkVarLinks reaches a link nested several levels down', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [link('https://x/{var:nitroRepositorySlug}')] },
            ],
          },
        ],
      },
    ],
  };
  assert.equal(run(tree).children[0].children[0].children[0].children[0].url, 'https://x/nitro');
});

test('remarkVarLinks defaults to the real content/vars.json', () => {
  // No `vars` argument: the plugin has to find the file itself, from its own location rather than
  // from the working directory, because source.config.ts and check-links run from different places.
  const vars = readVars();
  assert.equal(typeof vars.nitroRepositorySlug, 'string');
  const tree = { type: 'root', children: [link('https://x/{var:nitroRepositorySlug}')] };
  remarkVarLinks()(tree);
  assert.equal(tree.children[0].url, `https://x/${vars.nitroRepositorySlug}`);
});

test('remarkVarLinks rewrites an image destination', () => {
  // Only ever reached by a remote src. Fumadocs runs its own remark-image before this plugin, so a
  // local src has already become an import of the written path by the time the tree gets here, and
  // a placeholder in one fails the build on a missing file instead of expanding.
  const tree = {
    type: 'root',
    children: [{ type: 'image', url: 'https://x/{var:nitroVersionTag}/i.png', alt: 'a' }],
  };
  assert.equal(run(tree).children[0].url, 'https://x/v3.11.3/i.png');
});

test('remarkVarLinks rewrites a link title, and leaves a link without one untouched', () => {
  const children: VarLinksNode[] = [
    { type: 'link', url: 'https://x/y', title: 'Nitro {var:nitroVersionTag}', children: [] },
    link('https://x/{var:nitroVersionTag}'),
  ];
  const tree = { type: 'root', children };
  const [titled, plain] = run(tree).children;
  assert.equal(titled.title, 'Nitro v3.11.3');
  assert.equal(plain.title, undefined);
});
