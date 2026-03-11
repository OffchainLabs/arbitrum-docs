// Global type declarations

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
  };
}

// Module declarations for packages without proper types
declare module '@offchainlabs/notion-docs-generator' {
  export type Question = any;
  export type FAQ = any;
  export type RenderedKnowledgeItem = any;
  export type KnowledgeItem = any;
  export type LinkableTerms = any;
  export type LinkValidity = any;
  // Custom Record type (not the built-in TypeScript Record)
  export type Record = any;
  export function lookupQuestions(...args: any[]): any;
  export function handleRenderError(...args: any[]): any;
  export function renderRichTexts(...args: any[]): any;
  export function renderKnowledgeItem(...args: any[]): any;
  export function lookupProject(...args: any[]): any;
  export function lookupFAQs(...args: any[]): any;
  export const RenderMode: {
    HTML: string;
    MARKDOWN: string;
    Markdown: string;
    Plain: string;
  };
}

declare module '@docusaurus/plugin-content-docs/src/sidebars/types' {
  export type SidebarItemConfig = any;
}

// Docusaurus theme modules
declare module '@theme/Details' {
  const Details: React.ComponentType<any>;
  export default Details;
}

declare module '@theme/NotFound/Content' {
  export interface Props {
    className?: string;
    title?: string;
  }
  const Content: React.ComponentType<Props>;
  export default Content;
}

declare module '@theme/Heading' {
  const Heading: React.ComponentType<any>;
  export default Heading;
}

declare module '@theme-original/Footer' {
  const Footer: React.ComponentType<any>;
  export default Footer;
}

declare module '@theme-original/Layout' {
  const Layout: React.ComponentType<any>;
  export default Layout;
}

declare module '@docusaurus/BrowserOnly' {
  const BrowserOnly: React.ComponentType<any>;
  export default BrowserOnly;
}

declare module '@docusaurus/Link' {
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module '@docusaurus/useIsBrowser' {
  export default function useIsBrowser(): boolean;
}

declare module '@docusaurus/router' {
  export function useLocation(): { pathname: string };
}

declare module '@docusaurus/Head' {
  const Head: React.ComponentType<any>;
  export default Head;
}

declare module '@docusaurus/Translate' {
  const Translate: React.ComponentType<any>;
  export default Translate;
}

// MDX file imports
declare module '*.mdx' {
  const content: React.ComponentType<any>;
  export default content;
}
