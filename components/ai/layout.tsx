'use client';

import { type DocsLayoutProps, DocsLayout as Layout } from 'fumadocs-ui/layouts/notebook';
import {
  FullSearchTrigger,
  SearchTrigger,
  type SearchTriggerProps,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { MessageCircleIcon } from 'lucide-react';

import { AIChat, AIChatPanel, AIChatTrigger, useAIChat } from '@/components/ai/search';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function DocsLayout(props: DocsLayoutProps) {
  return (
    <AIChat>
      <ChatLayout {...props} />
      {/* Below md the navbar icon replaces it: a floating pill covers text while scrolling. */}
      <AIChatTrigger className="max-md:hidden" />
    </AIChat>
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

  return (
    <Layout
      {...props}
      slots={{ ...props.slots, searchTrigger: { sm: MobileTriggers, full: FullSearchTrigger } }}
      aiChat={{ open, onOpenChange: setOpen, panel: <AIChatPanel /> }}
    />
  );
}
