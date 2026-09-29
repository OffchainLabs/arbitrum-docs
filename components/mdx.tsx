import { Accordions } from 'fumadocs-ui/components/accordion';
import { Callout as FumadocsCallout } from 'fumadocs-ui/components/callout';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, type TabProps, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ElementType } from 'react';

import { InLink } from '@/components/HoverPopover/in-link';
import { Accordion } from '@/components/mdx/Accordion';
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

/**
 * The words a screen reader hears for an untitled callout, whose type is otherwise only its colour
 * and an `aria-hidden` icon. Keyed by every spelling Fumadocs accepts, so `tip` reads as a tip even
 * though Fumadocs draws it as `info`.
 */
const calloutLabels: Record<string, string> = {
  info: 'Note',
  tip: 'Tip',
  idea: 'Tip',
  warn: 'Warning',
  warning: 'Warning',
  error: 'Danger',
  success: 'Success',
};

/**
 * Fumadocs' `Callout` with its type exposed to assistive technology: `role="note"` (`alert` for
 * `error`), and a visually hidden label such as "Warning:" when the callout has no title. A titled
 * callout already says what it is, so it gets the role only.
 */
function Callout({
  type = 'info',
  title,
  children,
  ...props
}: ComponentProps<typeof FumadocsCallout>) {
  return (
    <FumadocsCallout
      type={type}
      title={title}
      role={type === 'error' ? 'alert' : 'note'}
      {...props}
    >
      {title ? null : <span className="sr-only">{calloutLabels[type] ?? 'Note'}: </span>}
      {children}
    </FumadocsCallout>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  const merged = {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    AEL: AddressExplorerLink,
    Callout,
    EdgeChallengeFlow,
    FlowChart,
    ImageZoom,
    // Markdown images arrive with `src`, `width` and `height` that remark-image measured from
    // `public/`. `rounded-lg` matches the Fumadocs default `img` this mapping replaces.
    img: (props: ComponentProps<'img'>) => (
      <ImageZoom {...(props as ImageZoomProps)} className={cn('rounded-lg', props.className)} />
    ),
    ReferenceList,
    Step,
    Steps,
    // Inactive panels stay in the server HTML (hidden by CSS) so their text is indexed and findable.
    Tab: (props: TabProps) => <Tab forceMount {...props} />,
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
    a: ({ children, ...props }: ComponentProps<'a'>) => {
      // Plain text cannot hold a <Term>, so only element children pay for the client boundary.
      const content = typeof children === 'string' ? children : <InLink>{children}</InLink>;
      // Next's <Link> prefetches every same-origin href in the viewport, so a PDF under `public/`
      // renders as a plain anchor to keep the browser from downloading it ahead of a click.
      return props.href?.startsWith('/') && /\.pdf$/i.test(props.href.split(/[?#]/)[0]) ? (
        <a {...props}>{content}</a>
      ) : (
        <Link {...props}>{content}</Link>
      );
    },
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
