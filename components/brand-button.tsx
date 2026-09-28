import Link from 'fumadocs-core/link';
import type { ComponentProps } from 'react';

/**
 * The arbitrum.io pill button. `primary` is filled, `secondary` outlined; `onDark` switches to the
 * white variants for a navy or gradient panel. Every variant shares the cyan-glow hover.
 */
export function BrandButton({
  mode = 'primary',
  onDark = false,
  arrow = true,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  mode?: 'primary' | 'secondary';
  onDark?: boolean;
  arrow?: boolean;
}) {
  // Each variant owns its border colour: two border-colour classes in one list are ordered by
  // Tailwind's sort, not by their position in the string.
  const surface = {
    primary: onDark
      ? 'border-transparent bg-white text-black hover:bg-arbitrum-cyan hover:text-arbitrum-navy active:bg-arbitrum-navy active:text-arbitrum-cyan'
      : 'border-transparent bg-black text-white hover:bg-arbitrum-navy hover:text-arbitrum-cyan active:bg-arbitrum-cyan active:text-arbitrum-navy dark:bg-white dark:text-black dark:hover:bg-arbitrum-navy dark:hover:text-arbitrum-cyan',
    secondary: onDark
      ? 'border-white/20 bg-white/15 text-white hover:border-transparent hover:bg-arbitrum-cyan hover:text-arbitrum-navy active:bg-arbitrum-navy active:text-arbitrum-cyan'
      : 'border-black/20 bg-transparent text-fd-foreground hover:border-transparent hover:bg-arbitrum-cyan hover:text-arbitrum-navy active:bg-arbitrum-navy active:text-arbitrum-cyan dark:border-white/20',
  }[mode];

  return (
    <Link
      {...props}
      className={[
        'inline-flex min-h-11 min-w-20 items-center justify-center gap-2 rounded-[40px] border px-5 py-2 text-sm font-medium leading-none backdrop-blur transition duration-300 hover:shadow-button-glow',
        surface,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {arrow ? (
        <svg
          aria-hidden
          viewBox="0 0 65 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-6 shrink-0"
        >
          <path
            d="M42.5682 34.2285H18.4102V32.2285H42.5682L30.9842 20.6445L32.4102 19.2285L46.4102 33.2285L32.4102 47.2285L30.9842 45.8125L42.5682 34.2285Z"
            fill="currentColor"
          />
        </svg>
      ) : null}
    </Link>
  );
}
