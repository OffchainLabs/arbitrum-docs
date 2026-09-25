'use client';

import { usePathname } from 'fumadocs-core/framework';
import type { Separator } from 'fumadocs-core/page-tree';
import { SidebarItem, SidebarSeparator, useFolderDepth } from 'fumadocs-ui/components/sidebar/base';

import type { NavigationReference } from '@/lib/docs-navigation';

/** Render cross-section links without adding duplicate page nodes to the navigation tree. */
export function SidebarNavigationReference({ item }: { item: Separator }) {
  const depth = useFolderDepth();
  const pathname = usePathname();
  if ('url' in item) {
    const { url } = item as NavigationReference;
    // A reference claims no page node, so nothing in the tree marks it as the current page and
    // `SidebarItem` leaves `active` false. For most references that is right: they point into
    // another section, and a reader standing on that page is looking at that section's sidebar, not
    // this one. Get started's own landing row is the exception this ticket created, and without
    // this it was the one row in the sidebar that stayed unlit under the reader's feet (FS-2749).
    // The three active classes are the notebook layout's own, from
    // `fumadocs-ui/layouts/notebook/slots/sidebar`.
    //
    // Both sides are compared with their trailing slash stripped, which is what Fumadocs'
    // `normalizeUrl` does before its own `searchPath` match. Exact equality happens to agree today,
    // because `trailingSlash` is unset, but under `trailingSlash: true` this row alone would stop
    // lighting up while every real page node kept working.
    const external = url.startsWith('https://');
    const trim = (p: string) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
    return (
      <SidebarItem
        href={url}
        active={!external && trim(pathname) === trim(url)}
        external={external}
        className="relative flex items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors [&_svg]:size-4 [&_svg]:shrink-0"
        style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
      >
        {item.name}
      </SidebarItem>
    );
  }
  return <SidebarSeparator>{item.name}</SidebarSeparator>;
}
