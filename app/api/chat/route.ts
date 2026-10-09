import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai';

import type { AIChatClientData } from '@/components/ai/chat';
import { checkChatRequest } from '@/lib/ai/chat-request';
import { ProvideLinksToolSchema } from '@/lib/ai/inkeep-qa-schema';
import { getSiteUrl } from '@/lib/shared';

export type InkeepUIMessage = UIMessage<never, { client: AIChatClientData }>;

const openai = createOpenAICompatible({
  name: 'inkeep',
  apiKey: process.env.INKEEP_API_KEY,
  baseURL: 'https://api.inkeep.com/v1',
});

export async function POST(req: Request) {
  const check = await checkChatRequest(req, {
    apiKey: process.env.INKEEP_API_KEY,
    siteUrl: getSiteUrl().replace(/\/$/, ''),
    production: process.env.NODE_ENV === 'production',
  });
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  let messages;
  try {
    messages = await convertToModelMessages<InkeepUIMessage>(check.messages as InkeepUIMessage[], {
      ignoreIncompleteToolCalls: true,
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    });
  } catch {
    return Response.json({ error: 'Invalid chat messages' }, { status: 400 });
  }

  const result = streamText({
    model: openai('inkeep-qa-expert'),
    maxOutputTokens: 1_500,
    // No `execute`: Inkeep emits this call to attach source links for the client.
    tools: { provideLinks: { inputSchema: ProvideLinksToolSchema } },
    messages,
    toolChoice: 'auto',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
