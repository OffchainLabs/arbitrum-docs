import { VanillaAdmonition } from '@/components/mdx/VanillaAdmonition';

/**
 * Placeholder for interactive widgets from the Docusaurus docs that have not yet
 * been ported to the Fumadocs app (VendingMachine, EdgeChallengeFlow, FlowChart,
 * MultiDimensionalContentWidget, GenerateTroubleshootingReportWidget). Keeps
 * pages rendering and makes the gap explicit. Replace with the real component
 * when it is ported.
 */
export function PendingWidget({ name }: { name?: string }) {
  return (
    <VanillaAdmonition type="info">
      An interactive widget{name ? ` (${name})` : ''} from the original documentation is not yet
      available in this version of the docs.
    </VanillaAdmonition>
  );
}
