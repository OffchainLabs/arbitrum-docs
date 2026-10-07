import { DocsLayout as NotebookLayout } from 'fumadocs-ui/layouts/notebook';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { SidebarCollapseButton } from '@/components/sidebar-collapse-button';
import { SidebarResourceLinks } from '@/components/sidebar-resource-links';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

// `NEXT_PUBLIC_*` is inlined at build time, so this is a constant per build.
const DocsLayout =
  process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true'
    ? dynamic(() => import('@/components/ai/layout').then((m) => m.DocsLayout))
    : NotebookLayout;

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
      // Suppresses the built-in collapse triggers only. The sidebar still
      // collapses. Collapse state lives in SidebarProvider and the edge-peek in
      // SidebarContent, neither of which reads this flag. SidebarCollapseButton
      // above replaces the trigger this removes from the navbar's right cluster.
      // `footer` pins Chain info, Glossary and Contribute under every
      // section tree. Keep shared links outside the page tree so they cannot
      // claim their destination's sidebar root.
      sidebar={{ collapsible: false, footer: SidebarResourceLinks }}
      tree={source.pageTree}
      // No root switcher: the navbar chooses the section, and the sidebar shows the tree of the
      // `root: true` folder the current page sits in.
      tabs={false}
    >
      {children}
    </DocsLayout>
  );
}
