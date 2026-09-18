import { type ReactNode } from 'react';

import { Reference } from '@/components/mdx/Reference';

/**
 * Glossary term hover — a thin alias for `<Reference collection="glossary">`.
 * Usage: `<Term id="dapp">decentralized app</Term>`.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Reference collection="glossary" id={id}>
      {children}
    </Reference>
  );
}
