/**
 * Classification and payload building for LLM-fetch tracking, ported from upstream
 * `lib/llms-tracking.ts` in OffchainLabs/arbitrum-docs.
 *
 * **This module is deliberately pure and import-free.** It is consumed two ways:
 *
 * - `proxy.ts` imports it as TypeScript, via the bundler.
 * - `scripts/lib/llms-tracking.test.ts` imports it directly under `node --test`, relying on
 *   Node 22's native type stripping. That only works while the file stays free of runtime imports
 *   (a bare `./shared` specifier does not resolve in plain ESM, and importing `./shared.ts` would
 *   need `allowImportingTsExtensions` in tsconfig). Keeping it import-free is what lets the tests
 *   run under `pnpm test` without a second copy of the logic to drift from.
 *
 * The route constants below are therefore local copies of `lib/shared.ts`. `proxy.ts` asserts at
 * compile time that they still agree, so a change to one that is not mirrored here fails
 * `types:check` rather than silently mis-classifying every request.
 */

/** Mirrors `docsRoute` in `lib/shared.ts`; checked against it in `proxy.ts`. */
export const DOCS_ROUTE = '/docs';
/** Mirrors `docsContentRoute` in `lib/shared.ts`; checked against it in `proxy.ts`. */
export const DOCS_CONTENT_ROUTE = '/llms.mdx/docs';

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
  | { kind: 'markdown-negotiate'; trackedPath: string; fileType: 'page' }
  | { kind: 'ignored'; trackedPath: null; fileType: null };

const MIRROR_PREFIX = `${DOCS_CONTENT_ROUTE}/`;
const MIRROR_SUFFIX = '/content.md';

/**
 * Canonical tracked path for a docs slug, so the same page reads the same in PostHog however it
 * was requested. The empty slug is the docs index, which is `${DOCS_ROUTE}.md`, not
 * `${DOCS_ROUTE}/.md`.
 */
function markdownPathFor(slug: string): string {
  return slug === '' ? `${DOCS_ROUTE}.md` : `${DOCS_ROUTE}/${slug}.md`;
}

/**
 * Classifies an incoming request path for LLM-fetch tracking.
 *
 * Three request shapes reach the same markdown resource here, and all three are normalised to the
 * one canonical `${DOCS_ROUTE}/<slug>.md` form, so a page's fetches are one number rather than
 * three. (Upstream did the same thing for negotiated requests, tracking the `.md` form rather than
 * the clean URL the reader typed.)
 *
 * Two of upstream's rules have no equivalent and are dropped:
 *
 * - **No `/sdk/` exclusion.** Upstream excluded its auto-generated typedoc tree; this site has no
 *   `/sdk` route at all.
 * - **No tracking of `.md` outside `/docs`.** A legacy URL like `/anytrust.md` is answered with a
 *   307 to `/docs/anytrust.md`, so the reader's follow-up request is tracked. Counting the redirect
 *   hop too would double every legacy fetch.
 *
 * @param pathname - URL pathname only, no query string.
 * @param markdownPreferred - the router's `isMarkdownPreferred(request)` result. Using the same
 *   decision keeps tracking aligned with the representation actually served.
 */
export function pathInfo(pathname: string, markdownPreferred: boolean): PathInfoResult {
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') {
    return { kind: 'llms-index', trackedPath: pathname, fileType: 'index' };
  }

  if (pathname.endsWith('.md')) {
    // The per-page markdown mirror: `/llms.mdx/docs/<slug>/content.md`. It is both the internal
    // rewrite target and a directly fetchable URL. A rewrite does not re-enter the proxy, so a
    // `/docs/<slug>.md` request is counted once, here or above, never twice.
    if (pathname.startsWith(MIRROR_PREFIX) && pathname.endsWith(MIRROR_SUFFIX)) {
      const slug = pathname.slice(MIRROR_PREFIX.length, -MIRROR_SUFFIX.length);
      return { kind: 'markdown-mirror', trackedPath: markdownPathFor(slug), fileType: 'page' };
    }

    if (pathname === `${DOCS_ROUTE}.md` || pathname.startsWith(`${DOCS_ROUTE}/`)) {
      return { kind: 'markdown-direct', trackedPath: pathname, fileType: 'page' };
    }

    return { kind: 'ignored', trackedPath: null, fileType: null };
  }

  // Match the proxy's negotiation rewrite for any path under `${DOCS_ROUTE}`, dots included, so
  // a slug like `/docs/v1.2/x` is tracked when served as markdown. The proxy passes its actual
  // Accept negotiation result rather than making a second, potentially different decision here.
  //
  // The proxy cannot check that the page exists (it cannot import `lib/source`), so this tracks a
  // request that may 404, exactly as the `.md` branch above already does for `/docs/nope.md`. An
  // overcount appears in PostHog as a `file` value nobody recognises; an undercount appears as
  // silence.
  const isDocsPath = pathname === DOCS_ROUTE || pathname.startsWith(`${DOCS_ROUTE}/`);
  if (isDocsPath && markdownPreferred) {
    const stripped = pathname.replace(/\/$/, '');
    const slug = stripped.slice(DOCS_ROUTE.length).replace(/^\//, '');
    return { kind: 'markdown-negotiate', trackedPath: markdownPathFor(slug), fileType: 'page' };
  }

  return { kind: 'ignored', trackedPath: null, fileType: null };
}

/**
 * The distinct_id salt, rotated daily (UTC).
 *
 * Rotating it is what stops a reader being linked across days: the same IP hashes differently
 * tomorrow. Within one day, requests from one client still collapse into a single PostHog person
 * rather than one per hit, which is the whole point of hashing rather than randomising.
 *
 * **This is pseudonymisation, not anonymisation.** The salt is a public date string, so the entire
 * IPv4 space can be hashed against it in seconds and a stored distinct_id matched back to an
 * address. Treat the id as personal data. Making it genuinely one-way needs a secret salt, which
 * means a server-side env var and a decision about what happens when it is unset; that is a
 * deliberate follow-up, not something to bolt on here.
 */
export function dailySalt(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export async function ipHash(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}|${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface BuildPayloadInput {
  trackedPath: string;
  fileType: 'index' | 'page';
  userAgent: string;
  referrer: string;
  /** Client IP, or `''` when `x-forwarded-for` was absent. Never included in the payload. */
  ip: string;
  posthogKey: string;
  /** Origin the tracked path is resolved against, e.g. `https://docs.arbitrum.io`. No trailing slash. */
  siteUrl: string;
  now?: Date;
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
    /**
     * Set only on the random-id fallback below, never on the hashed-IP path. Optional rather than
     * `boolean` so the common path cannot accidentally opt out and lose the person counts the
     * daily hash exists to produce.
     */
    $process_person_profile?: false;
  };
}

/**
 * Builds the PostHog capture body.
 *
 * The event name and property names are upstream's verbatim, on purpose: this is the same PostHog
 * project, so renaming them here would orphan the existing dashboards rather than continue them.
 *
 * Unlike `lib/posthog.ts`, this does not set `$process_person_profile: false`. That is upstream's
 * behaviour and the point of the daily IP hash: it is what makes "how many distinct crawlers
 * fetched this page today" answerable. It does mean one person profile per client per day.
 *
 * **An absent IP gets a random id with person processing off.** Hashing `''` is a constant, so
 * every request without an `x-forwarded-for` header would land on one shared PostHog person and
 * read as a single extraordinarily busy client. A random id fixes that, but on its own it swaps
 * one problem for its mirror image: because this payload deliberately omits the person-profile
 * opt-out that the common path needs, a unique id per request would mint a profile per request,
 * and every one of them would be unrelatable to anything by construction. Opting out on this
 * branch alone keeps the request countable as an event without the profile, and leaves the hashed
 * path and the dashboards untouched. This is the same treatment `lib/posthog.ts` gives its
 * anonymous feedback events. The header is always present on Vercel, so in production this is a
 * fallback rather than the common path.
 */
export async function buildTrackingPayload(input: BuildPayloadInput): Promise<TrackingPayload> {
  const category = classifyUA(input.userAgent);
  const salt = dailySalt(input.now);
  const hasIp = input.ip !== '';
  const distinct_id = hasIp ? await ipHash(input.ip, salt) : crypto.randomUUID();

  return {
    api_key: input.posthogKey,
    event: 'llms_file_fetched',
    distinct_id,
    properties: {
      $current_url: `${input.siteUrl}${input.trackedPath}`,
      file: input.trackedPath,
      file_type: input.fileType,
      bot_category: category,
      $user_agent: input.userAgent,
      $referrer: input.referrer,
      ...(hasIp ? {} : { $process_person_profile: false as const }),
    },
  };
}
