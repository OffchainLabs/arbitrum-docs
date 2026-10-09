import { z } from 'zod';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 20;
const MAX_USER_TEXT_CHARS = 8_000;

const MAX_PARTS = 100;

const textPart = z.object({ type: z.literal('text'), text: z.string() });

// Only the parts the chat sends. The AI SDK downloads every file URL in a message on the server,
// so a `file` part, or a tool output that holds one, must never reach `convertToModelMessages`.
// Unnamed keys are dropped.
const userPart = z.discriminatedUnion('type', [
  textPart,
  z.object({
    type: z.literal('data-client'),
    data: z.object({ location: z.string(), title: z.string() }),
  }),
]);

const assistantPart = z.discriminatedUnion('type', [
  textPart,
  z.object({ type: z.literal('step-start') }),
  // No `execute`, so the call never has an output; the route drops it as incomplete.
  z.object({
    type: z.literal('tool-provideLinks'),
    toolCallId: z.string(),
    state: z.enum(['input-streaming', 'input-available']),
    input: z.unknown().optional(),
  }),
]);

const requestSchema = z.object({
  messages: z
    .array(
      z.discriminatedUnion('role', [
        z.object({ role: z.literal('user'), parts: z.array(userPart).max(MAX_PARTS) }),
        z.object({ role: z.literal('assistant'), parts: z.array(assistantPart).max(MAX_PARTS) }),
      ]),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export type ChatRequestResult =
  | { ok: true; messages: z.infer<typeof requestSchema>['messages'] }
  | { ok: false; status: 400 | 403 | 413 | 415 | 503; error: string };

type ChatMessage = z.infer<typeof requestSchema>['messages'][number];

function userTextLength(message: ChatMessage): number {
  if (message.role !== 'user') return 0;
  let length = 0;
  for (const part of message.parts) {
    if (part.type === 'text') length += part.text.length;
  }
  return length;
}

function originAllowed(req: Request, siteUrl: string, production: boolean): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return !production;
  return origin === new URL(req.url).origin || origin === siteUrl;
}

/** Rejects a chat request that is unconfigured, cross-origin, oversized or malformed. */
export async function checkChatRequest(
  req: Request,
  options: { apiKey: string | undefined; siteUrl: string; production: boolean },
): Promise<ChatRequestResult> {
  if (!options.apiKey) return { ok: false, status: 503, error: 'AI assistant is not configured' };
  if (!originAllowed(req, options.siteUrl, options.production)) {
    return { ok: false, status: 403, error: 'Origin not allowed' };
  }
  if (!req.headers.get('content-type')?.startsWith('application/json')) {
    return { ok: false, status: 415, error: 'Content-Type must be application/json' };
  }
  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'Request too large' };
  }
  const body = await req.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'Request too large' };
  }
  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(JSON.parse(body));
  } catch {
    return { ok: false, status: 400, error: 'Invalid chat request' };
  }
  if (parsed.messages.some((m) => userTextLength(m) > MAX_USER_TEXT_CHARS)) {
    return { ok: false, status: 413, error: 'Message too large' };
  }
  return { ok: true, messages: parsed.messages };
}
