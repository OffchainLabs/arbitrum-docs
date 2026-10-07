'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ReactNode } from 'react';
import type { z } from 'zod';

import type { InkeepUIMessage } from '@/app/api/chat/route';
import type { ProvideLinksToolSchema } from '@/lib/ai/inkeep-qa-schema';

import { AIChatProvider, AIChatSources } from './chat';

export { AIChatPanel, AIChatTrigger, useAIChat } from './chat';

export function AIChat({ children }: { children: ReactNode }) {
  const chat = useChat<InkeepUIMessage>({
    id: 'search',
    throttle: 40,
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <AIChatProvider
      chat={chat}
      renderPart={renderPart}
      description={
        <>
          Answers from the docs, powered by{' '}
          <a
            href="https://inkeep.com"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-fd-foreground underline-offset-4 hover:underline"
          >
            Inkeep AI
          </a>
          .
        </>
      }
    >
      {children}
    </AIChatProvider>
  );
}

function renderPart(part: InkeepUIMessage['parts'][number]) {
  // links stream in as partial JSON
  if (part.type !== 'tool-provideLinks' || part.state === 'input-streaming') return;
  const input = part.input as z.infer<typeof ProvideLinksToolSchema> | undefined;

  return <AIChatSources sources={input?.links ?? []} />;
}
