// Spike: writes one MDX page per JSON-RPC method from content/openapi/arbitrum-json-rpc.json, and
// the method → request URL map that the code samples read.
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const INPUT = './content/openapi/arbitrum-json-rpc.json';

type Operation = {
  'operationId': string;
  'x-arbitrum-request-url'?: string;
  'externalDocs'?: { description: string; url: string };
};
const doc = JSON.parse(readFileSync(INPUT, 'utf8')) as {
  paths: Record<string, { post: Operation }>;
};
const operations = new Map(Object.values(doc.paths).map(({ post }) => [post.operationId, post]));

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
  // Pages are dynamic and cannot export, so the generated Layout export is reduced to its
  // <OpenAPIPage> tag, which components/mdx.tsx registers. fumadocs-openapi does not render
  // `externalDocs`, so the link to the method's source is written above the tag.
  beforeWrite(files) {
    for (const file of files) {
      const tag = /^export default function Layout[\s\S]*?(<OpenAPIPage [^\n]*\/>)[\s\S]*?^\}$/m;
      if (!tag.test(file.content)) {
        throw new Error(`${file.path}: generated page has no Layout export to replace`);
      }
      const source = operations.get(basename(file.path, '.mdx'))?.externalDocs;
      if (!source) throw new Error(`${INPUT}: the operation for ${file.path} has no externalDocs`);
      const link = `[Source: ${source.description}](${source.url})`;
      file.content = `${file.content.replace(tag, `${link}\n\n$1`)}\n`;
    }
  },
});

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
