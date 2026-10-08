import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { openapiPageMarkdown } from './openapi';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute || '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  pageTree: {
    // The sidebar comes from the `meta.json` files under content/docs. This only lets a page's
    // `sidebar_label` frontmatter replace its title as the sidebar name.
    transformers: [
      {
        file(node, filePath) {
          const file = filePath ? this.storage.read(filePath) : undefined;
          const label = file?.format === 'page' ? file.data.sidebar_label : undefined;
          return label ? { ...node, name: label } : node;
        },
      },
    ],
  },
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');
  const preload = page.data._openapi?.preload;
  const schemaId = Array.isArray(preload) && typeof preload[0] === 'string' ? preload[0] : '';
  const api = schemaId ? await openapiPageMarkdown(schemaId, page.slugs.at(-1) ?? '') : '';

  return `# ${page.data.title} (${page.url})

${processed}${api}`;
}
