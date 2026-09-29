/**
 * The sidebar is built by Fumadocs from the `meta.json` files under content/docs. Three mistakes in
 * those files render without an error: a page that no `meta.json` reaches is missing from the
 * sidebar, a `[Title](/docs/...)` link entry puts a real page on a second node, and a page outside
 * every `root: true` folder gets no section sidebar. This test builds the real tree and fails on
 * each.
 */
import { searchPath } from 'fumadocs-core/breadcrumb';
import type { Node } from 'fumadocs-core/page-tree';
import { loader } from 'fumadocs-core/source';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { posix } from 'node:path';
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
const source = loader({ baseUrl: '/docs', source: { files } });
const tree = source.pageTree;

/** The `meta.json` that lists a page, and the entry it takes there (a folder index is its folder). */
function listing(pagePath: string): { meta: string; entry: string } {
  const dir = posix.dirname(pagePath);
  const base = posix.basename(pagePath).replace(/\.mdx$/, '');
  if (base !== 'index') return { meta: posix.join('content/docs', dir, 'meta.json'), entry: base };
  const parent = posix.dirname(dir);
  return { meta: posix.join('content/docs', parent, 'meta.json'), entry: posix.basename(dir) };
}

/** Every `[Label](url)` link entry in a `meta.json` `pages` list that names `url`. */
function linkEntries(url: string): string[] {
  return files.flatMap((file) => {
    if (file.type !== 'meta' || !Array.isArray(file.data.pages)) return [];
    return file.data.pages
      .filter((entry: unknown) => typeof entry === 'string' && entry.endsWith(`](${url})`))
      .map((entry: string) => `content/docs/${file.path}: remove the "${entry}" entry`);
  });
}

test('every page is on exactly one sidebar node', () => {
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
  const problems = source.getPages().flatMap((page) => {
    const nodes = count.get(page.url) ?? 0;
    if (nodes === 1) return [];
    if (nodes === 0) {
      const { meta, entry } = listing(page.path);
      return [
        `${meta}: add "${entry}" to "pages" (content/docs/${page.path} is on no sidebar node)`,
      ];
    }
    const entries = linkEntries(page.url);
    return entries.length
      ? entries.map((e) => `${e} (content/docs/${page.path} is on ${nodes} sidebar nodes)`)
      : [`content/docs/${page.path} is on ${nodes} sidebar nodes; find the extra meta.json entry`];
  });
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every page except the docs index sits in a section', () => {
  const orphans = source
    .getPages()
    .filter((page) => page.url !== '/docs')
    .filter((page) => {
      // A page on no node at all is reported by the test above, with the meta.json to fix.
      const trail = searchPath(tree.children, page.url);
      return trail !== null && !trail.some((n) => n.type === 'folder' && n.root);
    });
  const problems = orphans.map(
    (page) =>
      `content/docs/${page.path}: not inside a section; move it under a folder whose meta.json has "root": true`,
  );
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});
