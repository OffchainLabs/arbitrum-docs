import type { DefaultMDXOptions } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { remarkStripMdxComments } from './mdx-comments.ts';
import { remarkVarLinks } from './var-links.ts';

// Shared by the site and check-links, so anchor validation sees the same MDX transforms the reader
// gets. `<include>` needs no plugin here: fumadocs-mdx wires remark-include itself.
export const mdxOptions: DefaultMDXOptions = {
  // `$…$` maths, `{var:name}` in link destinations (`lib/var-links.ts`), no `{/* … */}` in the
  // markdown mirrors (`lib/mdx-comments.ts`).
  remarkPlugins: [remarkMath, remarkVarLinks, remarkStripMdxComments],
  // A local `/img/…` src is measured from `public/` and kept as a path, so the mirrors print the
  // real URL. Remote images are never measured: a markdown image with a remote src breaks the page,
  // and `content:lint` rule `remote-image` blocks it. Wrap an `<img>` in `<ImageZoom>` for one.
  remarkImageOptions: {
    external: false,
    useImport: false,
  },
  rehypePlugins: (v) => [rehypeKatex, ...v],
};
