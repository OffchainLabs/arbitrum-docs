'use client';

import { type OperationObject, useOpenAPI } from 'fumadocs-openapi';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { type TypeNode, TypeTable } from 'fumadocs-ui/components/type-table';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Clipboard } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import jsonRpcTypes from '@/components/widgets/OpenAPIPage/json-rpc-types.json';
import requestUrls from '@/components/widgets/OpenAPIPage/request-urls.json';
import { cn } from '@/lib/cn';
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

/** The request body as a Python literal: JSON with Python's spelling of null and booleans. */
function pythonLiteral(value: unknown, indent = ''): string {
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) return `[${value.map((v) => pythonLiteral(v, indent)).join(', ')}]`;
  if (typeof value !== 'object') return JSON.stringify(value);
  const inner = `${indent}    `;
  const entries = Object.entries(value).map(
    ([key, v]) => `${inner}${JSON.stringify(key)}: ${pythonLiteral(v, inner)}`,
  );
  return entries.length === 0 ? '{}' : `{\n${entries.join(',\n')}\n${indent}}`;
}

codeUsages.add('jsonrpc-python', {
  lang: 'python',
  label: 'Python',
  generate: (data) => {
    const url = urlExpression(requestUrl(requestUrls, data.body), 'python');
    return [
      ...(url.startsWith('os.') ? ['import os'] : []),
      `import requests`,
      ``,
      `body = ${pythonLiteral(data.body)}`,
      `response = requests.post(${url}, json=body)`,
      `response.raise_for_status()`,
      `reply = response.json()`,
      ``,
      `# JSON-RPC returns HTTP 200 for errors too: check "error" before "result".`,
      `if "error" in reply:`,
      `    raise RuntimeError(f"{reply['error']['code']}: {reply['error']['message']}")`,
      `print(reply["result"])`,
    ].join('\n');
  },
});

codeUsages.add('jsonrpc-go', {
  lang: 'go',
  label: 'Go',
  generate: (data) => {
    const url = urlExpression(requestUrl(requestUrls, data.body), 'go');
    const imports = [
      'bytes',
      'encoding/json',
      'fmt',
      'net/http',
      ...(url.startsWith('os.') ? ['os'] : []),
    ];
    return [
      `package main`,
      ``,
      `import (`,
      ...imports.map((name) => `\t"${name}"`),
      `)`,
      ``,
      `func main() {`,
      `\tbody := []byte(\`${JSON.stringify(data.body, null, 2).replaceAll('\n', '\n\t')}\`)`,
      `\tresponse, err := http.Post(${url}, "application/json", bytes.NewReader(body))`,
      `\tif err != nil {`,
      `\t\tpanic(err)`,
      `\t}`,
      `\tdefer response.Body.Close()`,
      ``,
      `\t// JSON-RPC returns HTTP 200 for errors too: check "error" before "result".`,
      `\tvar reply struct {`,
      `\t\tResult json.RawMessage \`json:"result"\``,
      `\t\tError  *struct {`,
      `\t\t\tCode    int    \`json:"code"\``,
      `\t\t\tMessage string \`json:"message"\``,
      `\t\t} \`json:"error"\``,
      `\t}`,
      `\tif err := json.NewDecoder(response.Body).Decode(&reply); err != nil {`,
      `\t\tpanic(err)`,
      `\t}`,
      `\tif reply.Error != nil {`,
      `\t\tpanic(fmt.Sprintf("JSON-RPC error %d: %s", reply.Error.Code, reply.Error.Message))`,
      `\t}`,
      `\tfmt.Println(string(reply.Result))`,
      `}`,
    ].join('\n');
  },
});

/** What a `$NAME` placeholder in a request URL stands for. */
const PLACEHOLDERS: Record<string, string> = {
  $NITRO_RPC_URL: 'the RPC URL of your Nitro node',
  $DA_SERVER_URL: 'the URL of your data availability server',
};

/**
 * The URL the method is served at, with a copy button. The playground is off, so this stands in
 * for the library's method-and-path header, whose path is fake.
 */
function Endpoint({ operation }: { operation: OperationObject }) {
  const url = requestUrl(requestUrls, { method: operation.operationId });
  const [checked, copy] = useCopyButton(() => navigator.clipboard.writeText(url));
  const hint = PLACEHOLDERS[url];

  return (
    <div className="not-prose flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2 rounded-xl border bg-fd-card p-3 text-fd-card-foreground">
        <code className="flex-1 overflow-auto text-nowrap text-[0.8125rem]">{url}</code>
        <button
          type="button"
          aria-label={checked ? 'Copied URL' : 'Copy URL'}
          className={cn(buttonVariants({ size: 'icon-xs' }), 'text-fd-muted-foreground')}
          onClick={copy}
        >
          {checked ? <Check /> : <Clipboard />}
        </button>
      </div>
      {hint ? (
        <p className="text-fd-muted-foreground">
          <code>{url}</code> is {hint}.
        </p>
      ) : null}
    </div>
  );
}

interface ParamSchema {
  'title'?: string;
  'description'?: string;
  'default'?: unknown;
  '$ref-value'?: ParamSchema;
}

/**
 * The positional `params` of the JSON-RPC envelope. fumadocs-openapi's schema UI reads only
 * `items`, never `prefixItems`, so each position is listed here: index, name, type, description,
 * whether it is required (its index is below `minItems`) and its default. Each item carries an
 * anchor, `#params-<name>`.
 */
function PositionalParams({ operation }: { operation: OperationObject }) {
  const { resolve } = useOpenAPI().doc;
  const body = resolve(operation.requestBody) as
    { content?: Record<string, { schema?: unknown }> } | undefined;
  const schema = resolve(body?.content?.['application/json']?.schema) as
    { properties?: Record<string, unknown> } | undefined;
  const params = resolve(schema?.properties?.['params']) as
    { prefixItems?: ParamSchema[]; minItems?: number } | undefined;
  const required = params?.minItems ?? 0;
  const items = (params?.prefixItems ?? []).map((raw, i) => {
    const item = resolve(raw) as ParamSchema;
    // `resolve` merges the sibling `title` over the target's, so the type name is read from the
    // reference target, which the document's magic proxy exposes as `$ref-value`.
    const type = raw['$ref-value']?.title;
    return {
      name: item.title,
      type: type ?? 'any',
      description: item.description,
      required: i < required,
      default: item.default,
    };
  });
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 id="params">Params</h2>
      <ol className="not-prose flex flex-col divide-y border-y text-sm">
        {items.map((item, i) => (
          <li
            key={item.name ?? i}
            id={`params-${item.name}`}
            className="flex flex-col gap-1 py-3 scroll-mt-[calc(var(--fd-docs-row-3,56px)+24px)]"
          >
            <span className="font-mono">
              <span className="text-fd-muted-foreground">[{i}] </span>
              <a href={`#params-${item.name}`} className="text-fd-primary">
                {item.name}
              </a>{' '}
              {item.type}
              <span className="text-fd-muted-foreground">
                {' '}
                {item.required ? 'required' : 'optional'}
              </span>
            </span>
            {item.description ? (
              <span className="text-fd-muted-foreground">{item.description}</span>
            ) : null}
            {item.default !== undefined ? (
              <span className="text-fd-muted-foreground">
                Defaults to <code>{JSON.stringify(item.default)}</code>
              </span>
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

function envelope(body: Record<string, unknown>): string {
  return JSON.stringify({ jsonrpc: '2.0', id: 1, ...body }, null, 2);
}

/**
 * The `result` of the JSON-RPC response, without the envelope, from `json-rpc-types.json`, and an
 * example response for success and for failure. The error is the one a Nitro node returns.
 */
function ResultFields({ operation }: { operation: OperationObject }) {
  const types = typesOf(operation);
  if (!types) return null;
  // TypeTable hides `type` in a narrow container and shows `typeDescription` when a row opens,
  // so the expanded content repeats the type, then the pattern.
  const fields: Record<string, TypeNode> = Object.fromEntries(
    types.result.map((row) => [
      row.name,
      {
        type: row.type,
        required: row.required,
        description: row.description,
        typeDescription: (
          <span className="font-mono">
            {row.type}
            {row.pattern ? (
              <>
                <span className="font-sans text-fd-muted-foreground"> matching </span>
                {row.pattern}
              </>
            ) : null}
          </span>
        ),
      },
    ]),
  );
  const error = {
    code: -32601,
    message: `the method ${operation.operationId} does not exist/is not available`,
  };

  return (
    <section className="mt-10">
      <h2 id="result">Result</h2>
      <TypeTable type={fields} />
      <Tabs items={['Success', 'Error']}>
        <Tab value="Success">
          <DynamicCodeBlock lang="json" code={envelope({ result: types.example })} />
        </Tab>
        <Tab value="Error">
          <DynamicCodeBlock lang="json" code={envelope({ error })} />
        </Tab>
      </Tabs>
    </section>
  );
}

/** The method's Go signature and the structs it uses, copied from the pinned Nitro source. */
function GoDefinition({ operation }: { operation: OperationObject }) {
  const code = typesOf(operation)?.go;
  if (!code) return null;

  return (
    <section className="mt-10">
      <h2 id="go-definition">Go definition</h2>
      <DynamicCodeBlock lang="go" code={code} />
    </section>
  );
}

export const OpenAPIPage = createOpenAPIPage({
  codeUsages,
  playground: { enabled: false },
  content: {
    // Drops the `responseTabs` slot, one tab per HTTP status: JSON-RPC always answers 200, and
    // the Result section shows the success and error responses.
    renderAPIExampleLayout: (slots) => (
      <div className="prose-no-margin">
        {slots.selector}
        {slots.usageTabs}
      </div>
    ),
    // Drops the `apiPlayground` slot, which holds the method and the fake path, the `body` slot,
    // the library's Request Body section (FR-006), and the `responses` slot, which shows the
    // JSON-RPC envelope: Endpoint, PositionalParams, ResultFields and GoDefinition show the
    // method alone.
    renderOperationLayout: (slots, { operation }) => (
      <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1">
          {slots.header}
          <Endpoint operation={operation} />
          {slots.description}
          {slots.parameters}
          <PositionalParams operation={operation} />
          <ResultFields operation={operation} />
          <GoDefinition operation={operation} />
        </div>
        <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:w-[400px]">
          {slots.apiExample}
        </div>
      </div>
    ),
  },
});
