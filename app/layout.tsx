import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import 'katex/dist/katex.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/img/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: {
    template: '%s | Arbitrum Docs',
    default: 'Arbitrum Docs',
  },
  description: 'The complete guide to Arbitrum development, node operations, and protocol mechanics.',
  metadataBase: new URL('https://docs.arbitrum.io'),
  openGraph: {
    title: 'Arbitrum Docs',
    description: 'The complete guide to Arbitrum development, node operations, and protocol mechanics.',
    images: [
      {
        url: '/img/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Arbitrum',
      },
    ],
    siteName: 'Arbitrum Docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arbitrum Docs',
    description: 'The complete guide to Arbitrum development, node operations, and protocol mechanics.',
    images: ['/img/logo.svg'],
    creator: '@OffchainLabs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};