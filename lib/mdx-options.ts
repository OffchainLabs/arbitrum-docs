import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import type { DefaultMDXOptions } from 'fumadocs-mdx/config';
import { transformerTwoslash } from 'fumadocs-twoslash';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { remarkStripMdxComments } from './mdx-comments.ts';
import { remarkVarLinks } from './var-links.ts';

// Shared by the site and check-links: anchor validation must use the same MDX transforms. Typed as
// fumadocs-mdx's own option type, the one `defineConfig` and `applyMdxPreset` accept, so a key that
// fumadocs-mdx does not know fails `types:check` here rather than being ignored silently.
export const mdxOptions: DefaultMDXOptions = {
  // Fumadocs-mdx already wires `remark-include` internally (verified in
  // dist/build-mdx-*.js). The `<include>` MDX directive works out of the box
  // — no additional remark plugins required for partial inclusion.
  //
  // remark-math + rehype-katex render the LaTeX math ($…$ / $$…$$) used across
  // the ported docs (mirrors the Docusaurus setup). KaTeX CSS is imported in
  // app/layout.tsx.
  //
  // remarkVarLinks expands a `{var:name}` placeholder inside a link destination, which is the only
  // way a global variable can reach a URL: `<Var name="…" />` holds a space, and a space ends an
  // unbracketed CommonMark link destination, so that form does not parse as a link at all and ships
  // as literal `[text](…)` brackets (FS-2725). It lives here rather than in the site alone so
  // `check-links` resolves the same destinations the reader gets; see `lib/var-links.ts`.
  //
  // remarkStripMdxComments deletes `{/* … */}` comments from the tree. They never reached the HTML,
  // but they did reach the markdown mirrors and `llms-full.txt`, because those are stringified from
  // this same tree (FS-2732). See `lib/mdx-comments.ts`.
  remarkPlugins: [remarkMath, remarkVarLinks, remarkStripMdxComments],
  // Never reach out to the network to measure a third-party image.
  //
  // fumadocs' remark-image probes every image for its intrinsic size, and for an `https://` src
  // that means an HTTP request at compile time. `onError` defaults to `error`, so a single dead
  // URL threw and took the whole MDX compile down: every docs page 500s, not just the page
  // holding the image (FS-2681).
  //
  // `external: false` disables the probe for remote URLs only, and nothing else changes for
  // local images: `useImport` stays on, so a `/img/…` src is imported and the bundler fails the
  // build on a path that does not exist.
  //
  // The consequence to know about is that a markdown image with a remote src now reaches
  // `next/image` without a `width` and renders as an HTTP 500. That is the case
  // `pnpm images:presence` blocks in CI. `<ImageZoom src="https://…" />` is unaffected, because
  // it is a plain `<img>`. See INTERNALS.md "Remote images are never fetched at build".
  remarkImageOptions: {
    external: false,
  },
  rehypePlugins: (v) => [rehypeKatex, ...v],
  //
  // twoslash only activates on ```ts twoslash blocks (TypeScript). Other
  // languages (shell, Rust, Solidity) fall through to the default transformers.
  rehypeCodeOptions: {
    ...rehypeCodeDefaultOptions,
    transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    // No `langs` preload here despite https://www.fumadocs.dev/docs/markdown/twoslash saying one is
    // needed for a fenced block quoted *inside* a twoslash hover popup: verified against this
    // fumadocs-core (rehype-code) + fumadocs-twoslash pairing that it is not. The outer block's own
    // language (`ts`/`tsx`) is already lazy-loaded before the twoslash transformer runs, and a
    // language quoted inside a JSDoc comment popup self-heals — `codeToHast` throws `ShikiError`,
    // fumadocs-twoslash catches it and queues `highlighter.loadLanguage(lang)` as a postprocess step
    // that `rehype-code` awaits before returning. Reproduced in both `pnpm dev` and a production
    // build: a `js` block and an unrelated, never-preloaded `python` block, both quoted inside a
    // twoslash popup, render fully tokenized (keyword/string colors present) with no 500 and no
    // console error. Do not re-add `langs` on the docs page's authority alone without re-testing.
  },
};
