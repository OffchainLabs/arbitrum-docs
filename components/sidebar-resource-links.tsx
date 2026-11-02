'use client';

import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
} from 'fumadocs-ui/components/sidebar/base';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import jsonRpcMeta from '@/content/docs/json-rpc-spike/meta.json';
import { apiRefsMenu } from '@/lib/api-refs-menu';
import { sidebarResourceLinks } from '@/lib/shared';

/**
 * Chain info, Glossary and Contribute shortcuts shared by the section sidebars, plus the
 * "API Refs" menu: the JSON-RPC method pages grouped by namespace, read from the generated
 * `meta.json` of that folder so a regenerated reference updates the menu.
 * Keep these outside the page tree so they cannot claim their destination's sidebar root.
 *
 * Passed as a component: the notebook layout hides its default ReactNode footer container on
 * desktop when there are no icon links. We render our links separately, then retain that
 * container and its children for the mobile theme switch.
 */

// Copied from `itemVariants` in the notebook sidebar slot, so a footer entry is visually the same
// object as a tree entry: `link` for a page, `button` for a folder trigger, and the `highlight`
// bar of a nested page. The depth offsets are the slot's `getItemOffset(depth)` for depth 1.
const ITEM_BASE =
  'relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0';
const ITEM_CLASS = `${ITEM_BASE} transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors`;
const BUTTON_CLASS = `${ITEM_BASE} w-full transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none`;
const NESTED_ITEM_CLASS = `${ITEM_CLASS} ps-[calc(5*var(--spacing))] data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5`;

const API_REFS_BASE = '/json-rpc-spike';
const apiRefs = apiRefsMenu(jsonRpcMeta, API_REFS_BASE);

export function SidebarResourceLinks({ children, ...props }: ComponentProps<'div'>) {
  const pathname = usePathname();
  const insideApiRefs = pathname.startsWith(`${API_REFS_BASE}/`);

  return (
    <>
      <div className="flex flex-col gap-0.5 border-t p-2">
        {sidebarResourceLinks.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            data-active={pathname === link.url}
            className={ITEM_CLASS}
          >
            {link.text}
          </Link>
        ))}
        <SidebarFolder active={insideApiRefs}>
          <SidebarFolderTrigger className={BUTTON_CLASS}>API Refs</SidebarFolderTrigger>
          <SidebarFolderContent className="relative before:absolute before:inset-s-2.5 before:inset-y-1 before:w-px before:bg-fd-border before:content-['']">
            <div className="fd-scroll-container flex max-h-[40vh] flex-col gap-0.5 overflow-y-auto pt-0.5">
              {apiRefs.map((group) => (
                // The method names carry their namespace prefix, so a group is a gap, not a label.
                <div key={group.label} className="mt-3 flex flex-col gap-0.5 first:mt-0">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.url}
                      href={item.url}
                      active={pathname === item.url}
                      className={NESTED_ITEM_CLASS}
                    >
                      {item.text}
                    </SidebarItem>
                  ))}
                </div>
              ))}
            </div>
          </SidebarFolderContent>
        </SidebarFolder>
      </div>
      <div {...props}>{children}</div>
    </>
  );
}
