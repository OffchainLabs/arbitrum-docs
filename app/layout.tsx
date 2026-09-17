import { RootProvider } from 'fumadocs-ui/provider/next';
import 'katex/dist/katex.css';
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

import { Footer } from '@/components/footer';
import { InkeepChatButton } from '@/components/inkeep/inkeep-chat-button';
import InkeepSearchDialog from '@/components/inkeep/inkeep-search';

import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
// have to synthesize. Fallback stack copied from arbitrum-docs _variables.scss.
const sans = localFont({
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
  src: [
    { path: '../public/fonts/aeonik-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/aeonik-medium.woff2', weight: '500', style: 'normal' },
  ],
});

const mono = localFont({
  variable: '--font-mono',
  display: 'swap',
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
const code = JetBrains_Mono({
  variable: '--font-code',
  subsets: ['latin'],
  display: 'swap',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${code.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans" suppressHydrationWarning>
        <RootProvider
          theme={{ attribute: 'class', defaultTheme: 'light' }}
          search={{ SearchDialog: InkeepSearchDialog }}
        >
          {children}
          {/* Fumadocs exposes no footer slot, so the site footer is a sibling of
              the layout inside the flex column body. See components/footer.tsx. */}
          <Footer />
          <InkeepChatButton />
        </RootProvider>
      </body>
    </html>
  );
}
