import { type ReactNode } from 'react';

import { HoverPopover } from '@/components/HoverPopover';
import { getMDXComponents } from '@/components/mdx';
import { type ReferenceCollectionName, getReference } from '@/lib/references';

/**
 * Inline hover-reference to a typed content collection. Server component: it looks the entry up in
 * the registry and renders its definition (real MDX) on the server, handing that node to the client
 * `HoverPopover`. So each page bundles only the definitions it cites — no global index.
 *
 * A missing id renders the text plainly (and warns in dev); `scripts/references-check.mjs` fails the
 * build on any unresolved reference, so this is only a dev/runtime safety net.
 */
export function Reference({
  collection,
  id,
  children,
}: {
  collection: ReferenceCollectionName;
  id: string;
  children: ReactNode;
}) {
  const entry = getReference(collection, id);
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Reference] no "${collection}" entry for id "${id}"`);
    }
    return <>{children}</>;
  }

  const Definition = entry.body;
  return (
    <HoverPopover title={entry.title} content={<Definition components={getMDXComponents()} />}>
      {children}
    </HoverPopover>
  );
}
