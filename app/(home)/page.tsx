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
import Link from 'next/link';

import { docsRoute } from '@/lib/shared';

export default function HomePage() {
  const docs = (path: string) => `${docsRoute}${path}`;

  return (
    <main className="flex flex-col flex-1">
      <section className="flex flex-col items-center justify-center text-center px-4 py-10 gap-2 bg-linear-[135deg] from-arbitrum-gradient-from to-arbitrum-gradient-to text-white">
        <h1 className="text-4xl font-medium tracking-tight">Get started with Arbitrum</h1>
        <p className="max-w-2xl">
          Arbitrum is the finance-native platform providing infrastructure for applications,
          tokenization, and dedicated chains. These docs explain the protocols, chains, services,
          and SDKs developers use to build on the Arbitrum platform.
        </p>
        <div className="flex gap-3">
          <Link
            href={docs('/build-decentralized-apps/quickstart-solidity-remix')}
            className="rounded-md bg-fd-primary text-fd-primary-foreground px-5 py-2 font-medium"
          >
            Solidity quickstart
          </Link>
          <Link
            href={docs('/stylus/quickstart')}
            className="rounded-md border border-white/30 px-5 py-2 font-medium"
          >
            Stylus quickstart
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-16 flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-medium tracking-tight">Understand Arbitrum</h2>
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
          <h2 className="text-2xl font-medium tracking-tight">Build decentralized apps</h2>
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
          <h2 className="text-2xl font-medium tracking-tight">Launch your own chain</h2>
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
          <h2 className="text-2xl font-medium tracking-tight">Run a node</h2>
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
          <h2 className="text-2xl font-medium tracking-tight">Bridge tokens</h2>
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
