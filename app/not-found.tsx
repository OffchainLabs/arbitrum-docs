import { Card, Cards } from 'fumadocs-ui/components/card';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import {
  ArrowRightLeft,
  Blocks,
  Braces,
  Code,
  Compass,
  Megaphone,
  Server,
  Settings2,
} from 'lucide-react';
import type { Metadata } from 'next';

import { NotFoundTracker } from '@/components/analytics/not-found-tracker';
import { BrandButton } from '@/components/brand-button';
import { HomeHeader } from '@/components/home-header';
import { baseOptions } from '@/lib/layout.shared';
import { docsRoute } from '@/lib/shared';

// Root 404, replacing the Next default and the Docusaurus NotFound swizzle.
// Next routes both an unmatched URL and any `notFound()` thrown in a segment
// here, so this one file covers `/anything` and `/docs/anything`.
//
// It sits under app/layout.tsx but outside every route group, so it inherits
// the root theme, search dialog, and analytics providers but not the navbar any group
// adds. HomeLayout brings the navbar back with the same options the home route
// group uses; DocsLayout is the wrong choice here because it needs a page tree
// and the visitor has no place in it.
//
// Next injects `noindex` on a 404 response, so the section links below cannot
// turn this into an indexable hub page.

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The Arbitrum documentation page you requested does not exist.',
};

const sections = [
  {
    icon: <Compass />,
    title: 'Get started',
    description: 'Introductions, quickstarts, and the shape of the Arbitrum platform.',
    href: `${docsRoute}/get-started`,
  },
  {
    icon: <Code />,
    title: 'Build apps with Solidity',
    description: 'Deploy and test Solidity contracts on Arbitrum chains.',
    href: `${docsRoute}/build-decentralized-apps`,
  },
  {
    icon: <Braces />,
    title: 'Build apps with Stylus',
    description: 'Write contracts in Rust, C, and C++ that compile to WebAssembly.',
    href: `${docsRoute}/stylus`,
  },
  {
    icon: <Blocks />,
    title: 'Launch an Arbitrum chain',
    description: 'Deploy, configure, and operate your own chain.',
    href: `${docsRoute}/launch-arbitrum-chain`,
  },
  {
    icon: <Server />,
    title: 'Run a node',
    description: 'Full nodes, validators, feed relays, and ArbOS releases.',
    href: `${docsRoute}/run-a-node`,
  },
  {
    icon: <Settings2 />,
    title: 'How Arbitrum works',
    description: 'The protocol itself: sequencing, fraud proofs, bridging, and ArbOS.',
    href: `${docsRoute}/how-arbitrum-works`,
  },
  {
    icon: <ArrowRightLeft />,
    title: 'Arbitrum bridge',
    description: 'Move assets between Ethereum and Arbitrum chains.',
    href: `${docsRoute}/arbitrum-bridge`,
  },
  {
    icon: <Megaphone />,
    title: 'Notices',
    description: 'Upgrade notices and time-sensitive announcements.',
    href: `${docsRoute}/notices`,
  },
];

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()} slots={{ header: HomeHeader }}>
      <NotFoundTracker />
      {/* A div, not a <main>: HomeLayout's container already is the page's
          <main> landmark, and nesting one inside another is invalid HTML. */}
      <div className="flex flex-1 flex-col bg-repeating-lines">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-16">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-fd-muted-foreground">404</p>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Page not found</h1>
            <p className="max-w-2xl text-fd-muted-foreground">
              This page may have moved, been renamed, or never existed. Search the documentation, or
              start from one of the sections below.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {/* Opens the same dialog as the navbar trigger and Cmd/Ctrl+K: the
              Inkeep modal wired into RootProvider in app/layout.tsx. */}
            <FullSearchTrigger className="w-full sm:w-80" />
            <BrandButton href={docsRoute} mode="secondary">
              Browse all docs
            </BrandButton>
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-medium tracking-tight">Start somewhere else</h2>
            <Cards>
              {sections.map((section) => (
                <Card
                  key={section.href}
                  icon={section.icon}
                  title={section.title}
                  description={section.description}
                  href={section.href}
                />
              ))}
            </Cards>
          </section>
        </div>
      </div>
    </HomeLayout>
  );
}
