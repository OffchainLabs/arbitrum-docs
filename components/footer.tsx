import Link from 'fumadocs-core/link';

import { appName } from '@/lib/shared';

/**
 * Site footer, styled after the arbitrum.io footer. Fumadocs has no footer slot, so
 * `app/layout.tsx` renders it as a sibling of the layout in the flex-column body; inside
 * `DocsLayout` it would be auto-placed into a grid cell. Dark in both colour modes, so it uses
 * brand tokens (`arbitrum-*`) rather than theme tokens (`fd-*`).
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
      // Served from public/.
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

/** A hidden hexagon at the left edge; on hover the label slides right to reveal it, lit cyan. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
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
      {/* The same centred `max-w-5xl` container as the home page content. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-10 pb-12 lg:flex-row lg:justify-between lg:pb-16">
        <Link href="/" className="flex w-fit items-center gap-3 self-start normal-case">
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
