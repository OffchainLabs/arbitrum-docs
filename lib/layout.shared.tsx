import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Braces, Code, Coins } from 'lucide-react';

import { BuildAppsNavLabel } from '@/components/build-apps-nav-label';

import { appName, docsRoute } from './shared';

export function baseOptions(): BaseLayoutProps {
  const docHref = (section: string) => `${docsRoute}/${section}`;
  return {
    nav: {
      title: (
        <>
          {/* The Arbitrum mark is four-colour (navy/blue/light-blue/white), so it
              cannot be a currentColor component. One file serves light and dark. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.svg" alt="" width={18} height={20} className="h-5 w-auto" />
          {appName}
        </>
      ),
    },
    links: [
      // The top navbar, in order. Each target is a section landing page.
      { text: 'Get started', url: docHref('get-started') },
      {
        type: 'menu',
        text: <BuildAppsNavLabel />,
        // Rendered as a popover list by both headers (the notebook header on docs pages and
        // components/home-header.tsx elsewhere): icon and text on one row, `[&_svg]:size-4`.
        // Both ignore each item's `menu` options, and the icons carry no class of their own, since
        // a padded pill sits above the text baseline in a 16px inline slot.
        items: [
          {
            icon: <Code />,
            text: 'Build with Solidity',
            description: 'Deploy Solidity smart contracts to Arbitrum chains.',
            url: docHref('build-decentralized-apps'),
          },
          {
            icon: <Braces />,
            text: 'Build with Stylus',
            description: 'Write contracts in Rust, C, and C++ that compile to WebAssembly.',
            url: docHref('stylus/quickstart'),
          },
          {
            icon: <BookOpen />,
            text: 'Arbitrum essentials',
            description: 'Bridging, precompiles, the NodeInterface, and platform reference.',
            url: docHref('arbitrum-essentials'),
          },
          {
            icon: <Coins />,
            text: 'Machine Payments Protocol (MPP)',
            description: 'Machine-to-machine payments on Arbitrum.',
            url: docHref('build-decentralized-apps'),
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
