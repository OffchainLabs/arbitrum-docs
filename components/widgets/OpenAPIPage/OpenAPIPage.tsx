'use client';

import { type OperationObject, useOpenAPI } from 'fumadocs-openapi';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';

// The only code sample: a JSON-RPC POST to the server root. `data.url` carries the fake per-method
// path, so it is replaced with the server URL of the document.
const SERVER_URL = 'https://arb1.arbitrum.io/rpc';
const codeUsages = createCodeUsageGeneratorRegistry();
codeUsages.add('jsonrpc-curl', {
  lang: 'bash',
  label: 'JSON-RPC cURL',
  generate: (data) =>
    [
      `curl -X POST ${SERVER_URL}`,
      `  -H "Content-Type: application/json"`,
      `  -d '${JSON.stringify(data.body, null, 2)}'`,
    ].join(' \\\n'),
});

interface ParamSchema {
  'title'?: string;
  'description'?: string;
  '$ref-value'?: ParamSchema;
}

/**
 * The positional `params` of the JSON-RPC envelope. fumadocs-openapi's schema UI reads only
 * `items`, never `prefixItems`, so each position is listed here: index, name, type, description.
 */
function PositionalParams({ operation }: { operation: OperationObject }) {
  const { resolve } = useOpenAPI().doc;
  const body = resolve(operation.requestBody) as
    { content?: Record<string, { schema?: unknown }> } | undefined;
  const schema = resolve(body?.content?.['application/json']?.schema) as
    { properties?: Record<string, unknown> } | undefined;
  const params = resolve(schema?.properties?.['params']) as
    { prefixItems?: ParamSchema[] } | undefined;
  const items = (params?.prefixItems ?? []).map((raw) => {
    const item = resolve(raw) as ParamSchema;
    // `resolve` merges the sibling `title` over the target's, so the type name is read from the
    // reference target, which the document's magic proxy exposes as `$ref-value`.
    const type = raw['$ref-value']?.title;
    return { name: item.title, type: type ?? 'any', description: item.description };
  });
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 id="params">Params</h2>
      <ol className="not-prose flex flex-col divide-y border-y text-sm">
        {items.map((item, i) => (
          <li key={item.name ?? i} className="flex flex-col gap-1 py-3">
            <span className="font-mono">
              <span className="text-fd-muted-foreground">[{i}] </span>
              <span className="text-fd-primary">{item.name}</span> {item.type}
            </span>
            {item.description ? (
              <span className="text-fd-muted-foreground">{item.description}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export const OpenAPIPage = createOpenAPIPage({
  codeUsages,
  playground: { enabled: false },
  content: {
    // Drops the `apiPlayground` slot, which holds the method and the fake path.
    renderOperationLayout: (slots, { operation }) => (
      <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1">
          {slots.header}
          {slots.description}
          {slots.parameters}
          <PositionalParams operation={operation} />
          {slots.body}
          {slots.responses}
        </div>
        <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:w-[400px]">
          {slots.apiExample}
        </div>
      </div>
    ),
  },
});
