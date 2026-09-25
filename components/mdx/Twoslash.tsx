'use client';

// Type-only, so it is erased at build and pulls nothing into this module's chunk. It exists to give
// each lazy handle back the exact function-component type of the real thing: `dynamic()` returns a
// `ComponentType`, which widens to include `ComponentClass`, and `MDXComponents` only accepts
// function components.
import type * as TwoslashUi from 'fumadocs-twoslash/ui';
import dynamic from 'next/dynamic';

/**
 * Lazy handles for the three twoslash popover components, kept out of every docs page's eager
 * JavaScript.
 *
 * `transformerTwoslash` (wired in `source.config.ts`) compiles a ```ts twoslash block into markup
 * that references `Popup` / `PopupTrigger` / `PopupContent` by name, so all three have to be in the
 * MDX component map or the page throws "Expected component `Popup` to be defined" at render time.
 * That is a 500, not a build failure, because the frontmatter schema is all `types:check` sees.
 *
 * Importing them straight into `components/mdx.tsx` would work but costs every docs page about
 * 31 KB gzipped, because `fumadocs-twoslash/ui` pulls in the Base UI popover and Floating UI, and
 * Next cannot code-split a Client Component that a Server Component imports (see
 * `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`). `components/mdx.tsx` is a server
 * module, so the whole popover graph landed in the eager client bundle of pages that contain no
 * twoslash block at all.
 *
 * Routing the import through this Client Component module moves the `import()` inside a client
 * boundary, where `next/dynamic` does split it: the popover graph becomes its own async chunk that
 * only a page actually rendering a twoslash block downloads. `ssr` stays on (the default) so a
 * twoslash page still server-renders its markup.
 *
 * The three names are declared explicitly rather than spread from the module, so a future
 * non-component export of `fumadocs-twoslash/ui` cannot silently land in the MDX map.
 */
export const Popup = dynamic(() =>
  import('fumadocs-twoslash/ui').then((mod) => mod.Popup),
) as typeof TwoslashUi.Popup;

export const PopupTrigger = dynamic(() =>
  import('fumadocs-twoslash/ui').then((mod) => mod.PopupTrigger),
) as typeof TwoslashUi.PopupTrigger;

export const PopupContent = dynamic(() =>
  import('fumadocs-twoslash/ui').then((mod) => mod.PopupContent),
) as typeof TwoslashUi.PopupContent;
