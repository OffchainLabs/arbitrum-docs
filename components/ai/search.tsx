'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type RefObject, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { z } from 'zod';

import type { InkeepUIMessage } from '@/app/api/chat/route';
import { onAskAI } from '@/lib/ai/bridge';
import { type ComponentType, captureChatEvent } from '@/lib/ai/events';
import type { ProvideLinksToolSchema } from '@/lib/ai/inkeep-qa-schema';

import {
  type AIChatClientData,
  AIChatProvider,
  AIChatSources,
  useAIChat,
  useAIChatSend,
} from './chat';

export { AIChatPanel, AIChatTrigger, useAIChat } from './chat';

// Keeps the request body under the 32 KiB cap of /api/chat in normal use.
const MAX_SENT_MESSAGES = 10;

export function AIChat({ children }: { children: ReactNode }) {
  const source = useRef<ComponentType>('ChatButton');
  const chat = useChat<InkeepUIMessage>({
    id: 'search',
    throttle: 40,
    onFinish: ({ isAbort, isDisconnect, isError }) => {
      if (isAbort || isDisconnect || isError) return;
      captureChatEvent('assistant_message_received', { component_type: source.current });
      source.current = 'ChatButton';
    },
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages, body, trigger, messageId }) => ({
        body: { ...body, id, messages: messages.slice(-MAX_SENT_MESSAGES), trigger, messageId },
      }),
    }),
  });

  return (
    <AIChatProvider
      chat={chat}
      renderPart={renderPart}
      toMessage={(text) => {
        captureChatEvent('user_message_submitted', { component_type: source.current });
        return {
          role: 'user',
          parts: [
            {
              type: 'data-client',
              data: { location: location.href, title: document.title } satisfies AIChatClientData,
            },
            { type: 'text', text },
          ],
        };
      }}
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
      <AskAIBridge source={source} />
      {children}
    </AIChatProvider>
  );
}

function AskAIBridge({ source }: { source: RefObject<ComponentType> }) {
  const { setOpen } = useAIChat();
  const send = useAIChatSend();

  useEffect(
    () =>
      onAskAI((prompt) => {
        setOpen(true);
        if (!prompt.trim()) return;
        source.current = 'SearchBar';
        send(prompt.trim());
      }),
    [setOpen, send, source],
  );

  return null;
}

function renderPart(part: InkeepUIMessage['parts'][number]) {
  // links stream in as partial JSON
  if (part.type !== 'tool-provideLinks' || part.state === 'input-streaming') return;
  const input = part.input as z.infer<typeof ProvideLinksToolSchema> | undefined;

  return (
    <div
      onClickCapture={(e) => {
        const link = (e.target as HTMLElement).closest('a');
        if (link) {
          captureChatEvent('assistant_source_item_clicked', {
            component_type: 'ChatButton',
            source_link: link.href,
          });
        }
      }}
    >
      <AIChatSources sources={input?.links ?? []} />
    </div>
  );
}
