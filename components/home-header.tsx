'use client';

import Link from 'fumadocs-core/link';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { useHomeLayout } from 'fumadocs-ui/layouts/home';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { LinkItem } from 'fumadocs-ui/layouts/shared';
import { ChevronDown, Menu } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Fragment, useRef, useState } from 'react';

/**
 * Navbar for the home layout (landing page, 404), replacing Fumadocs' `slots.header`.
 *
 * Fumadocs ships two navbars. The docs pages use the notebook layout's header: a compact bar
 * whose `type: 'menu'` links open a small popover list. The home layout's header is a Radix
 * NavigationMenu whose menus open a full-width "mega menu" viewport of cards under the bar, with
 * the same `links` config. On this site that meant the landing page had a different navbar from
 * every docs page, and on the home hero the mega menu opened as a blurred, page-wide sheet.
 *
 * This slot renders the same `links` the notebook way: identical DOM shape to
 * `fumadocs-ui/layouts/notebook/slots/header` (`[data-header-body]`, title left, search in the
 * middle, links then controls on the right), so the navbar CSS in `app/global.css` keyed on
 * `[data-header-body]` applies to both. The popover logic below is copied from that file at
 * fumadocs-ui 16.15.9; re-diff it on a bump. The `id` stays `nd-nav` because Fumadocs' own styles
 * and the docs layout's `--fd-docs-row-1` sticky offsets key on `nd-subnav`, which this is not.
 *
 * Same popover behaviour as the notebook header: hover with a short delay opens, a freeze window
 * after each change stops the popover from fighting Radix's own click handling, and touch closes
 * the menu on selection. The notebook header is not reusable directly because it reads
 * `useNotebookLayout()`, which the home layout does not provide.
 *
 * The home layout has no sidebar, so below `md` a hamburger opens one popover listing every
 * link (menu children flattened under their heading), with the theme switch at the bottom.
 */
export function HomeHeader(props: ComponentProps<'header'>) {
  const { slots, navItems, menuItems } = useHomeLayout();
  const SearchFull = slots.searchTrigger ? slots.searchTrigger.full : null;
  const SearchSm = slots.searchTrigger ? slots.searchTrigger.sm : null;
  const ThemeSwitch = slots.themeSwitch || null;
  const NavTitle = slots.navTitle;

  return (
    <header
      id="nd-nav"
      {...props}
      className={[
        'sticky top-0 z-40 flex flex-col bg-fd-background/80 backdrop-blur-sm transition-colors',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div data-header-body="" className="flex h-14 gap-2 border-b px-4 md:px-6">
        <div className="flex flex-1 items-center">
          <NavTitle className="inline-flex items-center gap-2.5 font-semibold" />
        </div>
        {SearchFull ? (
          <SearchFull className="my-auto w-full max-w-sm rounded-xl ps-2.5 max-md:hidden" />
        ) : null}
        <div className="flex flex-1 items-center justify-end md:gap-2">
          <div className="flex items-center gap-6 empty:hidden max-lg:hidden">
            {navItems
              .filter((item) => item.type !== 'icon')
              .map((item, i) => (
                <NavbarLinkItem key={i} item={item} />
              ))}
          </div>
          <div className="flex items-center md:hidden">
            {SearchSm ? <SearchSm className="p-2" /> : null}
            <MobileMenu items={menuItems} themeSwitch={ThemeSwitch} />
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
            {ThemeSwitch ? <ThemeSwitch /> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavbarLinkItem({ item }: { item: LinkItemType }) {
  if (item.type === 'custom') return <>{item.children}</>;
  if (item.type === 'menu') return <NavbarLinkItemMenu item={item} />;
  return (
    <LinkItem
      item={item}
      className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary"
    >
      {item.text}
    </LinkItem>
  );
}

function NavbarLinkItemMenu({ item }: { item: Extract<LinkItemType, { type: 'menu' }> }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const freezeUntil = useRef<number | null>(null);
  const hoverDelay = 50;

  const delaySetOpen = (value: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = window.setTimeout(() => {
      setOpen(value);
      freezeUntil.current = Date.now() + 300;
    }, hoverDelay);
  };
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    delaySetOpen(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    delaySetOpen(false);
  };
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (freezeUntil.current === null || Date.now() >= freezeUntil.current) setOpen(value);
      }}
    >
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 p-1 text-sm text-fd-muted-foreground transition-colors has-data-[active=true]:text-fd-primary data-[state=open]:text-fd-accent-foreground focus-visible:outline-none"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {item.url ? (
          <Link href={item.url} external={item.external}>
            {item.text}
          </Link>
        ) : (
          item.text
        )}
        <ChevronDown className="size-3" />
      </PopoverTrigger>
      {/* Opaque for the same reason as MobileMenu below: on the landing page this opens over the
          hero gradient, where Fumadocs' translucent default leaves grey labels on blurred blue. */}
      <PopoverContent
        className="flex flex-col p-1 text-start text-fd-muted-foreground !bg-fd-popover"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {item.items.map((child, i) => {
          if (child.type === 'custom') return <Fragment key={i}>{child.children}</Fragment>;
          return (
            <LinkItem
              key={i}
              item={child}
              className="inline-flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4"
              onClick={() => {
                if (isTouchDevice()) setOpen(false);
              }}
            >
              {child.icon}
              {child.text}
            </LinkItem>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function MobileMenu({
  items,
  themeSwitch: ThemeSwitch,
}: {
  items: LinkItemType[];
  themeSwitch: React.FC | null;
}) {
  const [open, setOpen] = useState(false);
  const linkClass =
    'inline-flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Toggle Menu"
        className="-me-1.5 inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-5"
      >
        <Menu />
      </PopoverTrigger>
      {/* Opaque, unlike Fumadocs' translucent popover default: on the phone this sheet opens over
          the hero's gradient and slashes, where blurred navy behind grey text is not readable. */}
      <PopoverContent className="flex max-h-[80svh] w-[calc(100vw-2rem)] max-w-xs flex-col overflow-auto p-2 text-fd-muted-foreground !bg-fd-popover">
        {items.map((item, i) => {
          if (item.type === 'custom') return <Fragment key={i}>{item.children}</Fragment>;
          if (item.type === 'menu') {
            return (
              <div key={i} className="flex flex-col">
                <p className="p-2 text-xs font-medium text-fd-foreground uppercase">{item.text}</p>
                {item.items.map((child, j) => {
                  if (child.type === 'custom') return <Fragment key={j}>{child.children}</Fragment>;
                  return (
                    <LinkItem
                      key={j}
                      item={child}
                      className={`${linkClass} ps-4`}
                      onClick={() => setOpen(false)}
                    >
                      {child.icon}
                      {child.text}
                    </LinkItem>
                  );
                })}
              </div>
            );
          }
          return (
            <LinkItem
              key={i}
              item={item}
              className={linkClass}
              aria-label={item.type === 'icon' ? item.label : undefined}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.type === 'icon' ? null : item.text}
            </LinkItem>
          );
        })}
        {ThemeSwitch ? (
          <div className="mt-2 flex justify-end border-t pt-2">
            <ThemeSwitch />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
