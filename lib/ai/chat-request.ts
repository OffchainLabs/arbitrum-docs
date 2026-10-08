import { z } from 'zod';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 20;
const MAX_USER_TEXT_CHARS = 8_000;

const requestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), parts: z.array(z.unknown()).max(100) }))
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
    if (typeof part !== 'object' || part === null) continue;
    const { type, text } = part as { type?: unknown; text?: unknown };
    if (type === 'text' && typeof text === 'string') length += text.length;
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
