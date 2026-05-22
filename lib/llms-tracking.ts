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
