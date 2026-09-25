import { searchPath } from 'fumadocs-core/breadcrumb';
import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { type MetaData, type PageData, type VirtualFile, loader } from 'fumadocs-core/source';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import type { NavigationEntry, NavigationSection } from '../lib/docs-navigation-rules.ts';
import { buildDocsNavigation, docsNavigationTransformer } from '../lib/docs-navigation.ts';
import { readSections } from './lib/nav.ts';

/** The virtual files these tests hand `loader()`: pages may carry a `sidebar_label`. */
type TestFile = VirtualFile<{
  pageData: PageData & { sidebar_label?: string };
  metaData: MetaData;
}>;

const optionalOf = (value: unknown, type: 'string' | 'boolean'): boolean =>
  value === undefined || typeof value === type;

/** A parsed meta.json that has the shape fumadocs-core's `MetaData` declares. */
function isMetaData(value: unknown): value is MetaData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const meta: Record<string, unknown> = { ...value };
  return (
    optionalOf(meta.icon, 'string') &&
    optionalOf(meta.title, 'string') &&
    (optionalOf(meta.root, 'boolean') || typeof meta.root === 'string') &&
    (meta.pages === undefined ||
      (Array.isArray(meta.pages) && meta.pages.every((page) => typeof page === 'string'))) &&
    optionalOf(meta.pagesIndex, 'string') &&
    optionalOf(meta.defaultOpen, 'boolean') &&
    optionalOf(meta.collapsible, 'boolean') &&
    optionalOf(meta.description, 'string')
  );
}

function readMeta(url: URL): MetaData {
  const value: unknown = JSON.parse(readFileSync(url, 'utf8'));
  assert.ok(isMetaData(value), `${fileURLToPath(url)} is not a well-formed meta.json`);
  return value;
}

const isFolder = (node: Node | undefined): node is Folder => node?.type === 'folder';

/** The child folder of `parent` named `name`; fails the test when there is none. */
function childFolder(parent: Folder | undefined, name: string): Folder {
  const found = parent?.children.find((item) => item.name === name);
  assert.ok(isFolder(found), `no folder named ${name}`);
  return found;
}

/** `searchPath`, failing the test instead of returning `null` for a URL with no node. */
function pathTo(nodes: Node[], url: string): Node[] {
  const found = searchPath(nodes, url);
  assert.ok(found, `no tree node for ${url}`);
  return found;
}

const contentRoot = new URL('../content/docs/', import.meta.url);
const sections = readSections(
  fileURLToPath(new URL('../lib/docs-navigation.json', import.meta.url)),
);
const files: TestFile[] = readdirSync(contentRoot, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.mdx') || path.endsWith('meta.json'))
  .map((path): TestFile =>
    path.endsWith('.mdx')
      ? {
          type: 'page',
          path,
          data: { title: path, sidebar_label: path === 'oracles/DIA/dia.mdx' ? 'DIA' : undefined },
        }
      : { type: 'meta', path, data: readMeta(new URL(path, contentRoot)) },
  );
const source = loader({
  baseUrl: '/docs',
  source: { files },
  pageTree: {
    transformers: [docsNavigationTransformer(sections)],
  },
});
const tree = source.pageTree;
const roots = tree.children.filter((item): item is Folder => isFolder(item) && Boolean(item.root));
const section = (name: string): Folder | undefined => roots.find((item) => item.name === name);
const names = (folder: Folder | undefined): Node['name'][] => {
  assert.ok(folder, 'no such section');
  return folder.children.map((item) => item.name);
};
const owner = (url: string): Node['name'] | undefined =>
  searchPath(tree.children, url)?.findLast((item) => isFolder(item) && Boolean(item.root))?.name;

test('section landing pages belong to the section itself, not Additional guides', () => {
  for (const section of sections) {
    const path = pathTo(tree.children, `/docs/${section.id}`);
    assert.equal(path.length, 2, section.id);
    assert.equal(path[0].name, section.name);
    assert.equal(path[1].type, 'page');
  }
});

function visit(nodes: Node[], fn: (node: Node) => void): void {
  for (const node of nodes) {
    fn(node);
    if (node.type === 'folder') {
      if (node.index) fn(node.index);
      visit(node.children, fn);
    }
  }
}

test('all local pages remain navigable and have exactly one section owner', () => {
  const ownership = new Map<string, Set<Node['name']>>();
  for (const root of roots) {
    visit([root], (node) => {
      if (node.type !== 'page') return;
      const owners = ownership.get(node.url) ?? new Set();
      owners.add(root.name);
      ownership.set(node.url, owners);
    });
  }
  for (const page of source.getPages()) {
    assert.ok(searchPath(tree.children, page.url), `missing page ${page.url}`);
    if (page.url === '/docs') continue;
    assert.equal(ownership.get(page.url)?.size, 1, `ambiguous or absent owner for ${page.url}`);
  }
});

test('Get started restores the entry points and nests third-party docs and oracles', () => {
  assert.deepEqual(names(section('Get started')).slice(0, 17), [
    'Get started',
    'Arbitrum: introduction',
    'Build apps',
    'Arbitrum essentials',
    'Run an Arbitrum chain',
    'Run an Arbitrum node',
    'Arbitrum bridge',
    'How Arbitrum works',
    'Chain info',
    'Glossary',
    'Contribute',
    'FAQ',
    'Notices',
    'Audit reports',
    'Third-party docs',
    'DAO docs',
    'Prysm docs',
  ]);
  assert.equal(
    childFolder(section('Get started'), 'Third-party docs').children[0]?.name,
    'Oracles',
  );
  assert.equal(owner('/docs/oracles/chainlink/chainlink'), 'Get started');
  assert.equal(owner('/docs/chain-info'), 'Get started');
  const thirdParty = childFolder(section('Get started'), 'Third-party docs');
  assert.ok(
    thirdParty.children.some(
      (item) => isFolder(item) && item.$ref?.folder === 'third-party-docs/MetaMask',
    ),
  );
  assert.equal(pathTo(tree.children, '/docs/oracles/DIA/dia').at(-1)?.name, 'DIA');
});

test('Stylus follows the introduction, quickstart, fundamentals and guides learning sequence', () => {
  assert.deepEqual(names(section('Build apps with Stylus')).slice(0, 12), [
    'A gentle introduction',
    'Quickstart',
    'Fundamentals',
    'Guides',
    'CLI tools',
    'Best Practices',
    'Troubleshooting',
    'Concepts',
    'Advanced',
    'Reference',
    'Arbitrum essentials',
    'FAQ',
  ]);
});

test('chain configuration restores the original nested topics despite migrated file locations', () => {
  const chain = section('Run an Arbitrum chain');
  assert.deepEqual(names(chain).slice(0, 11), [
    'Overview',
    'Licensing',
    'FAQ',
    'Quickstart',
    'Chain configuration',
    'Deployment',
    'Integrations',
    'Migrate',
    'Operate',
    'Extend the protocol',
    'Run a node for an Arbitrum chain',
  ]);
  assert.deepEqual(names(childFolder(chain, 'Chain configuration')).slice(0, 6), [
    'Batch poster',
    'Costs',
    'Data availability',
    'Execution',
    'Sequencing',
    'Validation',
  ]);
});

test('cross-section shortcuts never steal their destination sidebar', () => {
  assert.equal(owner('/docs/stylus/quickstart'), 'Build apps with Stylus');
  assert.equal(
    owner('/docs/build-decentralized-apps/quickstart-solidity-remix'),
    'Build apps with Solidity',
  );
  assert.equal(owner('/docs/arbitrum-essentials/bridging/overview'), 'Arbitrum essentials');
  assert.equal(owner('/docs/run-a-node/run-full-node'), 'Run an Arbitrum node');
  visit(tree.children, (node) => {
    // A manifest `href` entry is a separator carrying a `url` (`NavigationReference`).
    if (
      node.type === 'separator' &&
      'url' in node &&
      typeof node.url === 'string' &&
      node.url.startsWith('/docs')
    ) {
      assert.ok(searchPath(tree.children, node.url), `unresolved shortcut ${node.url}`);
    }
  });
});

test('broken manifest entries fail instead of disappearing silently', () => {
  assert.throws(
    () =>
      buildDocsNavigation(tree, [
        {
          id: 'get-started',
          name: 'Get started',
          sourceFolders: ['get-started'],
          children: [{ page: '/docs/missing' }],
        },
      ]),
    /Navigation page does not exist/,
  );
});

// A URL claimed by two entries is the one broken shape `page()` cannot see, because both claims
// name a page that exists. The transformer rejects it up front so a dev server fails loudly, rather
// than leaving the reader a sidebar entry that opens a different page and the real page exiled to
// Additional guides. `pnpm nav:check` applies the same rule, but no gate runs during `pnpm dev`.
test('a page URL claimed by two manifest entries fails instead of rendering a wrong sidebar', () => {
  assert.throws(
    () =>
      buildDocsNavigation(tree, [
        {
          id: 'run-a-node',
          name: 'Run an Arbitrum node',
          sourceFolders: ['run-a-node'],
          children: [
            { name: 'Overview', page: '/docs/run-a-node/arbos-releases/overview' },
            { name: 'Elara (ArbOS 61)', page: '/docs/run-a-node/arbos-releases/overview' },
          ],
        },
      ]),
    /Navigation page claimed more than once: \/docs\/run-a-node\/arbos-releases\/overview \(Overview, Elara \(ArbOS 61\)\)/,
  );
});

test('the real manifest places every page that was falling into Additional guides', () => {
  // The six pages FS-2740 freed. Each was exiled because another entry had taken its URL.
  const placed = {
    '/docs/launch-arbitrum-chain/configuration/costs/parent-chain-data-fee-pricing':
      'Parent chain data fee pricing',
    '/docs/launch-arbitrum-chain/configuration/costs/priority-fees': 'Priority fees',
    '/docs/launch-arbitrum-chain/configuration/sequencer/sequencer-config-reference':
      'Sequencer configuration reference',
    '/docs/launch-arbitrum-chain/operate/error-index': 'Error index',
    '/docs/launch-arbitrum-chain/operate/sequencer-troubleshooting': 'Sequencer troubleshooting',
    '/docs/run-a-node/arbos-releases/arbos61': 'Elara (ArbOS 61)',
  };
  for (const [url, name] of Object.entries(placed)) {
    const path = searchPath(tree.children, url);
    assert.ok(path, `missing ${url}`);
    assert.equal(path.at(-1)?.name, name, url);
    assert.ok(
      !path.some((node) => node.name === 'Additional guides'),
      `${url} is still in Additional guides`,
    );
  }
});

// A page can set its own sidebar_label, and a manifest entry can rename that same page with its
// own `name`. Build a small synthetic source (rather than reusing the real content tree) so this
// case is exercised even when no page in content/docs happens to carry both right now.
function demoSource(children: NavigationEntry[]) {
  const files: TestFile[] = [
    { type: 'meta', path: 'demo/meta.json', data: { title: 'Demo' } },
    { type: 'page', path: 'demo/index.mdx', data: { title: 'Demo landing' } },
    {
      type: 'page',
      path: 'demo/sample.mdx',
      data: { title: 'Sample page', sidebar_label: 'From frontmatter' },
    },
  ];
  const sections: NavigationSection[] = [
    { id: 'demo', name: 'Demo', sourceFolders: ['demo'], children },
  ];
  return loader({
    baseUrl: '/docs',
    source: { files },
    pageTree: { transformers: [docsNavigationTransformer(sections)] },
  });
}

test("a manifest entry name wins over the page's own sidebar_label", () => {
  const tree = demoSource([{ page: '/docs/demo/sample', name: 'From manifest' }]).pageTree;
  const node = pathTo(tree.children, '/docs/demo/sample').at(-1);
  assert.equal(node?.name, 'From manifest');
});

test('sidebar_label applies when the manifest entry gives the page no explicit name', () => {
  const tree = demoSource([{ page: '/docs/demo/sample' }]).pageTree;
  const node = pathTo(tree.children, '/docs/demo/sample').at(-1);
  assert.equal(node?.name, 'From frontmatter');
});

/**
 * One URL, one page node (FS-2749). `searchPath` stops at the first node carrying a URL, so a
 * second node is never reached and the folder above it never gives that page its section. The
 * manifest rule FS-2740 added reads each section's `children`, which leaves two shapes it cannot
 * see, both covered here against the finished tree.
 */

test('the real navigation puts every page URL on exactly one tree node', () => {
  const places = new Map<string, string[]>();
  const walk = (nodes: Node[], trail: string): void => {
    for (const node of nodes) {
      if (node.type === 'page') places.set(node.url, [...(places.get(node.url) ?? []), trail]);
      if (node.type !== 'folder') continue;
      const next = `${trail} > ${node.name}`;
      if (node.index)
        places.set(node.index.url, [...(places.get(node.index.url) ?? []), `${next} (index)`]);
      walk(node.children, next);
    }
  };
  walk(tree.children, '');
  const repeated = [...places].filter(([, at]) => at.length > 1);
  assert.deepEqual(repeated, []);
  assert.equal(places.size, source.getPages().length);
});

test('a manifest entry claiming a section landing fails instead of building two nodes', () => {
  // The shape the real manifest carried until this ticket: Get started's first `children` entry
  // claimed `/docs/get-started`, which `buildDocsNavigation` also derives from the source folder's
  // index. Two nodes, one page, and `duplicateManifestPages` silent because it walks `children`.
  assert.throws(
    () => demoSource([{ name: 'Demo', page: '/docs/demo' }]).pageTree,
    /Navigation section landing claimed by a page entry: \/docs\/demo \(Demo in demo\)/,
  );
});

test('a section landing claimed from another section fails the same way', () => {
  // Measured on the real manifest: a `page` entry for `/docs/get-started` in the Notices section
  // passed both static rules while the transformer threw on the built tree. The static rule now
  // checks every section's landing against every section's children, so it fires first and names
  // the entry and the section holding it (FS-2749 review).
  const files: TestFile[] = [
    { type: 'meta', path: 'demo/meta.json', data: { title: 'Demo' } },
    { type: 'page', path: 'demo/index.mdx', data: { title: 'Demo landing' } },
    { type: 'meta', path: 'other/meta.json', data: { title: 'Other' } },
    { type: 'page', path: 'other/index.mdx', data: { title: 'Other landing' } },
  ];
  const sections: NavigationSection[] = [
    { id: 'demo', name: 'Demo', sourceFolders: ['demo'], children: [] },
    {
      id: 'other',
      name: 'Other',
      sourceFolders: ['other'],
      children: [{ name: 'Demo landing', page: '/docs/demo' }],
    },
  ];
  assert.throws(
    () =>
      loader({
        baseUrl: '/docs',
        source: { files },
        pageTree: { transformers: [docsNavigationTransformer(sections)] },
      }).pageTree,
    /Navigation section landing claimed by a page entry: \/docs\/demo \(Demo landing in other\)/,
  );
});

function folderSource(children: NavigationEntry[]) {
  const files: TestFile[] = [
    { type: 'meta', path: 'demo/meta.json', data: { title: 'Demo' } },
    { type: 'page', path: 'demo/index.mdx', data: { title: 'Demo landing' } },
    { type: 'meta', path: 'demo/guides/meta.json', data: { title: 'Guides' } },
    { type: 'page', path: 'demo/guides/first.mdx', data: { title: 'First guide' } },
  ];
  const sections: NavigationSection[] = [
    { id: 'demo', name: 'Demo', sourceFolders: ['demo'], children },
  ];
  return loader({
    baseUrl: '/docs',
    source: { files },
    pageTree: { transformers: [docsNavigationTransformer(sections)] },
  });
}

test('a page entry naming a page a folder entry already copied fails', () => {
  // `copyFolder` claims every page in the subtree, so nothing in the manifest is repeated and the
  // static rule returns zero. Measured on the real content with a `page` entry for
  // /docs/stylus/stylus-by-example/basic_examples/hello_world, already inside the Stylus Reference
  // group's `folder` entry: the transformer used to build it onto two nodes.
  assert.doesNotThrow(() => folderSource([{ folder: 'demo/guides' }]).pageTree);
  assert.throws(
    () =>
      folderSource([
        { folder: 'demo/guides' },
        { name: 'First guide', page: '/docs/demo/guides/first' },
      ]).pageTree,
    /Navigation page on more than one node: \/docs\/demo\/guides\/first/,
  );
});
