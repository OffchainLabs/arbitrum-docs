import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import type { ReactNode } from 'react';

/**
 * Compatibility wrapper for the Docusaurus `<CustomDetails summary="…">` collapsible
 * used in ported docs. Renders as a single Fumadocs Accordion.
 */
export function CustomDetails({ summary, children }: { summary?: string; children?: ReactNode }) {
  return (
    <Accordions type="single">
      <Accordion title={summary ?? 'Details'}>{children}</Accordion>
    </Accordions>
  );
}
