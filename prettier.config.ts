import offchainConfig from '@offchainlabs/prettier-config';
import type { Config } from 'prettier';

/**
 * Offchain Labs shared Prettier config, plus the @trivago import-sort plugin it configures. The
 * shared config supplies the `importOrder*` options; Prettier 3 requires the plugin itself to be
 * registered explicitly, which the shared config does not do. Keep code import sorting separate
 * from MDX: the docs use a wide print width and preserve upstream examples inside code fences.
 */
const { importOrder, importOrderSeparation, importOrderSortSpecifiers, ...base } = offchainConfig;

const config: Config = {
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
      },
    },
  ],
};

export default config;
