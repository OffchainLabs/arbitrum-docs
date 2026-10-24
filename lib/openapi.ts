import { createOpenAPI } from 'fumadocs-openapi/server';

import { methodTypes } from './json-rpc-types.ts';

// Server-only. The JSON-RPC reference spike: one OpenAPI 3.1 document, one fake path per method.
export const openapi = createOpenAPI({
  input: ['./content/openapi/arbitrum-json-rpc.json'],
});

type Json = Record<string, any>;

function resolve(doc: Json, node: Json | undefined): Json {
  const ref = node?.$ref as string | undefined;
  if (!ref) return node ?? {};
  const target = ref
    .slice(2)
    .split('/')
    .reduce<Json>((acc, key) => acc[key], doc);
  // A sibling `title`/`description` next to `$ref` overrides the target's (OpenAPI 3.1).
  return { ...resolve(doc, target), ...node, $ref: undefined };
}

/**
 * Spike: markdown for a generated OpenAPI page, for the `.md` mirror. The fake path is taken from
 * the last slug, which the generator derived from it; a real version would read the operations
 * from the page instead.
 */
export async function openapiPageMarkdown(schemaId: string, slug: string): Promise<string> {
  const doc = (await openapi.getSchema(schemaId)).bundled as Json;
  const op = doc.paths?.[`/${slug}`]?.post as Json | undefined;
  if (!op) return '';
  const server = op['x-arbitrum-request-url'] as string | undefined;
  if (!server) throw new Error(`${schemaId}: POST /${slug} has no x-arbitrum-request-url`);
  const body = resolve(doc, op.requestBody?.content?.['application/json']?.schema);
  const params = (resolve(doc, body.properties?.params).prefixItems ?? []) as Json[];
  const example = resolve(doc, body.properties?.params).examples?.[0] ?? [];
  const types = methodTypes(doc, op.operationId as string);

  const lines = ['', '## Parameters', ''];
  lines.push('| # | Name | Type | Description |', '| --- | --- | --- | --- |');
  params.forEach((p, i) => {
    const type = p.$ref ? resolve(doc, { $ref: p.$ref }).title : p.type;
    lines.push(`| ${i} | \`${p.title}\` | ${type} | ${p.description ?? ''} |`);
  });
  lines.push('', '## Result', '', '| Name | Type | Required | Description |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of types.result) {
    const type = row.type.replaceAll('|', '\\|');
    lines.push(
      `| \`${row.name}\` | ${type} | ${row.required ? 'yes' : 'no'} | ${row.description} |`,
    );
  }
  lines.push('', 'On failure the response has an `error` object with `code`, `message` and an');
  lines.push('optional `data`, instead of `result`.', '');
  lines.push('## Go definition', '', '```go', types.go, '```', '');
  const request = { jsonrpc: '2.0', id: 1, method: op.operationId, params: example };
  lines.push('## Example', '', '```bash', `curl -X POST ${server} \\`);
  lines.push(
    `  -H "Content-Type: application/json" \\`,
    `  -d '${JSON.stringify(request)}'`,
    '```',
  );
  return lines.join('\n');
}
