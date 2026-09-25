import type { Folder, Item, Node, Root, Separator } from 'fumadocs-core/page-tree';
import type { ContentStorage } from 'fumadocs-core/source';

import {
  type NavigationEntry,
  type NavigationSection,
  duplicateManifestPages,
  sectionLandingClaims,
} from './docs-navigation-rules.ts';

/** A display-only link: unlike a page, it cannot claim the destination's sidebar root. */
export interface NavigationReference extends Separator {
  type: 'separator';
  url: string;
}

export function docsNavigationTransformer(sections: NavigationSection[]) {
  return {
    file(this: { storage: Pick<ContentStorage, 'read'> }, node: Item, filePath?: string) {
      const file = filePath ? this.storage.read(filePath) : undefined;
      const label = file && 'sidebar_label' in file.data ? file.data.sidebar_label : undefined;
      return typeof label === 'string' ? { ...node, name: label } : node;
    },
    root(this: { custom?: Record<string, unknown> }, tree: Root) {
      return this.custom?._fallback ? tree : buildDocsNavigation(tree, sections);
    },
  };
}

/**
 * Apply the editorial hierarchy to the loader's real page nodes. URLs, icons and page metadata
 * still come from the one source loader; the manifest only supplies order, groups and labels.
 * Unlisted local content stays reachable in an Additional guides group within its section.
 */
export function buildDocsNavigation(tree: Root, sections: NavigationSection[]): Root {
  // Two static reads of the manifest, ahead of the build, because each names the offending entries
  // and the finished-tree check below can only name tree positions. `pnpm nav:check` applies both,
  // but no gate runs during `pnpm dev` (FS-2740, FS-2749).
  //
  // A URL claimed by two `page` entries means one of them names a page it does not open, and that
  // page falls into Additional guides instead. Both URLs exist, so `page()` below never sees it.
  const duplicates = duplicateManifestPages(sections);
  if (duplicates.length > 0) {
    const detail = duplicates.map((d) => `${d.url} (${d.names.join(', ')})`).join('; ');
    throw new Error(`Navigation page claimed more than once: ${detail}`);
  }

  // A `page` entry naming a section's landing URL is the same mistake against the landing node this
  // function derives below, which is in no section's `children` for the rule above to see. The
  // claim can sit in any section, not only the one the landing belongs to.
  const landings = sectionLandingClaims(sections);
  if (landings.length > 0) {
    const detail = landings
      .map((l) => `${l.url} (${l.claims.map((c) => `${c.name} in ${c.section}`).join(', ')})`)
      .join('; ');
    throw new Error(`Navigation section landing claimed by a page entry: ${detail}`);
  }

  const pages = new Map<string, Item>();
  const folders = new Map<string, Folder>();
  const claimed = new Set<string>();
  let nextId = 0;
  const id = () => `navigation:${nextId++}`;

  function collect(nodes: Node[]) {
    for (const node of nodes) {
      if (node.type === 'page') pages.set(node.url, node);
      if (node.type === 'folder') {
        if (node.$ref) folders.set(node.$ref.folder, node);
        if (node.index) pages.set(node.index.url, node.index);
        collect(node.children);
      }
    }
  }
  collect(tree.children);

  function page(url: string, name?: string): Item {
    const original = pages.get(url);
    if (!original) throw new Error(`Navigation page does not exist: ${url}`);
    claimed.add(url);
    return { ...original, name: name ?? original.name };
  }

  function copyFolder(original: Folder): Folder {
    return {
      ...original,
      $id: id(),
      root: false,
      index: original.index ? page(original.index.url) : undefined,
      children: original.children.map((child) => {
        if (child.type === 'folder') return copyFolder(child);
        if (child.type === 'page') return page(child.url);
        return child;
      }),
    };
  }

  function entry(item: NavigationEntry): Node {
    if (item.folder) {
      const original = folders.get(item.folder);
      if (!original) throw new Error(`Navigation folder does not exist: ${item.folder}`);
      return copyFolder(original);
    }
    if (item.children) {
      return {
        type: 'folder',
        $id: id(),
        name: item.name,
        defaultOpen: item.defaultOpen,
        index: item.page ? page(item.page) : undefined,
        children: entries(item.children),
      };
    }
    if (item.href) {
      if (item.href.startsWith('/docs') && !pages.has(item.href)) {
        throw new Error(`Navigation reference does not exist: ${item.href}`);
      }
      const reference: NavigationReference = {
        type: 'separator',
        $id: id(),
        name: item.name ?? pages.get(item.href)?.name,
        url: item.href,
      };
      return reference;
    }
    if (item.page) return page(item.page, item.name);
    throw new Error(`Navigation entry needs a page, href, folder or children: ${item.name}`);
  }

  function entries(items: NavigationEntry[]): Node[] {
    return items.flatMap((item) => {
      const node = entry(item);
      if (item.flatten && node.type === 'folder') {
        return [...(node.index ? [node.index] : []), ...node.children];
      }
      return [node];
    });
  }

  const roots = sections.map((section): Folder => {
    const original = folders.get(section.id);
    if (!original) throw new Error(`Navigation section does not exist: ${section.id}`);
    // A meta.json can list index.mdx among its children instead of attaching it as `index`.
    // Keep that landing page on the section itself, never under Additional guides.
    const landing = original.index ?? pages.get(`/docs/${section.id}`);
    return {
      ...original,
      $id: id(),
      name: section.name,
      root: true,
      index: landing ? page(landing.url) : undefined,
      children: entries(section.children),
    };
  });

  // Wait until every explicit entry has claimed its page before collecting leftovers. A page
  // can move across source folders (e.g. chain configuration) without appearing twice.
  function remaining(nodes: Node[]): Node[] {
    return nodes.flatMap((node): Node[] => {
      if (node.type === 'page') return claimed.has(node.url) ? [] : [page(node.url)];
      if (node.type !== 'folder') return [];
      const index = node.index && !claimed.has(node.index.url) ? page(node.index.url) : undefined;
      const children = remaining(node.children);
      if (!index && children.length === 0) return [];
      return [{ ...node, $id: id(), root: false, index, children }];
    });
  }

  for (const [i, section] of sections.entries()) {
    const extras = section.sourceFolders.flatMap((folder) => {
      const original = folders.get(folder);
      if (!original) throw new Error(`Navigation source folder does not exist: ${folder}`);
      return remaining([...(original.index ? [original.index] : []), ...original.children]);
    });
    if (extras.length) {
      roots[i].children.push({
        type: 'folder',
        $id: id(),
        name: 'Additional guides',
        children: extras,
      });
    }
  }

  const built: Root = { ...tree, children: [...remaining(tree.children), ...roots] };
  assertOneNodePerUrl(built);
  return built;
}

/**
 * Fail when any URL ends up on more than one page node in the finished tree.
 *
 * This is the authority, and the two manifest reads above are a fast path that names entries rather
 * than positions. `searchPath` stops at the first page node carrying a URL, so a second node is
 * never reached and the folder above it never gives that page its section. Reading the finished tree
 * is what catches the shapes a static read of the manifest cannot see (FS-2749):
 *
 * - a `folder` entry expands through `copyFolder` and claims every page in the subtree, so a `page`
 *   entry elsewhere naming one of those URLs puts it on two nodes with nothing in the manifest
 *   repeated. Measured: a `page` entry for
 *   `/docs/stylus/stylus-by-example/basic_examples/hello_world`, already reached through the Stylus
 *   Reference group's `folder` entry, builds cleanly and lands on two nodes.
 * - the derived section landing, which the `sectionLandingClaims` read above covers exactly, so
 *   that one is caught twice on purpose: once with the entry name, once here.
 */
function assertOneNodePerUrl(tree: Root): void {
  const places = new Map<string, string[]>();
  const label = (node: Folder) => (typeof node.name === 'string' ? node.name : '(unnamed)');

  function walk(nodes: Node[], trail: string[]): void {
    for (const node of nodes) {
      if (node.type === 'page')
        places.set(node.url, [...(places.get(node.url) ?? []), trail.join(' > ')]);
      if (node.type !== 'folder') continue;
      const next = [...trail, label(node)];
      if (node.index) {
        const at = [...next, '(index)'].join(' > ');
        places.set(node.index.url, [...(places.get(node.index.url) ?? []), at]);
      }
      walk(node.children, next);
    }
  }
  walk(tree.children, []);

  const repeated = [...places].filter(([, at]) => at.length > 1);
  if (repeated.length === 0) return;
  const detail = repeated.map(([url, at]) => `${url} (${at.join(' | ')})`).join('; ');
  throw new Error(`Navigation page on more than one node: ${detail}`);
}
