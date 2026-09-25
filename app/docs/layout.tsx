import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';

import { SidebarCollapseButton } from '@/components/sidebar-collapse-button';
import { SidebarNavigationReference } from '@/components/sidebar-navigation-reference';
import { SidebarResourceLinks } from '@/components/sidebar-resource-links';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  const base = baseOptions();
  return (
    <DocsLayout
      {...base}
      // The key is load-bearing. fumadocs-ui's notebook Header builds
      // `[navTitle, nav.children]` as a literal array
      // (dist/layouts/notebook/slots/header.js). A literal array's own
      // elements are pre-validated when built, but this one crosses the
      // server-client boundary as a lazy reference and is checked only
      // once resolved, so a real key is what satisfies it. No gate opens
      // a browser, so nothing catches its removal.
      nav={{ ...base.nav, mode: 'top', children: <SidebarCollapseButton key="sidebar-collapse" /> }}
      // Suppresses the built-in collapse triggers only — the sidebar still
      // collapses. Collapse state lives in SidebarProvider and the edge-peek in
      // SidebarContent, neither of which reads this flag. SidebarCollapseButton
      // above replaces the trigger this removes from the navbar's right cluster.
      // `footer` pins Chain info, Glossary and Contribute under every
      // section tree. Keep shared links outside the page tree so they cannot
      // claim their destination's sidebar root.
      sidebar={{
        collapsible: false,
        footer: SidebarResourceLinks,
        components: { Separator: SidebarNavigationReference },
      }}
      tree={source.pageTree}
      // No root switcher. Fumadocs would otherwise render a dropdown above the tree listing every
      // manifest section, a second copy of the navbar's section list that let a reader hop between
      // main-menu sections from inside the sidebar. The navbar chooses the section; the sidebar
      // shows that section's tree, as the Docusaurus site did. Section roots still decide which
      // tree a page gets whether or not a switcher renders.
      tabs={false}
    >
      {children}
    </DocsLayout>
  );
}
