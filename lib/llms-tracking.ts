/**
 * Classification and payload building for the PostHog `llms_file_fetched` event that `proxy.ts`
 * sends. The event and property names continue the series the Docusaurus site produced, so the
 * existing dashboards keep working.
 */
import { docsContentRoute, docsRoute } from './shared.ts';

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
  | { kind: 'markdown-mirror'; trackedPath: string; fileType: 'page' }
  | { kind: 'ignored'; trackedPath: null; fileType: null };

const MIRROR_PREFIX = `${docsContentRoute}/`;
const MIRROR_SUFFIX = '/content.md';

/**
 * Classifies a request path. Both markdown shapes, `/docs/<slug>.md` and
 * `/llms.mdx/docs/<slug>/content.md`, are tracked as `/docs/<slug>.md`, so one page is one series.
 * A rewrite does not re-enter the proxy, so each request is counted once.
 */
export function pathInfo(pathname: string): PathInfoResult {
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') {
    return { kind: 'llms-index', trackedPath: pathname, fileType: 'index' };
  }

  if (!pathname.endsWith('.md')) {
    return { kind: 'ignored', trackedPath: null, fileType: null };
  }

  if (pathname.startsWith(MIRROR_PREFIX) && pathname.endsWith(MIRROR_SUFFIX)) {
    const slug = pathname.slice(MIRROR_PREFIX.length, -MIRROR_SUFFIX.length);
    const trackedPath = slug === '' ? `${docsRoute}.md` : `${docsRoute}/${slug}.md`;
    return { kind: 'markdown-mirror', trackedPath, fileType: 'page' };
  }

  if (pathname === `${docsRoute}.md` || pathname.startsWith(`${docsRoute}/`)) {
    return { kind: 'markdown-direct', trackedPath: pathname, fileType: 'page' };
  }

  return { kind: 'ignored', trackedPath: null, fileType: null };
}

export interface BuildPayloadInput {
  trackedPath: string;
  fileType: 'index' | 'page';
  userAgent: string;
  referrer: string;
  posthogKey: string;
  /** Origin the tracked path is resolved against, e.g. `https://docs.arbitrum.io`. No trailing slash. */
  siteUrl: string;
}

export interface TrackingPayload {
  api_key: string;
  event: 'llms_file_fetched';
  distinct_id: string;
  properties: {
    $current_url: string;
    file: string;
    file_type: 'index' | 'page';
    bot_category: BotCategory;
    $user_agent: string;
    $referrer: string;
    $process_person_profile: false;
  };
}

/**
 * Builds the PostHog capture body. Each event gets a random `distinct_id` and no person profile:
 * the series counts fetches and bot categories, not visitors.
 */
export function buildTrackingPayload(input: BuildPayloadInput): TrackingPayload {
  return {
    api_key: input.posthogKey,
    event: 'llms_file_fetched',
    distinct_id: crypto.randomUUID(),
    properties: {
      $current_url: `${input.siteUrl}${input.trackedPath}`,
      file: input.trackedPath,
      file_type: input.fileType,
      bot_category: classifyUA(input.userAgent),
      $user_agent: input.userAgent,
      $referrer: input.referrer,
      $process_person_profile: false,
    },
  };
}
