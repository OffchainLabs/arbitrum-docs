'use client';

import { useChat } from '@ai-sdk/react';
import { APICallError, DefaultChatTransport } from 'ai';
import { type RefObject, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { z } from 'zod';

import type { InkeepUIMessage } from '@/app/api/chat/route';
import { useAIChatPendingPrompt } from '@/components/ai/chat/open';
import { type ComponentType, captureChatEvent } from '@/lib/ai/events';
import type { ProvideLinksToolSchema } from '@/lib/ai/inkeep-qa-schema';
import { inkeepAiChatSettings } from '@/lib/inkeep';

import {
  type AIChatClientData,
  AIChatPanel,
  AIChatProvider,
  AIChatSources,
  useAIChatSend,
} from './chat';

// Keeps the request body under the 32 KiB cap of /api/chat in normal use.
const MAX_SENT_MESSAGES = 10;

const errorText: Record<number, string> = {
  429: 'Too many questions. Wait a minute and try again.',
  413: 'This conversation is too long. Start a new chat.',
  503: 'The AI assistant is not available.',
};

/** Replaces the raw response body that AI SDK puts in `error.message` with plain text. */
function plainError(error: Error | undefined): Error | undefined {
  if (!error) return undefined;
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  const text = status === undefined ? undefined : errorText[status];
  return new Error(text ?? 'Something went wrong. Try again.');
}

/** The chat panel with its chat state; `components/ai/layout.tsx` loads it on first open. */
export function AIChatLazyPanel() {
  return (
    <AIChat>
      <AIChatPanel />
    </AIChat>
  );
}

function AIChat({ children }: { children: ReactNode }) {
  const source = useRef<ComponentType>('ChatButton');
  const chat = useChat<InkeepUIMessage>({
    id: 'search',
    throttle: 40,
    onFinish: ({ isAbort, isDisconnect, isError }) => {
      const component = source.current;
      source.current = 'ChatButton';
      if (isAbort || isDisconnect || isError) return;
      captureChatEvent('assistant_message_received', { component_type: component });
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
      chat={{ ...chat, error: plainError(chat.error) }}
      suggestions={inkeepAiChatSettings.exampleQuestions}
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

/** Sends the prompt that the search dialog queued, once per prompt id. */
function AskAIBridge({ source }: { source: RefObject<ComponentType> }) {
  const { prompt, clear } = useAIChatPendingPrompt();
  const send = useAIChatSend();
  const sent = useRef(0);

  useEffect(() => {
    if (!prompt) return;
    clear(prompt.id);
    if (sent.current === prompt.id) return;
    sent.current = prompt.id;
    source.current = 'SearchBar';
    send(prompt.text);
  }, [prompt, clear, send, source]);

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
