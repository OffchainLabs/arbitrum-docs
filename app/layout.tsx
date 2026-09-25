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
  // Icons live in public/ (not app/, which would recreate the app/favicon.ico
  // route that broke the Vercel build). Declared explicitly so Next emits the
  // <link> tags.
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

// Aeonik is the Arbitrum brand typeface, self-hosted from arbitrum-docs.
// Only 400 and 500 exist — there is no Bold or Black face. Heading weights are
// clamped to 500 in global.css so nothing requests a weight the browser would
// have to synthesize, and `font-synthesis: none` there makes any stray 600/700
// resolve to the real 500 face. Fallback stack copied from arbitrum-docs
// _variables.scss. The italic face comes from arbitrum-website (app/font/
// Aeonik-Italic.woff2, same family): without it every <em> was a synthesised
// slant, and with synthesis off it would render upright.
const sans = localFont({
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [
    { path: '../public/fonts/aeonik-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/aeonik-medium.woff2', weight: '500', style: 'normal' },
  ],
});

// The italic face, split out of `sans` above so it can opt out of preloading.
//
// `next/font` takes `preload` per declaration, not per `src` entry, so while the italic sat beside
// the two uprights it was preloaded everywhere they were. At 48 KiB it was the largest single
// preload on the site and the first request the browser made after the HTML, contending for
// bandwidth with the body text that is the Largest Contentful Paint element on every docs page, to
// serve the handful of `<em>` runs a given page contains. Splitting it costs one extra generated
// family and the rule in `app/global.css` that points italic elements at it.
//
// Weight 400 only, as before: Aeonik has no italic at 500, and `font-synthesis: none` in global.css
// means a bold italic resolves to this face rather than a synthesised slant.
const sansItalic = localFont({
  variable: '--font-sans-italic',
  display: 'swap',
  preload: false,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [{ path: '../public/fonts/aeonik-italic.woff2', weight: '400', style: 'italic' }],
});

const mono = localFont({
  variable: '--font-mono',
  display: 'swap',
  // Inline code, never the Largest Contentful Paint element on any page measured. A preload is a
  // high-priority request, so leaving it on spent 35 KiB of bandwidth competing with the text and
  // hero image that decide LCP. `display: swap` and the stack below render the text immediately, so
  // the face arriving a beat later costs a swap, not a blank run. `preload` is per-declaration in
  // `next/font`, not per `src` entry, which is why `sans` below keeps its preload: dropping it would
  // take the body faces with it, and body text is the LCP element on every docs page.
  // See INTERNALS.md "Page weight and what loads late".
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

// Aeonik Fono is the brand "mono" but is NOT actually fixed-pitch
// (post.isFixedPitch = 0; advances range 283-799 at 1000 upem). It stays on
// --font-mono for inline code, where brand texture matters and drift is
// invisible. Fenced blocks use a true monospace via --font-code so CLI output,
// ASCII diagrams and aligned comments stay in column.
//
// Local rather than `next/font/google` since FS-2750. The Google loader fetched this face's CSS
// and six woff2 files on every `next build`, retried three times and fell back to a local face
// only in dev, so an outage failed a production build and the now-blocking CI `Build` job with it.
// The committed file is byte for byte the one Google served for that declaration (its `latin`
// slice, sha256 1e06740a…, recorded in INTERNALS.md), so no reader's download changed.
//
// `weight` is the variable range Google declared, not a single value: `font-synthesis: none` in
// global.css means a static 400 face would render a bold code token at 400 rather than bold.
//
// `unicode-range` is the latin slice's own, carried over verbatim, and the reason to keep it is
// fidelity, not rendering: it makes this one `@font-face` mean what the `latin` member of the six
// Google emitted meant, so the before and after CSS are equivalent. It is emphatically NOT what
// makes a Cyrillic character fall back. CSS font matching runs per character, so a face with no
// glyph hands that character to the next family in the list whether or not the range is declared;
// measured through `CSS.getPlatformFontsForNode`, Cyrillic, Greek and box drawing all render in
// the fallback face either way, and the woff2 is downloaded either way. The only thing the range
// changes is which font draws the missing-glyph box for a character no family in the chain covers.
// So do not drop it as decoration, and do not trust it to do the falling back.
//
// The other five slices (latin-ext, cyrillic, cyrillic-ext, greek, vietnamese) are not committed,
// because no fenced block or inline code span anywhere in content/ holds a character any of them
// covers, so no reader ever requested one. Two characters, two different stories. One outside all
// six resolves exactly as it did before, through the generated metric-adjusted fallback. One the
// five did cover is now set in that fallback where it used to be set in JetBrains Mono, and that
// is the one cost this change accepts: cosmetic, and currently hypothetical.
//
// No `fallback` option, deliberately, because the Google declaration had none either: it keeps the
// emitted variable at `"code", "code Fallback"`, the same shape as before, and `pre, pre code` in
// global.css supplies the monospace stack after it.
const code = localFont({
  variable: '--font-code',
  display: 'swap',
  // Fenced code blocks only. Same reasoning as `mono` above: 40 KiB of preload priority bought
  // nothing, because no page's LCP element is set in this face.
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

// FK Screamer is the marketing site's display face (arbitrum-website app/fonts.ts), used there for
// the hero headline and card titles. Here it is the home hero heading only, through the
// `font-display` utility (`--font-display` in global.css). One upright weight exists, so nothing
// else should ask for bold or italic. Shipped at the maintainer's direction on 2026-09-15; the
// licence was granted for arbitrum.io and should be confirmed for this domain with the brand team.
const displayFace = localFont({
  variable: '--font-fk-screamer',
  display: 'swap',
  // The home hero heading is the only thing set in this face, but the declaration lives in the root
  // layout, so its preload went out on all 349 docs pages that never use it. The home hero's LCP
  // element is the background image rather than the heading (measured), so dropping the preload
  // costs a swap from Impact on one page and saves a request on every other.
  preload: false,
  fallback: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
  src: [{ path: '../public/fonts/fk-screamer-upright.otf', weight: '400', style: 'normal' }],
});

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
            theme={{ attribute: 'class', defaultTheme: 'light' }}
            search={{ SearchDialog: InkeepSearchDialog }}
          >
            {/* Announcement bar, ported from the Docusaurus `announcementBar`.
              Above the navbar because it is a sibling rendered before
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
            <InkeepChatButton />
          </RootProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
