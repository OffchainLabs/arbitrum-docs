import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ElementType } from 'react';

import { AddressExplorerLink } from '@/components/mdx/AddressExplorerLink';
import { FlowChart } from '@/components/mdx/CentralizedAuction';
import { EdgeChallengeFlow } from '@/components/mdx/EdgeChallengeFlow';
import FAQStructuredData from '@/components/mdx/FAQStructuredData';
import { ReferenceList } from '@/components/mdx/ReferenceList';
import { Term } from '@/components/mdx/Term';
import {
  ChecklistItem,
  ConfigGuidance,
  TroubleshootingChecklist,
  TroubleshootingConfig,
  TroubleshootingReport,
} from '@/components/mdx/Troubleshooting';
import { VanillaAdmonition } from '@/components/mdx/VanillaAdmonition';
import { Var } from '@/components/mdx/Var';
import { VendingMachine } from '@/components/mdx/VendingMachine';

export function getMDXComponents(components?: MDXComponents) {
  const merged = {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    AEL: AddressExplorerLink,
    EdgeChallengeFlow,
    FAQStructuredData,
    FAQStructuredDataJsonLd: FAQStructuredData,
    FlowChart,
    ImageZoom,
    // Markdown images arrive with `src` as the static import remark-image resolved.
    img: (props: ComponentProps<'img'>) => <ImageZoom {...(props as ImageZoomProps)} />,
    ReferenceList,
    Tab,
    Tabs,
    Term,
    // Node troubleshooting page (ports the Docusaurus MultiDimensionalContentWidget +
    // GenerateTroubleshootingReportWidget pair).
    ChecklistItem,
    ConfigGuidance,
    TroubleshootingChecklist,
    TroubleshootingConfig,
    TroubleshootingReport,
    VanillaAdmonition,
    Var,
    VendingMachine,
    ...components,
  };
  // Whichever `a` won the merge, usually the docs page's `createRelativeLink`.
  const Link = merged.a as ElementType<ComponentProps<'a'>>;

  return {
    ...merged,
    // Next's <Link> prefetches every same-origin href in the viewport, so a PDF under `public/`
    // renders as a plain anchor to keep the browser from downloading it ahead of a click.
    a: (props: ComponentProps<'a'>) =>
      props.href?.startsWith('/') && /\.pdf$/i.test(props.href) ? (
        <a {...props} />
      ) : (
        <Link {...props} />
      ),
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
