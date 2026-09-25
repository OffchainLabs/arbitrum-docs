import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Braces, Code, Coins } from 'lucide-react';

import { appName, docsRoute } from './shared';

/** Shared styling for the secondary icons in the "Build apps" menu. */
const menuIconClass = 'bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1';

export function baseOptions(): BaseLayoutProps {
  const docHref = (section: string) => `${docsRoute}/${section}`;
  return {
    nav: {
      title: (
        <>
          {/* The Arbitrum mark is four-colour (navy/blue/light-blue/white), so it
              cannot be a currentColor component the way OffchainMark was. Used in
              both light and dark, matching arbitrum-docs docusaurus.config.js,
              which sets `src` with no `srcDark`. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.svg" alt="" width={18} height={20} className="h-5 w-auto" />
          {appName}
        </>
      ),
    },
    links: [
      // Mirrors the Docusaurus top navbar (docusaurus.config.js `navbar.items`):
      // Get started · Build apps · Launch a chain · Run a node · Use the bridge ·
      // How it works · Notices. Targets point to the nearest existing Fumadocs page
      // to avoid 404s where a Docusaurus leaf has not been ported yet.
      { text: 'Get started', url: docHref('get-started') },
      {
        type: 'menu',
        text: 'Build apps',
        items: [
          {
            icon: <Code />,
            text: 'Build with Solidity',
            description: 'Deploy Solidity smart contracts to Arbitrum chains.',
            url: docHref('build-decentralized-apps'),
            menu: {
              className: 'md:row-span-3',
              banner: (
                <div className="-mx-3 -mt-3 flex flex-col justify-end rounded-t-lg bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-4 pt-20 text-white">
                  <p className="text-base font-medium">Build apps on Arbitrum</p>
                  <p className="text-sm text-white/80">
                    Deploy smart contracts and decentralized apps.
                  </p>
                </div>
              ),
            },
          },
          {
            icon: <Braces className={menuIconClass} />,
            text: 'Build with Stylus',
            description: 'Write contracts in Rust, C, and C++ that compile to WebAssembly.',
            url: docHref('stylus/quickstart'),
            menu: { className: 'lg:col-start-2' },
          },
          {
            icon: <BookOpen className={menuIconClass} />,
            text: 'Arbitrum essentials',
            description: 'Bridging, precompiles, the NodeInterface, and platform reference.',
            url: docHref('arbitrum-essentials'),
            menu: { className: 'lg:col-start-2' },
          },
          {
            icon: <Coins className={menuIconClass} />,
            text: 'Machine Payments Protocol (MPP)',
            description: 'Machine-to-machine payments on Arbitrum.',
            url: docHref('build-decentralized-apps'),
            menu: { className: 'lg:col-start-2' },
          },
        ],
      },
      { text: 'Launch a chain', url: docHref('launch-arbitrum-chain') },
      { text: 'Run a node', url: docHref('run-a-node') },
      { text: 'Use the bridge', url: docHref('arbitrum-bridge') },
      { text: 'How it works', url: docHref('how-arbitrum-works') },
      { text: 'Notices', url: docHref('notices') },
    ],
  };
}
