/**
 * `@offchainlabs/prettier-config` ships no declaration file. `prettier.config.ts` spreads its
 * default export into a `prettier` `Config`, so that is what it is declared as here.
 */
declare module '@offchainlabs/prettier-config' {
  import type { Config } from 'prettier';

  const config: Config;
  export default config;
}
