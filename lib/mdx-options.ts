import type { DefaultMDXOptions } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { remarkLlmsMarkdown } from './llms-markdown.ts';
import { remarkStripMdxComments } from './mdx-comments.ts';
import { remarkPreviewText } from './preview-text.ts';
import { remarkVarLinks } from './var-links.ts';

// Shared by the site and check-links, so anchor validation sees the same MDX transforms the reader
// gets. `<include>` needs no plugin here: fumadocs-mdx wires remark-include itself.
export const mdxOptions: DefaultMDXOptions = {
  // `$…$` maths, `{var:name}` in link destinations (`lib/var-links.ts`), no `{/* … */}` in the
  // markdown mirrors (`lib/mdx-comments.ts`), components as markdown in the mirrors
  // (`lib/llms-markdown.ts`, after var-links so it reads the expanded `href`/`src`), plain text
  // for the link previews (`lib/preview-text.ts`).
  remarkPlugins: [
    remarkMath,
    remarkVarLinks,
    remarkStripMdxComments,
    remarkLlmsMarkdown,
    remarkPreviewText,
  ],
  // A local `/img/…` src is measured from `public/` and kept as a path, so the mirrors print the
  // real URL. Remote images are never measured: a markdown image with a remote src breaks the page,
  // and `content:lint` rule `remote-image` blocks it. Wrap an `<img>` in `<ImageZoom>` for one.
  remarkImageOptions: {
    external: false,
    useImport: false,
  },
  // `structuredData` feeds the link previews (`lib/link-preview.ts`). Headings and paragraphs only,
  // so table cells, blockquote blocks and JSX blocks are not stored as units; a paragraph inside a
  // callout or list is still visited. `lib/preview-text.ts` hands remark-structure the plain text
  // of each one in place of the sliced source.
  remarkStructureOptions: {
    types: ['heading', 'paragraph'],
  },
  rehypePlugins: (v) => [rehypeKatex, ...v],
};
