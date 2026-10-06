import { type ReactNode } from 'react';

import { HoverPopover } from '@/components/HoverPopover';
import { getMDXComponents } from '@/components/mdx';
import { getReference } from '@/lib/references';

/**
 * Glossary term with a hover definition: `<Term id="dapp">decentralized app</Term>`.
 *
 * Server component: it renders the entry's MDX definition on the server and hands it to the client
 * `HoverPopover`, so each page bundles only the definitions it cites. An unknown id renders the text
 * plainly; `pnpm references:check` fails on one.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const entry = getReference('glossary', id);
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Term] no glossary entry for id "${id}"`);
    }
    return <>{children}</>;
  }

  const Definition = entry.body;
  return (
    <HoverPopover
      title={entry.title}
      content={<Definition components={getMDXComponents({ Term: PlainTerm })} />}
    >
      {children}
    </HoverPopover>
  );
}

/**
 * A `<Term>` inside a definition renders as its plain text. A popover inside a popover is a
 * trigger nobody can reach, and two entries that cite each other would otherwise recurse without
 * bound at prerender. The glossary page renders the same entries with the full map, so their
 * cross-references still hover there.
 */
function PlainTerm({ children }: { id: string; children: ReactNode }) {
  return <>{children}</>;
}
