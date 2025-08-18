import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootToggle } from 'fumadocs-ui/components/layout/root-toggle';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const tree = {
    name: 'Documentation',
    children: []
  };

  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            <img 
              src="/img/logo.svg" 
              alt="Arbitrum" 
              className="h-6 w-6"
            />
            <span className="font-semibold">Arbitrum Docs</span>
          </div>
        ),
        transparentMode: 'top',
        children: <RootToggle options={[
          {
            title: 'Documentation',
            description: 'Learn how to build on Arbitrum',
            url: '/',
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
        ]} />
      }}
      sidebar={{
        defaultOpenLevel: 1,
        banner: (
          <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-3 text-sm">
            <p className="font-medium text-primary">Welcome to Arbitrum Docs</p>
            <p className="text-muted-foreground text-xs mt-1">
              Everything you need to build on Arbitrum Layer 2
            </p>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 border-t">
            <span>© 2024 Offchain Labs</span>
          </div>
        ),
      }}
      links={[
        {
          text: 'Repository',
          url: 'https://github.com/OffchainLabs/arbitrum-docs',
          active: 'nested-url',
        },
        {
          text: 'Arbitrum Portal',
          url: 'https://portal.arbitrum.io',
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}