// Spike: writes one MDX page per JSON-RPC method from content/openapi/arbitrum-json-rpc.json, and
// the method → request URL map that the code samples read.
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { readFileSync, writeFileSync } from 'node:fs';

const INPUT = './content/openapi/arbitrum-json-rpc.json';

await generateFiles({
  input: createOpenAPI({ input: [INPUT] }),
  output: './content/docs/arbitrum-essentials/arbitrum-vs-ethereum/json-rpc-spike',
  per: 'operation',
  frontmatter: (title, description) => ({
    title,
    // The page description renders as plain text, so inline-code backticks are dropped.
    description: (description ?? title).replaceAll('`', ''),
    content_type: 'reference',
  }),
});

type Operation = { 'operationId': string; 'x-arbitrum-request-url'?: string };
const doc = JSON.parse(readFileSync(INPUT, 'utf8')) as {
  paths: Record<string, { post: Operation }>;
};
const urls: Record<string, string> = {};
for (const [path, { post }] of Object.entries(doc.paths)) {
  const url = post['x-arbitrum-request-url'];
  if (!url) throw new Error(`${INPUT}: POST ${path} has no x-arbitrum-request-url`);
  urls[post.operationId] = url;
}
writeFileSync(
  './components/widgets/OpenAPIPage/request-urls.json',
  `${JSON.stringify(urls, null, 2)}\n`,
);
