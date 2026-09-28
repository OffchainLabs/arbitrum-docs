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
 * Navbar for the home layout (landing page, 404), passed as `slots.header`, so these pages share
 * the docs pages' notebook navbar instead of the home layout's mega menu.
 *
 * The DOM shape matches `fumadocs-ui/layouts/notebook/slots/header` (`[data-header-body]`), so the
 * navbar CSS in `app/global.css` styles both. The popover logic is copied from that file at
 * fumadocs-ui 16.15.9; re-diff it on a bump. The notebook header itself cannot be reused because
 * it reads `useNotebookLayout()`. Below `md` a hamburger opens one popover listing every link.
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
      {/* Opaque, unlike Fumadocs' translucent default, because it opens over the hero. */}
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
      {/* Opaque, unlike Fumadocs' translucent default, because it opens over the hero. */}
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
