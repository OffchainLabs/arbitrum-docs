import { createOpenAPI } from 'fumadocs-openapi/server';

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
  const server = doc.servers?.[0]?.url as string;
  const body = resolve(doc, op.requestBody?.content?.['application/json']?.schema);
  const params = (resolve(doc, body.properties?.params).prefixItems ?? []) as Json[];
  const example = resolve(doc, body.properties?.params).examples?.[0] ?? [];
  const response = op.responses?.['200']?.content?.['application/json']?.schema as Json;
  const variants = (response?.oneOf ?? [response]) as Json[];

  const lines = [op.description ?? '', '', '## Parameters', ''];
  lines.push('| # | Name | Type | Description |', '| --- | --- | --- | --- |');
  params.forEach((p, i) => {
    const type = p.$ref ? resolve(doc, { $ref: p.$ref }).title : p.type;
    lines.push(`| ${i} | \`${p.title}\` | ${type} | ${p.description ?? ''} |`);
  });
  lines.push('', '## Response', '');
  for (const v of variants) {
    const r = resolve(doc, v);
    lines.push(
      `### ${r.title ?? 'Response'}`,
      '',
      '```json',
      JSON.stringify(r.properties, null, 2),
    );
    lines.push('```', '');
  }
  const request = { jsonrpc: '2.0', id: 1, method: op.operationId, params: example };
  lines.push('## Example', '', '```bash', `curl -X POST ${server} \\`);
  lines.push(
    `  -H "Content-Type: application/json" \\`,
    `  -d '${JSON.stringify(request)}'`,
    '```',
  );
  return lines.join('\n');
}
