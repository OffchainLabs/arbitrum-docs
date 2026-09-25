/**
 * Pure argument-parsing helpers for redirects-check.ts, split out so they can be unit tested
 * without importing the CLI script itself — that script runs a real network fetch unconditionally
 * at import time, which a test must never trigger as a side effect.
 */

/**
 * Reads `--flag <value>`, requiring a non-empty value when the flag is present at all. A value
 * that is missing (trailing flag) or itself looks like another flag (`--flag --other-flag`) is
 * treated the same way — both mean the intended value never arrived.
 */
function readFlagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`redirects-check: ${flag} requires a value`);
  }
  return value;
}

/**
 * `defaultBaseUrl` is what `--base-url` falls back to, so omitting both leaves nothing to return.
 * That is a caller bug rather than a user one, and it is named here for the same reason the flag
 * cases above are: without the guard it surfaces as `undefined.replace` several frames away.
 */
export interface ParseArgsOptions {
  defaultBaseUrl?: string;
}

export interface ParsedArgs {
  baseUrl: string;
}

export function parseArgs(
  argv: readonly string[],
  { defaultBaseUrl }: ParseArgsOptions = {},
): ParsedArgs {
  const baseUrl = readFlagValue(argv, '--base-url') ?? defaultBaseUrl;
  if (!baseUrl) {
    throw new Error('redirects-check: no --base-url and no defaultBaseUrl to fall back on');
  }
  return { baseUrl: baseUrl.replace(/\/+$/, '') };
}
