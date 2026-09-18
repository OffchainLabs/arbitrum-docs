import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { AddressExplorerLink } from '@/components/mdx/AddressExplorerLink';
import { CustomDetails } from '@/components/mdx/CustomDetails';
import FAQStructuredData from '@/components/mdx/FAQStructuredData';
import { ImageZoom } from '@/components/mdx/ImageZoom';
import { PdfModal } from '@/components/mdx/PdfModal';
import { PendingWidget } from '@/components/mdx/PendingWidget';
import { Reference } from '@/components/mdx/Reference';
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

/**
 * Route internal PDF links through `<PdfModal>` so they open in an overlay instead of navigating away.
 *
 * Doing it here rather than tagging each link in MDX keeps the content plain markdown — `[view](/audit-reports/x.pdf)`
 * needs no special syntax — and any PDF link added later gets the behaviour automatically. Only
 * root-absolute paths qualify: those are the ones Next serves from `public/`. External PDFs are left
 * to the default link so we never frame a third-party document.
 */
function isInternalPdf(href: string | undefined): href is string {
  return typeof href === 'string' && href.startsWith('/') && /\.pdf$/i.test(href);
}

type AnchorProps = ComponentPropsWithoutRef<'a'>;

/**
 * Wrap an existing anchor component so internal PDF links open in the modal and everything else falls
 * through untouched.
 *
 * This must WRAP rather than replace: `app/[lang]/docs/[[...slug]]/page.tsx` passes
 * `a: createRelativeLink(source, page)`, which resolves relative markdown links against the current
 * page. Overriding `a` outright silently broke that. PDF interception is orthogonal — internal PDF
 * hrefs are root-absolute, so they never needed relative resolution in the first place.
 */
function withPdfModal(Base: NonNullable<MDXComponents['a']>) {
  return function Anchor({ href, children, ...rest }: AnchorProps) {
    if (isInternalPdf(href)) {
      return <PdfModal href={href}>{children}</PdfModal>;
    }
    // `MDXComponents['a']` widens to every intrinsic tag name (including `'symbol'`), so TypeScript
    // cannot see that this slot holds an anchor-shaped component. In practice it is always
    // `defaultMdxComponents.a` or the `createRelativeLink` the docs page passes.
    const Base_ = Base as ElementType<AnchorProps>;
    return (
      <Base_ href={href} {...rest}>
        {children}
      </Base_>
    );
  };
}

export function getMDXComponents(components?: MDXComponents) {
  const merged = {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    AddressExplorerLink,
    AEL: AddressExplorerLink,
    CustomDetails,
    FAQStructuredData,
    FAQStructuredDataJsonLd: FAQStructuredData,
    ImageZoom,
    ImageWithCaption: ImageZoom,
    Reference,
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
    // Placeholders for not-yet-ported interactive widgets (see PendingWidget).
    VendingMachine: () => <PendingWidget name="VendingMachine" />,
    EdgeChallengeFlow: () => <PendingWidget name="EdgeChallengeFlow" />,
    FlowChart: () => <PendingWidget name="FlowChart" />,
    ...components,
  };

  return {
    ...merged,
    // Applied last so PDF interception composes with whatever `a` won the merge above — notably
    // `createRelativeLink`, which the docs page supplies.
    a: withPdfModal(merged.a),
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
