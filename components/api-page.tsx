'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';

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
      `  -d '${JSON.stringify(data.body)}'`,
    ].join(' \\\n'),
});

export const OpenAPIPage = createOpenAPIPage({
  codeUsages,
  playground: { enabled: false },
  content: {
    // Drops the `apiPlayground` slot, which holds the method and the fake path.
    renderOperationLayout: (slots) => (
      <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1">
          {slots.header}
          {slots.description}
          {slots.parameters}
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
