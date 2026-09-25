'use client';

import Link from 'next/link';

import { useTroubleshooting } from './store';

/**
 * "Review the docs" guidance, resolved from the current Node type + Network selection.
 *
 * The Docusaurus original nested two tab groups here and kept them in step with the selector at the
 * top of the page through Docusaurus' `groupId` tab syncing. Fumadocs 16 has no `groupId`, and
 * duplicating the tabs would let the two controls disagree, so the guidance reads the shared
 * selection directly — one source of truth, and the reader only picks a configuration once.
 */

interface Guidance {
  href: string;
  title: string;
}

const FULL_NODE_BY_NETWORK: Record<string, Guidance> = {
  'arb-one-nitro': {
    href: '/docs/run-a-node/run-full-node',
    title: 'How to run a full node (Nitro)',
  },
  'arb-one-classic': {
    href: '/docs/run-a-node/more-types/run-classic-node',
    title: 'How to run a full node (Classic, pre-Nitro)',
  },
  'arb-nova': { href: '/docs/run-a-node/run-full-node', title: 'How to run a full node (Nitro)' },
  'arb-sepolia': {
    href: '/docs/run-a-node/run-full-node',
    title: 'How to run a full node (Nitro)',
  },
  // The legacy page pointed at /run-arbitrum-node/run-local-dev-node, which has no equivalent in
  // this site; the ported page is run-nitro-dev-node.
  'localhost': {
    href: '/docs/run-a-node/run-nitro-dev-node',
    title: 'How to run a local Nitro dev node',
  },
};

const BY_NODE_TYPE: Record<string, Guidance> = {
  'archive-node': {
    href: '/docs/run-a-node/more-types/run-archive-node',
    title: 'How to run an archive node',
  },
  'validator-node': {
    href: '/docs/run-a-node/more-types/run-validator-node',
    title: 'How to run a validator',
  },
};

export function ConfigGuidance() {
  const { network, nodeType } = useTroubleshooting();

  const guidance =
    nodeType === 'full-node'
      ? (FULL_NODE_BY_NETWORK[network] ?? FULL_NODE_BY_NETWORK['arb-one-nitro']!)
      : (BY_NODE_TYPE[nodeType] ?? FULL_NODE_BY_NETWORK['arb-one-nitro']!);

  return (
    <p className="mb-0">
      <Link href={guidance.href}>{guidance.title}</Link> may address your issue.
    </p>
  );
}
