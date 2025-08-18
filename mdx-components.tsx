import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Card, Cards } from 'fumadocs-ui/components/card';
import type { MDXComponents } from 'mdx/types';
import { VanillaAdmonition } from './src/components/VanillaAdmonition';
import { ImageWithCaption } from './components/ui/image-with-caption';
import { ImageZoom } from './components/ui/image-zoom';
import { AddressExplorerLink } from './components/web3/AddressExplorerLink';
import { FlowChart } from './components/ui/flow-chart';

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    Card,
    Cards,
    VanillaAdmonition,
    ImageWithCaption,
    ImageZoom,
    AddressExplorerLink,
    AEL: AddressExplorerLink, // Alias for AddressExplorerLink
    FlowChart,
    ...components,
  };
}