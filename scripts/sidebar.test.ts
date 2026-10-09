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
const source = loader({ baseUrl: '/', source: { files } });
const tree = source.pageTree;

/** The `pages` list of every `meta.json`, by its folder (`.` for content/docs itself). */
const metaPages = new Map<string, unknown[]>(
  files.flatMap((file) =>
    file.type === 'meta' && Array.isArray(file.data.pages)
      ? [[posix.dirname(file.path), file.data.pages as unknown[]]]
      : [],
  ),
);

/**
 * The `meta.json` that fails to list a page, and the entry to add there. A page reaches the sidebar
 * through a chain: its own folder's `meta.json` lists it (a folder index is its folder), that
 * folder's parent lists the folder, and so on up to content/docs. A folder with no `meta.json`
 * lists everything, and `...` lists every unlisted sibling, so the chain breaks at the first
 * `meta.json` that exists and names neither the entry nor `...`. Naming that file matters: for a
 * page in a new sub-folder the fix is one entry in the parent's `meta.json`, not a file in the
 * sub-folder.
 */
export function listing(
  pagePath: string,
  metas: ReadonlyMap<string, unknown[]> = metaPages,
): { meta: string; entry: string } {
  let dir = posix.dirname(pagePath);
  let entry = posix.basename(pagePath).replace(/\.mdx$/, '');
  if (entry === 'index') {
    entry = posix.basename(dir);
    dir = posix.dirname(dir);
  }
  for (;;) {
    const pages = metas.get(dir);
    const listed = pages === undefined || pages.includes(entry) || pages.includes('...');
    if (!listed || dir === '.')
      return { meta: posix.join('content/docs', dir, 'meta.json'), entry };
    entry = posix.basename(dir);
    dir = posix.dirname(dir);
  }
}

test('listing names the meta.json whose pages list breaks the chain', () => {
  const metas = new Map<string, unknown[]>([
    ['.', ['launch']],
    ['launch', ['costs']],
    ['launch/costs', ['gas-target']],
    ['launch/costs/dac', ['...']],
  ]);
  // The page's own folder lists it; the parent does not list the folder.
  assert.deepEqual(listing('launch/costs/dac/setup.mdx', metas), {
    meta: 'content/docs/launch/costs/meta.json',
    entry: 'dac',
  });
  // No meta.json in the sub-folder lists everything, so the break is still the parent.
  assert.deepEqual(listing('launch/costs/zzsub/page.mdx', metas), {
    meta: 'content/docs/launch/costs/meta.json',
    entry: 'zzsub',
  });
  // The page's own folder omits it.
  assert.deepEqual(listing('launch/costs/fees.mdx', metas), {
    meta: 'content/docs/launch/costs/meta.json',
    entry: 'fees',
  });
  // A folder index is its folder, listed by the grandparent.
  assert.deepEqual(listing('launch/ops/index.mdx', metas), {
    meta: 'content/docs/launch/meta.json',
    entry: 'ops',
  });
});

/** Every `[Label](url)` link entry in a `meta.json` `pages` list that names `url`. */
function linkEntries(url: string): string[] {
  return files.flatMap((file) => {
    if (file.type !== 'meta' || !Array.isArray(file.data.pages)) return [];
    return file.data.pages
      .filter((entry: unknown) => typeof entry === 'string' && entry.endsWith(`](${url})`))
      .map((entry: string) => `content/docs/${file.path}: remove the "${entry}" entry`);
  });
}

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
  const problems = source
    .getPages()
    .filter((page) => page.url !== '/')
    .flatMap((page) => {
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
        : [
            `content/docs/${page.path} is on ${nodes} sidebar nodes; find the extra meta.json entry`,
          ];
    });
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every page except the docs index sits in a section', () => {
  const orphans = source
    .getPages()
    .filter((page) => page.url !== '/')
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
