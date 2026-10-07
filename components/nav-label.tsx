'use client';

import type * as PageTree from 'fumadocs-core/page-tree';
import { useTreePath } from 'fumadocs-ui/contexts/tree';

function contains(folder: PageTree.Folder, urls: string[]): boolean {
  if (folder.index && urls.includes(folder.index.url)) return true;
  return folder.children.some((node) =>
    node.type === 'folder' ? contains(node, urls) : node.type === 'page' && urls.includes(node.url),
  );
}

/* Marks a top nav item active when the current page sits in the same sidebar section (the
   outermost `root` folder) as any of `sections`, so pages a meta.json pulls in from elsewhere
   highlight the section they are listed under. */
export function NavLabel({ sections, children }: { sections: string[]; children: string }) {
  const root = useTreePath().find(
    (node): node is PageTree.Folder => node.type === 'folder' && node.root === true,
  );
  const active = root ? contains(root, sections) : false;
  return (
    <span data-active={active} aria-current={active ? 'location' : undefined}>
      {children}
    </span>
  );
}
