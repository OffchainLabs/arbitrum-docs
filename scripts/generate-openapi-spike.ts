// Spike: writes one MDX page per JSON-RPC method from content/openapi/arbitrum-json-rpc.json.
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

await generateFiles({
  input: createOpenAPI({ input: ['./content/openapi/arbitrum-json-rpc.json'] }),
  output: './content/docs/arbitrum-essentials/arbitrum-vs-ethereum/json-rpc-spike',
  per: 'operation',
  frontmatter: (title, description) => ({
    title,
    // The page description renders as plain text, so inline-code backticks are dropped.
    description: (description ?? title).replaceAll('`', ''),
    content_type: 'reference',
  }),
});
