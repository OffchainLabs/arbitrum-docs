import { llms } from 'fumadocs-core/source';

import { source } from '@/lib/source';

export const revalidate = false;

/**
 * `llms(source).index()` returns a promise as of fumadocs-core 16.15.9 (it was synchronous in
 * 16.15.1), so the handler has to await it before handing the string to `Response`.
 */
export async function GET() {
  return new Response(await llms(source).index());
}
