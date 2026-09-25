import offchainConfig from '@offchainlabs/prettier-config';

/**
 * Offchain Labs shared Prettier config, plus the @trivago import-sort plugin it configures. The
 * shared config supplies the `importOrder*` options; Prettier 3 requires the plugin itself to be
 * registered explicitly, which the shared config does not do.
 *
 * The `importOrder*` options are scoped to code files. Left in the base config they leak into the
 * Markdown override below, which runs without the plugin and then warns "unknown option" once per
 * file.
 */
const { importOrder, importOrderSeparation, importOrderSortSpecifiers, ...base } = offchainConfig;

export default {
  ...base,
  overrides: [
    {
      files: '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
      options: {
        plugins: ['@trivago/prettier-plugin-sort-imports'],
        importOrder,
        importOrderSeparation,
        importOrderSortSpecifiers,
      },
    },
    {
      files: '*.{md,mdx}',
      options: {
        parser: 'mdx',
        printWidth: 9999,
        proseWrap: 'preserve',
        // Doc examples mirror upstream tutorials, where import order and inline comments are
        // deliberate, so no import sorting inside fenced code blocks.
      },
    },
  ],
};
