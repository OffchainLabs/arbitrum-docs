import Link from 'fumadocs-core/link';

import { appName } from '@/lib/shared';

/**
 * Site footer.
 *
 * Fumadocs has no footer slot — neither `BaseLayoutProps` nor the home/notebook
 * layouts expose one, and upstream ships no `<footer>` anywhere. The documented
 * placement is a sibling of the layout inside the `flex flex-col min-h-screen`
 * body, which is where `app/layout.tsx` renders it. It must NOT go inside
 * `DocsLayout`: that container is a named-area CSS grid, so an unplaced child is
 * auto-placed into the gutter cell beside the navbar (and `overflow-x-clip`
 * would trim it).
 *
 * Content mirrors arbitrum-docs `docusaurus.config.js` `themeConfig.footer`.
 * Styling mirrors arbitrum-website `components/footer/footer.tsx`: the
 * navy-to-black `bg-footer` gradient, uppercase 12px type, `white/50` column
 * labels, and links that slide right to reveal a glowing cyan hexagon on hover.
 * The site's footer is dark on a light page, so this one renders identically in
 * both colour modes and uses brand tokens (`arbitrum-*`), not theme tokens (`fd-*`).
 */

interface FooterLink {
  text: string;
  url: string;
}

/** Same `{ text, url }` shape as the navbar items in `lib/layout.shared.tsx`. */
const columns: { title: string; items: FooterLink[] }[] = [
  {
    title: 'Ecosystem',
    items: [
      { text: 'Arbitrum.io', url: 'https://arbitrum.io/' },
      { text: 'Arbitrum chains', url: 'https://arbitrum.io/launch-chain' },
      { text: 'Arbitrum Foundation', url: 'https://arbitrum.foundation/' },
      // Served from public/; exempted from locale rewriting in proxy.ts.
      { text: 'Arbitrum whitepaper', url: '/nitro-whitepaper.pdf' },
    ],
  },
  {
    title: 'Products',
    items: [
      { text: 'Portal', url: 'https://portal.arbitrum.io/' },
      { text: 'Bridge', url: 'https://bridge.arbitrum.io/' },
      { text: 'Network status', url: 'https://status.arbitrum.io/' },
      { text: 'Governance docs', url: 'https://docs.arbitrum.foundation/' },
    ],
  },
  {
    title: 'Community',
    items: [
      { text: 'Discord', url: 'https://discord.gg/ZpZuw7p' },
      { text: 'Twitter', url: 'https://twitter.com/OffchainLabs' },
      { text: 'Youtube', url: 'https://www.youtube.com/@Arbitrum' },
      { text: 'Medium Blog', url: 'https://medium.com/offchainlabs' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { text: 'Support', url: 'https://support.arbitrum.io/' },
      { text: 'Bug Bounties', url: 'https://immunefi.com/bounty/arbitrum/' },
      { text: 'Research forum', url: 'https://research.arbitrum.io/' },
      { text: 'Careers', url: 'https://offchainlabs.com/careers/' },
    ],
  },
];

/**
 * The site's `StyledLink`: a hexagon sits hidden at the left edge and the label is pulled 1rem
 * left over it; on hover the label slides back to reveal the hexagon, both lit cyan.
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    // fumadocs-core/link routes internal hrefs through next/link and marks
    // external ones target=_blank rel=noreferrer.
    <Link
      href={href}
      className="group relative inline-block pl-4 transition-colors duration-300 hover:text-arbitrum-cyan hover:text-shadow-[0_0_6px_rgb(16_225_255/0.8)]"
    >
      <span
        aria-hidden
        className="absolute top-[3px] left-0 block h-[10px] w-[10px] drop-shadow-hex-glow"
      >
        <span className="hex-clip block h-[10px] bg-arbitrum-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      <span className="block -translate-x-4 text-nowrap transition-transform duration-300 group-hover:translate-x-0">
        {children}
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-linear-to-b from-arbitrum-navy to-black text-xs text-white uppercase">
      {/* Same container as the home page content (`app/(home)/page.tsx`), so
          the columns line up with the body text. Both content areas are
          viewport-centred at ~1000px — the docs article column included — so one
          centred container aligns the footer on every page type. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-10 pb-12 lg:flex-row lg:justify-between lg:pb-16">
        <Link href="/" className="flex w-fit items-center gap-3 self-start normal-case">
          {/* Four-colour mark, as in the navbar. The site's footer wordmark is white and takes
              these same colours on hover, so the coloured mark on navy is its hover state. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.svg" alt="" width={27} height={30} className="h-[30px] w-auto" />
          <span className="text-base font-medium">{appName}</span>
        </Link>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:gap-x-12">
          {columns.map((column) => (
            <div key={column.title} className="grid content-start gap-4">
              <p className="text-white/50">{column.title}</p>
              {column.items.map((item) => (
                <FooterLink key={item.text} href={item.url}>
                  {item.text}
                </FooterLink>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legal links live in the copyright row, not a fifth column, so the four
          link columns stay even. */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/20 px-4 py-5 text-white/50">
        <span className="normal-case">© {new Date().getFullYear()} Offchain Labs</span>
        <span className="flex gap-6">
          <FooterLink href="https://arbitrum.io/privacy">Privacy Policy</FooterLink>
          <FooterLink href="https://arbitrum.io/tos">Terms of Service</FooterLink>
        </span>
      </div>
    </footer>
  );
}
