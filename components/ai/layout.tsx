'use client';

import { type DocsLayoutProps, DocsLayout as Layout } from 'fumadocs-ui/layouts/notebook';
import {
  FullSearchTrigger,
  SearchTrigger,
  type SearchTriggerProps,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { MessageCircleIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Component, type ReactNode, useState } from 'react';

import { AIChatOpenProvider, AIChatTrigger, useAIChat } from '@/components/ai/chat/open';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

// The chat runtime, the transport and the markdown renderer download on the first open only.
const LazyPanel = dynamic(() => import('@/components/ai/search').then((m) => m.AIChatLazyPanel), {
  ssr: false,
  loading: () => <div className="size-full" />,
});

/** Keeps a failed panel download, such as a chunk gone after a deploy, inside the panel. */
class PanelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <p role="alert" className="m-auto p-4 text-center text-sm text-fd-muted-foreground">
        The AI chat could not load. Reload the page to try again.
      </p>
    );
  }
}

export function DocsLayout(props: DocsLayoutProps) {
  return (
    <AIChatOpenProvider>
      <ChatLayout {...props} />
      {/* Below md the navbar icon replaces it: a floating pill covers text while scrolling. */}
      <AIChatTrigger className="max-md:hidden" />
    </AIChatOpenProvider>
  );
}

/** The mobile navbar's search icon, followed by an Ask AI icon. */
function MobileTriggers(props: SearchTriggerProps) {
  const { open, setOpen } = useAIChat();

  return (
    <>
      <SearchTrigger {...props} />
      <button
        type="button"
        aria-label="Ask AI"
        aria-expanded={open}
        className={cn(
          buttonVariants({ size: 'icon-sm', color: 'ghost' }),
          'text-fd-muted-foreground',
        )}
        onClick={() => setOpen(!open)}
      >
        <MessageCircleIcon />
      </button>
    </>
  );
}

function ChatLayout(props: DocsLayoutProps) {
  const { open, setOpen } = useAIChat();
  // fumadocs-ui also mounts the panel on the first open; passing none keeps the chunk unfetched
  // without relying on that.
  const [loaded, setLoaded] = useState(false);
  if (open && !loaded) setLoaded(true);

  return (
    <Layout
      {...props}
      slots={{ ...props.slots, searchTrigger: { sm: MobileTriggers, full: FullSearchTrigger } }}
      aiChat={{
        open,
        onOpenChange: setOpen,
        panel: loaded ? (
          <PanelErrorBoundary>
            <LazyPanel />
          </PanelErrorBoundary>
        ) : undefined,
      }}
    />
  );
}
