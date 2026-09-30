'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import { sidebarResourceLinks } from '@/lib/shared';

/**
 * Chain info, Glossary and Contribute shortcuts shared by the section sidebars.
 * Keep these outside the page tree so they cannot claim their destination's sidebar root.
 *
 * Passed as a component: the notebook layout hides its default ReactNode footer container on
 * desktop when there are no icon links. We render our links separately, then retain that
 * container and its children for the mobile theme switch.
 */

// Copied from `itemVariants({ variant: 'link' })` in the notebook sidebar slot, minus the depth
// offset, so a footer link is visually the same object as a tree link.
const ITEM_CLASS =
  'relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors';

export function SidebarResourceLinks({ children, ...props }: ComponentProps<'div'>) {
  const pathname = usePathname();

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
      </div>
      <div {...props}>{children}</div>
    </>
  );
}
