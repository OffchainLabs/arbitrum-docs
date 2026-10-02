import { metaSchema } from 'fumadocs-core/source/schema';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { execFileSync } from 'node:child_process';

import { mdxOptions } from './lib/mdx-options.ts';
import { arbitrumPageSchema } from './lib/page-schema';
import { referenceSchema } from './lib/reference-schema';

// A shallow clone reports its oldest commit as adding every file, which would stamp most pages
// with one wrong date, so no date is resolved without full history. Vercel clones shallow unless
// `VERCEL_DEEP_CLONE=true` is set.
function hasFullGitHistory(): boolean {
  try {
    const out = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return out.trim() === 'false';
  } catch {
    return false;
  }
}

// Never `false`: fumadocs-mdx types `page.data.lastModified` only while the option is truthy, so
// the fallback is a resolver that returns no date.
const lastModified = hasFullGitHistory() ? true : async () => undefined;

/**
 * Partials live in `content/partials/`, outside the doc collection `dir`, so they can never be
 * routed and need no glob exclusion here. Pages inline them with `<include cwd>…</include>`.
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: arbitrumPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
    lastModified,
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * Reference collections back the glossary hover references. Every entry shares `referenceSchema`
 * ({ id, title, sortAs? }); the MDX body is the definition. A new reference type adds a collection
 * with this schema plus one registry entry in `lib/references.ts`. A separate collection, so it
 * does not carry the docs page contract; the schema lives in `lib/reference-schema.ts` because
 * this file may only export collections.
 */
export const glossary = defineCollections({
  type: 'doc',
  dir: 'content/glossary',
  schema: referenceSchema,
});

export default defineConfig({ mdxOptions });
