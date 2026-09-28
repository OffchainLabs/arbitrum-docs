import type { DefaultMDXOptions } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { remarkStripMdxComments } from './mdx-comments.ts';
import { remarkVarLinks } from './var-links.ts';

// Shared by the site and check-links, so anchor validation sees the same MDX transforms the reader
// gets. `<include>` needs no plugin here: fumadocs-mdx wires remark-include itself.
export const mdxOptions: DefaultMDXOptions = {
  // remark-math and rehype-katex render `$…$` and `$$…$$`. remarkVarLinks expands `{var:name}` in
  // a link destination (see `lib/var-links.ts`). remarkStripMdxComments keeps `{/* … */}` comments
  // out of the markdown mirrors and `llms-full.txt` (see `lib/mdx-comments.ts`).
  remarkPlugins: [remarkMath, remarkVarLinks, remarkStripMdxComments],
  // A local `/img/…` src is measured from `public/` and kept as a path rather than an import, so the
  // markdown mirrors print the real URL; a missing raster file fails the build. Remote images are
  // never measured: a markdown image with a remote src reaches `next/image` with no `width` and the
  // page returns HTTP 500, which `pnpm images:presence` blocks, so put a remote image in an `<img>`
  // tag instead.
  remarkImageOptions: {
    external: false,
    useImport: false,
  },
  rehypePlugins: (v) => [rehypeKatex, ...v],
};
