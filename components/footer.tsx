import Link from 'fumadocs-core/link';

/**
 * Site footer.
 *
 * Fumadocs has no footer slot — neither `BaseLayoutProps` nor the home/notebook
 * layouts expose one, and upstream ships no `<footer>` anywhere. The documented
 * placement is a sibling of the layout inside the `flex flex-col min-h-screen`
 * body, which is where `app/[lang]/layout.tsx` renders it. It must NOT go inside
 * `DocsLayout`: that container is a named-area CSS grid, so an unplaced child is
 * auto-placed into the gutter cell beside the navbar (and `overflow-x-clip`
 * would trim it).
 *
 * Content mirrors arbitrum-docs `docusaurus.config.js` `themeConfig.footer`.
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

const linkClass = 'text-fd-muted-foreground transition-colors hover:text-fd-primary';

export function Footer() {
  return (
    // Light: a recessed band, as in Docusaurus. Dark: `fd-muted` is *lighter*
    // than the page, which would invert that reading, so the footer sits flush
    // on `fd-background` and the top border alone separates it.
    <footer className="border-t bg-fd-muted text-[0.8125rem] dark:bg-fd-background">
      {/* Same container as the home page content (`app/[lang]/(home)/page.tsx`),
          so the columns line up with the body text. Both content areas are
          viewport-centred at ~1000px — the docs article column included — so one
          centred container aligns the footer on every page type. */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Grid + gap replaces Infima's four-then-one column jump: one column on
            phones, 2x2 on tablets, a single row on desktop. */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              {/* Aeonik ships only 400 and 500, so headings stop at `font-medium`
                  rather than the source's 600, which the browser would synthesize. */}
              <h2 className="mb-3 text-sm font-medium text-fd-foreground">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item.text}>
                    {/* fumadocs-core/link routes internal hrefs through next/link
                        and marks external ones target=_blank rel=noreferrer. */}
                    <Link href={item.url} className={linkClass}>
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal links live in the copyright row, not a fifth column, so the four
            link columns stay even. */}
        <div className="mt-6 border-t pt-4 text-center text-xs text-fd-muted-foreground">
          © {new Date().getFullYear()} Offchain Labs{' · '}
          <Link href="https://arbitrum.io/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          {' · '}
          <Link href="https://arbitrum.io/tos" className={linkClass}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
