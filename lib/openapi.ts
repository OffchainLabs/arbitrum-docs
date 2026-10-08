import { createOpenAPI } from 'fumadocs-openapi/server';

// Server-only. The JSON-RPC reference spike: one OpenAPI 3.1 document, one fake path per method.
export const openapi = createOpenAPI({
  input: ['./content/openapi/arbitrum-json-rpc.json'],
});
