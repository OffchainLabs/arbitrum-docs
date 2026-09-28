import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ElementType } from 'react';

import { AddressExplorerLink } from '@/components/mdx/AddressExplorerLink';
import { ReferenceList } from '@/components/mdx/ReferenceList';
import { Term } from '@/components/mdx/Term';
import { Var } from '@/components/mdx/Var';
import { FlowChart } from '@/components/widgets/CentralizedAuction';
import { EdgeChallengeFlow } from '@/components/widgets/EdgeChallengeFlow';
import {
  ChecklistItem,
  ConfigGuidance,
  TroubleshootingChecklist,
  TroubleshootingConfig,
  TroubleshootingReport,
} from '@/components/widgets/Troubleshooting';
import { VendingMachine } from '@/components/widgets/VendingMachine';
import { cn } from '@/lib/cn';

export function getMDXComponents(components?: MDXComponents) {
  const merged = {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    AEL: AddressExplorerLink,
    EdgeChallengeFlow,
    FlowChart,
    ImageZoom,
    // Markdown images arrive with `src`, `width` and `height` that remark-image measured from
    // `public/`. `rounded-lg` matches the Fumadocs default `img` this mapping replaces.
    img: (props: ComponentProps<'img'>) => (
      <ImageZoom {...(props as ImageZoomProps)} className={cn('rounded-lg', props.className)} />
    ),
    ReferenceList,
    Tab,
    Tabs,
    Term,
    ChecklistItem,
    ConfigGuidance,
    TroubleshootingChecklist,
    TroubleshootingConfig,
    TroubleshootingReport,
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
      props.href?.startsWith('/') && /\.pdf$/i.test(props.href.split(/[?#]/)[0]) ? (
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
