export type BotCategory =
  | 'oai-searchbot'
  | 'gptbot'
  | 'claudebot'
  | 'anthropic'
  | 'perplexitybot'
  | 'google-extended'
  | 'googlebot'
  | 'bingbot'
  | 'meta-externalagent'
  | 'other-bot'
  | 'human';

// Ordered most-specific first. The first match wins.
const UA_PATTERNS: Array<{ pattern: RegExp; category: BotCategory }> = [
  { pattern: /OAI-SearchBot/i, category: 'oai-searchbot' },
  { pattern: /GPTBot/i, category: 'gptbot' },
  { pattern: /anthropic-ai/i, category: 'anthropic' },
  { pattern: /ClaudeBot|Claude-Web/i, category: 'claudebot' },
  { pattern: /PerplexityBot/i, category: 'perplexitybot' },
  { pattern: /Google-Extended/i, category: 'google-extended' },
  { pattern: /Googlebot/i, category: 'googlebot' },
  { pattern: /Bingbot/i, category: 'bingbot' },
  { pattern: /meta-externalagent|meta-externalfetcher/i, category: 'meta-externalagent' },
  { pattern: /bot|crawler|spider|archive\.org_bot/i, category: 'other-bot' },
];

export function classifyUA(ua: string): BotCategory {
  for (const { pattern, category } of UA_PATTERNS) {
    if (pattern.test(ua)) return category;
  }
  return 'human';
}

export type PathInfoResult =
  | { kind: 'llms-index'; trackedPath: string; fileType: 'index' }
  | { kind: 'markdown-direct'; trackedPath: string; fileType: 'page' }
  | { kind: 'markdown-negotiate'; trackedPath: string; fileType: 'page' }
  | { kind: 'ignored'; trackedPath: null; fileType: null };

const SDK_EXCLUDE = /^\/sdk\//;

/**
 * Classifies an incoming request path for LLM-fetch tracking purposes.
 *
 * @param pathname - URL pathname only (no query string). Pass the result of `new URL(request.url).pathname`.
 * @param accept - The `Accept` header value (empty string if absent).
 */
export function pathInfo(pathname: string, accept: string): PathInfoResult {
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') {
    return { kind: 'llms-index', trackedPath: pathname, fileType: 'index' };
  }

  if (pathname.endsWith('.md')) {
    if (SDK_EXCLUDE.test(pathname)) {
      return { kind: 'ignored', trackedPath: null, fileType: null };
    }
    return { kind: 'markdown-direct', trackedPath: pathname, fileType: 'page' };
  }

  const isCleanUrl = !pathname.includes('.');
  const wantsMarkdown = accept.includes('text/markdown');
  if (isCleanUrl && wantsMarkdown) {
    const stripped = pathname.replace(/\/$/, '');
    const trackedPath = stripped === '' ? '/index.md' : `${stripped}.md`;
    return { kind: 'markdown-negotiate', trackedPath, fileType: 'page' };
  }

  return { kind: 'ignored', trackedPath: null, fileType: null };
}
