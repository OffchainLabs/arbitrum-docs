'use client';

import Link from 'next/link';

import { useTroubleshooting } from './store';

/**
 * "Review the docs" guidance, resolved from the current Node type + Network selection.
 *
 * The guidance reads the shared selection from the store, so the reader picks a configuration once
 * at the top of the page and every dependent block follows it.
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
