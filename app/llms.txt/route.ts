import { llms } from 'fumadocs-core/source';

import { formatLlmsIndex } from '@/lib/llms-index';
import { source } from '@/lib/source';

export const revalidate = false;

/**
 * `llms(source).index()` returns a promise as of fumadocs-core 16.15.9 (it was synchronous in
 * 16.15.1), so the handler has to await it. `formatLlmsIndex` restores master's title and summary,
 * links each page's `.md` mirror and lists each page once.
 */
export async function GET() {
  return new Response(formatLlmsIndex(await llms(source).index()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
