import offchainConfig from '@offchainlabs/prettier-config';

/**
 * Offchain Labs shared Prettier config, plus the @trivago import-sort plugin it configures. The
 * shared config supplies the `importOrder*` options; Prettier 3 requires the plugin itself to be
 * registered explicitly, which the shared config does not do.
 */
export default {
  ...offchainConfig,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
