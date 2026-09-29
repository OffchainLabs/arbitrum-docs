import { Banner } from 'fumadocs-ui/components/banner';
import { RootProvider } from 'fumadocs-ui/provider/next';
import 'katex/dist/katex.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { PostHogProvider } from '@/components/analytics/posthog-provider';
import { Footer } from '@/components/footer';
import { InkeepChatButton } from '@/components/inkeep/inkeep-chat-button';
import InkeepSearchDialog from '@/components/inkeep/inkeep-search';
import { vars } from '@/content/vars';
import { getSiteUrl } from '@/lib/shared';

import './global.css';

export const metadata: Metadata = {
  // Resolved through `getSiteUrl()` rather than read inline, so a production build with no
  // NEXT_PUBLIC_SITE_URL fails here instead of silently baking localhost into every canonical and
  // social image URL. This call is at module scope on purpose: that is what makes it a build
  // failure rather than a per-request one. See lib/shared.ts.
  metadataBase: new URL(getSiteUrl()),
  // Icons live in public/, not app/, where a favicon.ico file would become a route. Declared
  // explicitly so Next emits the <link> tags.
  //
  // The rasters are fallbacks for clients without SVG-favicon support (Safari
  // most notably) and are rendered from the same vector, so they show the same
  // mark rather than a different one. Concrete `sizes` on the .ico matter: with
  // `sizes: 'any'` browsers treat it as scalable and prefer it over the SVG.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/img/logo.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    // Not a favicon: iOS composites transparent home-screen icons onto black,
    // so this one keeps its opaque #213147 tile.
    apple: '/apple-icon.png',
  },
};

// Aeonik, the brand typeface. Only 400 and 500 exist; `font-synthesis: none` in global.css
// resolves heavier weights to the real 500 face. The uprights are the only preloaded faces.
const sans = localFont({
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [
    { path: '../public/fonts/aeonik-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/aeonik-medium.woff2', weight: '500', style: 'normal' },
  ],
});

// The italic is its own declaration because `preload` is per declaration; the `em, i, ...` rule
// in global.css points italic elements at it.
const sansItalic = localFont({
  variable: '--font-sans-italic',
  display: 'swap',
  preload: false,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [{ path: '../public/fonts/aeonik-italic.woff2', weight: '400', style: 'italic' }],
});

// Aeonik Fono, the brand "mono", for inline code. It is not fixed-pitch, so fenced blocks use
// `code` below.
const mono = localFont({
  variable: '--font-mono',
  display: 'swap',
  preload: false,
  fallback: [
    'ui-monospace',
    'SF Mono',
    'Cascadia Code',
    'Segoe UI Mono',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
  src: [{ path: '../public/fonts/aeonik-fono-regular.woff2', weight: '400', style: 'normal' }],
});

// JetBrains Mono (latin subset, SIL OFL beside the file) for fenced code blocks. The variable
// weight range keeps bold tokens bold; the monospace fallback stack is in global.css.
const code = localFont({
  variable: '--font-code',
  display: 'swap',
  preload: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
  src: [{ path: '../public/fonts/jetbrains-mono-latin.woff2', weight: '100 800', style: 'normal' }],
});

// FK Screamer, the arbitrum.io display face, for the home hero heading only (`font-display`).
// One upright weight. The licence was granted for arbitrum.io; confirm it covers this domain.
const displayFace = localFont({
  variable: '--font-fk-screamer',
  display: 'swap',
  preload: false,
  fallback: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
  src: [{ path: '../public/fonts/fk-screamer-upright.otf', weight: '400', style: 'normal' }],
});

// With no Inkeep key, neither Inkeep component renders and search is disabled: the site has no
// search route of its own for Fumadocs' default dialog to call. `NEXT_PUBLIC_*` is inlined at build
// time, so this is a constant in every build rather than a per-request branch.
const inkeepEnabled = Boolean(process.env.NEXT_PUBLIC_INKEEP_API_KEY);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // Restores Next's pre-16 behaviour of forcing an instant jump on route transitions while
      // global.css keeps `scroll-behavior: smooth` for in-page anchors. Without it every docs
      // navigation from a scrolled position animates back to the top of the new page.
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${sansItalic.variable} ${mono.variable} ${code.variable} ${displayFace.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans" suppressHydrationWarning>
        <PostHogProvider>
          <RootProvider
            // `hotKey: false` disables Fumadocs' theme shortcut, a bare `d` that fires whenever
            // focus is outside a text field. The visible theme toggle is the intended path.
            theme={{ attribute: 'class', defaultTheme: 'light', hotKey: false }}
            // Fumadocs preloads the dialog by default, which would fetch the Inkeep bundle on every
            // page load instead of on the first open. Without a key there is no search: the Orama
            // route Fumadocs' own dialog would call is not part of this site.
            search={
              inkeepEnabled
                ? { SearchDialog: InkeepSearchDialog, preload: false }
                : { enabled: false }
            }
          >
            {/* Announcement bar. Above the navbar because it is a sibling rendered before
              {children}, and every layout's header lives inside those.

              Writers control it from content/vars.json: text, link, and the
              enabled flag, so changing or retiring the message is a content
              edit rather than a code change. `announcementId` is both the
              dismissal key and the cache-buster. A viewer who closes the
              banner has that id written to localStorage, so a new message
              needs a new id or it stays hidden from everyone who dismissed
              the last one. */}
            {vars.announcementEnabled ? (
              <>
                {/* Banner puts `height` in an inline style AND in
                  --fd-banner-height, which the docs layout feeds to calc() and
                  a sticky `top`. So it has to be a real length, never `auto`.
                  The message fits one line from 640px up and wraps to two
                  below, hence the variable rather than a constant.

                  These two values are sized for a message a writer can change
                  without touching this file: 3rem holds two lines of text-sm
                  and 4rem holds three, so a long enough announcementText
                  overflows and nothing catches it. The budget is written down
                  in README next to the key. Raising a height here means
                  raising the budget there too. */}
                <style>{`:root{--fd-announcement-height:4rem}@media (min-width:640px){:root{--fd-announcement-height:3rem}}`}</style>
                <Banner
                  id={vars.announcementId}
                  height="var(--fd-announcement-height)"
                  className="bg-fd-primary text-fd-primary-foreground"
                >
                  <span className="pe-8 text-balance">
                    {vars.announcementText}{' '}
                    <Link
                      href={vars.announcementLinkHref}
                      // vars:check permits an https target as well as an internal
                      // path, so the href may leave the site. `rel` is set only
                      // then, because Next already omits it for internal routes
                      // and an unconditional one would be noise on every page.
                      rel={
                        vars.announcementLinkHref.startsWith('https://')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      {vars.announcementLinkText}
                    </Link>
                  </span>
                </Banner>
              </>
            ) : null}
            {children}
            {/* Fumadocs exposes no footer slot, so the site footer is a sibling of
              the layout inside the flex column body. See components/footer.tsx. */}
            <Footer />
            {inkeepEnabled ? <InkeepChatButton /> : null}
          </RootProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
