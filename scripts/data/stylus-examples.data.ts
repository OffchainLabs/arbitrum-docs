/**
 * Inputs for `generate-stylus-examples.ts`: which pages of `offchainlabs/stylus-by-example`
 * this site publishes, in what order, and the frontmatter fields the source cannot supply.
 *
 * Ported from the `allowLists` and `output.sections` blocks of arbitrum-docs
 * `scripts/sync-stylus-content.js`.
 */
import type { SectionPages } from '../lib/stylus-examples.ts';

/** One published section: a directory under `outputDir`, its sidebar title, and its pages. */
export interface StylusSection extends SectionPages {
  title: string;
}

/** The upstream repository. Cloned shallow, at its default branch, on every run. */
export const repoUrl: string = 'https://github.com/offchainlabs/stylus-by-example.git';

/** Where the Next.js app router pages live inside that clone. */
export const sourceRoot: string = 'src/app';

/** Where the generated pages land, and the URL prefix the same pages serve at. */
export const outputDir: string = 'content/docs/stylus/stylus-by-example';
export const outputUrl: string = '/docs/stylus/stylus-by-example';

/**
 * The partial spliced in ahead of the first Rust snippet on every page.
 *
 * Root-anchored rather than file-relative: these are doc pages, and a root-anchored
 * `<include cwd>` survives the page being moved (see the partials section of CLAUDE.md).
 */
export const notForProductionInclude: string =
  '<include cwd>content/partials/_not-for-production-banner-partial.mdx</include>';

/**
 * The frontmatter this repo requires and `page.mdx` has no way to express. Upstream carries only
 * `title` and `description`, as a Next.js `metadata` export; the other three fields are this
 * site's page contract (see `source.config.ts`), so they are constants rather than anything read
 * from the source. Every ported page is a worked example, hence `concept` throughout.
 */
export const frontmatterDefaults: Readonly<Record<string, string>> = {
  content_type: 'concept',
  author: 'gblanchemain',
  sme: 'gblanchemain',
};

/**
 * The published set, one entry per directory under `outputDir`.
 *
 * `pages` is an allowlist and doubles as the `meta.json` order, so it is **upstream's teaching
 * sequence, not alphabetical**: `hello_world` first, then the primitives, then the language
 * features that build on them. That sequence is the `allowLists` block of arbitrum-docs
 * `scripts/sync-stylus-content.js`, and it is what drove the Docusaurus sidebar before this site
 * existed. The hand port alphabetized it, which opened a beginner's section on "ABI Decode" and
 * pushed "Hello World" to tenth; restoring it is the parity this pipeline exists for. Sorting
 * this list is a change to the rendered sidebar, not a tidy-up.
 *
 * The order of the sections themselves comes from the same place (upstream's `output.sections`):
 * `basic_examples` before `applications`. The parent `content/docs/stylus/stylus-by-example/
 * meta.json` is hand-owned rather than generated, so that one has to be kept in step by hand.
 *
 * Upstream publishes far more examples than these; the generator reports the ones it skipped on
 * every run, so a new upstream page shows up in the weekly refresh log instead of vanishing
 * silently. Adding one here is a deliberate act — it is a new page on this site.
 */
export const sections: readonly StylusSection[] = [
  {
    dir: 'basic_examples',
    title: 'Basic_examples',
    pages: [
      'hello_world',
      'primitive_data_types',
      'variables',
      'constants',
      'function',
      'errors',
      'events',
      'inheritance',
      'vm_affordances',
      'sending_ether',
      'function_selector',
      'abi_encode',
      'abi_decode',
      'hashing',
      'bytes_in_bytes_out',
    ],
  },
  {
    dir: 'applications',
    title: 'Applications',
    pages: ['erc20', 'erc721', 'vending_machine', 'multi_call'],
  },
];
