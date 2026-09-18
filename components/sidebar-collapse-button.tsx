'use client';

import { SidebarCollapseTrigger, useSidebar } from 'fumadocs-ui/components/sidebar/base';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

/**
 * Sidebar collapse toggle for the docs navbar, passed as `nav.children`.
 *
 * Sits in the header, not in the sidebar, so it survives the panel it controls.
 * When collapsed, the only other way back is the 16px invisible hover strip
 * fumadocs-ui draws at the viewport edge, which it ignores for touch pointers.
 *
 * Requires the SidebarProvider that DocsLayout mounts — `useSidebar()` throws
 * without it, so this must not be added to the nav options shared with
 * app/(home)/layout.tsx.
 */
export function SidebarCollapseButton() {
  const { collapsed } = useSidebar();
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <SidebarCollapseTrigger
      // Overrides the library's hardcoded "Collapse Sidebar", which does not
      // change with state. Placed after `...props` in SidebarCollapseTrigger,
      // so this wins.
      aria-label={label}
      title={label}
      className={buttonVariants({
        color: 'ghost',
        size: 'icon-sm',
        // `order-first` puts this before the nav title: the header renders
        // `nav.children` after the title in one shared flex row.
        // `max-md:hidden` because collapsing is desktop-only — mobile uses the
        // drawer trigger in the navbar's right cluster.
        className: 'order-first -ms-1.5 me-2 text-fd-muted-foreground max-md:hidden',
      })}
    >
      <Icon className="size-4.5" />
    </SidebarCollapseTrigger>
  );
}
