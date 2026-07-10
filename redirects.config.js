/**
 * Internal doc redirects: old URL -> new URL.
 *
 * Entries between the AUTO-GENERATED markers are maintained by `yarn move-doc`. Consumed by
 * `@docusaurus/plugin-client-redirects` (in-app) and `yarn sync-redirects` (which mirrors them
 * into vercel.json for the edge). Types live in redirects.config.d.ts.
 *
 * This is a `.js` module (not `.ts`) so it resolves natively in both the Docusaurus config and
 * webpack's build-dependency cache; `redirects.config.d.ts` supplies the types for the tooling.
 */
export const redirects = [
  // Manual redirects — Stylus docs modernization (retired/merged pages)
  { from: '/stylus/using-cli', to: '/stylus/cli-tools/overview' },
  { from: '/stylus/concepts/public-preview-expectations', to: '/stylus/gentle-introduction' },
  {
    from: '/stylus/how-tos/adding-support-for-new-languages',
    to: '/stylus/how-tos/deploying-non-rust-wasm-contracts',
  },
  // AUTO-GENERATED REDIRECTS START
  {
    from: '/how-arbitrum-works/deep-dives/stf-gentle-intro',
    to: '/how-arbitrum-works/deep-dives/stf',
  },
  // AUTO-GENERATED REDIRECTS END
];
