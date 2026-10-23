/**
 * The URL that the request samples target, looked up by the JSON-RPC `method` in the request body.
 * fumadocs-openapi passes a code generator only the encoded request, not the operation, so the
 * operation's `x-arbitrum-request-url` reaches it through the generated `request-urls.json`.
 */
export function requestUrl(urls: Record<string, string>, body: unknown): string {
  const method = (body as { method?: unknown } | undefined)?.method;
  const url = typeof method === 'string' ? urls[method] : undefined;
  if (url === undefined) {
    throw new Error(
      `JSON-RPC method ${String(method)} has no request URL in request-urls.json. ` +
        'Run node scripts/generate-openapi-spike.ts.',
    );
  }
  return url;
}

/**
 * The request URL as an expression in a TypeScript or Rust sample. A `$NAME` placeholder expands
 * in the curl tab's shell, but not inside a string, so these tabs read it from the environment.
 */
export function urlExpression(url: string, lang: 'typescript' | 'rust'): string {
  if (!url.startsWith('$')) return lang === 'typescript' ? `'${url}'` : `"${url}"`;
  const name = /^\$([A-Z][A-Z0-9_]*)$/.exec(url)?.[1];
  if (name === undefined) {
    throw new Error(`Request URL ${url} is neither a URL nor a $NAME placeholder.`);
  }
  return lang === 'typescript' ? `process.env.${name}!` : `std::env::var("${name}")?`;
}
