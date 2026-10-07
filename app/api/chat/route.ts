import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai';

import type { AIChatClientData } from '@/components/ai/chat';
import { ProvideLinksToolSchema } from '@/lib/ai/inkeep-qa-schema';

export type InkeepUIMessage = UIMessage<never, { client: AIChatClientData }>;

const openai = createOpenAICompatible({
  name: 'inkeep',
  apiKey: process.env.INKEEP_API_KEY,
  baseURL: 'https://api.inkeep.com/v1',
});

export async function POST(req: Request, ctx: RouteContext<'/api/chat'>) {
  const reqJson = await req.json();

  const result = streamText({
    model: openai('inkeep-qa-expert'),
    tools: {
      provideLinks: {
        inputSchema: ProvideLinksToolSchema,
      },
    },
    messages: await convertToModelMessages<InkeepUIMessage>(reqJson.messages, {
      ignoreIncompleteToolCalls: true,
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    }),
    toolChoice: 'auto',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
