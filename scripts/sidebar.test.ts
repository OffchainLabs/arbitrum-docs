/**
 * The sidebar is built by Fumadocs from the `meta.json` files under content/docs. Three mistakes in
 * those files render without an error: a page that no `meta.json` reaches is missing from the
 * sidebar, a `[Title](/...)` link entry puts a real page on a second node, and a page outside
 * every `root: true` folder gets no section sidebar. This test builds the real tree and fails on
 * each.
 */
import { searchPath } from 'fumadocs-core/breadcrumb';
import type { Node } from 'fumadocs-core/page-tree';
import { loader } from 'fumadocs-core/source';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../content/docs/', import.meta.url);
const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.mdx') || path.endsWith('meta.json'))
  .map((path) =>
    path.endsWith('.mdx')
      ? { type: 'page' as const, path, data: { title: path } }
      : {
          type: 'meta' as const,
          path,
          data: JSON.parse(readFileSync(new URL(path, root), 'utf8')),
        },
  );
const source = loader({ baseUrl: '/', source: { files } });
const tree = source.pageTree;

test('every article is on exactly one sidebar node; the root overview is hidden', () => {
  const count = new Map<string, number>();
  const visit = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type === 'page') count.set(node.url, (count.get(node.url) ?? 0) + 1);
      if (node.type !== 'folder') continue;
      if (node.index) count.set(node.index.url, (count.get(node.index.url) ?? 0) + 1);
      visit(node.children);
    }
  };
  visit(tree.children);
  assert.equal(count.get('/'), undefined);
  const wrong = source.getPages().filter((page) => page.url !== '/' && count.get(page.url) !== 1);
  assert.deepEqual(
    wrong.map((page) => `${page.path}: ${count.get(page.url) ?? 0} nodes`),
    [],
  );
});

test('every page except the docs index sits in a section', () => {
  const orphans = source
    .getPages()
    .filter((page) => page.url !== '/')
    .filter(
      (page) => !searchPath(tree.children, page.url)?.some((n) => n.type === 'folder' && n.root),
    );
  assert.deepEqual(
    orphans.map((page) => page.path),
    [],
  );
});
