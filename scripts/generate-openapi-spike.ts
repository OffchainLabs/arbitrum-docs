// Spike: writes one MDX page per JSON-RPC method from content/openapi/arbitrum-json-rpc.json, and
// the method → request URL map that the code samples read, and the method → types map that the
// Result list and the Go definition panel read.
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

import { methodTypes } from '../lib/json-rpc-types.ts';

const INPUT = './content/openapi/arbitrum-json-rpc.json';

type Operation = {
  'operationId': string;
  'description': string;
  'x-arbitrum-request-url'?: string;
  'externalDocs'?: { description: string; url: string };
};
const doc = JSON.parse(readFileSync(INPUT, 'utf8')) as {
  paths: Record<string, { post: Operation }>;
};
const operations = new Map(Object.values(doc.paths).map(({ post }) => [post.operationId, post]));

/** A description may hold `<Term>` tags, which only the page body renders. */
const TERM = /<Term\s+id="[^"]+">([^<]*)<\/Term>/g;

function plainText(description: string): string {
  return description.replaceAll(TERM, '$1').replaceAll('`', '');
}

/** Drops `<Term>` tags from the frontmatter, which also holds the search index copy. */
function plainFrontmatter(content: string): string {
  const end = content.indexOf('\n---', 3);
  return content.slice(0, end).replaceAll(TERM, '$1') + content.slice(end);
}

await generateFiles({
  input: createOpenAPI({ input: [INPUT] }),
  output: './content/docs/json-rpc-spike',
  per: 'operation',
  frontmatter: (title, description) => ({
    title,
    // The frontmatter description is plain text, for metadata, search and link previews.
    description: plainText(description ?? title),
    content_type: 'reference',
  }),
  // Pages are dynamic and cannot export, so the generated Layout export is reduced to its
  // <OpenAPIPage> tag, which components/mdx.tsx registers. Above the tag go the description, as
  // MDX so its <Term> tags render, and the link to the method's source, since fumadocs-openapi
  // renders neither.
  beforeWrite(files) {
    for (const file of files) {
      const tag = /^export default function Layout[\s\S]*?(<OpenAPIPage [^\n]*\/>)[\s\S]*?^\}$/m;
      if (!tag.test(file.content)) {
        throw new Error(`${file.path}: generated page has no Layout export to replace`);
      }
      const operation = operations.get(basename(file.path, '.mdx'));
      const source = operation?.externalDocs;
      if (!source) throw new Error(`${INPUT}: the operation for ${file.path} has no externalDocs`);
      const link = `[Source: ${source.description}](${source.url})`;
      const body = (pageTag: string) => `${operation.description}\n\n${link}\n\n${pageTag}`;
      const page = file.content.replace(tag, (_, pageTag: string) => body(pageTag));
      file.content = `${plainFrontmatter(page)}\n`;
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

writeFileSync(
  './components/widgets/OpenAPIPage/json-rpc-types.json',
  `${JSON.stringify(Object.fromEntries([...operations.keys()].map((id) => [id, methodTypes(doc, id)])), null, 2)}\n`,
);
