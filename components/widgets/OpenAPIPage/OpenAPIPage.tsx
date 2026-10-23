'use client';

import { type OperationObject, useOpenAPI } from 'fumadocs-openapi';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

import jsonRpcTypes from '@/components/widgets/OpenAPIPage/json-rpc-types.json';
import requestUrls from '@/components/widgets/OpenAPIPage/request-urls.json';
import { requestUrl, urlExpression } from '@/lib/json-rpc-request-url';
import type { MethodTypes } from '@/lib/json-rpc-types';

// JSON-RPC code samples. `data.url` carries the fake per-method path, so every tab takes its URL
// from the operation's `x-arbitrum-request-url`, through the generated `request-urls.json`.
const codeUsages = createCodeUsageGeneratorRegistry();
codeUsages.add('jsonrpc-curl', {
  lang: 'bash',
  label: 'JSON-RPC cURL',
  generate: (data) =>
    [
      `curl -X POST ${requestUrl(requestUrls, data.body)}`,
      `  -H "Content-Type: application/json"`,
      `  -d '${JSON.stringify(data.body, null, 2)}'`,
    ].join(' \\\n'),
});

function indentBody(body: unknown, spaces: number): string {
  return JSON.stringify(body, null, 2).replaceAll('\n', `\n${' '.repeat(spaces)}`);
}

codeUsages.add('jsonrpc-typescript', {
  lang: 'typescript',
  label: 'TypeScript',
  generate: (data) =>
    [
      `const response = await fetch(${urlExpression(requestUrl(requestUrls, data.body), 'typescript')}, {`,
      `  method: 'POST',`,
      `  headers: { 'Content-Type': 'application/json' },`,
      `  body: JSON.stringify(${indentBody(data.body, 2)}),`,
      `});`,
      ``,
      `// JSON-RPC returns HTTP 200 for errors too: check \`error\` before \`result\`.`,
      `const { result, error } = await response.json();`,
      `if (error) throw new Error(\`\${error.code}: \${error.message}\`);`,
      `console.log(result);`,
    ].join('\n'),
});

codeUsages.add('jsonrpc-rust', {
  lang: 'rust',
  label: 'Rust',
  generate: (data) =>
    [
      `// Cargo.toml:`,
      `// reqwest = { version = "0.13", features = ["json"] }`,
      `// serde_json = "1"`,
      `// tokio = { version = "1", features = ["macros", "rt-multi-thread"] }`,
      `use serde_json::{json, Value};`,
      ``,
      `#[tokio::main]`,
      `async fn main() -> Result<(), Box<dyn std::error::Error>> {`,
      `    let body = json!(${indentBody(data.body, 4)});`,
      ``,
      `    let response: Value = reqwest::Client::new()`,
      `        .post(${urlExpression(requestUrl(requestUrls, data.body), 'rust')})`,
      `        .json(&body)`,
      `        .send()`,
      `        .await?`,
      `        .json()`,
      `        .await?;`,
      ``,
      `    // JSON-RPC returns HTTP 200 for errors too: check "error" before "result".`,
      `    if let Some(error) = response.get("error") {`,
      `        return Err(format!("JSON-RPC error: {error}").into());`,
      `    }`,
      `    println!("{:#}", response["result"]);`,
      `    Ok(())`,
      `}`,
    ].join('\n'),
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

function typesOf(operation: OperationObject): MethodTypes | undefined {
  const id = operation.operationId;
  return id === undefined ? undefined : (jsonRpcTypes as Record<string, MethodTypes>)[id];
}

/** The `result` of the JSON-RPC response, without the envelope, from `json-rpc-types.json`. */
function ResultFields({ operation }: { operation: OperationObject }) {
  const rows = typesOf(operation)?.result;
  if (!rows) return null;

  return (
    <section className="mt-10">
      <h2 id="result">Result</h2>
      <ul className="not-prose flex flex-col divide-y border-y text-sm">
        {rows.map((row) => (
          <li key={row.name} className="flex flex-col gap-1 py-3">
            <span className="font-mono">
              <span className="text-fd-primary">{row.name}</span> {row.type}
              {row.required ? null : <span className="text-fd-muted-foreground"> optional</span>}
            </span>
            {row.description ? (
              <span className="text-fd-muted-foreground">{row.description}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="text-sm text-fd-muted-foreground">
        On failure the response has an <code>error</code> object with <code>code</code>,{' '}
        <code>message</code> and an optional <code>data</code>, instead of <code>result</code>.
      </p>
    </section>
  );
}

function TypeScriptTypes({ operation }: { operation: OperationObject }) {
  const code = typesOf(operation)?.typescript;
  if (!code) return null;

  return (
    <section className="mt-10">
      <h2 id="typescript-types">TypeScript types</h2>
      <DynamicCodeBlock lang="ts" code={code} />
    </section>
  );
}

export const OpenAPIPage = createOpenAPIPage({
  codeUsages,
  playground: { enabled: false },
  content: {
    // Drops the `apiPlayground` slot, which holds the method and the fake path, the `body` slot,
    // the library's Request Body section (FR-006), and the `responses` slot, which shows the
    // JSON-RPC envelope: PositionalParams, ResultFields and TypeScriptTypes show the method alone.
    renderOperationLayout: (slots, { operation }) => (
      <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1">
          {slots.header}
          {slots.description}
          {slots.parameters}
          <PositionalParams operation={operation} />
          <ResultFields operation={operation} />
          <TypeScriptTypes operation={operation} />
        </div>
        <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:w-[400px]">
          {slots.apiExample}
        </div>
      </div>
    ),
  },
});
