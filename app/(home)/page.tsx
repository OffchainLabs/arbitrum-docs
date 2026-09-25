import { Card, Cards } from 'fumadocs-ui/components/card';
import {
  ArrowRightLeft,
  BookOpen,
  Boxes,
  Code,
  Compass,
  Cpu,
  Database,
  FileText,
  Globe,
  HardDrive,
  Landmark,
  Network,
  Radio,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { HomeHero } from '@/components/home-hero';
import {
  appName,
  docsRoute,
  getSiteUrl,
  siteDescription,
  siteTitle,
  socialHandle,
} from '@/lib/shared';

/**
 * The site root shipped with no title, description, canonical or social tags at all: everything
 * below is what `app/docs/[[...slug]]/page.tsx` emits per page, stated once for the one route that
 * is not a docs page (FS-2713).
 *
 * `og:image` is not listed. Next fills it, with its width, height, type and alt, from
 * `opengraph-image.tsx` beside this file.
 */
export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  // Absolute, built from `getSiteUrl()` rather than left relative for `metadataBase` to resolve,
  // for the reason the docs page gives: the value a wrong canonical would depend on is then read
  // through the one helper that refuses to guess it in a production build.
  alternates: {
    canonical: new URL('/', getSiteUrl()).toString(),
  },
  openGraph: {
    type: 'website',
    siteName: appName,
    title: siteTitle,
    description: siteDescription,
    url: new URL('/', getSiteUrl()).toString(),
  },
  // Next fills twitter:title/description/image from openGraph when they are absent, but the card
  // type and the site handle have no such default and are what X needs to render a large card.
  twitter: {
    card: 'summary_large_image',
    site: socialHandle,
  },
};

/**
 * The site's section eyebrow (`GradientFromTopSection`, `Dot`): a 9px dot with a soft shadow
 * beside the title. `currentColor` keeps it readable in both themes without a second class list.
 */
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 text-2xl font-medium tracking-tight">
      <span
        aria-hidden
        className="size-[9px] shrink-0 rounded-full bg-current shadow-[0_0_4px_currentColor]"
      />
      {children}
    </h2>
  );
}

export default function HomePage() {
  const docs = (path: string) => `${docsRoute}${path}`;

  return (
    <main className="flex flex-1 flex-col bg-repeating-lines">
      {/* The site's hero panel, static. Inset rather than full-bleed so the hairline background
          shows around it, as it does on arbitrum.io. See components/home-hero.tsx. */}
      <HomeHero />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16">
        <section className="flex flex-col gap-4">
          <SectionHeading>Understand Arbitrum</SectionHeading>
          <Cards>
            <Card
              icon={<BookOpen />}
              title="Arbitrum introduction"
              description="A FAQ-style overview of Arbitrum's finance-native platform."
              href={docs('/get-started/arbitrum-introduction')}
            />
            <Card
              icon={<Cpu />}
              title="Inside Nitro"
              description="A technical deep dive into Nitro's architecture."
              href={docs('/how-arbitrum-works/inside-arbitrum-nitro')}
            />
            <Card
              icon={<ShieldCheck />}
              title="Inside AnyTrust"
              description="A technical deep dive into the AnyTrust protocol."
              href={docs('/how-arbitrum-works/deep-dives/anytrust-protocol')}
            />
            <Card
              icon={<FileText />}
              title="Nitro whitepaper"
              description="The original whitepaper that introduced Nitro."
              href="https://docs.arbitrum.io/nitro-whitepaper.pdf"
            />
            <Card
              icon={<Landmark />}
              title="DAO governance"
              description="Docs for members of the Arbitrum DAO."
              href="https://docs.arbitrum.foundation/gentle-intro-dao-governance"
            />
          </Cards>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Build decentralized apps</SectionHeading>
          <Cards>
            <Card
              icon={<Code />}
              title="Quickstart (Solidity)"
              description="Deploy your first Solidity smart contract to Arbitrum using Remix."
              href={docs('/build-decentralized-apps/quickstart-solidity-remix')}
            />
            <Card
              icon={<Rocket />}
              title="Quickstart (Rust)"
              description="Deploy your first Rust smart contract using Arbitrum Stylus."
              href={docs('/stylus/quickstart')}
            />
            <Card
              icon={<Boxes />}
              title="Explore Stylus"
              description="Write EVM-compatible smart contracts in Rust, C, and other languages that compile to Wasm."
              href={docs('/stylus/gentle-introduction')}
            />
            <Card
              icon={<Network />}
              title="Chain info"
              description="Chain IDs, RPC endpoints, and network parameters."
              href={docs('/chain-info')}
            />
          </Cards>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Launch your own chain</SectionHeading>
          <Cards>
            <Card
              icon={<BookOpen />}
              title="A gentle introduction"
              description="Understand Arbitrum chains' value proposition and use cases."
              href={docs('/launch-arbitrum-chain/overview/a-gentle-introduction')}
            />
            <Card
              icon={<Rocket />}
              title="Deploy a chain"
              description="Use the Arbitrum chain SDK to configure and deploy your chain's core contracts."
              href={docs('/launch-arbitrum-chain/overview/arbitrum-chain-sdk-introduction')}
            />
            <Card
              icon={<Settings />}
              title="Configure your chain"
              description="Set up throughput, gas tokens, data availability, governance, and more."
              href={docs(
                '/launch-arbitrum-chain/configuration/core/additional-configuration-parameters',
              )}
            />
            <Card
              icon={<ArrowRightLeft />}
              title="Migrate from another stack"
              description="Move an existing chain to Arbitrum technology."
              href={docs('/launch-arbitrum-chain/migrate/migrate-from-another-stack')}
            />
          </Cards>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Run a node</SectionHeading>
          <Cards>
            <Card
              icon={<Server />}
              title="Run a full node"
              description="Access Arbitrum chains without connecting to a third-party node."
              href={docs('/run-a-node/run-full-node')}
            />
            <Card
              icon={<Database />}
              title="Run an archive node"
              description="Access extensive historical data for advanced analytical purposes."
              href={docs('/run-a-node/more-types/run-archive-node')}
            />
            <Card
              icon={<Radio />}
              title="Run a feed relay"
              description="Distribute the sequencer feed across multiple nodes."
              href={docs('/run-a-node/run-feed-relay')}
            />
            <Card
              icon={<HardDrive />}
              title="Configure a DAC"
              description="Run a Data Availability Server for AnyTrust chains."
              href={docs('/launch-arbitrum-chain/configuration/data-availability')}
            />
          </Cards>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Bridge tokens</SectionHeading>
          <Cards>
            <Card
              icon={<ArrowRightLeft />}
              title="Quickstart (bridge)"
              description="Step-by-step instructions for first-time bridge users."
              href={docs('/arbitrum-bridge/quickstart')}
            />
            <Card
              icon={<Compass />}
              title="Arbitrum bridge"
              description="Transfer tokens between Ethereum, Arbitrum One, Arbitrum Nova, and other Arbitrum chains."
              href="https://bridge.arbitrum.io/"
            />
            <Card
              icon={<Globe />}
              title="Arbitrum Portal"
              description="Discover dApps deployed on Arbitrum."
              href="https://portal.arbitrum.io/"
            />
          </Cards>
        </section>
      </div>
    </main>
  );
}
